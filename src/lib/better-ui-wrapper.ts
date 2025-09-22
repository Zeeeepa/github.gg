// Better-UI wrapper for consistent imports and compatibility
import { AUI, z } from '@lantos1618/better-ui';

// Create a singleton AUI instance
const aui = new AUI();

// Re-export the main aui object and z (zod) for type validation
export { z };
export default aui;
export { aui };

// Type definitions for better-ui tool structure
export interface ToolDefinition {
  name: string;
  description: string;
  tags?: string[];
  inputSchema: any;
  execute: (params: { input: any; ctx?: any }) => Promise<any>;
  render?: (params: { data: any; loading: boolean; error?: Error }) => React.ReactNode;
  clientExecute?: (params: { input: any; ctx?: any }) => Promise<any>;
}

// Helper type for better-ui tool creation
export type BetterUITool = ReturnType<typeof auiImport.tool>;

// Helper function to create compatible tool definitions
export function createTool(name: string) {
  return auiImport.tool(name);
}