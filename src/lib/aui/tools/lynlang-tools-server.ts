// Server-side lynlang tools with full compiler capabilities via tRPC
import aui, { z } from '@/lib/better-ui-wrapper';
import React from 'react';
import { trpc } from '@/lib/trpc/client';

// Enhanced server-side tool for comprehensive code analysis
export const analyzeCodeWithLynlang = aui
  .tool('analyzeCodeWithLynlang')
  .describe('Perform comprehensive code analysis using full lynlang compiler capabilities')
  .tag('code', 'analysis', 'server', 'lynlang', 'ast', 'patterns', 'metrics')
  .input(z.object({
    code: z.string().describe('Code content to analyze'),
    language: z.enum(['zen', 'typescript', 'javascript', 'python', 'rust']).default('zen').describe('Programming language'),
    analysisType: z.enum(['structure', 'patterns', 'ast', 'metrics', 'security', 'comprehensive']).default('comprehensive').describe('Type of analysis to perform'),
    patterns: z.array(z.string()).optional().describe('Specific patterns to search for'),
    includeAST: z.boolean().default(true).describe('Include Abstract Syntax Tree in analysis'),
    includeSecurity: z.boolean().default(true).describe('Include security vulnerability analysis'),
    filename: z.string().optional().describe('Virtual filename for better context')
  }))
  .execute(async ({ input }) => {
    try {
      const analysis = await trpc.lynlang.analyzeContent.mutate({
        content: input.code,
        language: input.language,
        filename: input.filename || `analysis.${input.language === 'zen' ? 'zen' : input.language === 'typescript' ? 'ts' : input.language === 'javascript' ? 'js' : input.language === 'python' ? 'py' : input.language === 'rust' ? 'rs' : 'txt'}`,
        analysisOptions: {
          includeAST: input.includeAST && ['ast', 'comprehensive'].includes(input.analysisType),
          includePatterns: ['patterns', 'comprehensive'].includes(input.analysisType),
          includeMetrics: ['metrics', 'comprehensive'].includes(input.analysisType),
          patterns: input.patterns,
          timeout: 30000
        }
      });

      return {
        success: analysis.success,
        type: 'comprehensive-analysis',
        data: {
          analysis,
          capabilities: {
            hasFullCompiler: true,
            supportsAST: true,
            supportsPatterns: true,
            supportsMetrics: true,
            supportsSecurity: input.includeSecurity
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        type: 'analysis-error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: null
      };
    }
  })
  .render(({ data, loading, error }) => {
    if (loading) {
      return React.createElement('div', { className: 'p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50' }, 
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('div', { className: 'animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full' }),
          React.createElement('div', { className: 'space-y-1' },
            React.createElement('div', { className: 'font-semibold text-blue-700' }, 'Running Lynlang Analysis...'),
            React.createElement('div', { className: 'text-sm text-blue-600' }, 'Using full compiler capabilities with AST generation, pattern matching, and security analysis')
          )
        )
      );
    }

    if (error) {
      return React.createElement('div', { className: 'p-6 border-2 border-red-200 rounded-lg bg-red-50' },
        React.createElement('div', { className: 'flex items-start gap-3' },
          React.createElement('div', { className: 'text-red-500 text-xl' }, '⚠️'),
          React.createElement('div', { className: 'flex-1' },
            React.createElement('h3', { className: 'font-semibold text-red-800 mb-2' }, 'Lynlang Analysis Error'),
            React.createElement('p', { className: 'text-red-700 mb-3' }, error.message),
            React.createElement('details', { className: 'text-sm' },
              React.createElement('summary', { className: 'cursor-pointer font-medium text-red-600 hover:text-red-800' }, 'Technical Details'),
              React.createElement('pre', { className: 'mt-2 p-3 bg-red-100 rounded overflow-auto text-xs' }, 
                JSON.stringify(error, null, 2)
              )
            )
          )
        )
      );
    }

    if (!data?.success) {
      return React.createElement('div', { className: 'p-6 border-2 border-yellow-200 rounded-lg bg-yellow-50' },
        React.createElement('div', { className: 'flex items-start gap-3' },
          React.createElement('div', { className: 'text-yellow-600 text-xl' }, '⚠️'),
          React.createElement('div', { className: 'flex-1' },
            React.createElement('h3', { className: 'font-semibold text-yellow-800 mb-2' }, 'Analysis Failed'),
            React.createElement('p', { className: 'text-yellow-700' }, data?.error || 'Unknown error occurred'),
            data?.data && React.createElement('details', { className: 'mt-3 text-sm' },
              React.createElement('summary', { className: 'cursor-pointer font-medium text-yellow-600' }, 'Error Details'),
              React.createElement('pre', { className: 'mt-2 p-3 bg-yellow-100 rounded overflow-auto text-xs' }, 
                JSON.stringify(data.data, null, 2)
              )
            )
          )
        )
      );
    }

    const analysis = data.data.analysis;
    const capabilities = data.data.capabilities;

    return React.createElement('div', { className: 'p-6 border rounded-lg bg-gradient-to-br from-green-50 to-blue-50' },
      // Header with capabilities
      React.createElement('div', { className: 'flex items-center justify-between mb-6' },
        React.createElement('h3', { className: 'text-xl font-bold text-gray-800' }, 'Comprehensive Lynlang Analysis'),
        React.createElement('div', { className: 'flex gap-2' },
          capabilities.hasFullCompiler && React.createElement('span', { className: 'px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full' }, '🚀 Full Compiler'),
          capabilities.supportsAST && React.createElement('span', { className: 'px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full' }, '🌳 AST'),
          capabilities.supportsPatterns && React.createElement('span', { className: 'px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full' }, '🔍 Patterns'),
          capabilities.supportsSecurity && React.createElement('span', { className: 'px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full' }, '🛡️ Security')
        )
      ),

      // Context information
      React.createElement('div', { className: 'mb-6 p-4 bg-white rounded-lg border' },
        React.createElement('h4', { className: 'font-semibold mb-3 text-gray-700' }, 'Analysis Context'),
        React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4 text-sm' },
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'font-semibold text-blue-600' }, analysis.context.language.toUpperCase()),
            React.createElement('div', { className: 'text-gray-600' }, 'Language')
          ),
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'font-semibold text-green-600' }, `${analysis.context.fileSize} bytes`),
            React.createElement('div', { className: 'text-gray-600' }, 'File Size')
          ),
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'font-semibold text-purple-600' }, `${analysis.context.executionTime}ms`),
            React.createElement('div', { className: 'text-gray-600' }, 'Analysis Time')
          ),
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'font-semibold text-orange-600' }, analysis.analysisType.toUpperCase()),
            React.createElement('div', { className: 'text-gray-600' }, 'Type')
          )
        )
      ),

      // Metrics Section (if available)
      analysis.metrics && React.createElement('div', { className: 'mb-6' },
        React.createElement('h4', { className: 'font-semibold mb-4 text-gray-700' }, 'Code Metrics'),
        
        // Primary metrics
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-4' },
          React.createElement('div', { className: 'text-center p-4 bg-blue-50 rounded-lg border' },
            React.createElement('div', { className: 'text-3xl font-bold text-blue-600' }, analysis.metrics.linesOfCode),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Lines of Code')
          ),
          React.createElement('div', { className: 'text-center p-4 bg-orange-50 rounded-lg border' },
            React.createElement('div', { className: 'text-3xl font-bold text-orange-600' }, analysis.metrics.complexity.cyclomatic),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Cyclomatic Complexity')
          ),
          React.createElement('div', { className: 'text-center p-4 bg-purple-50 rounded-lg border' },
            React.createElement('div', { className: 'text-3xl font-bold text-purple-600' }, analysis.metrics.complexity.cognitive.toFixed(1)),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Cognitive Complexity')
          )
        ),

        // Quality metrics (if available)
        analysis.metrics.quality && React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-4' },
          React.createElement('div', { className: 'text-center p-3 bg-green-50 rounded-lg' },
            React.createElement('div', { className: 'text-2xl font-bold text-green-600' }, `${analysis.metrics.quality.maintainability}%`),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Maintainability')
          ),
          React.createElement('div', { className: 'text-center p-3 bg-cyan-50 rounded-lg' },
            React.createElement('div', { className: 'text-2xl font-bold text-cyan-600' }, `${analysis.metrics.quality.testability}%`),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Testability')
          ),
          React.createElement('div', { className: 'text-center p-3 bg-indigo-50 rounded-lg' },
            React.createElement('div', { className: 'text-2xl font-bold text-indigo-600' }, `${analysis.metrics.quality.documentation}%`),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Documentation')
          )
        ),

        // Halstead metrics (if available)
        analysis.metrics.complexity.halstead && React.createElement('details', { className: 'mt-4' },
          React.createElement('summary', { className: 'cursor-pointer font-medium text-gray-700 hover:text-gray-900' }, 'Halstead Complexity Metrics'),
          React.createElement('div', { className: 'mt-3 grid grid-cols-2 md:grid-cols-4 gap-3' },
            React.createElement('div', { className: 'text-center p-3 bg-yellow-50 rounded' },
              React.createElement('div', { className: 'font-bold text-yellow-600' }, analysis.metrics.complexity.halstead.vocabulary),
              React.createElement('div', { className: 'text-xs text-gray-600' }, 'Vocabulary')
            ),
            React.createElement('div', { className: 'text-center p-3 bg-yellow-50 rounded' },
              React.createElement('div', { className: 'font-bold text-yellow-600' }, analysis.metrics.complexity.halstead.length),
              React.createElement('div', { className: 'text-xs text-gray-600' }, 'Length')
            ),
            React.createElement('div', { className: 'text-center p-3 bg-yellow-50 rounded' },
              React.createElement('div', { className: 'font-bold text-yellow-600' }, analysis.metrics.complexity.halstead.difficulty.toFixed(2)),
              React.createElement('div', { className: 'text-xs text-gray-600' }, 'Difficulty')
            ),
            React.createElement('div', { className: 'text-center p-3 bg-yellow-50 rounded' },
              React.createElement('div', { className: 'font-bold text-yellow-600' }, analysis.metrics.complexity.halstead.effort.toFixed(0)),
              React.createElement('div', { className: 'text-xs text-gray-600' }, 'Effort')
            )
          )
        )
      ),

      // Patterns Section (if available)
      analysis.patterns && analysis.patterns.length > 0 && React.createElement('div', { className: 'mb-6' },
        React.createElement('h4', { className: 'font-semibold mb-4 text-gray-700' }, `Code Patterns Found (${analysis.patterns.length})`),
        React.createElement('div', { className: 'space-y-3 max-h-64 overflow-y-auto' },
          ...analysis.patterns.slice(0, 10).map((pattern: any, index: number) => 
            React.createElement('div', { key: index, className: 'p-3 bg-white border rounded-lg' },
              React.createElement('div', { className: 'flex items-start justify-between' },
                React.createElement('div', { className: 'flex-1' },
                  React.createElement('div', { className: 'font-medium text-gray-800' }, pattern.type),
                  React.createElement('div', { className: 'text-sm text-gray-600 mt-1' }, pattern.description),
                  React.createElement('div', { className: 'text-xs text-blue-600 mt-2' }, 
                    `Line ${pattern.location.line}, Column ${pattern.location.column}`
                  )
                ),
                React.createElement('div', { className: 'ml-3' },
                  React.createElement('span', { 
                    className: `px-2 py-1 rounded-full text-xs font-medium ${
                      pattern.confidence > 0.8 ? 'bg-green-100 text-green-700' :
                      pattern.confidence > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }` 
                  }, `${Math.round(pattern.confidence * 100)}% confidence`)
                )
              )
            )
          ),
          analysis.patterns.length > 10 && React.createElement('div', { className: 'text-center p-3 text-sm text-gray-500' },
            `... and ${analysis.patterns.length - 10} more patterns`
          )
        )
      ),

      // Security vulnerabilities (if available)
      analysis.metrics?.security?.vulnerabilities && analysis.metrics.security.vulnerabilities.length > 0 && React.createElement('div', { className: 'mb-6' },
        React.createElement('h4', { className: 'font-semibold mb-4 text-gray-700 flex items-center gap-2' }, 
          React.createElement('span', { className: 'text-red-500' }, '🛡️'),
          `Security Analysis (${analysis.metrics.security.vulnerabilities.length} issues)`
        ),
        React.createElement('div', { className: 'space-y-3' },
          ...analysis.metrics.security.vulnerabilities.map((vuln: any, index: number) => 
            React.createElement('div', { 
              key: index, 
              className: `p-3 border rounded-lg ${
                vuln.severity === 'critical' ? 'bg-red-50 border-red-200' :
                vuln.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                vuln.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }` 
            },
              React.createElement('div', { className: 'flex items-start justify-between' },
                React.createElement('div', { className: 'flex-1' },
                  React.createElement('div', { className: 'font-medium' }, vuln.type),
                  React.createElement('div', { className: 'text-sm mt-1' }, vuln.description),
                  vuln.line && React.createElement('div', { className: 'text-xs mt-2 opacity-75' }, `Line ${vuln.line}`)
                ),
                React.createElement('span', { 
                  className: `px-2 py-1 rounded-full text-xs font-bold uppercase ${
                    vuln.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    vuln.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    vuln.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }` 
                }, vuln.severity)
              )
            )
          )
        )
      ),

      // Structure analysis (if available)
      analysis.structure && React.createElement('details', { className: 'mb-6' },
        React.createElement('summary', { className: 'cursor-pointer font-semibold text-gray-700 hover:text-gray-900 mb-3' }, 'Code Structure Analysis'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
          // Functions
          analysis.structure.functions.length > 0 && React.createElement('div', {},
            React.createElement('h5', { className: 'font-medium mb-3 text-blue-700' }, `Functions (${analysis.structure.functions.length})`),
            React.createElement('div', { className: 'space-y-2 max-h-48 overflow-y-auto' },
              ...analysis.structure.functions.slice(0, 8).map((func: any, index: number) =>
                React.createElement('div', { key: index, className: 'p-2 bg-blue-50 rounded text-sm' },
                  React.createElement('div', { className: 'font-medium' }, func.name),
                  React.createElement('div', { className: 'text-xs text-gray-600' }, 
                    `Line ${func.line} • Complexity: ${func.complexity} • Params: ${func.parameters}`
                  )
                )
              )
            )
          ),
          // Classes
          analysis.structure.classes.length > 0 && React.createElement('div', {},
            React.createElement('h5', { className: 'font-medium mb-3 text-green-700' }, `Classes (${analysis.structure.classes.length})`),
            React.createElement('div', { className: 'space-y-2 max-h-48 overflow-y-auto' },
              ...analysis.structure.classes.slice(0, 8).map((cls: any, index: number) =>
                React.createElement('div', { key: index, className: 'p-2 bg-green-50 rounded text-sm' },
                  React.createElement('div', { className: 'font-medium' }, cls.name),
                  React.createElement('div', { className: 'text-xs text-gray-600' }, 
                    `Line ${cls.line} • Methods: ${cls.methods} • Properties: ${cls.properties}`
                  )
                )
              )
            )
          )
        )
      ),

      // AST Section (if available)
      analysis.ast && React.createElement('details', { className: 'mb-6' },
        React.createElement('summary', { className: 'cursor-pointer font-semibold text-gray-700 hover:text-gray-900' }, 'Abstract Syntax Tree (AST)'),
        React.createElement('div', { className: 'mt-3 p-4 bg-gray-50 rounded-lg border' },
          React.createElement('pre', { className: 'text-xs overflow-auto max-h-96' }, 
            JSON.stringify(analysis.ast, null, 2)
          )
        )
      ),

      // Errors and warnings
      (analysis.errors?.length || analysis.warnings?.length) && React.createElement('div', { className: 'mt-6' },
        analysis.errors?.length > 0 && React.createElement('div', { className: 'mb-4' },
          React.createElement('h4', { className: 'font-semibold mb-2 text-red-700 flex items-center gap-2' },
            React.createElement('span', {}, '❌'),
            `Errors (${analysis.errors.length})`
          ),
          React.createElement('div', { className: 'space-y-1' },
            ...analysis.errors.map((error: string, index: number) =>
              React.createElement('div', { key: index, className: 'p-2 bg-red-50 text-red-700 text-sm rounded border border-red-200' }, error)
            )
          )
        ),
        analysis.warnings?.length > 0 && React.createElement('div', {},
          React.createElement('h4', { className: 'font-semibold mb-2 text-yellow-700 flex items-center gap-2' },
            React.createElement('span', {}, '⚠️'),
            `Warnings (${analysis.warnings.length})`
          ),
          React.createElement('div', { className: 'space-y-1' },
            ...analysis.warnings.map((warning: string, index: number) =>
              React.createElement('div', { key: index, className: 'p-2 bg-yellow-50 text-yellow-700 text-sm rounded border border-yellow-200' }, warning)
            )
          )
        )
      ),

      // Timestamp
      React.createElement('div', { className: 'mt-6 pt-4 border-t text-xs text-gray-500 text-center' },
        `Analysis completed at ${new Date(analysis.timestamp).toLocaleString()}`
      )
    );
  });

// Enhanced server-side tool for code comparison
export const compareCodePatterns = aui
  .tool('compareCodePatterns')
  .describe('Compare patterns and structures between code snippets using full lynlang capabilities')
  .tag('code', 'comparison', 'server', 'patterns', 'diff', 'analysis')
  .input(z.object({
    codeA: z.string().describe('First code snippet'),
    codeB: z.string().describe('Second code snippet'),
    language: z.enum(['zen', 'typescript', 'javascript', 'python', 'rust']).default('zen'),
    comparisonType: z.enum(['structure', 'patterns', 'complexity', 'comprehensive']).default('comprehensive'),
    includeAST: z.boolean().default(true).describe('Include AST-based comparison'),
    filenameA: z.string().optional().describe('Virtual filename for first code'),
    filenameB: z.string().optional().describe('Virtual filename for second code')
  }))
  .execute(async ({ input }) => {
    try {
      // Analyze both code snippets
      const [analysisA, analysisB] = await Promise.all([
        trpc.lynlang.analyzeContent.mutate({
          content: input.codeA,
          language: input.language,
          filename: input.filenameA || `code-a.${input.language === 'zen' ? 'zen' : input.language}`,
          analysisOptions: {
            includeAST: input.includeAST,
            includePatterns: true,
            includeMetrics: true,
            timeout: 20000
          }
        }),
        trpc.lynlang.analyzeContent.mutate({
          content: input.codeB,
          language: input.language,
          filename: input.filenameB || `code-b.${input.language === 'zen' ? 'zen' : input.language}`,
          analysisOptions: {
            includeAST: input.includeAST,
            includePatterns: true,
            includeMetrics: true,
            timeout: 20000
          }
        })
      ]);

      if (!analysisA.success || !analysisB.success) {
        return {
          success: false,
          type: 'comparison-error',
          error: `Analysis failed: ${[...analysisA.errors || [], ...analysisB.errors || []].join(', ')}`,
          data: null
        };
      }

      // Calculate comprehensive comparison metrics
      const comparison = {
        similarity: {
          structure: calculateStructuralSimilarity(analysisA, analysisB),
          patterns: calculatePatternSimilarity(analysisA, analysisB),
          complexity: calculateComplexitySimilarity(analysisA, analysisB),
          overall: 0
        },
        differences: {
          linesOfCode: (analysisB.metrics?.linesOfCode || 0) - (analysisA.metrics?.linesOfCode || 0),
          complexityDelta: (analysisB.metrics?.complexity.cyclomatic || 0) - (analysisA.metrics?.complexity.cyclomatic || 0),
          newPatterns: findUniquePatterns(analysisB.patterns || [], analysisA.patterns || []),
          removedPatterns: findUniquePatterns(analysisA.patterns || [], analysisB.patterns || []),
          structuralChanges: compareStructures(analysisA.structure, analysisB.structure)
        },
        analysisA,
        analysisB,
        metadata: {
          comparisonType: input.comparisonType,
          timestamp: new Date().toISOString(),
          language: input.language,
          includedAST: input.includeAST
        }
      };

      // Calculate overall similarity
      comparison.similarity.overall = (
        comparison.similarity.structure * 0.4 + 
        comparison.similarity.patterns * 0.3 + 
        comparison.similarity.complexity * 0.3
      );

      return {
        success: true,
        type: 'comprehensive-comparison',
        data: { comparison }
      };
    } catch (error) {
      return {
        success: false,
        type: 'comparison-error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: null
      };
    }
  })
  .render(({ data, loading, error }) => {
    if (loading) {
      return React.createElement('div', { className: 'p-6 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50' }, 
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('div', { className: 'animate-spin h-6 w-6 border-3 border-purple-500 border-t-transparent rounded-full' }),
          React.createElement('div', { className: 'space-y-1' },
            React.createElement('div', { className: 'font-semibold text-purple-700' }, 'Comparing Code Patterns...'),
            React.createElement('div', { className: 'text-sm text-purple-600' }, 'Analyzing structures, patterns, and complexity differences')
          )
        )
      );
    }

    if (error || !data?.success) {
      return React.createElement('div', { className: 'p-6 border-2 border-red-200 rounded-lg bg-red-50' },
        React.createElement('h3', { className: 'font-semibold text-red-800 mb-2' }, 'Code Comparison Failed'),
        React.createElement('p', { className: 'text-red-700' }, error?.message || data?.error || 'Unknown error')
      );
    }

    const comparison = data.data.comparison;

    return React.createElement('div', { className: 'p-6 border rounded-lg bg-gradient-to-br from-purple-50 to-blue-50' },
      // Header
      React.createElement('div', { className: 'mb-6' },
        React.createElement('h3', { className: 'text-xl font-bold text-gray-800 mb-2' }, 'Comprehensive Code Comparison'),
        React.createElement('div', { className: 'text-sm text-gray-600' }, 
          `${comparison.metadata.language.toUpperCase()} • ${comparison.metadata.comparisonType} analysis • ${comparison.metadata.includedAST ? 'With AST' : 'No AST'}`
        )
      ),

      // Overall similarity score
      React.createElement('div', { className: 'mb-8 text-center' },
        React.createElement('div', { 
          className: `text-6xl font-bold mb-2 ${
            comparison.similarity.overall > 0.8 ? 'text-green-500' :
            comparison.similarity.overall > 0.6 ? 'text-yellow-500' :
            comparison.similarity.overall > 0.4 ? 'text-orange-500' :
            'text-red-500'
          }` 
        }, `${Math.round(comparison.similarity.overall * 100)}%`),
        React.createElement('div', { className: 'text-lg text-gray-700 font-medium' }, 'Overall Similarity'),
        React.createElement('div', { className: 'text-sm text-gray-500 mt-1' }, 
          comparison.similarity.overall > 0.8 ? 'Highly Similar Code' :
          comparison.similarity.overall > 0.6 ? 'Moderately Similar Code' :
          comparison.similarity.overall > 0.4 ? 'Somewhat Different Code' :
          'Very Different Code'
        )
      ),

      // Detailed similarity breakdown
      React.createElement('div', { className: 'mb-6' },
        React.createElement('h4', { className: 'font-semibold mb-4 text-gray-700' }, 'Similarity Breakdown'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
          React.createElement('div', { className: 'text-center p-4 bg-white rounded-lg border' },
            React.createElement('div', { className: 'text-3xl font-bold text-blue-600' }, `${Math.round(comparison.similarity.structure * 100)}%`),
            React.createElement('div', { className: 'text-sm text-gray-600 mt-1' }, 'Structural Similarity'),
            React.createElement('div', { className: 'text-xs text-gray-500 mt-2' }, 'Functions, classes, imports')
          ),
          React.createElement('div', { className: 'text-center p-4 bg-white rounded-lg border' },
            React.createElement('div', { className: 'text-3xl font-bold text-purple-600' }, `${Math.round(comparison.similarity.patterns * 100)}%`),
            React.createElement('div', { className: 'text-sm text-gray-600 mt-1' }, 'Pattern Similarity'),
            React.createElement('div', { className: 'text-xs text-gray-500 mt-2' }, 'Code patterns and idioms')
          ),
          React.createElement('div', { className: 'text-center p-4 bg-white rounded-lg border' },
            React.createElement('div', { className: 'text-3xl font-bold text-orange-600' }, `${Math.round(comparison.similarity.complexity * 100)}%`),
            React.createElement('div', { className: 'text-sm text-gray-600 mt-1' }, 'Complexity Similarity'),
            React.createElement('div', { className: 'text-xs text-gray-500 mt-2' }, 'Cyclomatic complexity match')
          )
        )
      ),

      // Key differences
      React.createElement('div', { className: 'mb-6' },
        React.createElement('h4', { className: 'font-semibold mb-4 text-gray-700' }, 'Key Differences'),
        React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-4' },
          React.createElement('div', { className: 'text-center p-3 bg-white rounded border' },
            React.createElement('div', { 
              className: `text-2xl font-bold ${comparison.differences.linesOfCode > 0 ? 'text-green-600' : comparison.differences.linesOfCode < 0 ? 'text-red-600' : 'text-gray-600'}` 
            }, comparison.differences.linesOfCode > 0 ? `+${comparison.differences.linesOfCode}` : comparison.differences.linesOfCode.toString()),
            React.createElement('div', { className: 'text-xs text-gray-600' }, 'Lines of Code Δ')
          ),
          React.createElement('div', { className: 'text-center p-3 bg-white rounded border' },
            React.createElement('div', { 
              className: `text-2xl font-bold ${comparison.differences.complexityDelta > 0 ? 'text-orange-600' : comparison.differences.complexityDelta < 0 ? 'text-green-600' : 'text-gray-600'}` 
            }, comparison.differences.complexityDelta > 0 ? `+${comparison.differences.complexityDelta}` : comparison.differences.complexityDelta.toString()),
            React.createElement('div', { className: 'text-xs text-gray-600' }, 'Complexity Δ')
          ),
          React.createElement('div', { className: 'text-center p-3 bg-white rounded border' },
            React.createElement('div', { className: 'text-2xl font-bold text-blue-600' }, comparison.differences.newPatterns.length),
            React.createElement('div', { className: 'text-xs text-gray-600' }, 'New Patterns')
          ),
          React.createElement('div', { className: 'text-center p-3 bg-white rounded border' },
            React.createElement('div', { className: 'text-2xl font-bold text-red-600' }, comparison.differences.removedPatterns.length),
            React.createElement('div', { className: 'text-xs text-gray-600' }, 'Removed Patterns')
          )
        )
      ),

      // Side-by-side metrics comparison
      React.createElement('div', { className: 'mb-6' },
        React.createElement('h4', { className: 'font-semibold mb-4 text-gray-700' }, 'Metrics Comparison'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
          // Code A
          React.createElement('div', { className: 'p-4 bg-blue-50 rounded-lg border' },
            React.createElement('h5', { className: 'font-medium mb-3 text-blue-700' }, 'Code A'),
            comparison.analysisA.metrics && React.createElement('div', { className: 'space-y-2 text-sm' },
              React.createElement('div', { className: 'flex justify-between' },
                React.createElement('span', {}, 'Lines of Code:'),
                React.createElement('span', { className: 'font-medium' }, comparison.analysisA.metrics.linesOfCode)
              ),
              React.createElement('div', { className: 'flex justify-between' },
                React.createElement('span', {}, 'Cyclomatic Complexity:'),
                React.createElement('span', { className: 'font-medium' }, comparison.analysisA.metrics.complexity.cyclomatic)
              ),
              React.createElement('div', { className: 'flex justify-between' },
                React.createElement('span', {}, 'Patterns Found:'),
                React.createElement('span', { className: 'font-medium' }, comparison.analysisA.patterns?.length || 0)
              )
            )
          ),
          // Code B
          React.createElement('div', { className: 'p-4 bg-green-50 rounded-lg border' },
            React.createElement('h5', { className: 'font-medium mb-3 text-green-700' }, 'Code B'),
            comparison.analysisB.metrics && React.createElement('div', { className: 'space-y-2 text-sm' },
              React.createElement('div', { className: 'flex justify-between' },
                React.createElement('span', {}, 'Lines of Code:'),
                React.createElement('span', { className: 'font-medium' }, comparison.analysisB.metrics.linesOfCode)
              ),
              React.createElement('div', { className: 'flex justify-between' },
                React.createElement('span', {}, 'Cyclomatic Complexity:'),
                React.createElement('span', { className: 'font-medium' }, comparison.analysisB.metrics.complexity.cyclomatic)
              ),
              React.createElement('div', { className: 'flex justify-between' },
                React.createElement('span', {}, 'Patterns Found:'),
                React.createElement('span', { className: 'font-medium' }, comparison.analysisB.patterns?.length || 0)
              )
            )
          )
        )
      ),

      // Detailed pattern differences
      (comparison.differences.newPatterns.length > 0 || comparison.differences.removedPatterns.length > 0) && 
      React.createElement('details', { className: 'mb-6' },
        React.createElement('summary', { className: 'cursor-pointer font-semibold text-gray-700 hover:text-gray-900' }, 'Pattern Changes Detail'),
        React.createElement('div', { className: 'mt-4 grid grid-cols-1 md:grid-cols-2 gap-4' },
          comparison.differences.newPatterns.length > 0 && React.createElement('div', {},
            React.createElement('h5', { className: 'font-medium mb-2 text-green-700' }, 'New Patterns in Code B'),
            React.createElement('div', { className: 'space-y-2' },
              ...comparison.differences.newPatterns.slice(0, 5).map((pattern: any, index: number) =>
                React.createElement('div', { key: index, className: 'p-2 bg-green-50 border border-green-200 rounded text-sm' },
                  React.createElement('div', { className: 'font-medium' }, pattern.type),
                  React.createElement('div', { className: 'text-xs text-gray-600' }, pattern.description)
                )
              )
            )
          ),
          comparison.differences.removedPatterns.length > 0 && React.createElement('div', {},
            React.createElement('h5', { className: 'font-medium mb-2 text-red-700' }, 'Patterns Removed from Code A'),
            React.createElement('div', { className: 'space-y-2' },
              ...comparison.differences.removedPatterns.slice(0, 5).map((pattern: any, index: number) =>
                React.createElement('div', { key: index, className: 'p-2 bg-red-50 border border-red-200 rounded text-sm' },
                  React.createElement('div', { className: 'font-medium' }, pattern.type),
                  React.createElement('div', { className: 'text-xs text-gray-600' }, pattern.description)
                )
              )
            )
          )
        )
      ),

      // Timestamp
      React.createElement('div', { className: 'mt-6 pt-4 border-t text-xs text-gray-500 text-center' },
        `Comparison completed at ${new Date(comparison.metadata.timestamp).toLocaleString()}`
      )
    );
  });

// Helper functions for comparison calculations
function calculateStructuralSimilarity(analysisA: any, analysisB: any): number {
  if (!analysisA.structure || !analysisB.structure) return 0.5;
  
  const funcSimilarity = Math.min(analysisA.structure.functions.length, analysisB.structure.functions.length) / 
                        Math.max(analysisA.structure.functions.length, analysisB.structure.functions.length, 1);
  const classSimilarity = Math.min(analysisA.structure.classes.length, analysisB.structure.classes.length) / 
                         Math.max(analysisA.structure.classes.length, analysisB.structure.classes.length, 1);
  
  return (funcSimilarity + classSimilarity) / 2;
}

function calculatePatternSimilarity(analysisA: any, analysisB: any): number {
  const patternsA = new Set((analysisA.patterns || []).map((p: any) => p.type));
  const patternsB = new Set((analysisB.patterns || []).map((p: any) => p.type));
  
  const intersection = new Set([...patternsA].filter(p => patternsB.has(p)));
  const union = new Set([...patternsA, ...patternsB]);
  
  return union.size > 0 ? intersection.size / union.size : 1;
}

function calculateComplexitySimilarity(analysisA: any, analysisB: any): number {
  if (!analysisA.metrics || !analysisB.metrics) return 0.5;
  
  const complexityA = analysisA.metrics.complexity.cyclomatic;
  const complexityB = analysisB.metrics.complexity.cyclomatic;
  
  const maxComplexity = Math.max(complexityA, complexityB, 1);
  const minComplexity = Math.min(complexityA, complexityB);
  
  return minComplexity / maxComplexity;
}

function findUniquePatterns(patternsA: any[], patternsB: any[]): any[] {
  const typesB = new Set(patternsB.map(p => p.type));
  return patternsA.filter(p => !typesB.has(p.type));
}

function compareStructures(structureA: any, structureB: any): any {
  // Simplified structure comparison - could be enhanced
  return {
    functionChanges: (structureB?.functions?.length || 0) - (structureA?.functions?.length || 0),
    classChanges: (structureB?.classes?.length || 0) - (structureA?.classes?.length || 0)
  };
}

export const lynlangToolsServer = {
  analyzCodeWithLynlang,
  compareCodePatterns
};