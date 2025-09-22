import { NextRequest, NextResponse } from 'next/server';
import { streamText, convertToCoreMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { toAISDKTools, toolNames } from '@/lib/aui/registry';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Schema for the request body
const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  context: z.object({
    repository: z.object({
      owner: z.string(),
      repo: z.string(),
      ref: z.string().optional()
    }).optional(),
    pageUrl: z.string().optional(),
    userAgent: z.string().optional()
  }).optional()
});

type ChatRequest = z.infer<typeof ChatRequestSchema>;

// Get all better-ui tools converted to AI SDK format
const tools = toAISDKTools();

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ 
      headers: req.headers 
    } as Request);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = ChatRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request format', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { messages, context } = parsed.data;

    // Get Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Build system prompt with context
    let systemPrompt = `You are an AI assistant specialized in analyzing GitHub repositories and providing insights about codebases. 

You have access to several powerful tools:
- Repository analysis tools (structure, file search, metadata)
- Page context analysis tools (current page understanding, content extraction)
- Lynlang code analysis tools (deep code analysis, pattern matching, AST generation)

Key capabilities:
1. Analyze repository structure and organization
2. Search through repository files for specific patterns
3. Perform deep code analysis using lynlang compiler
4. Compare code patterns and complexity
5. Understand current page context and extract relevant information

Always use the most appropriate tools for the user's request. When analyzing code, prefer using lynlang tools for deeper insights when possible, but provide helpful fallback analysis if lynlang is not available.

Be conversational, helpful, and provide actionable insights based on your analysis.`;

    // Add context information to system prompt
    if (context?.repository) {
      systemPrompt += `\n\nCurrent repository context: ${context.repository.owner}/${context.repository.repo}`;
      if (context.repository.ref) {
        systemPrompt += ` (${context.repository.ref})`;
      }
    }

    if (context?.pageUrl) {
      systemPrompt += `\nCurrent page: ${context.pageUrl}`;
    }

    // Prepare messages with system prompt
    const messagesWithSystem = [
      { role: 'system' as const, content: systemPrompt },
      ...convertToCoreMessages(messages)
    ];

    // Stream the response
    const result = await streamText({
      model: google('gemini-1.5-pro-latest'),
      messages: messagesWithSystem,
      tools,
      maxSteps: 5,
      temperature: 0.7,
      maxTokens: 4000,
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? String(error) : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    availableTools: toolNames,
    description: 'GitHub.gg Chat API with repository analysis and lynlang integration powered by better-ui'
  });
}