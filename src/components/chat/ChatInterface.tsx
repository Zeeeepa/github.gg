'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User, Code, Search, FileText, Cpu } from 'lucide-react';
import { useAUI, useToolRenderer } from '@/lib/aui/provider';
import { toolNames } from '@/lib/aui/registry';

interface ChatInterfaceProps {
  repositoryContext?: {
    owner: string;
    repo: string;
    ref?: string;
  };
  className?: string;
}

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: any;
  result?: any;
  state: 'calling' | 'result' | 'error';
}

const toolIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  analyzeRepositoryStructure: FileText,
  searchRepositoryFiles: Search,
  getRepositoryInfo: FileText,
  analyzePageContext: FileText,
  extractPageContent: FileText,
  analyzCodeWithLynlang: Code,
  compareCodePatterns: Cpu,
};

export function ChatInterface({ repositoryContext, className }: ChatInterfaceProps) {
  const [pageContext, setPageContext] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const aui = useAUI();
  const toolRenderer = useToolRenderer();

  // Initialize page context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageContext({
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    }
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, reload } = useChat({
    api: '/api/chat',
    body: {
      context: {
        repository: repositoryContext,
        pageUrl: pageContext?.url,
        userAgent: pageContext?.userAgent
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const renderToolInvocation = (toolInvocation: ToolInvocation) => {
    const Icon = toolIcons[toolInvocation.toolName] || Code;
    
    return (
      <div key={toolInvocation.toolCallId} className="my-3 p-3 bg-blue-50 border border-blue-200 rounded-lg" data-testid="tool-result">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            {getToolDisplayName(toolInvocation.toolName)}
          </span>
          {toolInvocation.state === 'calling' && (
            <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
          )}
        </div>
        
        {toolInvocation.args && (
          <div className="mb-2">
            <details className="text-xs">
              <summary className="cursor-pointer text-blue-700 hover:text-blue-800">
                Parameters
              </summary>
              <pre className="mt-1 p-2 bg-blue-100 rounded text-blue-900 overflow-auto">
                {JSON.stringify(toolInvocation.args, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {toolInvocation.result && (
          <div className="text-sm">
            {/* Use better-ui's tool renderer for enhanced display */}
            {toolRenderer.render(
              toolInvocation.toolName, 
              toolInvocation.result, 
              toolInvocation.state === 'calling',
              toolInvocation.state === 'error' ? new Error('Tool execution failed') : undefined
            ) || renderToolResult(toolInvocation.toolName, toolInvocation.result)}
          </div>
        )}

        {toolInvocation.state === 'error' && (
          <div className="text-sm text-red-600">
            Tool execution failed
          </div>
        )}
      </div>
    );
  };

  const getToolDisplayName = (toolName: string): string => {
    const displayNames: Record<string, string> = {
      analyzeRepositoryStructure: 'Analyzing Repository Structure',
      searchRepositoryFiles: 'Searching Repository Files',
      getRepositoryInfo: 'Getting Repository Info',
      analyzePageContext: 'Analyzing Page Context',
      extractPageContent: 'Extracting Page Content',
      analyzCodeWithLynlang: 'Analyzing Code with Lynlang',
      compareCodePatterns: 'Comparing Code Patterns'
    };
    return displayNames[toolName] || toolName;
  };

  const renderToolResult = (toolName: string, result: any) => {
    // Handle different tool result formats
    if (result?.success === false) {
      return (
        <div className="text-red-600">
          <strong>Error:</strong> {result.error || 'Tool execution failed'}
        </div>
      );
    }

    switch (toolName) {
      case 'analyzeRepositoryStructure':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2 rounded">
                <div className="font-semibold">{result.totalFiles || 0}</div>
                <div className="text-gray-600">Files</div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="font-semibold">{Object.keys(result.languages || {}).length}</div>
                <div className="text-gray-600">Languages</div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="font-semibold">{result.directories?.length || 0}</div>
                <div className="text-gray-600">Directories</div>
              </div>
            </div>
            {result.languages && (
              <div className="text-xs">
                <strong>Top Languages:</strong>{' '}
                {Object.entries(result.languages)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 3)
                  .map(([lang, count]) => `${lang} (${count})`)
                  .join(', ')}
              </div>
            )}
          </div>
        );

      case 'searchRepositoryFiles':
        return (
          <div className="space-y-2 text-xs">
            <div><strong>Query:</strong> "{result.query}"</div>
            <div><strong>Results:</strong> {result.totalResults} files with matches</div>
            {result.results?.slice(0, 3).map((file: any, idx: number) => (
              <div key={idx} className="bg-white p-2 rounded">
                <div className="font-medium">{file.file}</div>
                <div className="text-gray-600">{file.matches.length} matches</div>
              </div>
            ))}
          </div>
        );

      case 'analyzCodeWithLynlang':
        return (
          <div className="space-y-2 text-xs">
            {result.summary && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-2 rounded text-center">
                  <div className="font-semibold">{result.summary.linesOfCode}</div>
                  <div className="text-gray-600">Lines</div>
                </div>
                <div className="bg-white p-2 rounded text-center">
                  <div className="font-semibold">{result.summary.complexity}</div>
                  <div className="text-gray-600">Complexity</div>
                </div>
                <div className="bg-white p-2 rounded text-center">
                  <div className="font-semibold">{result.summary.patternCount}</div>
                  <div className="text-gray-600">Patterns</div>
                </div>
              </div>
            )}
            {result.error && (
              <div className="text-amber-600">
                <strong>Note:</strong> {result.error}
                {result.fallback && <div className="mt-1">{result.fallback}</div>}
              </div>
            )}
          </div>
        );

      default:
        return (
          <details className="text-xs">
            <summary className="cursor-pointer">View Result</summary>
            <pre className="mt-1 p-2 bg-white rounded overflow-auto max-h-32">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        );
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(e);
      inputRef.current?.focus();
    }
  };

  return (
    <Card className={`flex flex-col h-[600px] ${className || ''}`} data-testid="chat-interface">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">Repository Assistant</h3>
          {repositoryContext && (
            <span className="text-sm text-gray-600 ml-auto">
              {repositoryContext.owner}/{repositoryContext.repo}
            </span>
          )}
        </div>
        {isLoading && (
          <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="w-3 h-3 animate-spin" />
            Thinking...
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Hi! I'm your repository assistant.</p>
              <p className="text-sm mt-1">
                I can analyze code, search files, and provide insights about this repository.
              </p>
              <div className="mt-4 text-xs text-left max-w-md mx-auto">
                <p className="font-medium mb-2">Try asking me:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• "Analyze the structure of this repository"</li>
                  <li>• "Search for React components in the codebase"</li>
                  <li>• "What programming languages are used here?"</li>
                  <li>• "Analyze this code with lynlang" (paste code)</li>
                </ul>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
              data-testid="chat-message"
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-blue-100' 
                  : 'bg-green-100'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-blue-600" />
                ) : (
                  <Bot className="w-4 h-4 text-green-600" />
                )}
              </div>
              
              <div className={`flex-1 max-w-[80%] ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}>
                <div className={`inline-block p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </div>

                {/* Tool invocations */}
                {message.toolInvocations?.map((toolInvocation: any) =>
                  renderToolInvocation(toolInvocation)
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about this repository..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}