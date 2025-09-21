// Client-side version of lynlang tools with fallback implementations
import aui, { z } from '@/lib/better-ui-wrapper';
import React from 'react';

// Basic code analysis for client-side fallback
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
  
  const similarity = calculateBasicSimilarity(codeA, codeB);
  
  return {
    similarity,
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

// Client-side tool for code analysis (fallback only)
export const analyzCodeWithLynlang = aui
  .tool('analyzeCodeWithLynlang')
  .describe('Perform code analysis using client-side fallback')
  .tag('code', 'analysis', 'client')
  .input(z.object({
    code: z.string().describe('Code content to analyze'),
    language: z.enum(['zen', 'typescript', 'javascript', 'python', 'rust']).default('zen').describe('Programming language'),
    analysisType: z.enum(['structure', 'patterns', 'ast', 'metrics']).default('structure').describe('Type of analysis to perform'),
    patterns: z.array(z.string()).optional().describe('Specific patterns to search for')
  }))
  .execute(async ({ input }) => {
    // Client-side always uses basic analysis
    return {
      success: true,
      type: 'basic-analysis',
      data: {
        message: 'Using client-side basic analysis (lynlang compiler not available in browser)',
        analysis: analyzeCodeBasic(input.code)
      }
    };
  })
  .render(({ data, loading, error }) => {
    if (loading) {
      return React.createElement('div', { className: 'p-4 border rounded-lg' }, 
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('div', { className: 'animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full' }),
          'Analyzing code...'
        )
      );
    }

    if (error) {
      return React.createElement('div', { className: 'p-4 border border-red-200 rounded-lg bg-red-50' },
        React.createElement('h3', { className: 'font-semibold text-red-800' }, 'Analysis Error'),
        React.createElement('p', { className: 'text-red-600 mt-1' }, error.message)
      );
    }

    const analysis = data?.data?.analysis;
    if (!analysis) {
      return React.createElement('div', { className: 'p-4 border border-yellow-200 rounded-lg bg-yellow-50' },
        React.createElement('h3', { className: 'font-semibold text-yellow-800' }, 'No Analysis Data'),
        React.createElement('p', { className: 'text-yellow-600 mt-1' }, 'Unable to analyze code')
      );
    }

    return React.createElement('div', { className: 'p-4 border rounded-lg' },
      React.createElement('h3', { className: 'font-semibold mb-3' }, 'Basic Code Analysis'),
      React.createElement('div', { className: 'text-sm text-blue-600 mb-3' }, data.data.message),
      
      // Metrics
      React.createElement('div', { className: 'grid grid-cols-3 gap-4 mb-4' },
        React.createElement('div', { className: 'text-center p-3 bg-blue-50 rounded' },
          React.createElement('div', { className: 'text-2xl font-bold text-blue-600' }, analysis.linesOfCode),
          React.createElement('div', { className: 'text-sm text-gray-600' }, 'Lines of Code')
        ),
        React.createElement('div', { className: 'text-center p-3 bg-green-50 rounded' },
          React.createElement('div', { className: 'text-2xl font-bold text-green-600' }, analysis.estimatedComplexity),
          React.createElement('div', { className: 'text-sm text-gray-600' }, 'Est. Complexity')
        ),
        React.createElement('div', { className: 'text-center p-3 bg-purple-50 rounded' },
          React.createElement('div', { className: 'text-2xl font-bold text-purple-600' }, analysis.commentLines),
          React.createElement('div', { className: 'text-sm text-gray-600' }, 'Comment Lines')
        )
      ),

      // Detailed analysis
      React.createElement('details', { className: 'mt-4' },
        React.createElement('summary', { className: 'cursor-pointer font-medium mb-2' }, 'Detailed Analysis'),
        React.createElement('pre', { className: 'bg-gray-50 p-3 rounded overflow-auto text-xs' }, 
          JSON.stringify(analysis, null, 2)
        )
      )
    );
  });

// Client-side tool for code comparison (fallback only)
export const compareCodePatterns = aui
  .tool('compareCodePatterns')
  .describe('Compare patterns between code snippets using client-side analysis')
  .tag('code', 'comparison', 'client')
  .input(z.object({
    codeA: z.string().describe('First code snippet'),
    codeB: z.string().describe('Second code snippet'),
    language: z.enum(['zen', 'typescript', 'javascript', 'python', 'rust']).default('zen'),
    comparisonType: z.enum(['structure', 'patterns', 'complexity']).default('structure')
  }))
  .execute(async ({ input }) => {
    const comparison = compareCodeBasic(input.codeA, input.codeB);
    
    return {
      success: true,
      type: 'basic-comparison',
      data: {
        message: 'Using client-side basic comparison (lynlang compiler not available in browser)',
        comparison
      }
    };
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
        React.createElement('p', { className: 'text-red-600 mt-1' }, error?.message || 'Unknown error')
      );
    }

    const comparison = data.data.comparison;

    return React.createElement('div', { className: 'p-4 border rounded-lg' },
      React.createElement('h3', { className: 'font-semibold mb-4' }, 'Basic Code Comparison'),
      React.createElement('div', { className: 'text-sm text-blue-600 mb-3' }, data.data.message),
      
      // Similarity score
      React.createElement('div', { className: 'mb-6 text-center' },
        React.createElement('div', { className: 'text-4xl font-bold text-blue-600' }, 
          `${Math.round(comparison.similarity * 100)}%`
        ),
        React.createElement('div', { className: 'text-gray-600' }, 'Similarity Score')
      ),

      // Detailed comparison
      React.createElement('details', { className: 'mt-4' },
        React.createElement('summary', { className: 'cursor-pointer font-medium mb-2' }, 'Detailed Comparison'),
        React.createElement('pre', { className: 'bg-gray-50 p-3 rounded overflow-auto text-xs' }, 
          JSON.stringify(comparison, null, 2)
        )
      )
    );
  });

export const lynlangToolsClient = {
  analyzCodeWithLynlang,
  compareCodePatterns
};