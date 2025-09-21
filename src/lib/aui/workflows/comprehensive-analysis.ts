// Comprehensive analysis workflows that demonstrate full lynlang + better-ui integration
import aui, { z } from '@/lib/better-ui-wrapper';
import React from 'react';
import { trpc } from '@/lib/trpc/client';

// Multi-stage comprehensive codebase analysis workflow
export const comprehensiveCodebaseAnalysisWorkflow = aui
  .tool('comprehensiveCodebaseAnalysisWorkflow')
  .describe('Multi-stage comprehensive analysis workflow combining lynlang compiler, GitHub.gg backend, and ecosystem intelligence')
  .tag('workflow', 'comprehensive', 'analysis', 'lynlang', 'ecosystem', 'multi-stage')
  .input(z.object({
    target: z.object({
      type: z.enum(['repository', 'directory', 'files']),
      owner: z.string().optional(),
      repo: z.string().optional(),
      path: z.string().optional(),
      files: z.array(z.string()).optional()
    }).describe('Analysis target specification'),
    workflow: z.object({
      stages: z.array(z.enum([
        'discovery', 'structure', 'lynlang-analysis', 'patterns', 'security', 
        'performance', 'maintainability', 'recommendations', 'report'
      ])).default(['discovery', 'structure', 'lynlang-analysis', 'patterns', 'security', 'recommendations', 'report']),
      includeVisualizations: z.boolean().default(true),
      generateReport: z.boolean().default(true),
      realTimeUpdates: z.boolean().default(true)
    }).default({
      stages: ['discovery', 'structure', 'lynlang-analysis', 'patterns', 'security', 'recommendations', 'report'],
      includeVisualizations: true,
      generateReport: true,
      realTimeUpdates: true
    }),
    preferences: z.object({
      maxFiles: z.number().min(1).max(200).default(100),
      timeoutPerStage: z.number().min(10000).max(300000).default(60000),
      detailLevel: z.enum(['basic', 'standard', 'comprehensive']).default('comprehensive'),
      focusAreas: z.array(z.enum(['security', 'performance', 'maintainability', 'patterns', 'architecture'])).optional()
    }).default({
      maxFiles: 100,
      timeoutPerStage: 60000,
      detailLevel: 'comprehensive'
    })
  }))
  .execute(async ({ input }) => {
    const workflowId = `workflow-${Date.now()}`;
    const results: any = {
      workflowId,
      startTime: new Date().toISOString(),
      stages: {},
      summary: {},
      visualizations: [],
      report: null,
      errors: []
    };

    try {
      // Stage 1: Discovery
      if (input.workflow.stages.includes('discovery')) {
        results.stages.discovery = await executeDiscoveryStage(input.target, input.preferences);
      }

      // Stage 2: Structure Analysis
      if (input.workflow.stages.includes('structure')) {
        results.stages.structure = await executeStructureStage(
          input.target, 
          results.stages.discovery,
          input.preferences
        );
      }

      // Stage 3: Lynlang Analysis
      if (input.workflow.stages.includes('lynlang-analysis')) {
        results.stages.lynlangAnalysis = await executeLynlangStage(
          results.stages.structure?.analyzableFiles || [],
          input.preferences
        );
      }

      // Stage 4: Pattern Analysis
      if (input.workflow.stages.includes('patterns')) {
        results.stages.patterns = await executePatternsStage(
          results.stages.lynlangAnalysis,
          input.preferences
        );
      }

      // Stage 5: Security Analysis
      if (input.workflow.stages.includes('security')) {
        results.stages.security = await executeSecurityStage(
          results.stages.lynlangAnalysis,
          input.preferences
        );
      }

      // Stage 6: Performance Analysis
      if (input.workflow.stages.includes('performance')) {
        results.stages.performance = await executePerformanceStage(
          results.stages.lynlangAnalysis,
          input.preferences
        );
      }

      // Stage 7: Maintainability Analysis
      if (input.workflow.stages.includes('maintainability')) {
        results.stages.maintainability = await executeMaintainabilityStage(
          results.stages.lynlangAnalysis,
          input.preferences
        );
      }

      // Stage 8: Recommendations
      if (input.workflow.stages.includes('recommendations')) {
        results.stages.recommendations = await executeRecommendationsStage(
          results.stages,
          input.preferences
        );
      }

      // Stage 9: Report Generation
      if (input.workflow.stages.includes('report') && input.workflow.generateReport) {
        results.report = await executeReportStage(results, input);
      }

      // Generate summary
      results.summary = generateWorkflowSummary(results);
      results.endTime = new Date().toISOString();

      return {
        success: true,
        type: 'comprehensive-workflow',
        data: { results }
      };
    } catch (error) {
      results.errors.push({
        stage: 'workflow-execution',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        type: 'workflow-error',
        error: `Workflow execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: { results }
      };
    }
  })
  .render(({ data, loading, error }) => {
    if (loading) {
      return React.createElement('div', { className: 'p-8 border rounded-lg bg-gradient-to-br from-blue-50 via-purple-50 to-green-50' },
        React.createElement('div', { className: 'text-center mb-6' },
          React.createElement('div', { className: 'animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4' }),
          React.createElement('h3', { className: 'text-2xl font-bold text-gray-800' }, 'Comprehensive Analysis Workflow'),
          React.createElement('p', { className: 'text-gray-600 mt-2' }, 'Multi-stage analysis using lynlang compiler and GitHub.gg ecosystem')
        ),
        
        // Workflow stages progress
        React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-3 mb-6' },
          React.createElement('div', { className: 'p-3 bg-blue-100 rounded-lg text-center' },
            React.createElement('div', { className: 'animate-pulse text-blue-600 text-2xl mb-1' }, '🔍'),
            React.createElement('div', { className: 'text-sm font-medium text-blue-800' }, 'Discovery')
          ),
          React.createElement('div', { className: 'p-3 bg-purple-100 rounded-lg text-center' },
            React.createElement('div', { className: 'animate-pulse text-purple-600 text-2xl mb-1' }, '⚡'),
            React.createElement('div', { className: 'text-sm font-medium text-purple-800' }, 'Lynlang Analysis')
          ),
          React.createElement('div', { className: 'p-3 bg-green-100 rounded-lg text-center' },
            React.createElement('div', { className: 'animate-pulse text-green-600 text-2xl mb-1' }, '🔗'),
            React.createElement('div', { className: 'text-sm font-medium text-green-800' }, 'Ecosystem')
          ),
          React.createElement('div', { className: 'p-3 bg-yellow-100 rounded-lg text-center' },
            React.createElement('div', { className: 'animate-pulse text-yellow-600 text-2xl mb-1' }, '📊'),
            React.createElement('div', { className: 'text-sm font-medium text-yellow-800' }, 'Report')
          )
        ),
        
        React.createElement('div', { className: 'text-center text-sm text-gray-600' },
          'This may take several minutes depending on codebase size and analysis depth...'
        )
      );
    }

    if (error) {
      return React.createElement('div', { className: 'p-6 border-2 border-red-200 rounded-lg bg-red-50' },
        React.createElement('h3', { className: 'font-bold text-red-800 mb-3 flex items-center gap-2' },
          React.createElement('span', {}, '❌'),
          'Workflow Execution Failed'
        ),
        React.createElement('p', { className: 'text-red-700 mb-4' }, error.message),
        data?.data?.results?.errors && React.createElement('details', { className: 'text-sm' },
          React.createElement('summary', { className: 'cursor-pointer font-medium text-red-600 hover:text-red-800' }, 
            'Error Details'
          ),
          React.createElement('div', { className: 'mt-2 space-y-2' },
            ...data.data.results.errors.map((err: any, index: number) =>
              React.createElement('div', { key: index, className: 'p-2 bg-red-100 rounded' },
                React.createElement('div', { className: 'font-medium' }, `Stage: ${err.stage}`),
                React.createElement('div', { className: 'text-xs text-gray-600' }, err.error)
              )
            )
          )
        )
      );
    }

    if (!data?.success) {
      return React.createElement('div', { className: 'p-6 border border-yellow-200 rounded-lg bg-yellow-50' },
        React.createElement('h3', { className: 'font-bold text-yellow-800 mb-2' }, 'Workflow Completed with Issues'),
        React.createElement('p', { className: 'text-yellow-700' }, data?.error || 'Partial execution completed')
      );
    }

    const results = data.data.results;
    
    return React.createElement('div', { className: 'space-y-8' },
      // Workflow header
      React.createElement('div', { className: 'p-6 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', {},
            React.createElement('h2', { className: 'text-3xl font-bold text-gray-800 mb-2' }, 
              '🎯 Comprehensive Analysis Complete'
            ),
            React.createElement('p', { className: 'text-gray-600' }, 
              `Workflow ID: ${results.workflowId} • ${Object.keys(results.stages).length} stages executed`
            )
          ),
          React.createElement('div', { className: 'text-right text-sm text-gray-600' },
            React.createElement('div', {}, `Started: ${new Date(results.startTime).toLocaleString()}`),
            React.createElement('div', {}, `Completed: ${new Date(results.endTime).toLocaleString()}`),
            React.createElement('div', { className: 'font-semibold mt-1' }, 
              `Duration: ${Math.round((new Date(results.endTime).getTime() - new Date(results.startTime).getTime()) / 1000)}s`
            )
          )
        )
      ),

      // Executive Summary
      React.createElement('div', { className: 'p-6 border rounded-lg bg-gray-50' },
        React.createElement('h3', { className: 'text-xl font-bold text-gray-800 mb-4 flex items-center gap-2' },
          React.createElement('span', {}, '📋'),
          'Executive Summary'
        ),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-6' },
          React.createElement('div', { className: 'text-center p-4 bg-white rounded border' },
            React.createElement('div', { className: 'text-3xl font-bold text-blue-600' }, 
              results.summary.filesAnalyzed || 0
            ),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Files Analyzed'),
            React.createElement('div', { className: 'text-xs text-blue-600 mt-1' }, 
              `${results.summary.linesOfCode?.toLocaleString() || 0} LOC`
            )
          ),
          React.createElement('div', { className: 'text-center p-4 bg-white rounded border' },
            React.createElement('div', { 
              className: `text-3xl font-bold ${
                (results.summary.overallScore || 0) >= 80 ? 'text-green-600' :
                (results.summary.overallScore || 0) >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`
            }, `${Math.round(results.summary.overallScore || 0)}`),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Overall Score'),
            React.createElement('div', { className: 'text-xs text-gray-500 mt-1' }, 'Quality Rating')
          ),
          React.createElement('div', { className: 'text-center p-4 bg-white rounded border' },
            React.createElement('div', { 
              className: `text-3xl font-bold ${
                (results.summary.criticalIssues || 0) === 0 ? 'text-green-600' :
                (results.summary.criticalIssues || 0) < 5 ? 'text-yellow-600' :
                'text-red-600'
              }`
            }, results.summary.criticalIssues || 0),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Critical Issues'),
            React.createElement('div', { className: 'text-xs text-gray-500 mt-1' }, 'Security & Quality')
          ),
          React.createElement('div', { className: 'text-center p-4 bg-white rounded border' },
            React.createElement('div', { className: 'text-3xl font-bold text-purple-600' }, 
              results.summary.recommendations?.length || 0
            ),
            React.createElement('div', { className: 'text-sm text-gray-600' }, 'Recommendations'),
            React.createElement('div', { className: 'text-xs text-purple-600 mt-1' }, 'Actionable Items')
          )
        )
      ),

      // Stage Results
      ...Object.entries(results.stages).map(([stageName, stageData]: [string, any]) => 
        stageData && React.createElement('div', { key: stageName, className: 'p-6 border rounded-lg' },
          React.createElement('h4', { className: 'text-lg font-bold text-gray-800 mb-4 flex items-center gap-2' },
            React.createElement('span', {}, getStageIcon(stageName)),
            `${stageName.charAt(0).toUpperCase() + stageName.slice(1).replace(/([A-Z])/g, ' $1')} Results`
          ),
          renderStageResults(stageName, stageData)
        )
      ),

      // Comprehensive Report
      results.report && React.createElement('div', { className: 'p-6 border rounded-lg bg-gradient-to-br from-purple-50 to-blue-50' },
        React.createElement('h3', { className: 'text-xl font-bold text-gray-800 mb-4 flex items-center gap-2' },
          React.createElement('span', {}, '📊'),
          'Comprehensive Report'
        ),
        React.createElement('div', { className: 'prose max-w-none' },
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
            // Key findings
            React.createElement('div', {},
              React.createElement('h5', { className: 'font-semibold mb-3 text-purple-700' }, 'Key Findings'),
              React.createElement('ul', { className: 'space-y-2 text-sm' },
                ...results.report.keyFindings.map((finding: string, index: number) =>
                  React.createElement('li', { key: index, className: 'flex items-start gap-2' },
                    React.createElement('span', { className: 'text-purple-600 mt-0.5' }, '•'),
                    React.createElement('span', {}, finding)
                  )
                )
              )
            ),
            // Action items
            React.createElement('div', {},
              React.createElement('h5', { className: 'font-semibold mb-3 text-blue-700' }, 'Priority Actions'),
              React.createElement('ul', { className: 'space-y-2 text-sm' },
                ...results.report.priorityActions.map((action: string, index: number) =>
                  React.createElement('li', { key: index, className: 'flex items-start gap-2' },
                    React.createElement('span', { className: 'text-blue-600 mt-0.5' }, '→'),
                    React.createElement('span', {}, action)
                  )
                )
              )
            )
          )
        )
      ),

      // Workflow metadata
      React.createElement('div', { className: 'text-center text-xs text-gray-500 py-4 border-t' },
        `Comprehensive analysis workflow completed • ${Object.keys(results.stages).length} stages executed • `,
        `Generated at ${new Date().toLocaleString()}`
      )
    );
  });

// Helper functions for workflow execution stages
async function executeDiscoveryStage(target: any, preferences: any): Promise<any> {
  // Repository discovery and metadata collection
  if (target.type === 'repository') {
    const repoInfo = await trpc.github.repos.get.query({
      owner: target.owner,
      repo: target.repo
    });

    const fileTree = await trpc.github.files.getTree.query({
      owner: target.owner,
      repo: target.repo,
      recursive: true
    });

    return {
      success: true,
      repository: repoInfo,
      fileTree,
      fileCount: fileTree.length,
      timestamp: new Date().toISOString()
    };
  }

  return { success: false, error: 'Unsupported target type for discovery' };
}

async function executeStructureStage(target: any, discoveryData: any, preferences: any): Promise<any> {
  if (!discoveryData?.success) return { success: false, error: 'Discovery stage failed' };

  const analyzableFiles = discoveryData.fileTree
    .filter((file: any) => file.type === 'blob')
    .filter((file: any) => {
      const ext = file.path.split('.').pop()?.toLowerCase();
      return ext && ['zen', 'ts', 'js', 'py', 'rs', 'go', 'java', 'cpp', 'c'].includes(ext);
    })
    .slice(0, preferences.maxFiles);

  return {
    success: true,
    analyzableFiles,
    structure: categorizeFilesByType(analyzableFiles),
    languages: detectLanguageDistribution(analyzableFiles),
    timestamp: new Date().toISOString()
  };
}

async function executeLynlangStage(files: any[], preferences: any): Promise<any> {
  if (!files.length) return { success: false, error: 'No analyzable files' };

  const filePaths = files.map(f => f.path);
  
  const batchAnalysis = await trpc.lynlang.batchAnalyze.mutate({
    filePaths,
    analysisOptions: {
      includeAST: preferences.detailLevel === 'comprehensive',
      includePatterns: true,
      includeMetrics: true,
      timeout: preferences.timeoutPerStage
    }
  });

  return {
    success: batchAnalysis.success,
    analysis: batchAnalysis,
    summary: summarizeBatchAnalysis(batchAnalysis),
    timestamp: new Date().toISOString()
  };
}

async function executePatternsStage(lynlangData: any, preferences: any): Promise<any> {
  if (!lynlangData?.success) return { success: false, error: 'Lynlang analysis required' };

  const allPatterns = lynlangData.analysis.results
    .filter((r: any) => r.analysis?.patterns)
    .flatMap((r: any) => r.analysis.patterns);

  const patternAnalysis = analyzePatternDistribution(allPatterns);

  return {
    success: true,
    patterns: allPatterns,
    analysis: patternAnalysis,
    insights: generatePatternInsights(patternAnalysis),
    timestamp: new Date().toISOString()
  };
}

async function executeSecurityStage(lynlangData: any, preferences: any): Promise<any> {
  if (!lynlangData?.success) return { success: false, error: 'Lynlang analysis required' };

  const securityFindings = lynlangData.analysis.results
    .filter((r: any) => r.analysis?.metrics?.security?.vulnerabilities)
    .flatMap((r: any) => r.analysis.metrics.security.vulnerabilities);

  return {
    success: true,
    vulnerabilities: securityFindings,
    summary: categorizeSecurityFindings(securityFindings),
    riskAssessment: calculateSecurityRisk(securityFindings),
    timestamp: new Date().toISOString()
  };
}

async function executePerformanceStage(lynlangData: any, preferences: any): Promise<any> {
  if (!lynlangData?.success) return { success: false, error: 'Lynlang analysis required' };

  const performanceMetrics = lynlangData.analysis.results
    .filter((r: any) => r.analysis?.metrics)
    .map((r: any) => ({
      file: r.filePath,
      complexity: r.analysis.metrics.complexity.cyclomatic,
      linesOfCode: r.analysis.metrics.linesOfCode
    }));

  return {
    success: true,
    metrics: performanceMetrics,
    analysis: analyzePerformanceMetrics(performanceMetrics),
    recommendations: generatePerformanceRecommendations(performanceMetrics),
    timestamp: new Date().toISOString()
  };
}

async function executeMaintainabilityStage(lynlangData: any, preferences: any): Promise<any> {
  if (!lynlangData?.success) return { success: false, error: 'Lynlang analysis required' };

  const maintainabilityData = lynlangData.analysis.results
    .filter((r: any) => r.analysis?.metrics?.quality)
    .map((r: any) => ({
      file: r.filePath,
      maintainability: r.analysis.metrics.quality.maintainability,
      testability: r.analysis.metrics.quality.testability,
      complexity: r.analysis.metrics.complexity.cyclomatic
    }));

  return {
    success: true,
    data: maintainabilityData,
    score: calculateOverallMaintainability(maintainabilityData),
    analysis: analyzeMaintainabilityTrends(maintainabilityData),
    timestamp: new Date().toISOString()
  };
}

async function executeRecommendationsStage(stageResults: any, preferences: any): Promise<any> {
  const recommendations: any[] = [];

  // Generate recommendations based on all stage results
  if (stageResults.security?.vulnerabilities?.length > 0) {
    recommendations.push({
      priority: 'critical',
      category: 'security',
      title: 'Address Security Vulnerabilities',
      description: `${stageResults.security.vulnerabilities.length} security issues detected`,
      actionItems: ['Review critical vulnerabilities', 'Implement security patches', 'Add security testing']
    });
  }

  if (stageResults.performance?.analysis?.highComplexityFiles?.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'performance',
      title: 'Reduce Code Complexity',
      description: 'Multiple files with high cyclomatic complexity detected',
      actionItems: ['Refactor complex functions', 'Extract common logic', 'Add unit tests']
    });
  }

  return {
    success: true,
    recommendations,
    prioritized: prioritizeRecommendations(recommendations),
    timestamp: new Date().toISOString()
  };
}

async function executeReportStage(results: any, input: any): Promise<any> {
  return {
    summary: `Comprehensive analysis of ${input.target.type} completed with ${Object.keys(results.stages).length} stages`,
    keyFindings: generateKeyFindings(results.stages),
    priorityActions: generatePriorityActions(results.stages),
    detailedAnalysis: results.stages,
    metadata: {
      workflowId: results.workflowId,
      analysisDepth: input.preferences.detailLevel,
      stagesExecuted: Object.keys(results.stages),
      timestamp: new Date().toISOString()
    }
  };
}

// Helper functions for rendering and analysis
function getStageIcon(stageName: string): string {
  const icons: Record<string, string> = {
    discovery: '🔍',
    structure: '🏗️',
    lynlangAnalysis: '⚡',
    patterns: '🔍',
    security: '🛡️',
    performance: '⚡',
    maintainability: '🔧',
    recommendations: '💡'
  };
  return icons[stageName] || '📊';
}

function renderStageResults(stageName: string, stageData: any): React.ReactElement {
  // Simplified rendering for each stage type
  return React.createElement('div', { className: 'text-sm text-gray-600' },
    React.createElement('pre', { className: 'bg-gray-50 p-3 rounded overflow-auto max-h-48' },
      JSON.stringify(stageData, null, 2)
    )
  );
}

function generateWorkflowSummary(results: any): any {
  const lynlangData = results.stages.lynlangAnalysis;
  
  return {
    filesAnalyzed: lynlangData?.analysis?.totalFiles || 0,
    linesOfCode: lynlangData?.summary?.totalLinesOfCode || 0,
    overallScore: calculateOverallScore(results.stages),
    criticalIssues: results.stages.security?.vulnerabilities?.filter((v: any) => v.severity === 'critical').length || 0,
    recommendations: results.stages.recommendations?.recommendations || []
  };
}

function calculateOverallScore(stages: any): number {
  // Simplified scoring algorithm
  let score = 100;
  
  if (stages.security?.vulnerabilities?.length > 0) {
    score -= stages.security.vulnerabilities.length * 5;
  }
  
  if (stages.performance?.analysis?.averageComplexity > 10) {
    score -= 20;
  }
  
  return Math.max(0, score);
}

// Additional helper functions would be implemented here for:
// - categorizeFilesByType
// - detectLanguageDistribution
// - summarizeBatchAnalysis
// - analyzePatternDistribution
// - generatePatternInsights
// - categorizeSecurityFindings
// - calculateSecurityRisk
// - analyzePerformanceMetrics
// - generatePerformanceRecommendations
// - calculateOverallMaintainability
// - analyzeMaintainabilityTrends
// - prioritizeRecommendations
// - generateKeyFindings
// - generatePriorityActions

function categorizeFilesByType(files: any[]): Record<string, number> {
  const categories: Record<string, number> = {};
  files.forEach(file => {
    const ext = file.path.split('.').pop()?.toLowerCase() || 'unknown';
    categories[ext] = (categories[ext] || 0) + 1;
  });
  return categories;
}

function detectLanguageDistribution(files: any[]): Record<string, number> {
  return categorizeFilesByType(files);
}

function summarizeBatchAnalysis(batchAnalysis: any): any {
  return {
    totalFiles: batchAnalysis.totalFiles,
    successfulAnalyses: batchAnalysis.successfulAnalyses,
    totalLinesOfCode: batchAnalysis.results?.reduce((sum: number, r: any) => 
      sum + (r.analysis?.metrics?.linesOfCode || 0), 0) || 0,
    totalPatterns: batchAnalysis.results?.reduce((sum: number, r: any) => 
      sum + (r.analysis?.patterns?.length || 0), 0) || 0
  };
}

function analyzePatternDistribution(patterns: any[]): any {
  const distribution: Record<string, number> = {};
  patterns.forEach(pattern => {
    distribution[pattern.type] = (distribution[pattern.type] || 0) + 1;
  });
  return { distribution, total: patterns.length };
}

function generatePatternInsights(patternAnalysis: any): string[] {
  const insights: string[] = [];
  const { distribution, total } = patternAnalysis;
  
  if (total > 100) {
    insights.push(`High pattern density detected (${total} patterns)`);
  }
  
  const topPattern = Object.entries(distribution).sort(([,a], [,b]) => (b as number) - (a as number))[0];
  if (topPattern) {
    insights.push(`Most common pattern: ${topPattern[0]} (${topPattern[1]} occurrences)`);
  }
  
  return insights;
}

function categorizeSecurityFindings(vulnerabilities: any[]): any {
  const categories = { critical: 0, high: 0, medium: 0, low: 0 };
  vulnerabilities.forEach(vuln => {
    if (categories.hasOwnProperty(vuln.severity)) {
      categories[vuln.severity as keyof typeof categories]++;
    }
  });
  return categories;
}

function calculateSecurityRisk(vulnerabilities: any[]): string {
  const critical = vulnerabilities.filter(v => v.severity === 'critical').length;
  const high = vulnerabilities.filter(v => v.severity === 'high').length;
  
  if (critical > 0) return 'Critical';
  if (high > 3) return 'High';
  if (high > 0) return 'Medium';
  return 'Low';
}

function analyzePerformanceMetrics(metrics: any[]): any {
  const complexities = metrics.map(m => m.complexity);
  return {
    averageComplexity: complexities.reduce((a, b) => a + b, 0) / complexities.length,
    maxComplexity: Math.max(...complexities),
    highComplexityFiles: metrics.filter(m => m.complexity > 10)
  };
}

function generatePerformanceRecommendations(metrics: any[]): string[] {
  const recommendations: string[] = [];
  const highComplexity = metrics.filter(m => m.complexity > 15);
  
  if (highComplexity.length > 0) {
    recommendations.push(`Refactor ${highComplexity.length} high-complexity files`);
  }
  
  return recommendations;
}

function calculateOverallMaintainability(data: any[]): number {
  if (data.length === 0) return 0;
  return data.reduce((sum, d) => sum + d.maintainability, 0) / data.length;
}

function analyzeMaintainabilityTrends(data: any[]): any {
  const low = data.filter(d => d.maintainability < 50).length;
  const medium = data.filter(d => d.maintainability >= 50 && d.maintainability < 80).length;
  const high = data.filter(d => d.maintainability >= 80).length;
  
  return { low, medium, high, total: data.length };
}

function prioritizeRecommendations(recommendations: any[]): any[] {
  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
  });
}

function generateKeyFindings(stages: any): string[] {
  const findings: string[] = [];
  
  if (stages.lynlangAnalysis?.success) {
    findings.push(`Analyzed ${stages.lynlangAnalysis.summary.totalFiles} files with lynlang compiler`);
  }
  
  if (stages.security?.vulnerabilities?.length > 0) {
    findings.push(`${stages.security.vulnerabilities.length} security vulnerabilities identified`);
  }
  
  if (stages.patterns?.patterns?.length > 0) {
    findings.push(`${stages.patterns.patterns.length} code patterns detected and analyzed`);
  }
  
  return findings;
}

function generatePriorityActions(stages: any): string[] {
  const actions: string[] = [];
  
  if (stages.security?.vulnerabilities?.some((v: any) => v.severity === 'critical')) {
    actions.push('Address critical security vulnerabilities immediately');
  }
  
  if (stages.performance?.analysis?.highComplexityFiles?.length > 0) {
    actions.push('Refactor high-complexity code sections');
  }
  
  if (stages.maintainability?.score < 60) {
    actions.push('Improve code maintainability through refactoring');
  }
  
  return actions;
}

export const comprehensiveWorkflows = {
  comprehensiveCodebaseAnalysisWorkflow
};