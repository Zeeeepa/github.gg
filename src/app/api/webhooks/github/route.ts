import { Webhooks } from '@octokit/webhooks';
import { db } from '@/db';
import { githubAppInstallations, installationRepositories } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { postPRReviewComment, isPRReviewEnabled } from '@/lib/github/pr-comment-service';
import { postCommitAnalysisComment, postIssueAnalysisComment, isAnalysisEnabled } from '@/lib/github/commit-issue-comment-service';

// Only initialize webhooks if the secret is available
const webhooks = process.env.GITHUB_WEBHOOK_SECRET
  ? new Webhooks({
      secret: process.env.GITHUB_WEBHOOK_SECRET,
    })
  : null;

// Centralized error logging utility for webhook handlers
function logWebhookError(context: string, details: Record<string, unknown>, error: unknown) {
  console.error(`[GitHub Webhook] ERROR: Failed to ${context}`, {
    ...details,
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : String(error),
  });
}

/**
 * Higher-order function to create webhook analysis handlers
 * Eliminates duplication in PR/commit/issue analysis handlers
 */
function createAnalysisHandler<TParams extends { installationId?: number; owner: string; repo: string }>({
  featureName,
  resourceType,
  getResourceId,
  checkEnabled,
  performAnalysis,
}: {
  featureName: string;
  resourceType: string;
  getResourceId: (params: TParams) => string | number;
  checkEnabled: (installationId: number, owner: string, repo: string) => Promise<boolean>;
  performAnalysis: (params: TParams & { installationId: number }) => Promise<void>;
}) {
  return async (params: TParams) => {
    const repoFullName = `${params.owner}/${params.repo}`;
    const resourceId = getResourceId(params);

    if (!params.installationId) {
      console.error(`[GitHub Webhook] ERROR: No installation ID provided for ${featureName}`, {
        repo: repoFullName,
        [resourceType]: resourceId,
      });
      return;
    }

    // Check if feature is enabled for this repo
    const isEnabled = await checkEnabled(params.installationId, params.owner, params.repo);
    if (!isEnabled) {
      console.log(`[GitHub Webhook] ${featureName} not enabled`, {
        repo: repoFullName,
        [resourceType]: resourceId,
      });
      return;
    }

    console.log(`[GitHub Webhook] Starting ${featureName}`, {
      repo: repoFullName,
      [resourceType]: resourceId,
      installationId: params.installationId,
    });

    try {
      await performAnalysis({ ...params, installationId: params.installationId });
      console.log(`[GitHub Webhook] SUCCESS: ${featureName} completed`, {
        repo: repoFullName,
        [resourceType]: resourceId,
      });
    } catch (error) {
      logWebhookError(featureName, { repo: repoFullName, [resourceType]: resourceId }, error);
      throw error;
    }
  };
}

// Background handler for PR analysis
const handlePRAnalysis = createAnalysisHandler<{
  installationId?: number;
  owner: string;
  repo: string;
  prNumber: number;
  prTitle: string;
  prDescription: string;
  baseBranch: string;
  headBranch: string;
}>({
  featureName: 'PR analysis',
  resourceType: 'prNumber',
  getResourceId: (params) => params.prNumber,
  checkEnabled: isPRReviewEnabled,
  performAnalysis: async (params) => {
    await postPRReviewComment({
      installationId: params.installationId,
      owner: params.owner,
      repo: params.repo,
      prNumber: params.prNumber,
      prTitle: params.prTitle,
      prDescription: params.prDescription,
      baseBranch: params.baseBranch,
      headBranch: params.headBranch,
    });
  },
});

// Background handler for commit analysis
const handleCommitAnalysis = createAnalysisHandler<{
  installationId?: number;
  owner: string;
  repo: string;
  commitSha: string;
}>({
  featureName: 'commit analysis',
  resourceType: 'commitSha',
  getResourceId: (params) => params.commitSha.slice(0, 7),
  checkEnabled: isAnalysisEnabled,
  performAnalysis: async (params) => {
    await postCommitAnalysisComment({
      installationId: params.installationId,
      owner: params.owner,
      repo: params.repo,
      commitSha: params.commitSha,
    });
  },
});

// Background handler for issue analysis
const handleIssueAnalysis = createAnalysisHandler<{
  installationId?: number;
  owner: string;
  repo: string;
  issueNumber: number;
}>({
  featureName: 'issue analysis',
  resourceType: 'issueNumber',
  getResourceId: (params) => params.issueNumber,
  checkEnabled: isAnalysisEnabled,
  performAnalysis: async (params) => {
    await postIssueAnalysisComment({
      installationId: params.installationId,
      owner: params.owner,
      repo: params.repo,
      issueNumber: params.issueNumber,
    });
  },
});

// Event Handlers - only register if webhooks is available
if (webhooks) {
  webhooks.on('installation.created', async ({ payload }) => {
    const installationId = payload.installation.id;
    console.log('[GitHub Webhook] installation.created:', { installationId });

    try {
      // Check if account exists and get its type
      const account = payload.installation.account;
      if (!account) {
        console.error('[GitHub Webhook] ERROR: No account found in installation payload', {
          installationId,
          payloadKeys: Object.keys(payload),
        });
        return;
      }

      const accountType = 'type' in account ? account.type : 'User';

      // Extract account details based on type
      const accountLogin = 'login' in account ? account.login : account.slug;
      const accountAvatarUrl = account.avatar_url;
      const accountName = 'name' in account ? account.name : accountLogin;

      console.log('[GitHub Webhook] Recording installation:', {
        installationId,
        accountLogin,
        accountType,
        repositoryCount: payload.repositories?.length || 0,
      });

      await db.insert(githubAppInstallations).values({
        installationId: payload.installation.id,
        accountId: account.id,
        accountType,
        accountLogin,
        accountAvatarUrl,
        accountName,
        repositorySelection: payload.installation.repository_selection,
      });

      if (payload.repositories) {
        for (const repo of payload.repositories) {
          await db.insert(installationRepositories).values({
            installationId: payload.installation.id,
            repositoryId: repo.id,
            fullName: repo.full_name,
          });
        }
      }

      console.log('[GitHub Webhook] SUCCESS: Successfully recorded installation', {
        installationId,
        accountLogin,
        repositoryCount: payload.repositories?.length || 0,
      });
    } catch (error) {
      console.error('[GitHub Webhook] ERROR: Failed to record installation', {
        installationId,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : String(error),
      });
    }
  });

  webhooks.on('installation.deleted', async ({ payload }) => {
    const installationId = payload.installation.id;
    console.log('[GitHub Webhook] installation.deleted:', { installationId });

    try {
      // First, delete all related repository records
      await db.delete(installationRepositories)
        .where(eq(installationRepositories.installationId, installationId));
      console.log('[GitHub Webhook] Deleted repository records:', { installationId });

      // Then delete the installation record
      await db.delete(githubAppInstallations)
        .where(eq(githubAppInstallations.installationId, installationId));
      console.log('[GitHub Webhook] SUCCESS: Successfully deleted installation', { installationId });
    } catch (error) {
      console.error('[GitHub Webhook] ERROR: Failed to delete installation', {
        installationId,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : String(error),
      });
    }
  });

  webhooks.on('installation_repositories.added', async ({ payload }) => {
    const installationId = payload.installation.id;
    const count = payload.repositories_added.length;
    console.log('[GitHub Webhook] installation_repositories.added:', { installationId, count });

    try {
      for (const repo of payload.repositories_added) {
        await db.insert(installationRepositories).values({
          installationId: payload.installation.id,
          repositoryId: repo.id,
          fullName: repo.full_name,
        });
      }
      console.log('[GitHub Webhook] SUCCESS: Successfully added repositories', { installationId, count });
    } catch (error) {
      console.error('[GitHub Webhook] ERROR: Failed to add repositories', {
        installationId,
        count,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : String(error),
      });
    }
  });

  webhooks.on('installation_repositories.removed', async ({ payload }) => {
    const installationId = payload.installation.id;
    const count = payload.repositories_removed.length;
    console.log('[GitHub Webhook] installation_repositories.removed:', { installationId, count });

    try {
      for (const repo of payload.repositories_removed) {
        await db.delete(installationRepositories)
          .where(and(
            eq(installationRepositories.installationId, payload.installation.id),
            eq(installationRepositories.repositoryId, repo.id)
          ));
      }
      console.log('[GitHub Webhook] SUCCESS: Successfully removed repositories', { installationId, count });
    } catch (error) {
      console.error('[GitHub Webhook] ERROR: Failed to remove repositories', {
        installationId,
        count,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : String(error),
      });
    }
  });

  webhooks.on('push', async ({ payload }) => {
    const repo = payload.repository.full_name;
    const commitCount = payload.commits.length;
    console.log('[GitHub Webhook] push:', { repo, commitCount });

    if (!payload.repository.owner) {
      console.error('[GitHub Webhook] ERROR: No owner found in push event', {
        repo,
        hasRepository: !!payload.repository,
      });
      return;
    }

    // Analyze each commit (limit to last 3 to avoid overwhelming API)
    const commitsToAnalyze = payload.commits.slice(-3);
    console.log('[GitHub Webhook] Analyzing commits:', {
      repo,
      totalCommits: commitCount,
      analyzingCount: commitsToAnalyze.length,
    });

    for (const commit of commitsToAnalyze) {
      handleCommitAnalysis({
        installationId: payload.installation?.id,
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        commitSha: commit.id,
      }).catch(error => {
        logWebhookError('analyze commit', { repo, commitSha: commit.id.slice(0, 7) }, error);
      });
    }
  });

  webhooks.on('pull_request.opened', async ({ payload }) => {
    const repo = payload.repository.full_name;
    const prNumber = payload.pull_request.number;
    const prTitle = payload.pull_request.title;
    console.log('[GitHub Webhook] pull_request.opened:', { repo, prNumber, prTitle });

    // Trigger PR analysis in the background
    handlePRAnalysis({
      installationId: payload.installation?.id,
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      prNumber,
      prTitle,
      prDescription: payload.pull_request.body || '',
      baseBranch: payload.pull_request.base.ref,
      headBranch: payload.pull_request.head.ref,
    }).catch(error => {
      logWebhookError('analyze PR', { repo, prNumber }, error);
    });
  });

  webhooks.on('pull_request.synchronize', async ({ payload }) => {
    const repo = payload.repository.full_name;
    const prNumber = payload.pull_request.number;
    const prTitle = payload.pull_request.title;
    console.log('[GitHub Webhook] pull_request.synchronize:', { repo, prNumber, prTitle });

    // Re-run analysis when PR is updated
    handlePRAnalysis({
      installationId: payload.installation?.id,
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      prNumber,
      prTitle,
      prDescription: payload.pull_request.body || '',
      baseBranch: payload.pull_request.base.ref,
      headBranch: payload.pull_request.head.ref,
    }).catch(error => {
      logWebhookError('re-analyze PR', { repo, prNumber }, error);
    });
  });

  webhooks.on('issues.opened', async ({ payload }) => {
    const repo = payload.repository.full_name;
    const issueNumber = payload.issue.number;
    const issueTitle = payload.issue.title;
    console.log('[GitHub Webhook] issues.opened:', { repo, issueNumber, issueTitle });

    // Trigger issue analysis in the background
    handleIssueAnalysis({
      installationId: payload.installation?.id,
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issueNumber,
    }).catch(error => {
      logWebhookError('analyze issue', { repo, issueNumber }, error);
    });
  });
}

// The main handler
export async function POST(request: Request) {
  const event = request.headers.get('x-github-event') ?? 'unknown';
  const delivery = request.headers.get('x-github-delivery') ?? 'unknown';

  // Log incoming webhook request with full details
  console.log('[GitHub Webhook] Incoming webhook:', {
    event,
    delivery,
    hasWebhookSecret: !!process.env.GITHUB_WEBHOOK_SECRET,
    webhooksConfigured: !!webhooks,
    timestamp: new Date().toISOString(),
  });

  if (!webhooks) {
    console.error('[GitHub Webhook] ERROR: Webhooks not configured', {
      hasSecret: !!process.env.GITHUB_WEBHOOK_SECRET,
      webhooksInitialized: !!webhooks,
      event,
      delivery,
    });
    return new Response('Webhooks not configured', { status: 503 });
  }

  let payload: string;
  try {
    payload = await request.text();
    console.log('[GitHub Webhook] Payload received:', {
      event,
      delivery,
      payloadLength: payload.length,
    });
  } catch (error) {
    console.error('[GitHub Webhook] ERROR: Failed to read request body', {
      event,
      delivery,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : String(error),
    });
    return new Response('Failed to read request body', { status: 400 });
  }

  const signature = request.headers.get('x-hub-signature-256');

  if (!signature) {
    console.error('[GitHub Webhook] ERROR: No signature found in webhook request', {
      event,
      delivery,
      headers: Object.fromEntries(request.headers.entries()),
    });
    return new Response('No signature found', { status: 401 });
  }

  try {
    const verified = await webhooks.verify(payload, signature);
    if (!verified) {
      console.error('[GitHub Webhook] ERROR: Webhook signature verification failed', {
        event,
        delivery,
        signatureProvided: !!signature,
        hasSecret: !!process.env.GITHUB_WEBHOOK_SECRET,
      });
      return new Response('Signature verification failed', { status: 401 });
    }
    console.log('[GitHub Webhook] Signature verified successfully:', { event, delivery });
  } catch (error) {
    console.error('[GitHub Webhook] ERROR: Webhook verification error', {
      event,
      delivery,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : String(error),
    });
    return new Response('Signature verification failed', { status: 401 });
  }

  try {
    console.log('[GitHub Webhook] Processing webhook event:', { event, delivery });

    await webhooks.receive({
      id: delivery,
      name: event as string,
      payload: JSON.parse(payload),
    } as Parameters<typeof webhooks.receive>[0]);

    console.log('[GitHub Webhook] SUCCESS: Successfully processed webhook event', {
      event,
      delivery,
      timestamp: new Date().toISOString(),
    });
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('[GitHub Webhook] ERROR: Error processing webhook', {
      event,
      delivery,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : String(error),
      timestamp: new Date().toISOString(),
    });
    return new Response('Internal server error', { status: 500 });
  }
} 