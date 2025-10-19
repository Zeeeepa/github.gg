import { Octokit } from '@octokit/rest';
import type { RepoSummary } from './types';
import { parseError } from '@/lib/types/errors';

// GitHub API response types

// Add this type above the class definition:
type RawGitHubRepo = {
  owner: { login: string };
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  html_url: string;
  private?: boolean;
  fork?: boolean;
};

// User-specific operations
export class UserService {
  private octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  // Get user repositories with optional limit for performance
  async getUserRepositories(username?: string, limit?: number): Promise<RepoSummary[]> {
    try {
      console.log(`🔍 Fetching repositories for ${username || 'authenticated user'}${limit ? ` (limit: ${limit})` : ''}...`);

      // If limit is specified, use single request instead of pagination
      if (limit) {
        const response = await this.octokit.request<{ data: RawGitHubRepo[] }>(
          username ? 'GET /users/{username}/repos' : 'GET /user/repos',
          username
            ? { username, per_page: limit, sort: 'updated' as const }
            : { affiliation: 'owner,collaborator,organization_member', per_page: limit, sort: 'updated' as const }
        );
        const repos = response.data;
        const publicRepos = repos.filter((r) => !r.private);
        console.log(`✅ Fetched ${publicRepos.length} public repositories`);
        return publicRepos.map((repo) => ({
          owner: repo.owner.login,
          name: repo.name,
          description: repo.description || undefined,
          stargazersCount: repo.stargazers_count || 0,
          forksCount: repo.forks_count || 0,
          language: repo.language || undefined,
          topics: repo.topics || undefined,
          url: repo.html_url,
          fork: repo.fork,
        }));
      }

      // No limit: paginate to fetch ALL repositories (slow, use sparingly)
      const allRepos = await this.octokit.paginate<RawGitHubRepo>(
        username
          ? 'GET /users/{username}/repos'
          : 'GET /user/repos',
        username
          ? { username, per_page: 100, sort: 'updated' }
          : { affiliation: 'owner,collaborator,organization_member', per_page: 100, sort: 'updated' }
      );
      // Filter for public repos after fetching
      const publicRepos = allRepos.filter((r) => !r.private);
      console.log(`✅ Total public repositories fetched: ${publicRepos.length}`);
      return publicRepos.map((repo) => ({
        owner: repo.owner.login,
        name: repo.name,
        description: repo.description || undefined,
        stargazersCount: repo.stargazers_count || 0,
        forksCount: repo.forks_count || 0,
        language: repo.language || undefined,
        topics: repo.topics || undefined,
        url: repo.html_url,
        fork: repo.fork,
      }));
    } catch (error: unknown) {
      const errorMessage = parseError(error);
      console.error('❌ Error fetching repositories:', errorMessage);
      if (errorMessage.includes('401')) {
         throw new Error(`Authentication error: Bad credentials or token expired. Please sign out and sign back in. Original error: ${errorMessage}`);
      }
      if (errorMessage.includes('403')) {
         throw new Error(`Permission error: Your GitHub token doesn't have the required scopes. Please check your GitHub App installation or OAuth permissions. Original error: ${errorMessage}`);
      }
      throw new Error(`Failed to get user repositories: ${errorMessage}`);
    }
  }

  // Get popular repositories (trending)
  async getPopularRepositories(): Promise<RepoSummary[]> {
    try {
      // This would typically use a different endpoint or service
      // For now, we'll return an empty array as this might need external data
      return [];
    } catch (error: unknown) {
      console.error('Failed to get popular repositories:', error);
      throw new Error('Failed to fetch popular repositories.');
    }
  }

  // Check if the authenticated user has starred a repository
  async hasStarredRepo(owner: string, repo: string): Promise<boolean> {
    try {
      await this.octokit.rest.activity.checkRepoIsStarredByAuthenticatedUser({
        owner,
        repo,
      });
      return true;
    } catch (error: unknown) {
      // If the repo is not starred, the API returns a 404
      const errorObj = error as { status?: number };
      if (errorObj.status === 404) {
        return false;
      }
      // For other errors, throw them
      const errorMessage = parseError(error);
      throw new Error(`Failed to check if repo is starred: ${errorMessage}`);
    }
  }
} 