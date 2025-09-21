import { lynlangTools } from './tools/lynlang-tools';
import { pageContextTools } from './tools/page-context-tools';
import { repositoryTools } from './tools/repository-tools';
import { pythonEnhancedTools } from './tools/python-enhanced-tools';

// Create a central registry of all better-ui tools
export const toolRegistry = {
  // Lynlang tools
  analyzCodeWithLynlang: lynlangTools.analyzCodeWithLynlang,
  compareCodePatterns: lynlangTools.compareCodePatterns,
  
  // Page context tools
  analyzePageContext: pageContextTools.analyzePageContext,
  extractPageContent: pageContextTools.extractPageContent,
  trackUserInteractions: pageContextTools.trackUserInteractions,
  
  // Repository tools
  analyzeRepositoryStructure: repositoryTools.analyzeRepositoryStructure,
  searchRepositoryFiles: repositoryTools.searchRepositoryFiles,
  getRepositoryInfo: repositoryTools.getRepositoryInfo,
  
  // Python-enhanced tools
  pythonAnalyzeRepository: pythonEnhancedTools.pythonAnalyzeRepository,
  pythonCodeReview: pythonEnhancedTools.pythonCodeReview,
};

// Export tools as array for easier iteration
export const allTools = Object.values(toolRegistry);

// Export tool names
export const toolNames = Object.keys(toolRegistry);

// Helper to get a tool by name
export function getTool(name: string) {
  return toolRegistry[name as keyof typeof toolRegistry];
}

// Helper to get tools by tag
export function getToolsByTag(tag: string) {
  return allTools.filter(tool => {
    // Access the tool's tags through its internal structure
    // Note: This assumes the better-ui tools have a tags property
    return (tool as any)._tags?.includes(tag);
  });
}

// Convert tools to AI SDK format
export function toAISDKTools() {
  const aiTools: Record<string, any> = {};
  
  Object.entries(toolRegistry).forEach(([name, tool]) => {
    aiTools[name] = (tool as any).toAISDKTool?.() || {
      description: (tool as any)._description || `Execute ${name}`,
      parameters: (tool as any)._inputSchema || {},
      execute: async (params: any) => {
        return await (tool as any).execute({ input: params });
      }
    };
  });
  
  return aiTools;
}

export type ToolRegistry = typeof toolRegistry;
export type ToolName = keyof ToolRegistry;