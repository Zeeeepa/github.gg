'use client';

/**
 * Web UI Python SDK Adapter
 * 
 * This adapter provides a bridge between the frontend React/TypeScript code
 * and the web-ui-python-sdk backend integration. Since the Python SDK operates
 * on the server side, this adapter handles the communication via API endpoints.
 */

import { toolRegistry } from '@/lib/aui/registry';

export interface PythonSDKConfig {
  baseUrl?: string;
  token?: string;
  model?: 'glm-4.5v' | '0727-360B-API';
  enableThinking?: boolean;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

export interface PythonSDKMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface PythonSDKResponse {
  content: string;
  thinking?: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class WebUIPythonAdapter {
  private config: PythonSDKConfig;
  private isConnected: boolean = false;

  constructor(config: PythonSDKConfig = {}) {
    this.config = {
      baseUrl: '/api/python-bridge',
      model: 'glm-4.5v',
      enableThinking: true,
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 2000,
      ...config
    };
  }

  /**
   * Initialize the Python SDK connection
   */
  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      console.error('Failed to connect to Python SDK:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Send a chat message to the Python SDK
   */
  async chat(
    messages: PythonSDKMessage[],
    options: Partial<PythonSDKConfig> = {}
  ): Promise<PythonSDKResponse> {
    if (!this.isConnected) {
      await this.connect();
    }

    const requestConfig = { ...this.config, ...options };

    const response = await fetch(`${this.config.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        config: requestConfig
      }),
    });

    if (!response.ok) {
      throw new Error(`Python SDK chat failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Stream chat responses from the Python SDK
   */
  async *chatStream(
    messages: PythonSDKMessage[],
    options: Partial<PythonSDKConfig> = {}
  ): AsyncGenerator<{ delta: string; phase: 'thinking' | 'answer' }, void, unknown> {
    if (!this.isConnected) {
      await this.connect();
    }

    const requestConfig = { ...this.config, ...options };

    const response = await fetch(`${this.config.baseUrl}/chat-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        config: requestConfig
      }),
    });

    if (!response.ok) {
      throw new Error(`Python SDK chat stream failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No readable stream available');
    }

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.delta) {
                yield data;
              }
            } catch (e) {
              console.warn('Failed to parse stream data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Execute a better-ui tool through the Python SDK
   */
  async executeTool(
    toolName: string,
    input: any,
    context?: any
  ): Promise<any> {
    if (!this.isConnected) {
      await this.connect();
    }

    // Check if tool exists in registry
    const tool = toolRegistry[toolName as keyof typeof toolRegistry];
    if (!tool) {
      throw new Error(`Tool ${toolName} not found in registry`);
    }

    const response = await fetch(`${this.config.baseUrl}/execute-tool`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolName,
        input,
        context
      }),
    });

    if (!response.ok) {
      throw new Error(`Tool execution failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get available tools from the Python SDK
   */
  async getAvailableTools(): Promise<string[]> {
    if (!this.isConnected) {
      await this.connect();
    }

    const response = await fetch(`${this.config.baseUrl}/tools`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get tools: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tools || [];
  }

  /**
   * Update SDK configuration
   */
  updateConfig(config: Partial<PythonSDKConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): PythonSDKConfig {
    return { ...this.config };
  }

  /**
   * Check if the adapter is connected
   */
  isReady(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnect from the Python SDK
   */
  async disconnect(): Promise<void> {
    this.isConnected = false;
  }
}

// Global adapter instance
let globalAdapter: WebUIPythonAdapter | null = null;

/**
 * Get the global Python SDK adapter instance
 */
export function getPythonAdapter(config?: PythonSDKConfig): WebUIPythonAdapter {
  if (!globalAdapter) {
    globalAdapter = new WebUIPythonAdapter(config);
  }
  return globalAdapter;
}

/**
 * Hook for using the Python SDK in React components
 */
export function usePythonSDK(config?: PythonSDKConfig) {
  const adapter = getPythonAdapter(config);
  
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const connectAdapter = async () => {
      setIsLoading(true);
      try {
        const connected = await adapter.connect();
        setIsConnected(connected);
      } catch (error) {
        console.error('Failed to connect to Python SDK:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    connectAdapter();
  }, [adapter]);

  return {
    adapter,
    isConnected,
    isLoading,
    chat: adapter.chat.bind(adapter),
    chatStream: adapter.chatStream.bind(adapter),
    executeTool: adapter.executeTool.bind(adapter),
    getAvailableTools: adapter.getAvailableTools.bind(adapter),
  };
}

// React import for the hook
import React from 'react';

// Note: This is currently a mock implementation for development
// In production, this would integrate with the actual web-ui-python-sdk