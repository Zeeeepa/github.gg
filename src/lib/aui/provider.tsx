'use client';

import { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import { toolRegistry, getTool, allTools, type ToolName } from './registry';

// Enhanced AUI context with full better-ui integration
interface AUIContext {
  tools: typeof toolRegistry;
  execute: (toolName: ToolName, input: any, options?: ExecutionOptions) => Promise<any>;
  isExecuting: (toolName: string) => boolean;
  getExecutionHistory: () => ExecutionRecord[];
  clearHistory: () => void;
}

interface ExecutionOptions {
  clientSide?: boolean;
  cache?: boolean;
  timeout?: number;
}

interface ExecutionRecord {
  toolName: string;
  input: any;
  result?: any;
  error?: string;
  timestamp: number;
  duration?: number;
}

const AUIContextObj = createContext<AUIContext | null>(null);

interface AUIProviderProps {
  children: ReactNode;
}

export function AUIProvider({ children }: AUIProviderProps) {
  const [executingTools, setExecutingTools] = useState<Set<string>>(new Set());
  const [executionHistory, setExecutionHistory] = useState<ExecutionRecord[]>([]);

  const aui = useMemo(() => ({
    tools: toolRegistry,
    
    execute: async (toolName: ToolName, input: any, options: ExecutionOptions = {}) => {
      const tool = getTool(toolName);
      if (!tool) {
        throw new Error(`Tool ${toolName} not found`);
      }

      const executionId = `${toolName}-${Date.now()}`;
      const startTime = Date.now();
      
      // Mark tool as executing
      setExecutingTools(prev => new Set(prev).add(toolName));
      
      // Create execution record
      const record: ExecutionRecord = {
        toolName,
        input,
        timestamp: startTime
      };

      try {
        let result;
        
        // Try client-side execution first if available and requested
        if (options.clientSide && (tool as any).clientExecute) {
          try {
            result = await (tool as any).clientExecute({
              input,
              ctx: {
                cache: new Map(), // Simple cache implementation
                fetch: fetch.bind(window),
                storage: localStorage,
                sessionStorage: sessionStorage
              }
            });
          } catch (clientError) {
            console.warn('Client-side execution failed, falling back to server:', clientError);
            // Fall back to server execution
            result = await (tool as any).execute({ input });
          }
        } else {
          // Server-side execution
          result = await (tool as any).execute({ 
            input,
            ctx: {
              fetch: fetch.bind(window)
            }
          });
        }

        record.result = result;
        record.duration = Date.now() - startTime;

        return result;
      } catch (error) {
        record.error = error instanceof Error ? error.message : String(error);
        record.duration = Date.now() - startTime;
        throw error;
      } finally {
        // Remove from executing set
        setExecutingTools(prev => {
          const next = new Set(prev);
          next.delete(toolName);
          return next;
        });
        
        // Add to history
        setExecutionHistory(prev => [...prev.slice(-99), record]); // Keep last 100 records
      }
    },
    
    isExecuting: (toolName: string) => executingTools.has(toolName),
    
    getExecutionHistory: () => executionHistory,
    
    clearHistory: () => setExecutionHistory([])
  }), [executingTools, executionHistory]);
  
  return (
    <AUIContextObj.Provider value={aui}>
      {children}
    </AUIContextObj.Provider>
  );
}

export function useAUI() {
  const context = useContext(AUIContextObj);
  if (!context) {
    throw new Error('useAUI must be used within an AUIProvider');
  }
  return context;
}

// Hook to get a specific tool
export function useTool<T extends ToolName>(toolName: T) {
  const { tools, execute, isExecuting } = useAUI();
  
  return {
    tool: tools[toolName],
    execute: (input: any, options?: ExecutionOptions) => execute(toolName, input, options),
    isExecuting: isExecuting(toolName)
  };
}

// Hook to render a tool result
export function useToolRenderer() {
  const { tools } = useAUI();
  
  return {
    render: (toolName: string, data: any, loading = false, error?: Error) => {
      const tool = getTool(toolName as ToolName);
      if (!tool || !(tool as any).render) {
        return null;
      }
      
      return (tool as any).render({ data, loading, error });
    }
  };
}