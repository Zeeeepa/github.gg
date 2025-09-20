import { aui, z } from '@lantos1618/better-ui';
import { lynlangService } from '@/lib/services/lynlang';
import React from 'react';

// Tool to analyze code with lynlang
export const analyzCodeWithLynlang = aui
  .tool('analyzeCodeWithLynlang')
  .describe('Perform deep code analysis using lynlang compiler')
  .tag('code', 'analysis', 'lynlang', 'ast')
  .input(z.object({
    code: z.string().describe('Code content to analyze'),
    language: z.enum(['zen', 'typescript', 'javascript', 'python', 'rust']).default('zen').describe('Programming language'),
    analysisType: z.enum(['structure', 'patterns', 'ast', 'metrics']).default('structure').describe('Type of analysis to perform'),
    patterns: z.array(z.string()).optional().describe('Specific patterns to search for')
  }))
  .execute(async ({ input }) => {
    try {
      // Check if lynlang is available
      const isAvailable = await lynlangService.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Lynlang compiler is not available. Please ensure it is installed and accessible.',
          fallback: 'Using basic text analysis instead',
          basicAnalysis: analyzeCodeBasic(input.code)
        };
      }

      const fileExtension = getFileExtension(input.language);
      
      switch (input.analysisType) {
        case 'ast':
          const tempFile = await createTempFileForAnalysis(input.code, fileExtension);
          const ast = await lynlangService.generateAST(tempFile);
          await cleanupTempFile(tempFile);
          return {
            success: true,
            type: 'ast',
            data: ast
          };

        case 'patterns':
          if (!input.patterns?.length) {
            return {
              success: false,
              error: 'Patterns are required for pattern analysis'
            };
          }
          
          const tempFilePatterns = await createTempFileForAnalysis(input.code, fileExtension);
          const patternResults = await lynlangService.findPatterns(
            tempFilePatterns,
            input.patterns
          );
          await cleanupTempFile(tempFilePatterns);
          
          return {
            success: true,
            type: 'patterns',
            data: patternResults
          };

        case 'metrics':
        case 'structure':
        default:
          const analysis = await lynlangService.analyzeContent(
            input.code,
            fileExtension
          );
          
          return {
            success: analysis.success,
            type: 'analysis',
            data: analysis,
            summary: analysis.success ? {
              linesOfCode: analysis.metrics?.linesOfCode || 0,
              complexity: analysis.metrics?.complexity || 0,
              patternCount: analysis.patterns?.length || 0,
              errorCount: analysis.errors?.length || 0,
              warningCount: analysis.warnings?.length || 0
            } : null
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Analysis failed: ${error}`,
        fallback: 'Using basic text analysis instead',
        basicAnalysis: analyzeCodeBasic(input.code)
      };
    }
  })
  .render(({ data, loading, error }) => {
    if (loading) {
      return React.createElement('div', { className: 'p-4 border rounded-lg' }, 
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('div', { className: 'animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full' }),
          'Analyzing code with lynlang...'
        )
      );
    }

    if (error) {
      return React.createElement('div', { className: 'p-4 border border-red-200 rounded-lg bg-red-50' },
        React.createElement('h3', { className: 'font-semibold text-red-800' }, 'Analysis Error'),
        React.createElement('p', { className: 'text-red-600 mt-1' }, error.message)
      );
    }

    if (!data.success) {
      return React.createElement('div', { className: 'p-4 border border-yellow-200 rounded-lg bg-yellow-50' },
        React.createElement('h3', { className: 'font-semibold text-yellow-800' }, 'Analysis Failed'),
        React.createElement('p', { className: 'text-yellow-700 mt-1' }, data.error || 'Unknown error'),
        data.fallback && React.createElement('p', { className: 'text-sm text-yellow-600 mt-2' }, data.fallback),
        data.basicAnalysis && React.createElement('div', { className: 'mt-3 p-3 bg-white rounded border' },
          React.createElement('h4', { className: 'font-medium mb-2' }, 'Basic Analysis'),
          React.createElement('pre', { className: 'text-xs overflow-auto' }, JSON.stringify(data.basicAnalysis, null, 2))
        )
      );
    }

    return React.createElement('div', { className: 'p-4 border rounded-lg' },
      React.createElement('h3', { className: 'font-semibold mb-3' }, 'Lynlang Analysis Results'),
      
      // Summary
      data.summary && React.createElement('div', { className: 'grid grid-cols-3 gap-4 mb-4' },
        React.createElement('div', { className: 'text-center p-3 bg-blue-50 rounded' },
          React.createElement('div', { className: 'text-2xl font-bold text-blue-600' }, data.summary.linesOfCode),
          React.createElement('div', { className: 'text-sm text-gray-600' }, 'Lines of Code')
        ),
        React.createElement('div', { className: 'text-center p-3 bg-green-50 rounded' },
          React.createElement('div', { className: 'text-2xl font-bold text-green-600' }, data.summary.complexity),
          React.createElement('div', { className: 'text-sm text-gray-600' }, 'Complexity Score')
        ),
        React.createElement('div', { className: 'text-center p-3 bg-purple-50 rounded' },
          React.createElement('div', { className: 'text-2xl font-bold text-purple-600' }, data.summary.patternCount),
          React.createElement('div', { className: 'text-sm text-gray-600' }, 'Patterns Found')
        )
      ),

      // Detailed results
      React.createElement('details', { className: 'mt-4' },
        React.createElement('summary', { className: 'cursor-pointer font-medium mb-2' }, 'Detailed Analysis'),
        React.createElement('pre', { className: 'bg-gray-50 p-3 rounded overflow-auto text-xs' }, 
          JSON.stringify(data.data, null, 2)
        )
      )
    );
  });

// Tool to compare code patterns
export const compareCodePatterns = aui
  .tool('compareCodePatterns')
  .describe('Compare patterns between different code snippets using lynlang')
  .tag('code', 'comparison', 'patterns', 'lynlang')
  .input(z.object({
    codeA: z.string().describe('First code snippet'),
    codeB: z.string().describe('Second code snippet'),
    language: z.enum(['zen', 'typescript', 'javascript', 'python', 'rust']).default('zen'),
    comparisonType: z.enum(['structure', 'patterns', 'complexity']).default('structure')
  }))
  .execute(async ({ input }) => {
    try {
      const isAvailable = await lynlangService.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Lynlang compiler is not available',
          fallback: compareCodeBasic(input.codeA, input.codeB)
        };
      }

      const fileExtension = getFileExtension(input.language);
      
      // Analyze both code snippets
      const [analysisA, analysisB] = await Promise.all([
        lynlangService.analyzeContent(input.codeA, fileExtension),
        lynlangService.analyzeContent(input.codeB, fileExtension)
      ]);

      if (!analysisA.success || !analysisB.success) {
        return {
          success: false,
          error: 'Failed to analyze one or both code snippets',
          analysisA,
          analysisB
        };
      }

      // Compute comparison
      const comparison = {
        metrics: {
          linesOfCode: {
            a: analysisA.metrics?.linesOfCode || 0,
            b: analysisB.metrics?.linesOfCode || 0,
            difference: (analysisB.metrics?.linesOfCode || 0) - (analysisA.metrics?.linesOfCode || 0)
          },
          complexity: {
            a: analysisA.metrics?.complexity || 0,
            b: analysisB.metrics?.complexity || 0,
            difference: (analysisB.metrics?.complexity || 0) - (analysisA.metrics?.complexity || 0)
          }
        },
        patterns: {
          commonPatterns: findCommonPatterns(analysisA.patterns || [], analysisB.patterns || []),
          uniqueToA: findUniquePatterns(analysisA.patterns || [], analysisB.patterns || []),
          uniqueToB: findUniquePatterns(analysisB.patterns || [], analysisA.patterns || [])
        },
        similarity: calculateSimilarityScore(analysisA, analysisB)
      };

      return {
        success: true,
        comparison,
        analysisA,
        analysisB
      };
    } catch (error) {
      return {
        success: false,
        error: `Comparison failed: ${error}`,
        fallback: compareCodeBasic(input.codeA, input.codeB)
      };
    }
  })
  .render(({ data, loading, error }) => {
    if (loading) {
      return React.createElement('div', { className: 'p-4 border rounded-lg' }, 
        'Comparing code patterns...'
      );
    }

    if (error || !data.success) {
      return React.createElement('div', { className: 'p-4 border border-red-200 rounded-lg bg-red-50' },
        React.createElement('h3', { className: 'font-semibold text-red-800' }, 'Comparison Failed'),
        React.createElement('p', { className: 'text-red-600 mt-1' }, error?.message || data.error)
      );
    }

    return React.createElement('div', { className: 'p-4 border rounded-lg' },
      React.createElement('h3', { className: 'font-semibold mb-4' }, 'Code Pattern Comparison'),
      
      // Similarity score
      React.createElement('div', { className: 'mb-6 text-center' },
        React.createElement('div', { className: 'text-4xl font-bold text-blue-600' }, 
          `${Math.round(data.comparison.similarity * 100)}%`
        ),
        React.createElement('div', { className: 'text-gray-600' }, 'Similarity Score')
      ),

      // Metrics comparison
      React.createElement('div', { className: 'grid grid-cols-2 gap-4 mb-6' },
        React.createElement('div', { className: 'p-3 bg-blue-50 rounded' },
          React.createElement('h4', { className: 'font-medium mb-2' }, 'Lines of Code'),
          React.createElement('div', null, `A: ${data.comparison.metrics.linesOfCode.a}`),
          React.createElement('div', null, `B: ${data.comparison.metrics.linesOfCode.b}`),
          React.createElement('div', { 
            className: data.comparison.metrics.linesOfCode.difference > 0 ? 'text-green-600' : 'text-red-600' 
          }, `Diff: ${data.comparison.metrics.linesOfCode.difference > 0 ? '+' : ''}${data.comparison.metrics.linesOfCode.difference}`)
        ),
        React.createElement('div', { className: 'p-3 bg-green-50 rounded' },
          React.createElement('h4', { className: 'font-medium mb-2' }, 'Complexity'),
          React.createElement('div', null, `A: ${data.comparison.metrics.complexity.a}`),
          React.createElement('div', null, `B: ${data.comparison.metrics.complexity.b}`),
          React.createElement('div', { 
            className: data.comparison.metrics.complexity.difference > 0 ? 'text-red-600' : 'text-green-600' 
          }, `Diff: ${data.comparison.metrics.complexity.difference > 0 ? '+' : ''}${data.comparison.metrics.complexity.difference}`)
        )
      ),

      // Pattern analysis
      React.createElement('div', { className: 'space-y-3' },
        React.createElement('div', null,
          React.createElement('h4', { className: 'font-medium mb-2' }, 'Common Patterns'),
          React.createElement('div', { className: 'text-sm text-gray-600' }, 
            `${data.comparison.patterns.commonPatterns.length} patterns found in both`
          )
        ),
        React.createElement('div', null,
          React.createElement('h4', { className: 'font-medium mb-2' }, 'Unique Patterns'),
          React.createElement('div', { className: 'text-sm text-gray-600' }, 
            `A: ${data.comparison.patterns.uniqueToA.length} unique, B: ${data.comparison.patterns.uniqueToB.length} unique`
          )
        )
      )
    );
  });

// Helper functions
function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    'zen': '.zen',
    'typescript': '.ts',
    'javascript': '.js',
    'python': '.py',
    'rust': '.rs'
  };
  return extensions[language] || '.zen';
}

async function createTempFileForAnalysis(content: string, extension: string): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');
  const tempDir = await fs.mkdtemp(path.join(process.cwd(), 'temp-lynlang-'));
  const tempFile = path.join(tempDir, `analysis${extension}`);
  await fs.writeFile(tempFile, content, 'utf-8');
  return tempFile;
}

async function cleanupTempFile(tempFile: string): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');
  try {
    await fs.unlink(tempFile);
    await fs.rmdir(path.dirname(tempFile));
  } catch (error) {
    console.warn('Failed to clean up temporary file:', error);
  }
}

function analyzeCodeBasic(code: string) {
  const lines = code.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);
  const commentLines = nonEmptyLines.filter(line => 
    line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('/*')
  );

  return {
    totalLines: lines.length,
    linesOfCode: nonEmptyLines.length,
    commentLines: commentLines.length,
    averageLineLength: nonEmptyLines.reduce((acc, line) => acc + line.length, 0) / nonEmptyLines.length || 0,
    hasMainFunction: /function\s+main|def\s+main|fn\s+main|main\s*=/i.test(code),
    estimatedComplexity: Math.ceil(nonEmptyLines.length / 10) + (code.match(/if|for|while|switch|catch/gi)?.length || 0)
  };
}

function compareCodeBasic(codeA: string, codeB: string) {
  const analysisA = analyzeCodeBasic(codeA);
  const analysisB = analyzeCodeBasic(codeB);
  
  return {
    similarity: calculateBasicSimilarity(codeA, codeB),
    analysisA,
    analysisB,
    differences: {
      linesOfCode: analysisB.linesOfCode - analysisA.linesOfCode,
      complexity: analysisB.estimatedComplexity - analysisA.estimatedComplexity
    }
  };
}

function calculateBasicSimilarity(codeA: string, codeB: string): number {
  const wordsA = new Set(codeA.toLowerCase().match(/\w+/g) || []);
  const wordsB = new Set(codeB.toLowerCase().match(/\w+/g) || []);
  
  const intersection = new Set([...wordsA].filter(word => wordsB.has(word)));
  const union = new Set([...wordsA, ...wordsB]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

function findCommonPatterns(patternsA: any[], patternsB: any[]): any[] {
  return patternsA.filter(patternA => 
    patternsB.some(patternB => patternA.type === patternB.type)
  );
}

function findUniquePatterns(patternsA: any[], patternsB: any[]): any[] {
  return patternsA.filter(patternA => 
    !patternsB.some(patternB => patternA.type === patternB.type)
  );
}

function calculateSimilarityScore(analysisA: any, analysisB: any): number {
  // Simple similarity calculation based on metrics and patterns
  const metricsA = analysisA.metrics || {};
  const metricsB = analysisB.metrics || {};
  const patternsA = analysisA.patterns || [];
  const patternsB = analysisB.patterns || [];
  
  const locSimilarity = 1 - Math.abs((metricsA.linesOfCode || 0) - (metricsB.linesOfCode || 0)) / Math.max(metricsA.linesOfCode || 1, metricsB.linesOfCode || 1);
  const complexitySimilarity = 1 - Math.abs((metricsA.complexity || 0) - (metricsB.complexity || 0)) / Math.max(metricsA.complexity || 1, metricsB.complexity || 1);
  const patternSimilarity = patternsA.length > 0 && patternsB.length > 0 ? 
    findCommonPatterns(patternsA, patternsB).length / Math.max(patternsA.length, patternsB.length) : 0;
  
  return (locSimilarity + complexitySimilarity + patternSimilarity) / 3;
}

export const lynlangTools = {
  analyzCodeWithLynlang,
  compareCodePatterns
};