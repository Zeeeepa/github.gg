import { NextRequest, NextResponse } from 'next/server';
import { toolRegistry } from '@/lib/aui/registry';

/**
 * Python Bridge API Endpoints
 * 
 * These endpoints provide a bridge between the frontend and the web-ui-python-sdk.
 * They proxy requests to the Python FastAPI service running the actual ZAI client.
 */

// Configuration for Python service
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
const PYTHON_SERVICE_TIMEOUT = parseInt(process.env.PYTHON_SERVICE_TIMEOUT || '30000');

// Helper function to proxy requests to Python service
async function proxyToPythonService(
  endpoint: string, 
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<Response> {
  const url = `${PYTHON_SERVICE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(PYTHON_SERVICE_TIMEOUT)
    });
    
    return response;
  } catch (error) {
    console.error(`Python service proxy error for ${endpoint}:`, error);
    
    // Return error response that maintains the same structure
    return new Response(
      JSON.stringify({
        error: 'Python service unavailable',
        details: error instanceof Error ? error.message : String(error),
        fallback: true
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  
  if (pathname.endsWith('/health')) {
    // Proxy to Python service for real health check
    const pythonResponse = await proxyToPythonService('/health');
    
    if (pythonResponse.ok) {
      return new NextResponse(pythonResponse.body, {
        status: pythonResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Fallback response if Python service is down
      const fallbackData = await pythonResponse.json();
      return NextResponse.json({
        status: 'degraded',
        timestamp: Date.now(),
        pythonSDK: 'web-ui-python-sdk',
        pythonService: 'unavailable',
        error: fallbackData.error,
        fallback: true
      });
    }
  }
  
  if (pathname.endsWith('/tools')) {
    // Try Python service first, then fallback to local registry
    const pythonResponse = await proxyToPythonService('/tools');
    
    if (pythonResponse.ok) {
      return new NextResponse(pythonResponse.body, {
        status: pythonResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Fallback to local tool registry
      const availableTools = Object.keys(toolRegistry);
      return NextResponse.json({ 
        tools: availableTools,
        count: availableTools.length,
        source: 'fallback',
        pythonService: 'unavailable'
      });
    }
  }
  
  return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
}

// Chat and tool execution endpoints
export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);
  
  try {
    const body = await request.json();
    
    if (pathname.endsWith('/chat')) {
      return await handleChat(body);
    }
    
    if (pathname.endsWith('/chat-stream')) {
      return await handleChatStream(body);
    }
    
    if (pathname.endsWith('/execute-tool')) {
      return await handleToolExecution(body);
    }
    
    return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    
  } catch (error) {
    console.error('Python bridge error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

async function handleChat(body: any) {
  // Proxy to Python service for real ZAI integration
  const pythonResponse = await proxyToPythonService('/chat', 'POST', body);
  
  if (pythonResponse.ok) {
    return new NextResponse(pythonResponse.body, {
      status: pythonResponse.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    // Fallback to mock implementation if Python service unavailable
    const { messages, config } = body;
    
    const fallbackResponse = {
      content: generateMockResponse(messages),
      thinking: config?.enableThinking ? generateMockThinking(messages) : undefined,
      model: config?.model || 'glm-4.5v',
      usage: {
        promptTokens: estimateTokens(messages),
        completionTokens: 150,
        totalTokens: estimateTokens(messages) + 150
      },
      fallback: true,
      pythonService: 'unavailable'
    };
    
    return NextResponse.json(fallbackResponse);
  }
}

async function handleChatStream(body: any) {
  // Try to proxy to Python service for real streaming
  try {
    const pythonResponse = await proxyToPythonService('/chat-stream', 'POST', body);
    
    if (pythonResponse.ok && pythonResponse.body) {
      return new Response(pythonResponse.body, {
        status: pythonResponse.status,
        headers: {
          'Content-Type': 'text/stream-event',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
  } catch (error) {
    console.error('Python streaming service error:', error);
  }
  
  // Fallback to mock streaming implementation
  const { messages, config } = body;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = generateMockResponse(messages);
        
        // Add fallback indicator
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            delta: '[Fallback Mode] ',
            phase: 'system'
          })}\n\n`)
        );
        
        // Stream thinking phase if enabled
        if (config?.enableThinking) {
          const thinking = generateMockThinking(messages);
          for (let i = 0; i < thinking.length; i += 10) {
            const chunk = thinking.slice(i, i + 10);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                delta: chunk,
                phase: 'thinking'
              })}\n\n`)
            );
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        // Stream answer phase
        for (let i = 0; i < response.length; i += 5) {
          const chunk = response.slice(i, i + 5);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              delta: chunk,
              phase: 'answer'
            })}\n\n`)
          );
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/stream-event',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

async function handleToolExecution(body: any) {
  const { toolName, input, context } = body;
  
  // First try Python service for enhanced AI-powered tools
  if (toolName.includes('python') || toolName.includes('ai') || toolName.includes('analyze')) {
    const pythonResponse = await proxyToPythonService('/execute-tool', 'POST', body);
    
    if (pythonResponse.ok) {
      return new NextResponse(pythonResponse.body, {
        status: pythonResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Fallback to local tool execution
  const tool = toolRegistry[toolName as keyof typeof toolRegistry];
  if (!tool) {
    return NextResponse.json(
      { error: `Tool ${toolName} not found` }, 
      { status: 404 }
    );
  }
  
  try {
    // Execute the tool locally
    const result = await (tool as any).execute({ input, ctx: context });
    
    return NextResponse.json({
      success: true,
      toolName,
      result,
      timestamp: Date.now(),
      source: 'local-fallback'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      toolName,
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    }, { status: 500 });
  }
}

// Helper functions for mock implementation
function generateMockResponse(messages: any[]): string {
  const lastMessage = messages[messages.length - 1];
  const userMessage = lastMessage?.content || '';
  
  // Simple mock responses based on user input
  if (userMessage.toLowerCase().includes('analyze') || userMessage.toLowerCase().includes('repository')) {
    return "I've analyzed the repository structure and found several interesting patterns. The codebase appears to be well-organized with clear separation of concerns. Would you like me to dive deeper into any specific areas?";
  }
  
  if (userMessage.toLowerCase().includes('code') || userMessage.toLowerCase().includes('function')) {
    return "I can help you analyze the code structure. The implementation follows modern best practices with TypeScript and React. There are opportunities for optimization in several areas.";
  }
  
  if (userMessage.toLowerCase().includes('test') || userMessage.toLowerCase().includes('playwright')) {
    return "The testing infrastructure looks comprehensive with Playwright integration. I can help you create additional test cases or analyze the existing test coverage.";
  }
  
  return "I'm here to help you with repository analysis, code review, and development insights. What would you like to explore?";
}

function generateMockThinking(messages: any[]): string {
  return "Let me think about this request... I need to analyze the context and provide a helpful response based on the repository structure and the user's question.";
}

function estimateTokens(messages: any[]): number {
  const totalText = messages.map(m => m.content).join(' ');
  return Math.ceil(totalText.length / 4); // Rough token estimation
}