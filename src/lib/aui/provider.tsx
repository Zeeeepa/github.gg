'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';

// Simple AUI context without external dependencies for now
interface SimpleAUI {
  tools: Map<string, any>;
  execute: (toolName: string, input: any) => Promise<any>;
}

const AUIContext = createContext<SimpleAUI | null>(null);

interface AUIProviderProps {
  children: ReactNode;
}

export function AUIProvider({ children }: AUIProviderProps) {
  const aui = useMemo(() => ({
    tools: new Map(),
    execute: async (toolName: string, input: any) => {
      // Simple implementation for now
      console.log('Executing tool:', toolName, 'with input:', input);
      return { success: true, message: `Tool ${toolName} executed` };
    }
  }), []);
  
  return (
    <AUIContext.Provider value={aui}>
      {children}
    </AUIContext.Provider>
  );
}

export function useAUI() {
  const context = useContext(AUIContext);
  if (!context) {
    throw new Error('useAUI must be used within an AUIProvider');
  }
  return context;
}