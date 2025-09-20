import { aui, z } from '@lantos1618/better-ui';
import { createGitHubServiceFromSession } from '@/lib/github';

// Tool to analyze repository structure
export const analyzeRepositoryStructure = aui
  .tool('analyzeRepositoryStructure')
  .describe('Analyze the structure and organization of a GitHub repository')
  .tag('repository', 'analysis', 'structure')
  .input(z.object({
    owner: z.string().describe('Repository owner/organization'),
    repo: z.string().describe('Repository name'),
    ref: z.string().optional().describe('Git reference (branch, tag, or commit)'),
    maxFiles: z.number().default(500).describe('Maximum number of files to analyze')
  }))
  .execute(async ({ input, ctx }) => {
    try {
      const response = await ctx?.fetch?.('/api/trpc/github.files.files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: {
            owner: input.owner,
            repo: input.repo,
            ref: input.ref,
            maxFiles: input.maxFiles
          }
        })
      });
      
      if (!response?.ok) {
        throw new Error(`Failed to fetch repository files: ${response?.statusText}`);
      }
      
      const data = await response.json();
      const files = data.result?.data?.files || [];
      
      // Analyze file structure
      const fileTypes = new Map<string, number>();
      const directories = new Set<string>();
      const languageStats = new Map<string, number>();
      
      files.forEach((file: any) => {
        // Extract file extension
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext) {
          fileTypes.set(ext, (fileTypes.get(ext) || 0) + 1);
          
          // Map extensions to languages
          const langMap: Record<string, string> = {
            'js': 'JavaScript', 'ts': 'TypeScript', 'jsx': 'JavaScript',
            'tsx': 'TypeScript', 'py': 'Python', 'java': 'Java',
            'cpp': 'C++', 'c': 'C', 'cs': 'C#', 'rb': 'Ruby',
            'go': 'Go', 'rs': 'Rust', 'php': 'PHP', 'swift': 'Swift'
          };
          
          const language = langMap[ext] || ext.toUpperCase();
          languageStats.set(language, (languageStats.get(language) || 0) + 1);
        }
        
        // Extract directory
        const dir = file.path.split('/').slice(0, -1).join('/');
        if (dir) directories.add(dir);
      });
      
      return {
        totalFiles: files.length,
        fileTypes: Object.fromEntries(fileTypes),
        languages: Object.fromEntries(languageStats),
        directories: Array.from(directories).sort(),
        structure: {
          hasPackageJson: files.some((f: any) => f.name === 'package.json'),
          hasReadme: files.some((f: any) => f.name.toLowerCase().includes('readme')),
          hasDockerfile: files.some((f: any) => f.name === 'Dockerfile'),
          hasTests: files.some((f: any) => f.path.includes('test') || f.path.includes('spec')),
          isMonorepo: files.some((f: any) => f.name === 'lerna.json' || f.name === 'nx.json')
        }
      };
    } catch (error) {
      throw new Error(`Failed to analyze repository structure: ${error}`);
    }
  });

// Tool to search repository files
export const searchRepositoryFiles = aui
  .tool('searchRepositoryFiles')
  .describe('Search for specific patterns or content within repository files')
  .tag('repository', 'search', 'files')
  .input(z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name'),
    query: z.string().describe('Search query or pattern'),
    fileExtensions: z.array(z.string()).optional().describe('File extensions to search in'),
    caseSensitive: z.boolean().default(false).describe('Whether search is case sensitive')
  }))
  .execute(async ({ input, ctx }) => {
    try {
      const response = await ctx?.fetch?.('/api/trpc/github.files.files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: {
            owner: input.owner,
            repo: input.repo,
            maxFiles: 1000
          }
        })
      });
      
      const data = await response?.json();
      const files = data.result?.data?.files || [];
      
      const results: Array<{
        file: string;
        path: string;
        matches: Array<{ line: number; content: string; context: string }>;
      }> = [];
      
      const searchRegex = new RegExp(
        input.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        input.caseSensitive ? 'g' : 'gi'
      );
      
      files.forEach((file: any) => {
        if (input.fileExtensions?.length) {
          const ext = file.name.split('.').pop()?.toLowerCase();
          if (!input.fileExtensions.includes(ext)) return;
        }
        
        if (file.content) {
          const lines = file.content.split('\n');
          const matches: Array<{ line: number; content: string; context: string }> = [];
          
          lines.forEach((line: string, index: number) => {
            if (searchRegex.test(line)) {
              const contextStart = Math.max(0, index - 2);
              const contextEnd = Math.min(lines.length - 1, index + 2);
              const context = lines.slice(contextStart, contextEnd + 1).join('\n');
              
              matches.push({
                line: index + 1,
                content: line.trim(),
                context
              });
            }
          });
          
          if (matches.length > 0) {
            results.push({
              file: file.name,
              path: file.path,
              matches: matches.slice(0, 10) // Limit matches per file
            });
          }
        }
      });
      
      return {
        query: input.query,
        totalResults: results.length,
        results: results.slice(0, 50) // Limit total results
      };
    } catch (error) {
      throw new Error(`Failed to search repository files: ${error}`);
    }
  });

// Tool to get repository information
export const getRepositoryInfo = aui
  .tool('getRepositoryInfo')
  .describe('Get comprehensive information about a GitHub repository')
  .tag('repository', 'info', 'metadata')
  .input(z.object({
    owner: z.string().describe('Repository owner'),
    repo: z.string().describe('Repository name')
  }))
  .execute(async ({ input, ctx }) => {
    try {
      const response = await ctx?.fetch?.('/api/trpc/github.files.getRepoInfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: {
            owner: input.owner,
            repo: input.repo
          }
        })
      });
      
      const data = await response?.json();
      return data.result?.data || {};
    } catch (error) {
      throw new Error(`Failed to get repository info: ${error}`);
    }
  });

// Export all repository tools
export const repositoryTools = {
  analyzeRepositoryStructure,
  searchRepositoryFiles,
  getRepositoryInfo
};