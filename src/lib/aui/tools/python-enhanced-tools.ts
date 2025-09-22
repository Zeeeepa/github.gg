import aui, { z } from '@/lib/better-ui-wrapper';
import { getPythonAdapter } from '@/lib/adapters/web-ui-python-adapter';
import React from 'react';

// Python-enhanced repository analysis tool
export const pythonAnalyzeRepository = aui
  .tool('pythonAnalyzeRepository')
  .describe('Analyze repository using Python SDK with advanced AI capabilities')
  .tag('repository', 'analysis', 'python', 'ai')
  .input(z.object({
    owner: z.string().describe('Repository owner/organization'),
    repo: z.string().describe('Repository name'),
    analysisType: z.enum(['structure', 'quality', 'security', 'performance']).default('structure').describe('Type of analysis to perform'),
    includeFiles: z.boolean().default(true).describe('Include file-level analysis'),
    maxDepth: z.number().min(1).max(5).default(3).describe('Maximum directory depth to analyze')
  }))
  .execute(async ({ input }) => {
    try {
      const pythonAdapter = getPythonAdapter();
      
      // Check if Python SDK is available
      const isConnected = await pythonAdapter.connect();
      if (!isConnected) {
        // Fallback to basic analysis
        return {
          success: true,
          source: 'fallback',
          data: {
            message: 'Python SDK not available, using basic analysis',
            repository: `${input.owner}/${input.repo}`,
            analysisType: input.analysisType,
            basicMetrics: {
              analyzed: true,
              timestamp: Date.now(),
              fallbackReason: 'Python SDK unavailable'
            }
          }
        };
      }

      // Use Python SDK for enhanced analysis
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a senior software engineer analyzing GitHub repositories. Provide detailed, actionable insights.'
        },
        {
          role: 'user' as const,
          content: `Analyze the repository ${input.owner}/${input.repo} with focus on ${input.analysisType}. ${input.includeFiles ? 'Include file-level details.' : 'Focus on high-level structure.'} Maximum depth: ${input.maxDepth}`
        }
      ];

      const response = await pythonAdapter.chat(messages, {
        model: '0727-360B-API', // Use the more advanced model for repository analysis
        enableThinking: true,
        temperature: 0.3, // Lower temperature for more focused analysis
        maxTokens: 2000
      });

      return {
        success: true,
        source: 'python-sdk',
        data: {
          repository: `${input.owner}/${input.repo}`,
          analysisType: input.analysisType,
          analysis: response.content,
          thinking: response.thinking,
          model: response.model,
          metadata: {
            timestamp: Date.now(),
            tokensUsed: response.usage?.totalTokens || 0,
            includeFiles: input.includeFiles,
            maxDepth: input.maxDepth
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        fallbackSuggestion: 'Try using the basic repository analysis tool instead'
      };
    }
  })
  .render(({ data, loading, error }) => {
    if (loading) {
      return React.createElement('div', { className: 'flex items-center gap-3 p-4 border rounded-lg bg-blue-50' },
        React.createElement('div', { className: 'animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full' }),
        React.createElement('div', null,
          React.createElement('div', { className: 'font-medium text-blue-900' }, 'Analyzing Repository with AI'),
          React.createElement('div', { className: 'text-sm text-blue-700' }, 'Using advanced Python SDK capabilities...')
        )
      );
    }

    if (error) {
      return React.createElement('div', { className: 'p-4 border border-red-200 rounded-lg bg-red-50' },
        React.createElement('h3', { className: 'font-semibold text-red-800 mb-2' }, 'Analysis Error'),
        React.createElement('p', { className: 'text-red-600 mb-2' }, error.message || 'Unknown error occurred'),
        data?.fallbackSuggestion && React.createElement('p', { className: 'text-sm text-red-700 italic' }, data.fallbackSuggestion)
      );
    }

    if (!data?.success) {
      return React.createElement('div', { className: 'p-4 border border-yellow-200 rounded-lg bg-yellow-50' },
        React.createElement('h3', { className: 'font-semibold text-yellow-800' }, 'Analysis Failed'),
        React.createElement('p', { className: 'text-yellow-600' }, data?.error || 'Unable to complete analysis')
      );
    }

    const analysisData = data.data;

    return React.createElement('div', { className: 'p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50' },
      // Header
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('div', null,
          React.createElement('h3', { className: 'font-bold text-lg text-gray-900' }, 'AI Repository Analysis'),
          React.createElement('p', { className: 'text-sm text-gray-600' }, analysisData.repository)
        ),
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('span', { className: `px-2 py-1 text-xs rounded-full ${
            data.source === 'python-sdk' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }` }, data.source === 'python-sdk' ? 'Python SDK' : 'Fallback'),
          React.createElement('span', { className: 'px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full' }, 
            analysisData.analysisType || 'structure'
          )
        )
      ),

      // Analysis content
      analysisData.analysis && React.createElement('div', { className: 'mb-4' },
        React.createElement('h4', { className: 'font-medium text-gray-900 mb-2' }, 'Analysis Results'),
        React.createElement('div', { className: 'prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap' }, 
          analysisData.analysis
        )
      ),

      // Thinking process (if available)
      analysisData.thinking && React.createElement('details', { className: 'mb-4' },
        React.createElement('summary', { className: 'cursor-pointer font-medium text-gray-700 hover:text-gray-900' }, 
          'View AI Thinking Process'
        ),
        React.createElement('div', { className: 'mt-2 p-3 bg-gray-50 rounded text-sm text-gray-600 whitespace-pre-wrap' },
          analysisData.thinking
        )
      ),

      // Metadata
      React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600 pt-3 border-t border-gray-200' },
        React.createElement('div', null,
          React.createElement('div', { className: 'font-medium' }, 'Model'),
          React.createElement('div', null, analysisData.model || 'glm-4.5v')
        ),
        analysisData.metadata?.tokensUsed && React.createElement('div', null,
          React.createElement('div', { className: 'font-medium' }, 'Tokens'),
          React.createElement('div', null, analysisData.metadata.tokensUsed.toLocaleString())
        ),
        React.createElement('div', null,
          React.createElement('div', { className: 'font-medium' }, 'Max Depth'),
          React.createElement('div', null, analysisData.metadata?.maxDepth || 'N/A')
        ),
        React.createElement('div', null,
          React.createElement('div', { className: 'font-medium' }, 'Timestamp'),
          React.createElement('div', null, new Date(analysisData.metadata?.timestamp || Date.now()).toLocaleTimeString())
        )
      )
    );
  });

// Python-enhanced code review tool
export const pythonCodeReview = aui
  .tool('pythonCodeReview')
  .describe('Perform AI-powered code review using Python SDK')
  .tag('code', 'review', 'python', 'ai', 'quality')
  .input(z.object({
    code: z.string().min(1).describe('Code to review'),
    language: z.enum(['typescript', 'javascript', 'python', 'rust', 'go', 'java', 'cpp']).default('typescript').describe('Programming language'),
    reviewType: z.enum(['security', 'performance', 'style', 'comprehensive']).default('comprehensive').describe('Type of code review'),
    context: z.string().optional().describe('Additional context about the code')
  }))
  .execute(async ({ input }) => {
    try {
      const pythonAdapter = getPythonAdapter();
      
      // Check if Python SDK is available
      const isConnected = await pythonAdapter.connect();
      if (!isConnected) {
        return {
          success: false,
          error: 'Python SDK not available',
          fallback: 'Basic static analysis could be performed instead'
        };
      }

      const messages = [
        {
          role: 'system' as const,
          content: `You are an expert code reviewer specializing in ${input.language}. Provide detailed, actionable feedback focusing on ${input.reviewType} aspects.`
        },
        {
          role: 'user' as const,
          content: `Please review this ${input.language} code with focus on ${input.reviewType}:

${input.context ? `Context: ${input.context}\n\n` : ''}Code:
\`\`\`${input.language}
${input.code}
\`\`\``
        }
      ];

      const response = await pythonAdapter.chat(messages, {
        model: '0727-360B-API',
        enableThinking: true,
        temperature: 0.2,
        maxTokens: 1500
      });

      return {
        success: true,
        data: {
          review: response.content,
          thinking: response.thinking,
          language: input.language,
          reviewType: input.reviewType,
          model: response.model,
          codeLength: input.code.length,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  })
  .render(({ data, loading, error }) => {
    if (loading) {
      return React.createElement('div', { className: 'flex items-center gap-3 p-4 border rounded-lg bg-purple-50' },
        React.createElement('div', { className: 'animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full' }),
        React.createElement('div', null,
          React.createElement('div', { className: 'font-medium text-purple-900' }, 'AI Code Review in Progress'),
          React.createElement('div', { className: 'text-sm text-purple-700' }, 'Analyzing code quality and best practices...')
        )
      );
    }

    if (error || !data?.success) {
      return React.createElement('div', { className: 'p-4 border border-red-200 rounded-lg bg-red-50' },
        React.createElement('h3', { className: 'font-semibold text-red-800' }, 'Code Review Failed'),
        React.createElement('p', { className: 'text-red-600' }, error?.message || data?.error || 'Unknown error')
      );
    }

    const reviewData = data.data;

    return React.createElement('div', { className: 'p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50' },
      // Header
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('h3', { className: 'font-bold text-lg text-gray-900' }, 'AI Code Review'),
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('span', { className: 'px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full' }, 
            reviewData.language
          ),
          React.createElement('span', { className: 'px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded-full' }, 
            reviewData.reviewType
          )
        )
      ),

      // Review content
      React.createElement('div', { className: 'mb-4' },
        React.createElement('h4', { className: 'font-medium text-gray-900 mb-2' }, 'Review Findings'),
        React.createElement('div', { className: 'prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap' }, 
          reviewData.review
        )
      ),

      // Thinking process
      reviewData.thinking && React.createElement('details', { className: 'mb-4' },
        React.createElement('summary', { className: 'cursor-pointer font-medium text-gray-700 hover:text-gray-900' }, 
          'View Analysis Process'
        ),
        React.createElement('div', { className: 'mt-2 p-3 bg-gray-50 rounded text-sm text-gray-600 whitespace-pre-wrap' },
          reviewData.thinking
        )
      ),

      // Metadata
      React.createElement('div', { className: 'flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-200' },
        React.createElement('div', null, `Code length: ${reviewData.codeLength} characters`),
        React.createElement('div', null, `Model: ${reviewData.model}`),
        React.createElement('div', null, new Date(reviewData.timestamp).toLocaleTimeString())
      )
    );
  });

export const pythonEnhancedTools = {
  pythonAnalyzeRepository,
  pythonCodeReview
};