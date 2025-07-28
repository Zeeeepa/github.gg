import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '@/lib/trpc/trpc';
import { db } from '@/db';
import { repositoryScorecards, tokenUsage } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateScorecardAnalysis } from '@/lib/ai/scorecard';
import { getUserPlanAndKey, getApiKeyForUser } from '@/lib/utils/user-plan';
import { TRPCError } from '@trpc/server';
import { scorecardSchema } from '@/lib/types/scorecard';
import { isPgErrorWithCode } from '@/lib/db/utils';
import { createGitHubServiceFromSession } from '@/lib/github';


export const scorecardRouter = router({
  generateScorecard: protectedProcedure
    .input(z.object({
      user: z.string(),
      repo: z.string(),
      ref: z.string().optional().default('main'),
      files: z.array(z.object({
        path: z.string(),
        content: z.string(),
        size: z.number().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const { repo, files } = input;
      
      // Check for active subscription
      const { subscription, plan } = await getUserPlanAndKey(ctx.user.id);
      if (!subscription || subscription.status !== 'active') {
        throw new TRPCError({ 
          code: 'FORBIDDEN', 
          message: 'Active subscription required for AI features' 
        });
      }
      
      // Get appropriate API key
      const keyInfo = await getApiKeyForUser(ctx.user.id, plan as 'byok' | 'pro');
      if (!keyInfo) {
        throw new TRPCError({ 
          code: 'FORBIDDEN', 
          message: 'Please add your Gemini API key in settings to use this feature' 
        });
      }
      
      try {
        // Generate scorecard using the AI service
        const result = await generateScorecardAnalysis({
          files,
          repoName: repo,
        });
        
        // The AI result is already in the structured format we want
        const scorecardData = scorecardSchema.parse(result.scorecard);
        
        // Simple upsert - insert or update existing
        const [insertedScorecard] = await db
          .insert(repositoryScorecards)
          .values({
            userId: ctx.user.id,
            repoOwner: input.user,
            repoName: input.repo,
            ref: input.ref || 'main',
            overallScore: scorecardData.overallScore,
            metrics: scorecardData.metrics,
            markdown: scorecardData.markdown,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [
              repositoryScorecards.userId,
              repositoryScorecards.repoOwner,
              repositoryScorecards.repoName,
              repositoryScorecards.ref
            ],
            set: {
              overallScore: scorecardData.overallScore,
              metrics: scorecardData.metrics,
              markdown: scorecardData.markdown,
              updatedAt: new Date(),
            }
          })
          .returning();

        // Log token usage with actual values from AI response
        await db.insert(tokenUsage).values({
          userId: ctx.user.id,
          feature: 'scorecard',
          repoOwner: input.user,
          repoName: input.repo,
          model: 'gemini-2.5-pro', // Default model used
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          totalTokens: result.usage.totalTokens,
          isByok: keyInfo.isByok,
          createdAt: new Date(),
        });

        // Return the inserted scorecard
        return {
          scorecard: {
            metrics: insertedScorecard.metrics,
            markdown: insertedScorecard.markdown,
            overallScore: insertedScorecard.overallScore,
          },
          cached: false,
          stale: false,
          lastUpdated: insertedScorecard.updatedAt || new Date(),
        };
      } catch (error) {
        console.error('🔥 Raw error in scorecard route:', error);
        console.error('🔥 Error type:', typeof error);
        console.error('🔥 Error message:', error instanceof Error ? error.message : 'No message');
        console.error('🔥 Error stack:', error instanceof Error ? error.stack : 'No stack');
        
        const userFriendlyMessage = error instanceof Error ? error.message : 'Failed to generate repository scorecard';
        throw new Error(userFriendlyMessage);
      }
    }),

  // Unified public endpoint: fetch latest or specific version of a scorecard for a repo/ref
  publicGetScorecard: publicProcedure
    .input(z.object({
      user: z.string(),
      repo: z.string(),
      ref: z.string().optional().default('main'),
      version: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { user, repo, ref, version } = input;
      
      // Check repository access and privacy
      try {
        const githubService = await createGitHubServiceFromSession(ctx.session);
        const repoInfo = await githubService.getRepositoryInfo(user, repo);
        
        // If the repository is private, check if user has access
        if (repoInfo.private === true) {
          // If user is not authenticated, block access
          if (!ctx.session?.user) {
            return {
              scorecard: null,
              cached: false,
              stale: false,
              lastUpdated: null,
              error: 'This repository is private'
            };
          }
          
          // User is authenticated, so they should have access (since we successfully fetched repo info)
          // Continue to show the scorecard
        }
      } catch {
        // If we can't access the repo (404 or no auth), it might be private or user doesn't have access
        return {
          scorecard: null,
          cached: false,
          stale: false,
          lastUpdated: null,
          error: 'Unable to access repository'
        };
      }
      
      const baseConditions = [
        eq(repositoryScorecards.repoOwner, user),
        eq(repositoryScorecards.repoName, repo),
        eq(repositoryScorecards.ref, ref),
      ];
      // Note: version parameter is ignored - we only store latest per group
      const cached = await db
        .select()
        .from(repositoryScorecards)
        .where(and(...baseConditions))
        .orderBy(desc(repositoryScorecards.updatedAt))
        .limit(1);
      if (cached.length > 0) {
        const scorecard = cached[0];
        const isStale = new Date().getTime() - scorecard.updatedAt.getTime() > 24 * 60 * 60 * 1000; // 24 hours
        return {
          scorecard: {
            metrics: scorecard.metrics,
            markdown: scorecard.markdown,
            overallScore: scorecard.overallScore,
          },
          cached: true,
          stale: isStale,
          lastUpdated: scorecard.updatedAt,
        };
      }
      return {
        scorecard: null,
        cached: false,
        stale: false,
        lastUpdated: null,
      };
    }),

  getScorecardVersions: publicProcedure
    .input(z.object({ user: z.string(), repo: z.string(), ref: z.string().optional().default('main') }))
    .query(async ({ input }) => {
      // Since we only store latest per group, return single version
      const result = await db
        .select({ updatedAt: repositoryScorecards.updatedAt })
        .from(repositoryScorecards)
        .where(
          and(
            eq(repositoryScorecards.repoOwner, input.user),
            eq(repositoryScorecards.repoName, input.repo),
            eq(repositoryScorecards.ref, input.ref)
          )
        )
        .limit(1);
      
      return result.length > 0 ? [{ version: 1, updatedAt: result[0].updatedAt }] : [];
    }),

});
