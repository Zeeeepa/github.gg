// Workaround for better-ui package that exports TypeScript files directly
// This wrapper provides the same functionality with proper module resolution

import { z } from 'zod';
import React from 'react';

// Basic AUI tool interface
export interface AUIContext {
  cache: Map<string, unknown>;
  fetch: typeof fetch;
  isServer: boolean;
}

export interface ToolConfig {
  name: string;
  description?: string;
  tags?: string[];
}

// Simplified AUI tool implementation
export class AUITool<TInput = unknown, TOutput = unknown> {
  public name: string;
  public description: string;
  public tags: string[] = [];
  private inputSchema?: z.ZodSchema<TInput>;
  private executeFunction?: (params: { input: TInput; ctx?: AUIContext }) => Promise<TOutput>;
  private renderFunction?: (params: { data: TOutput; loading: boolean; error?: Error }) => React.ReactElement;

  constructor(name: string) {
    this.name = name;
    this.description = '';
  }

  describe(description: string): this {
    this.description = description;
    return this;
  }

  tag(...tags: string[]): this {
    this.tags.push(...tags);
    return this;
  }

  input<T>(schema: z.ZodSchema<T>): AUITool<T, TOutput> {
    (this as any).inputSchema = schema;
    return this as any;
  }

  execute<T>(fn: (params: { input: T; ctx?: AUIContext }) => Promise<TOutput>): AUITool<T, TOutput> {
    (this as any).executeFunction = fn;
    return this as any;
  }

  render(fn: (params: { data: TOutput; loading: boolean; error?: Error }) => React.ReactElement): this {
    this.renderFunction = fn;
    return this;
  }

  async run(input: TInput, ctx?: AUIContext): Promise<TOutput> {
    if (!this.executeFunction) {
      throw new Error(`Tool ${this.name} has no execute function`);
    }

    // Validate input if schema is provided
    if (this.inputSchema) {
      const result = this.inputSchema.safeParse(input);
      if (!result.success) {
        throw new Error(`Invalid input for tool ${this.name}: ${result.error.message}`);
      }
    }

    return await this.executeFunction({ input, ctx });
  }

  renderResult(data: TOutput, loading: boolean = false, error?: Error): React.ReactElement {
    if (this.renderFunction) {
      return this.renderFunction({ data, loading, error });
    }
    
    // Default rendering
    return React.createElement('div', { className: 'p-4 border rounded' }, 
      React.createElement('h3', { className: 'font-semibold' }, this.name),
      React.createElement('pre', { className: 'mt-2 text-sm' }, JSON.stringify(data, null, 2))
    );
  }
}

export class AUI {
  private tools = new Map<string, AUITool>();

  tool(name: string): AUITool {
    const t = new AUITool(name);
    this.tools.set(name, t);
    return t;
  }

  get(name: string): AUITool | undefined {
    return this.tools.get(name);
  }

  getTool(name: string): AUITool | undefined {
    return this.tools.get(name);
  }

  async execute<TInput = any, TOutput = any>(
    name: string,
    input: TInput,
    ctx?: AUIContext
  ): Promise<TOutput> {
    const tool = this.get(name);
    if (!tool) throw new Error(`Tool "${name}" not found`);
    return await tool.run(input, ctx || this.createContext());
  }

  createContext(additions?: Partial<AUIContext>): AUIContext {
    return {
      cache: new Map(),
      fetch: globalThis.fetch?.bind(globalThis) || (() => Promise.reject(new Error('Fetch not available'))),
      isServer: typeof window === 'undefined',
      ...additions,
    };
  }

  list(): AUITool[] {
    return Array.from(this.tools.values());
  }

  getTools(): AUITool[] {
    return this.list();
  }

  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  clear(): void {
    this.tools.clear();
  }

  remove(name: string): boolean {
    return this.tools.delete(name);
  }
  
  findByTag(tag: string): AUITool[] {
    return this.list().filter(tool => tool.tags.includes(tag));
  }
  
  findByTags(...tags: string[]): AUITool[] {
    return this.list().filter(tool => 
      tags.every(tag => tool.tags.includes(tag))
    );
  }
}

const aui: AUI = new AUI();

export type InferToolInput<T> = T extends AUITool<infer I, any> ? I : never;
export type InferToolOutput<T> = T extends AUITool<any, infer O> ? O : never;

export { z };
export default aui;