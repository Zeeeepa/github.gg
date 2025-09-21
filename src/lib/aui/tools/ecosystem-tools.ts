// Backend integration tools that give better-ui access to the entire GitHub.gg ecosystem
import aui, { z } from '@/lib/better-ui-wrapper';
import React from 'react';
import { trpc } from '@/lib/trpc/client';

// Enhanced repository analysis tool with full backend integration
export const analyzeRepositoryEcosystem = aui
  .tool('analyzeRepositoryEcosystem')
  .describe('Comprehensive repository analysis using lynlang + GitHub.gg backend services')
  .tag('repository', 'ecosystem', 'github', 'analysis', 'comprehensive')
  .input(z.object({
    owner: z.string().describe('Repository owner/organization'),
    repo: z.string().describe('Repository name'),
    analysisScope: z.enum(['files', 'structure', 'dependencies', 'security', 'comprehensive']).default('comprehensive'),
    includeMetrics: z.boolean().default(true),
    includeSecurity: z.boolean().default(true),
    includePatterns: z.boolean().default(true),
    maxFiles: z.number().min(1).max(100).default(50).describe('Maximum number of files to analyze'),
    fileExtensions: z.array(z.string()).optional().describe('Specific file extensions to analyze')
  }))
  .execute(async ({ input }) => {
    try {
      // Step 1: Get repository information from GitHub API
      const repoInfo = await trpc.github.repos.get.query({
        owner: input.owner,
        repo: input.repo
      });

      // Step 2: Get repository file structure
      const fileStructure = await trpc.github.files.getTree.query({
        owner: input.owner,
        repo: input.repo,
        recursive: true
      });

      // Step 3: Filter files for analysis
      const analysisFiles = filterFilesForAnalysis(fileStructure, {
        maxFiles: input.maxFiles,
        extensions: input.fileExtensions || ['zen', 'ts', 'js', 'py', 'rs', 'go', 'java', 'cpp', 'c']
      });

      // Step 4: Batch analyze files with lynlang
      const lynlangAnalysis = await trpc.lynlang.batchAnalyze.mutate({
        filePaths: analysisFiles.map(f => f.path),
        analysisOptions: {
          includeAST: input.analysisScope === 'comprehensive',
          includePatterns: input.includePatterns,
          includeMetrics: input.includeMetrics,
          timeout: 120000
        }
      });

      // Step 5: Get additional repository metrics from GitHub.gg
      const [scorecard, dependencies] = await Promise.allSettled([
        trpc.scorecard.get.query({ 
          owner: input.owner, 
          repo: input.repo 
        }).catch(() => null),
        trpc.github.repos.getDependencies.query({ 
          owner: input.owner, 
          repo: input.repo 
        }).catch(() => null)
      ]);

      // Step 6: Compile comprehensive ecosystem analysis
      const ecosystemAnalysis = {
        repository: {
          info: repoInfo,
          fileCount: fileStructure.length,
          analyzedFiles: analysisFiles.length,
          languages: detectLanguages(analysisFiles),
          structure: categorizeFiles(analysisFiles)
        },
        lynlangAnalysis: {
          success: lynlangAnalysis.success,
          results: lynlangAnalysis.results,
          summary: summarizeLynlangResults(lynlangAnalysis.results),
          executionTime: lynlangAnalysis.executionTime
        },
        metrics: {
          codeQuality: calculateCodeQuality(lynlangAnalysis.results),
          complexity: aggregateComplexity(lynlangAnalysis.results),
          security: aggregateSecurityFindings(lynlangAnalysis.results),
          maintainability: calculateMaintainability(lynlangAnalysis.results)
        },
        ecosystem: {
          scorecard: scorecard.status === 'fulfilled' ? scorecard.value : null,
          dependencies: dependencies.status === 'fulfilled' ? dependencies.value : null,
          integrations: detectIntegrations(fileStructure),
          frameworks: detectFrameworks(analysisFiles)
        },
        recommendations: generateRecommendations(lynlangAnalysis.results, repoInfo),
        timestamp: new Date().toISOString()
      };

      return {
        success: true,
        type: 'ecosystem-analysis',
        data: { ecosystemAnalysis }
      };
    } catch (error) {
      return {
        success: false,
        type: 'ecosystem-error',
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  })
  .render(({ data, loading, error }) => {
    if (loading) {
      return React.createElement('div', { className: 'p-6 border rounded-lg bg-gradient-to-r from-blue-50 via-purple-50 to-green-50' },
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', { className: 'flex items-center gap-3' },
            React.createElement('div', { className: 'animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full' }),
            React.createElement('div', {},
              React.createElement('div', { className: 'font-bold text-lg text-gray-800' }, 'Analyzing Repository Ecosystem'),
              React.createElement('div', { className: 'text-sm text-gray-600' }, 'Running comprehensive analysis with lynlang + GitHub.gg services')
            )
          ),
          React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-3 text-sm' },
            React.createElement('div', { className: 'flex items-center gap-2 p-2 bg-blue-100 rounded' },
              React.createElement('span', { className: 'animate-pulse' }, '🔍'),
              'Repository Scan'
            ),
            React.createElement('div', { className: 'flex items-center gap-2 p-2 bg-purple-100 rounded' },
              React.createElement('span', { className: 'animate-pulse' }, '⚡'),
              'Lynlang Analysis'
            ),
            React.createElement('div', { className: 'flex items-center gap-2 p-2 bg-green-100 rounded' },
              React.createElement('span', { className: 'animate-pulse' }, '📊'),
              'Metrics Collection'
            ),
            React.createElement('div', { className: 'flex items-center gap-2 p-2 bg-yellow-100 rounded' },
              React.createElement('span', { className: 'animate-pulse' }, '🔗'),
              'Ecosystem Integration'
            )
          )
        )
      );
    }

    if (error || !data?.success) {
      return React.createElement('div', { className: 'p-6 border-2 border-red-200 rounded-lg bg-red-50' },
        React.createElement('h3', { className: 'font-bold text-red-800 mb-3' }, 'Ecosystem Analysis Failed'),
        React.createElement('p', { className: 'text-red-700' }, error?.message || data?.error || 'Unknown error')
      );
    }

    const analysis = data.data.ecosystemAnalysis;

    return React.createElement('div', { className: 'space-y-6' },
      // Header
      React.createElement('div', { className: 'p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50' },
        React.createElement('div', { className: 'flex items-start justify-between' },
          React.createElement('div', {},
            React.createElement('h3', { className: 'text-2xl font-bold text-gray-800 mb-2' }, 
              `${analysis.repository.info.owner.login}/${analysis.repository.info.name}`
            ),
            React.createElement('p', { className: 'text-gray-600' }, analysis.repository.info.description),
            React.createElement('div', { className: 'flex gap-4 mt-3 text-sm' },
              React.createElement('span', { className: 'flex items-center gap-1' },
                '⭐', analysis.repository.info.stargazers_count.toLocaleString()
              ),
              React.createElement('span', { className: 'flex items-center gap-1' },
                '🍴', analysis.repository.info.forks_count.toLocaleString()
              ),
              React.createElement('span', { className: 'flex items-center gap-1' },
                '📁', `${analysis.repository.analyzedFiles}/${analysis.repository.fileCount} files analyzed`
              )
            )
          ),
          React.createElement('div', { className: 'text-right' },
            React.createElement('div', { className: 'text-sm text-gray-500' }, 'Primary Language'),
            React.createElement('div', { className: 'font-semibold text-lg' }, analysis.repository.info.language || 'Unknown')
          )
        )
      ),

      // Overview metrics
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-4' },
        React.createElement('div', { className: 'p-4 border rounded-lg bg-green-50' },
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'text-3xl font-bold text-green-600' }, 
              analysis.metrics.codeQuality.score.toFixed(1)
            ),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Code Quality Score'),
            React.createElement('div', { className: 'text-xs text-green-600 mt-1' }, analysis.metrics.codeQuality.grade)
          )
        ),
        React.createElement('div', { className: 'p-4 border rounded-lg bg-orange-50' },
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'text-3xl font-bold text-orange-600' }, 
              analysis.metrics.complexity.average.toFixed(1)
            ),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Avg Complexity'),
            React.createElement('div', { className: 'text-xs text-orange-600 mt-1' }, 
              `Max: ${analysis.metrics.complexity.max}`
            )
          )
        ),
        React.createElement('div', { className: 'p-4 border rounded-lg bg-blue-50' },
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'text-3xl font-bold text-blue-600' }, 
              analysis.metrics.maintainability.score.toFixed(1)
            ),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Maintainability'),
            React.createElement('div', { className: 'text-xs text-blue-600 mt-1' }, analysis.metrics.maintainability.level)
          )
        ),
        React.createElement('div', { className: 'p-4 border rounded-lg bg-red-50' },
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'text-3xl font-bold text-red-600' }, 
              analysis.metrics.security.issueCount
            ),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Security Issues'),
            React.createElement('div', { className: 'text-xs text-red-600 mt-1' }, 
              `${analysis.metrics.security.critical} critical`
            )
          )
        )
      ),

      // Repository structure
      React.createElement('div', { className: 'p-6 border rounded-lg' },
        React.createElement('h4', { className: 'font-bold text-lg mb-4' }, 'Repository Structure'),
        React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4' },
          ...Object.entries(analysis.repository.structure).map(([category, files]: [string, any]) =>
            React.createElement('div', { key: category, className: 'text-center p-3 bg-gray-50 rounded' },
              React.createElement('div', { className: 'text-2xl font-bold text-gray-700' }, files.length),
              React.createElement('div', { className: 'text-sm text-gray-600 capitalize' }, category)
            )
          )
        ),
        React.createElement('div', { className: 'mt-4' },
          React.createElement('h5', { className: 'font-semibold mb-2' }, 'Language Distribution'),
          React.createElement('div', { className: 'flex flex-wrap gap-2' },
            ...Object.entries(analysis.repository.languages).map(([lang, count]: [string, any]) =>
              React.createElement('span', { 
                key: lang, 
                className: 'px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium' 
              }, `${lang}: ${count}`)
            )
          )
        )
      ),

      // Lynlang analysis summary
      React.createElement('div', { className: 'p-6 border rounded-lg bg-purple-50' },
        React.createElement('h4', { className: 'font-bold text-lg mb-4 flex items-center gap-2' },
          React.createElement('span', {}, '⚡'),
          'Lynlang Analysis Summary'
        ),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-4' },
          React.createElement('div', { className: 'text-center p-3 bg-white rounded border' },
            React.createElement('div', { className: 'text-2xl font-bold text-purple-600' }, 
              analysis.lynlangAnalysis.summary.totalLinesOfCode.toLocaleString()
            ),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Total Lines of Code')
          ),
          React.createElement('div', { className: 'text-center p-3 bg-white rounded border' },
            React.createElement('div', { className: 'text-2xl font-bold text-blue-600' }, 
              analysis.lynlangAnalysis.summary.totalPatterns
            ),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Patterns Detected')
          ),
          React.createElement('div', { className: 'text-center p-3 bg-white rounded border' },
            React.createElement('div', { className: 'text-2xl font-bold text-green-600' }, 
              `${(analysis.lynlangAnalysis.executionTime / 1000).toFixed(1)}s`
            ),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Analysis Time')
          )
        ),
        analysis.lynlangAnalysis.summary.fileResults.length > 0 && React.createElement('details', { className: 'mt-4' },
          React.createElement('summary', { className: 'cursor-pointer font-medium text-purple-700 hover:text-purple-900' }, 
            'File Analysis Details'
          ),
          React.createElement('div', { className: 'mt-3 max-h-64 overflow-y-auto space-y-2' },
            ...analysis.lynlangAnalysis.summary.fileResults.slice(0, 10).map((result: any, index: number) =>
              React.createElement('div', { key: index, className: 'p-3 bg-white rounded border text-sm' },
                React.createElement('div', { className: 'flex justify-between items-start' },
                  React.createElement('div', { className: 'flex-1' },
                    React.createElement('div', { className: 'font-medium text-gray-800' }, 
                      result.filePath.split('/').pop()
                    ),
                    React.createElement('div', { className: 'text-xs text-gray-600' }, result.filePath),
                    result.analysis && React.createElement('div', { className: 'text-xs text-blue-600 mt-1' },
                      `${result.analysis.metrics?.linesOfCode || 0} LOC, ` +
                      `${result.analysis.metrics?.complexity.cyclomatic || 0} complexity`
                    )
                  ),
                  React.createElement('div', { className: 'ml-3' },
                    React.createElement('span', { 
                      className: `px-2 py-1 rounded-full text-xs ${
                        result.analysis?.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }` 
                    }, result.analysis?.success ? '✓' : '✗')
                  )
                )
              )
            )
          )
        )
      ),

      // Security findings
      analysis.metrics.security.issueCount > 0 && React.createElement('div', { className: 'p-6 border rounded-lg bg-red-50' },
        React.createElement('h4', { className: 'font-bold text-lg mb-4 flex items-center gap-2 text-red-800' },
          React.createElement('span', {}, '🛡️'),
          `Security Analysis (${analysis.metrics.security.issueCount} issues)`
        ),
        React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-3 mb-4' },
          React.createElement('div', { className: 'text-center p-2 bg-red-100 rounded' },
            React.createElement('div', { className: 'font-bold text-red-600' }, analysis.metrics.security.critical),
            React.createElement('div', { className: 'text-xs text-gray-600' }, 'Critical')
          ),
          React.createElement('div', { className: 'text-center p-2 bg-orange-100 rounded' },
            React.createElement('div', { className: 'font-bold text-orange-600' }, analysis.metrics.security.high),
            React.createElement('div', { className: 'text-xs text-gray-600' }, 'High')
          ),
          React.createElement('div', { className: 'text-center p-2 bg-yellow-100 rounded' },
            React.createElement('div', { className: 'font-bold text-yellow-600' }, analysis.metrics.security.medium),
            React.createElement('div', { className: 'text-xs text-gray-600' }, 'Medium')
          ),
          React.createElement('div', { className: 'text-center p-2 bg-blue-100 rounded' },
            React.createElement('div', { className: 'font-bold text-blue-600' }, analysis.metrics.security.low),
            React.createElement('div', { className: 'text-xs text-gray-600' }, 'Low')
          )
        )
      ),

      // Ecosystem integrations
      React.createElement('div', { className: 'p-6 border rounded-lg bg-green-50' },
        React.createElement('h4', { className: 'font-bold text-lg mb-4 flex items-center gap-2' },
          React.createElement('span', {}, '🔗'),
          'Ecosystem Integrations'
        ),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
          // Detected frameworks
          React.createElement('div', {},
            React.createElement('h5', { className: 'font-semibold mb-2 text-green-700' }, 'Detected Frameworks'),
            React.createElement('div', { className: 'flex flex-wrap gap-2' },
              ...analysis.ecosystem.frameworks.map((framework: string, index: number) =>
                React.createElement('span', { 
                  key: index,
                  className: 'px-2 py-1 bg-green-100 text-green-800 rounded text-sm' 
                }, framework)
              )
            )
          ),
          // Integration tools
          React.createElement('div', {},
            React.createElement('h5', { className: 'font-semibold mb-2 text-blue-700' }, 'Integration Tools'),
            React.createElement('div', { className: 'flex flex-wrap gap-2' },
              ...analysis.ecosystem.integrations.map((integration: string, index: number) =>
                React.createElement('span', { 
                  key: index,
                  className: 'px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm' 
                }, integration)
              )
            )
          )
        ),
        // Scorecard (if available)
        analysis.ecosystem.scorecard && React.createElement('div', { className: 'mt-4 p-4 bg-white rounded border' },
          React.createElement('h5', { className: 'font-semibold mb-2' }, 'GitHub.gg Scorecard'),
          React.createElement('div', { className: 'text-sm text-gray-600' },
            `Score: ${analysis.ecosystem.scorecard.score}/100 • Last updated: ${new Date(analysis.ecosystem.scorecard.updatedAt).toLocaleDateString()}`
          )
        )
      ),

      // Recommendations
      analysis.recommendations.length > 0 && React.createElement('div', { className: 'p-6 border rounded-lg bg-yellow-50' },
        React.createElement('h4', { className: 'font-bold text-lg mb-4 flex items-center gap-2' },
          React.createElement('span', {}, '💡'),
          'Recommendations'
        ),
        React.createElement('div', { className: 'space-y-3' },
          ...analysis.recommendations.map((rec: any, index: number) =>
            React.createElement('div', { key: index, className: 'p-3 bg-white border rounded' },
              React.createElement('div', { className: 'flex items-start gap-3' },
                React.createElement('span', { 
                  className: `text-lg ${
                    rec.priority === 'high' ? 'text-red-500' :
                    rec.priority === 'medium' ? 'text-yellow-500' :
                    'text-green-500'
                  }` 
                }, rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'),
                React.createElement('div', { className: 'flex-1' },
                  React.createElement('div', { className: 'font-medium text-gray-800' }, rec.title),
                  React.createElement('div', { className: 'text-sm text-gray-600 mt-1' }, rec.description),
                  rec.action && React.createElement('div', { className: 'text-xs text-blue-600 mt-2' }, 
                    `Action: ${rec.action}`
                  )
                )
              )
            )
          )
        )
      ),

      // Analysis timestamp
      React.createElement('div', { className: 'text-center text-xs text-gray-500 py-4 border-t' },
        `Comprehensive analysis completed at ${new Date(analysis.timestamp).toLocaleString()}`
      )
    );
  });

// Tool for real-time lynlang analysis during development
export const realTimeLynlangAnalysis = aui
  .tool('realTimeLynlangAnalysis')
  .describe('Real-time code analysis as user types/edits code using lynlang backend')
  .tag('realtime', 'analysis', 'development', 'lynlang', 'feedback')
  .input(z.object({
    code: z.string().describe('Current code content'),
    language: z.string().default('zen'),
    analysisLevel: z.enum(['basic', 'standard', 'comprehensive']).default('standard'),
    enableLivePatterns: z.boolean().default(true),
    enableLiveMetrics: z.boolean().default(true)
  }))
  .execute(async ({ input }) => {
    try {
      const analysis = await trpc.lynlang.analyzeContent.mutate({
        content: input.code,
        language: input.language,
        analysisOptions: {
          includeAST: input.analysisLevel === 'comprehensive',
          includePatterns: input.enableLivePatterns,
          includeMetrics: input.enableLiveMetrics,
          timeout: 5000 // Quick analysis for real-time
        }
      });

      return {
        success: true,
        type: 'realtime-analysis',
        data: { 
          analysis,
          insights: generateRealTimeInsights(analysis),
          suggestions: generateCodeSuggestions(analysis, input.code)
        }
      };
    } catch (error) {
      return {
        success: false,
        type: 'realtime-error',
        error: error instanceof Error ? error.message : 'Analysis failed',
        data: null
      };
    }
  })
  .render(({ data, loading, error }) => {
    if (loading) {
      return React.createElement('div', { className: 'p-3 border rounded bg-blue-50' },
        React.createElement('div', { className: 'flex items-center gap-2 text-sm' },
          React.createElement('div', { className: 'animate-pulse h-2 w-2 bg-blue-500 rounded-full' }),
          React.createElement('span', { className: 'text-blue-700' }, 'Analyzing...')
        )
      );
    }

    if (error || !data?.success) {
      return React.createElement('div', { className: 'p-3 border rounded bg-red-50' },
        React.createElement('div', { className: 'text-red-700 text-sm' }, '⚠️ Analysis error')
      );
    }

    const { analysis, insights, suggestions } = data.data;

    return React.createElement('div', { className: 'space-y-3' },
      // Quick metrics
      analysis.metrics && React.createElement('div', { className: 'flex gap-4 text-sm' },
        React.createElement('span', { className: 'px-2 py-1 bg-blue-100 text-blue-700 rounded' },
          `${analysis.metrics.linesOfCode} LOC`
        ),
        React.createElement('span', { className: 'px-2 py-1 bg-orange-100 text-orange-700 rounded' },
          `Complexity: ${analysis.metrics.complexity.cyclomatic}`
        ),
        analysis.patterns && React.createElement('span', { className: 'px-2 py-1 bg-purple-100 text-purple-700 rounded' },
          `${analysis.patterns.length} patterns`
        )
      ),

      // Live insights
      insights.length > 0 && React.createElement('div', { className: 'space-y-1' },
        ...insights.map((insight: any, index: number) =>
          React.createElement('div', { 
            key: index, 
            className: `text-xs p-2 rounded ${
              insight.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
              insight.type === 'error' ? 'bg-red-50 text-red-700' :
              'bg-green-50 text-green-700'
            }` 
          }, insight.message)
        )
      ),

      // Code suggestions
      suggestions.length > 0 && React.createElement('details', { className: 'text-sm' },
        React.createElement('summary', { className: 'cursor-pointer text-blue-600 hover:text-blue-800' }, 
          `💡 ${suggestions.length} suggestions`
        ),
        React.createElement('div', { className: 'mt-2 space-y-1' },
          ...suggestions.slice(0, 3).map((suggestion: any, index: number) =>
            React.createElement('div', { key: index, className: 'p-2 bg-blue-50 text-blue-700 rounded text-xs' },
              suggestion.text
            )
          )
        )
      )
    );
  });

// Helper functions
function filterFilesForAnalysis(files: any[], options: { maxFiles: number; extensions: string[] }): any[] {
  return files
    .filter(file => file.type === 'blob') // Only files, not directories
    .filter(file => {
      const ext = file.path.split('.').pop()?.toLowerCase();
      return ext && options.extensions.includes(ext);
    })
    .slice(0, options.maxFiles);
}

function detectLanguages(files: any[]): Record<string, number> {
  const languages: Record<string, number> = {};
  files.forEach(file => {
    const ext = file.path.split('.').pop()?.toLowerCase();
    if (ext) {
      const lang = extToLanguage(ext);
      languages[lang] = (languages[lang] || 0) + 1;
    }
  });
  return languages;
}

function extToLanguage(ext: string): string {
  const mapping: Record<string, string> = {
    'ts': 'TypeScript',
    'js': 'JavaScript',
    'py': 'Python',
    'rs': 'Rust',
    'go': 'Go',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'zen': 'Zen'
  };
  return mapping[ext] || ext.toUpperCase();
}

function categorizeFiles(files: any[]): Record<string, any[]> {
  const categories: Record<string, any[]> = {
    source: [],
    test: [],
    config: [],
    docs: [],
    other: []
  };

  files.forEach(file => {
    if (file.path.includes('test') || file.path.includes('spec')) {
      categories.test.push(file);
    } else if (file.path.includes('config') || file.path.endsWith('.json') || file.path.endsWith('.yaml')) {
      categories.config.push(file);
    } else if (file.path.includes('doc') || file.path.endsWith('.md')) {
      categories.docs.push(file);
    } else if (file.path.match(/\.(ts|js|py|rs|go|java|cpp|c|zen)$/)) {
      categories.source.push(file);
    } else {
      categories.other.push(file);
    }
  });

  return categories;
}

function summarizeLynlangResults(results: any[]): any {
  const successful = results.filter(r => r.analysis?.success);
  
  return {
    totalFiles: results.length,
    successfulAnalyses: successful.length,
    totalLinesOfCode: successful.reduce((sum, r) => sum + (r.analysis?.metrics?.linesOfCode || 0), 0),
    totalPatterns: successful.reduce((sum, r) => sum + (r.analysis?.patterns?.length || 0), 0),
    fileResults: results
  };
}

function calculateCodeQuality(results: any[]): any {
  const successful = results.filter(r => r.analysis?.success && r.analysis?.metrics);
  if (successful.length === 0) return { score: 0, grade: 'N/A' };

  const avgComplexity = successful.reduce((sum, r) => sum + r.analysis.metrics.complexity.cyclomatic, 0) / successful.length;
  const score = Math.max(0, 100 - avgComplexity * 5);
  
  return {
    score,
    grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
  };
}

function aggregateComplexity(results: any[]): any {
  const complexities = results
    .filter(r => r.analysis?.success && r.analysis?.metrics)
    .map(r => r.analysis.metrics.complexity.cyclomatic);

  return {
    average: complexities.length > 0 ? complexities.reduce((a, b) => a + b) / complexities.length : 0,
    max: complexities.length > 0 ? Math.max(...complexities) : 0,
    min: complexities.length > 0 ? Math.min(...complexities) : 0
  };
}

function aggregateSecurityFindings(results: any[]): any {
  const allVulns = results
    .filter(r => r.analysis?.success && r.analysis?.metrics?.security)
    .flatMap(r => r.analysis.metrics.security.vulnerabilities);

  return {
    issueCount: allVulns.length,
    critical: allVulns.filter(v => v.severity === 'critical').length,
    high: allVulns.filter(v => v.severity === 'high').length,
    medium: allVulns.filter(v => v.severity === 'medium').length,
    low: allVulns.filter(v => v.severity === 'low').length
  };
}

function calculateMaintainability(results: any[]): any {
  const successful = results.filter(r => r.analysis?.success && r.analysis?.metrics?.quality);
  if (successful.length === 0) return { score: 50, level: 'Unknown' };

  const avgMaintainability = successful.reduce((sum, r) => sum + r.analysis.metrics.quality.maintainability, 0) / successful.length;
  
  return {
    score: avgMaintainability,
    level: avgMaintainability >= 80 ? 'Excellent' : avgMaintainability >= 60 ? 'Good' : avgMaintainability >= 40 ? 'Fair' : 'Poor'
  };
}

function detectIntegrations(files: any[]): string[] {
  const integrations: string[] = [];
  const fileNames = files.map(f => f.path.toLowerCase());

  if (fileNames.some(f => f.includes('docker'))) integrations.push('Docker');
  if (fileNames.some(f => f.includes('github/workflows'))) integrations.push('GitHub Actions');
  if (fileNames.some(f => f.includes('travis'))) integrations.push('Travis CI');
  if (fileNames.some(f => f.includes('jenkins'))) integrations.push('Jenkins');
  if (fileNames.some(f => f.includes('terraform'))) integrations.push('Terraform');
  if (fileNames.some(f => f.includes('kubernetes') || f.includes('k8s'))) integrations.push('Kubernetes');

  return integrations;
}

function detectFrameworks(files: any[]): string[] {
  const frameworks: string[] = [];
  const fileContents = files.map(f => f.path.toLowerCase()).join(' ');

  if (fileContents.includes('react')) frameworks.push('React');
  if (fileContents.includes('next')) frameworks.push('Next.js');
  if (fileContents.includes('vue')) frameworks.push('Vue.js');
  if (fileContents.includes('angular')) frameworks.push('Angular');
  if (fileContents.includes('express')) frameworks.push('Express.js');
  if (fileContents.includes('fastapi')) frameworks.push('FastAPI');
  if (fileContents.includes('django')) frameworks.push('Django');
  if (fileContents.includes('rails')) frameworks.push('Ruby on Rails');

  return frameworks;
}

function generateRecommendations(results: any[], repoInfo: any): any[] {
  const recommendations: any[] = [];
  const successful = results.filter(r => r.analysis?.success);

  // High complexity recommendation
  const highComplexityFiles = successful.filter(r => r.analysis.metrics?.complexity.cyclomatic > 10);
  if (highComplexityFiles.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Reduce Code Complexity',
      description: `${highComplexityFiles.length} files have high cyclomatic complexity (>10). Consider refactoring.`,
      action: 'Review and refactor complex functions'
    });
  }

  // Security recommendations
  const securityIssues = successful.filter(r => r.analysis.metrics?.security?.vulnerabilities?.length > 0);
  if (securityIssues.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Address Security Issues',
      description: 'Security vulnerabilities detected in code analysis.',
      action: 'Review and fix security vulnerabilities'
    });
  }

  // Documentation recommendation
  if (!repoInfo.description || repoInfo.description.length < 20) {
    recommendations.push({
      priority: 'medium',
      title: 'Improve Documentation',
      description: 'Repository lacks comprehensive description and documentation.',
      action: 'Add detailed README and API documentation'
    });
  }

  return recommendations;
}

function generateRealTimeInsights(analysis: any): any[] {
  const insights: any[] = [];

  if (analysis.metrics?.complexity.cyclomatic > 10) {
    insights.push({
      type: 'warning',
      message: 'High complexity detected - consider breaking into smaller functions'
    });
  }

  if (analysis.patterns?.some((p: any) => p.type.includes('deprecated'))) {
    insights.push({
      type: 'warning',
      message: 'Deprecated patterns found'
    });
  }

  if (analysis.errors?.length === 0 && analysis.warnings?.length === 0) {
    insights.push({
      type: 'info',
      message: 'Code analysis passed without issues'
    });
  }

  return insights;
}

function generateCodeSuggestions(analysis: any, code: string): any[] {
  const suggestions: any[] = [];

  if (analysis.metrics?.complexity.cyclomatic > 15) {
    suggestions.push({
      text: 'Consider extracting complex logic into separate functions',
      type: 'refactor'
    });
  }

  if (code.includes('TODO') || code.includes('FIXME')) {
    suggestions.push({
      text: 'Address TODO/FIXME comments before production',
      type: 'cleanup'
    });
  }

  if (!code.includes('export') && code.includes('function')) {
    suggestions.push({
      text: 'Consider making functions exportable for better modularity',
      type: 'modularity'
    });
  }

  return suggestions;
}

export const ecosystemTools = {
  analyzeRepositoryEcosystem,
  realTimeLynlangAnalysis
};