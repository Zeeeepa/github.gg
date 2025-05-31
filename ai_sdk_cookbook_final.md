# AI SDK Cookbook

An open-source collection of recipes, guides, and templates for building with the AI SDK.

# Natural Language Postgres Guide

In this guide, you will learn how to build an app that uses AI to interact with a PostgreSQL database using natural language.

The application will:

* Generate SQL queries from a natural language input
* Explain query components in plain English
* Create a chart to visualise query results

You can find a completed version of this project at [natural-language-postgres.vercel.app](https://natural-language-postgres.vercel.app/).

## Project setup

This project uses the following stack:

* Next.js (App Router)
* AI SDK
* OpenAI
* Zod

## Project setup and data

### Clone repo

### About the dataset

### Project structure

### Existing components

## Building the application

### Generate SQL queries

#### Providing context

#### Create a Server Action

#### Update the frontend

### Explain SQL Queries

#### Create a Server Action

#### Update query viewer
# Multi-Modal Chatbot Guide

In this guide, you will build a multi-modal AI-chatbot capable of understanding both images and PDFs.

Multi-modal refers to the ability of the chatbot to understand and generate responses in multiple formats, such as text, images, PDFs, and videos. In this example, we will focus on sending images and PDFs and generating text-based responses.

Different AI providers have varying levels of multi-modal support, for example:

* OpenAI (GPT-4o): Supports image input
* Anthropic (Sonnet 3.5): Supports image and PDF input
* Google (Gemini 2.0): Supports image and PDF input

For a complete list of providers that support both image and PDF inputs, visit the [providers documentation](https://ai-sdk.dev/docs/providers).

We'll first build a chatbot capable of generating responses based on an image input using OpenAI, then show how to switch providers to handle PDFs.

## Prerequisites

## Create Your Application

### Install dependencies

### Configure OpenAI API key

## Implementation Plan

### Create a Route Handler

### Wire up the UI

### Add Image Upload

## Running Your Application

## Working with PDFs

## Where to Next?
# Get Started with Computer Use Guide

With the [release of Computer Use in Claude 3.5 Sonnet](https://www.anthropic.com/news/claude-computer-use), you can now direct AI models to interact with computers like humans do - moving cursors, clicking buttons, and typing text. This capability enables automation of complex tasks while leveraging Claude's advanced reasoning abilities.

The AI SDK is a powerful TypeScript toolkit for building AI applications with large language models (LLMs) like Anthropic's Claude alongside popular frameworks like React, Next.js, Vue, Svelte, Node.js, and more. In this guide, you will learn how to integrate Computer Use into your AI SDK applications.

Computer Use is currently in beta with some [limitations](https://docs.anthropic.com/claude/docs/computer-use-beta). The feature may be error-prone at times. Anthropic recommends starting with low-risk tasks and implementing appropriate safety measures.

## Computer Use

Anthropic recently released a new version of the Claude 3.5 Sonnet model which is capable of 'Computer Use'. This allows the model to interact with computer interfaces through basic actions like:

## How It Works

## Available Tools

## Implementation Considerations

## Getting Started with the AI SDK

## Using Computer Tools with Text Generation

## Configure Multi-Step (Agentic) Generations

## Combine Multiple Tools

## Best Practices for Computer Use

## Security Measures
# Get Started with OpenAI o1 Guide

With the [release of OpenAI's o1 series models](https://openai.com/blog/introducing-o1), there has never been a better time to start building AI applications, particularly those that require complex reasoning capabilities.

The AI SDK is a powerful TypeScript toolkit for building AI applications with large language models (LLMs) like OpenAI o1 alongside popular frameworks like React, Next.js, Vue, Svelte, Node.js, and more.

## OpenAI o1

OpenAI released a series of AI models designed to spend more time thinking before responding. They can reason through complex tasks and solve harder problems than previous models in science, coding, and math. These models, named the o1 series, are trained with reinforcement learning and can "think before they answer". As a result, they are able to produce a long internal chain of thought before responding to a prompt.

There are three reasoning models available in the API:

1. **o1**: Designed to reason about hard problems using broad general knowledge about the world.
2. **o1-preview**: The original preview version of o1 - slower than o1 but with similar capabilities.
3. **o1-mini**: A smaller, faster, and more affordable version of o1 with similar capabilities.

## Benchmarks

## Prompt Engineering for o1 Models

## Getting Started with the AI SDK

## Refining Reasoning Effort

## Generating Structured Data

## Tools

## Using Tools with the AI SDK

## Building Interactive Interfaces

## Get Started
\n## Next.js Recipes\n
# Generate Text

A situation may arise when you need to generate text based on a prompt. For example, you may want to generate a response to a question or summarize a body of text. The `generateText` function can be used to generate text based on the input prompt.

## Client

Let's create a simple React component that will make a POST request to the `/api/completion` endpoint when a button is clicked. The endpoint will generate text based on the input prompt.

\`\`\`jsx
import { useState } from 'react';

export default function Page() {
  const [generation, setGeneration] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div>
      <button
        onClick={async () => {
          setIsLoading(true);
          await fetch('/api/completion', {
            method: 'POST',
            body: JSON.stringify({
              prompt: 'Why is the sky blue?',
            }),
          }).then(response => {
            response.json().then(json => {
              setGeneration(json.text);
              setIsLoading(false);
            });
          });
        }}
      >
        Generate
      </button>
      <div>{isLoading ? 'Loading...' : generation}</div>
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/completion` that will generate text based on the input prompt. The route will call the `generateText` function from the `ai` module, which will then generate text based on the input prompt and return it.

app/api/completion/route.ts

\`\`\`typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();
  
  const { text } = await generateText({
    model: openai('gpt-4'),
    system: 'You are a helpful assistant.',
    prompt,
  });
  
  return Response.json({ text });
}
\`\`\`
# Generate Text with Chat Prompt

Previously, you were able to generate text and objects using either a single message prompt, a system prompt, or a combination of both of them. However, there may be times when you want to generate text based on a series of messages.

A chat completion allows you to generate text based on a series of messages. This series of messages can be any series of interactions between any number of systems, but the most popular and relatable use case has been a series of messages that represent a conversation between a user and a model.

## Client

Let's create a simple React component that will make a POST request to the `/api/completion` endpoint when a button is clicked. The endpoint will generate text based on the input prompt.

\`\`\`jsx
import { useState } from 'react';

export default function Page() {
  const [generation, setGeneration] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div>
      <button
        onClick={async () => {
          setIsLoading(true);
          await fetch('/api/completion', {
            method: 'POST',
            body: JSON.stringify({
              prompt: 'Why is the sky blue?',
            }),
          }).then(response => {
            response.json().then(json => {
              setGeneration(json.text);
              setIsLoading(false);
            });
          });
        }}
      >
        Generate
      </button>
      <div>{isLoading ? 'Loading...' : generation}</div>
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/completion` that will generate text based on the input prompt. The route will call the `generateText` function from the `ai` module, which will then generate text based on the input prompt and return it.

app/api/completion/route.ts

\`\`\`typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();
  
  const { text } = await generateText({
    model: openai('gpt-4'),
    system: 'You are a helpful assistant.',
    prompt,
  });
  
  return Response.json({ text });
}
\`\`\`
# Generate Image with Chat Prompt

When building a chatbot, you may want to allow the user to generate an image. This can be done by creating a tool that generates an image using the `experimental_generateImage` function from the AI SDK.

## Server

Let's create an endpoint at `/api/chat` that generates the assistant's response based on the conversation history. You will also define a tool called `generateImage` that will generate an image based on the assistant's response.

\`\`\`typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { experimental_generateImage, Message, streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(request: Request) {
  const { messages }: { messages: Message[] } = await request.json();

  // filter through messages and remove base64 image data to avoid token limits
  const formattedMessages = messages.map(m => {
    if (m.role === 'assistant' && m.toolResults) {
      return {
        ...m,
        toolResults: m.toolResults.map(tr => {
          if (tr.toolName === 'generateImage') {
            return {
              ...tr,
              result: 'base64 image data removed for token optimization',
            };
          }
          return tr;
        }),
      };
    }
    return m;
  });

  const generateImage = tool({
    name: 'generateImage',
    description: 'Generate an image based on a text prompt',
    parameters: z.object({
      prompt: z.string().describe('The prompt to generate an image from'),
    }),
    execute: async ({ prompt }) => {
      const { image } = await experimental_generateImage({
        model: openai('dall-e-3'),
        prompt,
      });

      return image;
    },
  });

  const textStream = await streamText({
    model: openai('gpt-4-vision-preview'),
    messages: formattedMessages,
    tools: [generateImage],
  });

  return new Response(textStream);
}
\`\`\`

## Client

Now, let's create a React component that will display a chat interface and allow the user to generate images.

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import Image from 'next/image';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const [imagePrompt, setImagePrompt] = useState('');

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
          {m.toolResults?.map((toolResult, i) => (
            <div key={i}>
              {toolResult.toolName === 'generateImage' && (
                <Image
                  src={`data:image/png;base64,${toolResult.result}`}
                  alt="Generated image"
                  width={512}
                  height={512}
                  style={{ marginTop: '1rem' }}
                />
              )}
            </div>
          ))}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something or ask for an image..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

With this implementation, users can ask the AI to generate images, and the AI will use the `generateImage` tool to create and display the requested images in the chat interface.
# Stream Text

Text generation can sometimes take a long time to complete, especially when you're generating a couple of paragraphs. In such cases, it is useful to stream the text generation process to the client in real-time. This allows the client to display the generated text as it is being generated, rather than have users wait for it to complete before displaying the result.

## Client

Let's create a simple React component that imports the `useCompletion` hook from the `@ai-sdk/react` module. The `useCompletion` hook will call the `/api/completion` endpoint when a button is clicked. The endpoint will generate text based on the input prompt and stream it to the client.

\`\`\`jsx
'use client';

import { useCompletion } from 'ai/react';

export default function Page() {
  const { completion, input, handleInputChange, handleSubmit, isLoading } = useCompletion();

  return (
    <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
      <form onSubmit={handleSubmit} className="flex mb-4">
        <input
          className="border border-gray-300 rounded-l p-2 flex-1"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question"
        />
        <button
          className="bg-blue-500 text-white rounded-r px-4"
          type="submit"
          disabled={isLoading}
        >
          Generate
        </button>
      </form>
      <div className="whitespace-pre-wrap">
        {completion}
      </div>
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/completion` that will generate text based on the input prompt and stream it to the client.

\`\`\`typescript
// app/api/completion/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const textStream = await streamText({
    model: openai('gpt-4'),
    system: 'You are a helpful assistant.',
    prompt,
  });
  
  return new Response(textStream);
}
\`\`\`

This implementation allows for real-time text streaming, providing a more responsive user experience compared to waiting for the entire generation to complete before displaying anything.
# Stream Text with Chat Prompt

Chat completion can sometimes take a long time to finish, especially when the response is big. In such cases, it is useful to stream the chat completion to the client in real-time. This allows the client to display the new message as it is being generated by the model, rather than have users wait for it to finish.

## Client

Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client.

\`\`\`jsx
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/chat` that will generate the assistant's response based on the conversation history and stream it to the client.

\`\`\`typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const textStream = await streamText({
    model: openai('gpt-4'),
    messages,
  });
  
  return new Response(textStream);
}
\`\`\`

This implementation allows for real-time streaming of chat responses, providing a more responsive user experience compared to waiting for the entire response to complete before displaying anything.
# Stream Text with Image Prompt

Vision models such as GPT-4 can process both text and images. In this example, we will show you how to send an image URL along with the user's message to the model.

## Using Image URLs

## Server

We split the user's message into two parts: the text and the image URL. We then send both parts to the model. The last message is the user's message, and we add the image URL to it.

\`\`\`typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  // 'data' contains the additional data that you have sent:
  const { messages, data } = await req.json();

  // The last message is the user's message
  const lastMessageIndex = messages.length - 1;
  
  // We create a new array of messages, where we modify the last message
  // to include the image URL
  const messagesWithImage = messages.map((message, i) => {
    if (i === lastMessageIndex && message.role === 'user') {
      return {
        ...message,
        content: [
          {
            type: 'text',
            text: message.content,
          },
          {
            type: 'image_url',
            image_url: {
              url: data.imageUrl,
            },
          },
        ],
      };
    }
    return message;
  });

  const textStream = await streamText({
    model: openai('gpt-4-vision-preview'),
    messages: messagesWithImage,
    temperature: 0.7,
    max_tokens: 500,
  });

  return new Response(textStream);
}
\`\`\`

## Client

Now, let's create a React component that will allow the user to enter a message and an image URL, and then send both to the server.

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import Image from 'next/image';

export default function Chat() {
  const [imageUrl, setImageUrl] = useState('');
  
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: {
      imageUrl,
    },
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
          {m.role === 'user' && imageUrl && index === messages.length - 1 && (
            <div>
              <Image
                src={imageUrl}
                alt="User provided image"
                width={300}
                height={300}
                style={{ objectFit: 'contain', marginTop: '0.5rem' }}
              />
            </div>
          )}
        </div>
      ))}

      <div className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl">
        <input
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL..."
        />
        <form onSubmit={handleSubmit}>
          <input
            className="w-full p-2 border border-gray-300 rounded"
            value={input}
            onChange={handleInputChange}
            placeholder="Say something about the image..."
          />
        </form>
      </div>
    </div>
  );
}
\`\`\`

This implementation allows users to provide both text and image inputs, enabling the AI to analyze and respond to visual content alongside textual queries.
# Chat with PDFs

Some language models like Anthropic's Claude Sonnet 3.5 and Google's Gemini 2.0 can understand PDFs and respond to questions about their contents. In this example, we'll show you how to build a chat interface that accepts PDF uploads.

This example requires a provider that supports PDFs, such as Anthropic's Claude 3.7, Google's Gemini 2.5, or OpenAI's GPT-4.1. Check the [provider documentation](https://ai-sdk.dev/docs/providers) for up-to-date support information.

## Implementation

## Server

Create a route handler that will use Anthropic's Claude model to process messages and PDFs:

\`\`\`typescript
// app/api/chat/route.ts
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, data } = await req.json();
  
  // The last message is the user's message
  const lastMessageIndex = messages.length - 1;
  
  // We create a new array of messages, where we modify the last message
  // to include the PDF if it exists
  const messagesWithPDF = messages.map((message, i) => {
    if (i === lastMessageIndex && message.role === 'user' && data?.pdfBase64) {
      return {
        ...message,
        content: [
          {
            type: 'text',
            text: message.content,
          },
          {
            type: 'file',
            file_data: {
              type: 'pdf',
              data: data.pdfBase64,
            },
          },
        ],
      };
    }
    return message;
  });

  const textStream = await streamText({
    model: anthropic('claude-3-sonnet-20240229'),
    messages: messagesWithPDF,
    temperature: 0.7,
    max_tokens: 1000,
  });

  return new Response(textStream);
}
\`\`\`

## Client

Now, let's create a React component that will allow the user to upload a PDF and chat with the AI about its contents:

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';
import { useState, useRef } from 'react';

export default function Chat() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfBase64, setPdfBase64] = useState('');
  const fileInputRef = useRef(null);
  
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: {
      pdfBase64: pdfBase64 || undefined,
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      
      // Convert PDF to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result.split(',')[1];
        setPdfBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPdf = () => {
    setPdfFile(null);
    setPdfBase64('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="mb-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="mb-2"
        />
        {pdfFile && (
          <div className="flex items-center">
            <span className="mr-2">
              PDF: {pdfFile.name} ({Math.round(pdfFile.size / 1024)} KB)
            </span>
            <button
              onClick={clearPdf}
              className="px-2 py-1 text-sm text-white bg-red-500 rounded"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md p-2 mb-8 bg-white border border-gray-300 rounded shadow-xl">
        <input
          className="w-full p-2 border border-gray-300 rounded"
          value={input}
          onChange={handleInputChange}
          placeholder={pdfFile ? "Ask about the PDF..." : "Upload a PDF first..."}
          disabled={!pdfFile}
        />
      </form>
    </div>
  );
}
\`\`\`

This implementation allows users to upload PDF documents and ask questions about their contents, with the AI model processing and responding to queries based on the PDF's information.
# Stream Text Multi-Step

You may want to have different steps in your stream where each step has different settings, e.g. models, tools, or system prompts.

With `createDataStreamResponse` and `sendFinish` / `sendStart` options when merging into the data stream, you can control when the finish and start events are sent to the client, allowing you to have different steps in a single assistant UI message.

## Server

\`\`\`typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { createDataStreamResponse, streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: async dataStream => {
      // step 1 example: forced tool call
      const result1 = await streamText({
        model: openai('gpt-4o-mini', { structuredOutputs: true }),
        system: 'Extract the user goal from the conversation.',
        messages,
        tools: [
          tool({
            name: 'extractGoal',
            description: 'Extract the user goal from the conversation',
            parameters: z.object({
              goal: z.string().describe('The user goal'),
            }),
          }),
        ],
        forceToolCall: 'extractGoal',
      });

      await dataStream.append(result1);
      await dataStream.sendFinish();

      // step 2 example: different model and system prompt
      const result2 = await streamText({
        model: openai('gpt-4o'),
        system: 'You are a helpful assistant. Use the extracted goal to provide a helpful response.',
        messages: [
          ...messages,
          {
            role: 'assistant',
            content: 'I understand your goal. Let me help you with that.',
          },
        ],
      });

      await dataStream.sendStart();
      await dataStream.append(result2);
    },
  });
}
\`\`\`

## Client

Now, let's create a React component that will display the chat interface:

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

This implementation allows for multi-step processing in a single assistant response, enabling more complex interactions while maintaining a seamless user experience.
# Markdown Chatbot with Memoization

When building a chatbot with Next.js and the AI SDK, you'll likely want to render the model's responses in Markdown format using a library like `react-markdown`. However, this can have negative performance implications as the Markdown is re-rendered on each new token received from the streaming response.

As conversations get longer and more complex, this performance impact becomes exponentially worse since the entire conversation history is re-rendered with each new token.

This recipe uses memoization - a performance optimization technique where the results of expensive function calls are cached and reused to avoid unnecessary re-computation. In this case, parsed Markdown blocks are memoized to prevent them from being re-parsed and re-rendered on each token update, which means that once a block is fully parsed, it's cached and reused rather than being regenerated. This approach significantly improves rendering performance for long conversations by eliminating redundant parsing and rendering operations.

## Server

\`\`\`typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const textStream = await streamText({
    model: openai('gpt-4'),
    messages,
    temperature: 0.7,
  });
  
  return new Response(textStream);
}
\`\`\`

## Memoized Markdown Component

Create a memoized Markdown component that efficiently renders Markdown content:

\`\`\`tsx
// components/MemoizedMarkdown.tsx
'use client';

import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// This component will only re-render if the content prop changes
const MemoizedMarkdown = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  // Custom comparison function to determine if re-render is needed
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

MemoizedMarkdown.displayName = 'MemoizedMarkdown';

export default MemoizedMarkdown;
\`\`\`

## Client

Now, let's create a chat interface that uses the memoized Markdown component:

\`\`\`tsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import MemoizedMarkdown from '../components/MemoizedMarkdown';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Markdown Chat with Memoization</h1>
      
      <div className="flex-1 overflow-y-auto mb-4 border border-gray-300 rounded-md p-4 max-h-[70vh]">
        {messages.map((message, i) => (
          <div 
            key={i} 
            className={`mb-4 p-3 rounded-lg ${
              message.role === 'user' ? 'bg-blue-100 ml-auto max-w-md' : 'bg-gray-100 mr-auto max-w-md'
            }`}
          >
            <div className="font-bold mb-1">
              {message.role === 'user' ? 'You' : 'AI'}
            </div>
            <div className="prose prose-sm max-w-none">
              <MemoizedMarkdown content={message.content} />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
\`\`\`

This implementation significantly improves performance when rendering Markdown in streaming chat responses, especially for longer conversations, by avoiding redundant parsing and rendering operations.
# Generate Object

Earlier functions like `generateText` and `streamText` gave us the ability to generate unstructured text. However, if you want to generate structured data like JSON, you can provide a schema that describes the structure of your desired object to the `generateObject` function.

The function requires you to provide a schema using [zod](https://zod.dev/), a library for defining schemas for JavaScript objects. By using zod, you can also use it to validate the generated object and ensure that it conforms to the specified structure.

## Client

Let's create a simple React component that will make a POST request to the `/api/completion` endpoint when a button is clicked. The endpoint will return the generated object based on the input prompt and we'll display it.

\`\`\`jsx
// app/page.tsx
'use client';

import { useState } from 'react';

export default function Page() {
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate Notification</h1>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        disabled={isLoading}
        onClick={async () => {
          setIsLoading(true);
          await fetch('/api/completion', {
            method: 'POST',
            body: JSON.stringify({
              prompt: 'Generate a notification about a new feature release',
            }),
          }).then(response => {
            response.json().then(json => {
              setNotification(json);
              setIsLoading(false);
            });
          });
        }}
      >
        {isLoading ? 'Generating...' : 'Generate Notification'}
      </button>
      
      {notification && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold">{notification.title}</h2>
          <p className="text-gray-700 mt-2">{notification.message}</p>
          <div className="mt-2 flex justify-between">
            <span className="text-sm text-gray-500">Priority: {notification.priority}</span>
            <span className="text-sm text-gray-500">Type: {notification.type}</span>
          </div>
          <div className="mt-4 flex gap-2">
            {notification.actions.map((action, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded text-sm ${
                  action.primary ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/completion` that will generate an object based on the input prompt. The route will call the `generateObject` function from the `ai` module, which will then generate an object based on the input prompt and return it.

\`\`\`typescript
// app/api/completion/route.ts
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  // Define the schema for the notification object
  const notificationSchema = z.object({
    title: z.string().describe('The title of the notification'),
    message: z.string().describe('The message body of the notification'),
    priority: z.enum(['low', 'medium', 'high']).describe('The priority level of the notification'),
    type: z.enum(['info', 'warning', 'error', 'success']).describe('The type of notification'),
    actions: z.array(
      z.object({
        label: z.string().describe('The label for the action button'),
        primary: z.boolean().describe('Whether this is the primary action'),
      })
    ).describe('The action buttons for the notification'),
  });
  
  const notification = await generateObject({
    model: openai('gpt-4-turbo', { structuredOutputs: true }),
    schema: notificationSchema,
    prompt,
    system: 'You are a helpful assistant that generates notification objects.',
  });
  
  return Response.json(notification);
}
\`\`\`

This implementation allows you to generate structured data objects that conform to a specified schema, making it easier to work with AI-generated content in a type-safe manner.
# Generate Object with File Prompt through Form Submission

This feature is limited to model providers that support PDF inputs (Anthropic, Google Gemini, and Google Vertex).

With select models, you can send PDFs (files) as part of your prompt. Let's create a simple Next.js application that allows a user to upload a PDF send it to an LLM for summarization.

## Client

On the frontend, create a form that allows the user to upload a PDF. When the form is submitted, send the PDF to the `/api/analyze` route.

\`\`\`jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze PDF');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF Analyzer</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block mb-2">Upload PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 w-full"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">What would you like to know about this document?</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full h-24"
            placeholder="E.g., Summarize the main points, Extract key information, etc."
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !file}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {isLoading ? 'Analyzing...' : 'Analyze PDF'}
        </button>
      </form>
      
      {result && (
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Analysis Results</h2>
          <div className="mb-4">
            <h3 className="font-medium">Summary</h3>
            <p>{result.summary}</p>
          </div>
          <div className="mb-4">
            <h3 className="font-medium">Key Points</h3>
            <ul className="list-disc pl-5">
              {result.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Document Type</h3>
            <p>{result.documentType}</p>
          </div>
        </div>
      )}
    </div>
  );
}
\`\`\`

## Server

Create a route handler that processes the uploaded PDF and uses the `generateObject` function to analyze it:

\`\`\`typescript
// app/api/analyze/route.ts
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;
    
    if (!file || !description) {
      return Response.json(
        { error: 'File and description are required' },
        { status: 400 }
      );
    }
    
    // Convert file to base64
    const fileBuffer = await file.arrayBuffer();
    const fileBase64 = Buffer.from(fileBuffer).toString('base64');
    
    // Define the schema for the analysis result
    const analysisSchema = z.object({
      summary: z.string().describe('A concise summary of the document'),
      keyPoints: z.array(z.string()).describe('List of key points from the document'),
      documentType: z.string().describe('The type of document (e.g., research paper, report, manual)'),
    });
    
    // Generate the analysis
    const analysis = await generateObject({
      model: anthropic('claude-3-sonnet-20240229'),
      schema: analysisSchema,
      prompt: [
        {
          type: 'text',
          text: `${description}. Please analyze the attached PDF document.`,
        },
        {
          type: 'file',
          file_data: {
            type: 'pdf',
            data: fileBase64,
          },
        },
      ],
      system: 'You are an expert document analyzer. Provide detailed and accurate analysis of PDF documents.',
    });
    
    return Response.json(analysis);
  } catch (error) {
    console.error('Error processing PDF:', error);
    return Response.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}
\`\`\`

This implementation allows users to upload PDF files and receive structured analysis results based on their specific queries about the document content.
# Stream Object

Object generation can sometimes take a long time to complete, especially when you're generating a large schema. In such cases, it is useful to stream the object generation process to the client in real-time. This allows the client to display the generated object as it is being generated, rather than have users wait for it to complete before displaying the result.

## Object Mode

The `streamObject` function allows you to specify different output strategies using the `output` parameter. By default, the output mode is set to `object`, which will generate exactly the structured object that you specify in the schema option.

## Schema

It is helpful to set up the schema in a separate file that is imported on both the client and server.

\`\`\`typescript
// lib/schema.ts
import { z } from 'zod';

export const notificationSchema = z.object({
  title: z.string().describe('The title of the notification'),
  message: z.string().describe('The message body of the notification'),
  priority: z.enum(['low', 'medium', 'high']).describe('The priority level of the notification'),
  type: z.enum(['info', 'warning', 'error', 'success']).describe('The type of notification'),
  actions: z.array(
    z.object({
      label: z.string().describe('The label for the action button'),
      primary: z.boolean().describe('Whether this is the primary action'),
    })
  ).describe('The action buttons for the notification'),
});

export type Notification = z.infer<typeof notificationSchema>;
\`\`\`

## Client

Let's create a React component that will display the notification as it's being generated:

\`\`\`jsx
// app/page.tsx
'use client';

import { useState } from 'react';
import { useStreamObject } from 'ai/react';
import { Notification } from '@/lib/schema';

export default function Page() {
  const [prompt, setPrompt] = useState('Generate a notification about a new feature release');
  
  const { object, isLoading, error, stop } = useStreamObject<Notification>({
    api: '/api/stream-object',
    initialObject: {
      title: '',
      message: '',
      priority: 'medium',
      type: 'info',
      actions: [],
    },
    body: {
      prompt,
    },
  });

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Stream Notification Object</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter prompt..."
        />
      </div>
      
      <button
        onClick={() => useStreamObject.reload()}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 mr-2"
      >
        {isLoading ? 'Generating...' : 'Generate Notification'}
      </button>
      
      {isLoading && (
        <button
          onClick={stop}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stop
        </button>
      )}
      
      {error && (
        <div className="mt-4 p-2 text-red-500 border border-red-300 rounded bg-red-50">
          {error.message}
        </div>
      )}
      
      {object && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold">{object.title}</h2>
          <p className="text-gray-700 mt-2">{object.message}</p>
          <div className="mt-2 flex justify-between">
            <span className="text-sm text-gray-500">Priority: {object.priority}</span>
            <span className="text-sm text-gray-500">Type: {object.type}</span>
          </div>
          <div className="mt-4 flex gap-2">
            {object.actions.map((action, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded text-sm ${
                  action.primary ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
\`\`\`

## Server

Now, let's create a route handler for `/api/stream-object` that will stream the object generation process:

\`\`\`typescript
// app/api/stream-object/route.ts
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { notificationSchema } from '@/lib/schema';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const objectStream = await streamObject({
    model: openai('gpt-4-turbo', { structuredOutputs: true }),
    schema: notificationSchema,
    prompt,
    system: 'You are a helpful assistant that generates notification objects.',
  });
  
  return new Response(objectStream);
}
\`\`\`

## Loading State and Stopping the Stream

The `useStreamObject` hook provides an `isLoading` state and a `stop` function that allows you to control the streaming process. You can use these to show a loading indicator and provide a way for users to cancel the generation if it's taking too long.

## Array Mode

The `streamObject` function also supports an `array` output mode, which is useful when you want to generate a list of items that grows over time.

## Schema

\`\`\`typescript
// lib/schema.ts
import { z } from 'zod';

export const todoItemSchema = z.object({
  id: z.string().describe('A unique identifier for the todo item'),
  title: z.string().describe('The title of the todo item'),
  completed: z.boolean().describe('Whether the todo item is completed'),
  priority: z.enum(['low', 'medium', 'high']).describe('The priority of the todo item'),
});

export type TodoItem = z.infer<typeof todoItemSchema>;

export const todoListSchema = z.array(todoItemSchema);
\`\`\`

## Client

\`\`\`jsx
// app/page.tsx
'use client';

import { useState } from 'react';
import { useStreamObject } from 'ai/react';
import { TodoItem } from '@/lib/schema';

export default function Page() {
  const [prompt, setPrompt] = useState('Generate a list of todo items for a software developer');
  
  const { object: todoItems, isLoading, error, stop } = useStreamObject<TodoItem[]>({
    api: '/api/stream-array',
    initialObject: [],
    body: {
      prompt,
    },
  });

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Stream Todo List</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter prompt..."
        />
      </div>
      
      <button
        onClick={() => useStreamObject.reload()}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 mr-2"
      >
        {isLoading ? 'Generating...' : 'Generate Todo List'}
      </button>
      
      {isLoading && (
        <button
          onClick={stop}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stop
        </button>
      )}
      
      {error && (
        <div className="mt-4 p-2 text-red-500 border border-red-300 rounded bg-red-50">
          {error.message}
        </div>
      )}
      
      {todoItems && todoItems.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Todo Items ({todoItems.length})</h2>
          <ul className="border rounded divide-y">
            {todoItems.map((item) => (
              <li key={item.id} className="p-3 flex items-center justify-between">
                <div>
                  <span className={item.completed ? 'line-through text-gray-500' : ''}>
                    {item.title}
                  </span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    item.priority === 'high' ? 'bg-red-100 text-red-800' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={item.completed}
                  readOnly
                  className="h-5 w-5"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
\`\`\`

## Server

\`\`\`typescript
// app/api/stream-array/route.ts
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { todoListSchema } from '@/lib/schema';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const objectStream = await streamObject({
    model: openai('gpt-4-turbo', { structuredOutputs: true }),
    schema: todoListSchema,
    prompt,
    system: 'You are a helpful assistant that generates todo lists.',
    output: 'array',
  });
  
  return new Response(objectStream);
}
\`\`\`

## No Schema Mode

You can also use `streamObject` without a schema, which will stream the raw JSON output from the model.

## Client

\`\`\`jsx
// app/page.tsx
'use client';

import { useState } from 'react';
import { useStreamObject } from 'ai/react';

export default function Page() {
  const [prompt, setPrompt] = useState('Generate a JSON object with information about a random country');
  
  const { object, isLoading, error, stop } = useStreamObject({
    api: '/api/stream-raw',
    body: {
      prompt,
    },
  });

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Stream Raw JSON</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter prompt..."
        />
      </div>
      
      <button
        onClick={() => useStreamObject.reload()}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 mr-2"
      >
        {isLoading ? 'Generating...' : 'Generate JSON'}
      </button>
      
      {isLoading && (
        <button
          onClick={stop}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stop
        </button>
      )}
      
      {error && (
        <div className="mt-4 p-2 text-red-500 border border-red-300 rounded bg-red-50">
          {error.message}
        </div>
      )}
      
      {object && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Generated JSON</h2>
          <pre className="p-4 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(object, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
\`\`\`

## Server

\`\`\`typescript
// app/api/stream-raw/route.ts
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const objectStream = await streamObject({
    model: openai('gpt-4-turbo', { structuredOutputs: true }),
    prompt,
    system: 'You are a helpful assistant that generates JSON data.',
  });
  
  return new Response(objectStream);
}
\`\`\`
# Call Tools

Some models allow developers to provide a list of tools that can be called at any time during a generation. This is useful for extending the capabilities of a language model to either use logic or data to interact with systems external to the model.

## Client

Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client. If the assistant responds with a tool call, the hook will automatically display them as well.

\`\`\`jsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
          
          {m.role === 'assistant' && m.toolCalls && m.toolCalls.length > 0 && (
            <div className="ml-4 mt-2 border-l-2 border-gray-300 pl-2">
              {m.toolCalls.map((toolCall, i) => (
                <div key={i} className="mb-2">
                  <strong>Tool Call: {toolCall.name}</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(toolCall.arguments, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
          
          {m.role === 'assistant' && m.toolResults && m.toolResults.length > 0 && (
            <div className="ml-4 mt-2 border-l-2 border-green-300 pl-2">
              {m.toolResults.map((toolResult, i) => (
                <div key={i} className="mb-2">
                  <strong>Tool Result: {toolResult.toolName}</strong>
                  <pre className="bg-green-50 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(toolResult.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/chat` that will generate the assistant's response based on the conversation history and stream it to the client. We'll define two tools: one for getting the weather and another for searching the web.

\`\`\`typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Define a tool for getting the weather
  const getWeather = tool({
    name: 'getWeather',
    description: 'Get the current weather in a given location',
    parameters: z.object({
      location: z.string().describe('The city and state, e.g. San Francisco, CA'),
    }),
    execute: async ({ location }) => {
      // In a real application, you would call a weather API here
      return {
        temperature: 72,
        unit: 'fahrenheit',
        description: 'Sunny',
        location,
      };
    },
  });
  
  // Define a tool for searching the web
  const searchWeb = tool({
    name: 'searchWeb',
    description: 'Search the web for information',
    parameters: z.object({
      query: z.string().describe('The search query'),
    }),
    execute: async ({ query }) => {
      // In a real application, you would call a search API here
      return {
        results: [
          {
            title: 'Example search result 1',
            url: 'https://example.com/1',
            snippet: 'This is an example search result.',
          },
          {
            title: 'Example search result 2',
            url: 'https://example.com/2',
            snippet: 'This is another example search result.',
          },
        ],
        query,
      };
    },
  });
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: [getWeather, searchWeb],
  });
  
  return new Response(textStream);
}
\`\`\`

This implementation allows the AI to call tools when needed to provide more accurate and up-to-date information to the user. The tools are defined on the server side and can execute any logic or API calls needed to fulfill the user's request.
# Call Tools in Parallel

Some language models support calling tools in parallel. This is particularly useful when multiple tools are independent of each other and can be executed in parallel during the same generation step.

## Client

Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client. If the assistant responds with tool calls, the hook will automatically display them as well.

\`\`\`jsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
          
          {m.role === 'assistant' && m.toolCalls && m.toolCalls.length > 0 && (
            <div className="ml-4 mt-2 border-l-2 border-gray-300 pl-2">
              <strong>Tool Calls:</strong>
              {m.toolCalls.map((toolCall, i) => (
                <div key={i} className="mb-2 mt-1">
                  <div className="font-medium">{toolCall.name}</div>
                  <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto text-sm">
                    {JSON.stringify(toolCall.arguments, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
          
          {m.role === 'assistant' && m.toolResults && m.toolResults.length > 0 && (
            <div className="ml-4 mt-2 border-l-2 border-green-300 pl-2">
              <strong>Tool Results:</strong>
              {m.toolResults.map((toolResult, i) => (
                <div key={i} className="mb-2 mt-1">
                  <div className="font-medium">{toolResult.toolName}</div>
                  <pre className="bg-green-50 p-2 rounded mt-1 overflow-auto text-sm">
                    {JSON.stringify(toolResult.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/chat` that will generate the assistant's response based on the conversation history and stream it to the client. We'll define multiple tools that can be called in parallel.

\`\`\`typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Define a tool for getting the weather
  const getWeather = tool({
    name: 'getWeather',
    description: 'Get the current weather in a given location',
    parameters: z.object({
      location: z.string().describe('The city and state, e.g. San Francisco, CA'),
    }),
    execute: async ({ location }) => {
      // In a real application, you would call a weather API here
      return {
        temperature: 72,
        unit: 'fahrenheit',
        description: 'Sunny',
        location,
      };
    },
  });
  
  // Define a tool for getting the time
  const getTime = tool({
    name: 'getTime',
    description: 'Get the current time in a given timezone',
    parameters: z.object({
      timezone: z.string().describe('The timezone, e.g. America/New_York'),
    }),
    execute: async ({ timezone }) => {
      // In a real application, you would get the actual time for the timezone
      return {
        time: new Date().toLocaleTimeString('en-US', { timeZone: timezone }),
        timezone,
      };
    },
  });
  
  // Define a tool for currency conversion
  const convertCurrency = tool({
    name: 'convertCurrency',
    description: 'Convert an amount from one currency to another',
    parameters: z.object({
      amount: z.number().describe('The amount to convert'),
      from: z.string().describe('The currency to convert from, e.g. USD'),
      to: z.string().describe('The currency to convert to, e.g. EUR'),
    }),
    execute: async ({ amount, from, to }) => {
      // In a real application, you would call a currency conversion API here
      const rates = {
        USD: { EUR: 0.92, GBP: 0.79, JPY: 153.45 },
        EUR: { USD: 1.09, GBP: 0.86, JPY: 167.23 },
        GBP: { USD: 1.27, EUR: 1.16, JPY: 194.24 },
        JPY: { USD: 0.0065, EUR: 0.006, GBP: 0.0051 },
      };
      
      const rate = rates[from]?.[to] || 1;
      const convertedAmount = amount * rate;
      
      return {
        originalAmount: amount,
        originalCurrency: from,
        convertedAmount,
        convertedCurrency: to,
        rate,
      };
    },
  });
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: [getWeather, getTime, convertCurrency],
    maxSteps: 3, // Allow up to 3 parallel tool calls
  });
  
  return new Response(textStream);
}
\`\`\`

You will use the `maxSteps` to specify the maximum number of steps that the model can take when generating a response. This allows the model to make multiple tool calls in parallel during a single step, which can significantly improve response time when dealing with independent operations.

This implementation allows the AI to call multiple tools in parallel when needed, making the response generation more efficient when multiple pieces of information are required simultaneously.
# Call Tools in Multiple Steps

Some language models are great at calling tools in multiple steps to achieve a more complex task. This is particularly useful when the tools are dependent on each other and need to be executed in sequence during the same generation step.

## Client

Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client. If the assistant responds with a tool call, the hook will automatically display them as well.

To call tools in multiple steps, you can use the `maxSteps` option to specify the maximum number of steps that can be made before the model or the user responds with a text message. In this example, you will set it to `5` to allow for multiple tool calls.

\`\`\`jsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
          
          {m.role === 'assistant' && m.toolCalls && m.toolCalls.length > 0 && (
            <div className="ml-4 mt-2 border-l-2 border-gray-300 pl-2">
              <strong>Tool Calls:</strong>
              {m.toolCalls.map((toolCall, i) => (
                <div key={i} className="mb-2 mt-1">
                  <div className="font-medium">{toolCall.name}</div>
                  <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto text-sm">
                    {JSON.stringify(toolCall.arguments, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
          
          {m.role === 'assistant' && m.toolResults && m.toolResults.length > 0 && (
            <div className="ml-4 mt-2 border-l-2 border-green-300 pl-2">
              <strong>Tool Results:</strong>
              {m.toolResults.map((toolResult, i) => (
                <div key={i} className="mb-2 mt-1">
                  <div className="font-medium">{toolResult.toolName}</div>
                  <pre className="bg-green-50 p-2 rounded mt-1 overflow-auto text-sm">
                    {JSON.stringify(toolResult.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/chat` that will generate the assistant's response based on the conversation history and stream it to the client. We'll define multiple tools that can be called in sequence to solve a complex task.

\`\`\`typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Define a tool for searching for flights
  const searchFlights = tool({
    name: 'searchFlights',
    description: 'Search for available flights between two locations on a specific date',
    parameters: z.object({
      origin: z.string().describe('The origin airport code, e.g. LAX'),
      destination: z.string().describe('The destination airport code, e.g. JFK'),
      date: z.string().describe('The date of travel in YYYY-MM-DD format'),
    }),
    execute: async ({ origin, destination, date }) => {
      // In a real application, you would call a flight search API here
      return {
        flights: [
          {
            id: 'FL123',
            airline: 'Example Airlines',
            origin,
            destination,
            departureTime: `${date}T08:00:00`,
            arrivalTime: `${date}T11:30:00`,
            price: 299.99,
            currency: 'USD',
          },
          {
            id: 'FL456',
            airline: 'Sample Airways',
            origin,
            destination,
            departureTime: `${date}T14:15:00`,
            arrivalTime: `${date}T17:45:00`,
            price: 349.99,
            currency: 'USD',
          },
        ],
      };
    },
  });
  
  // Define a tool for getting flight details
  const getFlightDetails = tool({
    name: 'getFlightDetails',
    description: 'Get detailed information about a specific flight',
    parameters: z.object({
      flightId: z.string().describe('The ID of the flight'),
    }),
    execute: async ({ flightId }) => {
      // In a real application, you would call a flight details API here
      return {
        id: flightId,
        aircraft: 'Boeing 737-800',
        seatsAvailable: 42,
        amenities: ['Wi-Fi', 'Power outlets', 'In-flight entertainment'],
        baggageAllowance: {
          carryOn: '1 bag, up to 10kg',
          checked: '1 bag, up to 23kg',
        },
      };
    },
  });
  
  // Define a tool for booking a flight
  const bookFlight = tool({
    name: 'bookFlight',
    description: 'Book a flight for a passenger',
    parameters: z.object({
      flightId: z.string().describe('The ID of the flight to book'),
      passengerName: z.string().describe('The full name of the passenger'),
      passengerEmail: z.string().describe('The email address of the passenger'),
    }),
    execute: async ({ flightId, passengerName, passengerEmail }) => {
      // In a real application, you would call a booking API here
      return {
        bookingId: `BK-${Math.floor(Math.random() * 10000)}`,
        flightId,
        passengerName,
        passengerEmail,
        status: 'confirmed',
        bookingDate: new Date().toISOString(),
      };
    },
  });
  
  // Define a tool for sending a confirmation email
  const sendConfirmationEmail = tool({
    name: 'sendConfirmationEmail',
    description: 'Send a confirmation email for a booking',
    parameters: z.object({
      bookingId: z.string().describe('The ID of the booking'),
      recipientEmail: z.string().describe('The email address to send the confirmation to'),
    }),
    execute: async ({ bookingId, recipientEmail }) => {
      // In a real application, you would call an email API here
      return {
        emailId: `EM-${Math.floor(Math.random() * 10000)}`,
        recipientEmail,
        subject: 'Flight Booking Confirmation',
        sentAt: new Date().toISOString(),
        status: 'sent',
      };
    },
  });
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: [searchFlights, getFlightDetails, bookFlight, sendConfirmationEmail],
    maxSteps: 5, // Allow up to 5 sequential tool calls
  });
  
  return new Response(textStream);
}
\`\`\`

This implementation allows the AI to call tools in a sequence to complete a complex task, such as searching for flights, getting details about a specific flight, booking the flight, and sending a confirmation email. The `maxSteps` parameter ensures that the model can make multiple tool calls in sequence before generating a final text response to the user.
# Model Context Protocol (MCP) Tools

The AI SDK supports Model Context Protocol (MCP) tools by offering a lightweight client that exposes a `tools` method for retrieving tools from a MCP server. After use, the client should always be closed to release resources.

## Server

Let's create a route handler for `/api/completion` that will generate text based on the input prompt and MCP tools that can be called at any time during a generation. The route will call the `streamText` function from the `ai` module, which will then generate text based on the input prompt and stream it to the client.

To use the `StreamableHTTPClientTransport`, you will need to install the official Typescript SDK for Model Context Protocol:

\`\`\`bash
$ pnpm install @modelcontextprotocol/sdk
\`\`\`

\`\`\`typescript
// app/api/completion/route.ts
import { experimental_createMCPClient, streamText } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  // Create an MCP client
  const client = experimental_createMCPClient({
    transport: new Experimental_StdioMCPTransport({
      pythonCommand: 'python',
      scriptPath: './mcp_server.py',
    }),
  });
  
  try {
    // Get the tools from the MCP server
    const tools = await client.tools();
    
    // Generate text with the tools
    const textStream = await streamText({
      model: {
        provider: 'anthropic',
        model: 'claude-3-opus-20240229',
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
      prompt,
      system: 'You are a helpful assistant with access to tools.',
      tools,
    });
    
    return new Response(textStream);
  } finally {
    // Always close the client to release resources
    await client.close();
  }
}
\`\`\`

You'll also need to create a Python script that implements the MCP server:

\`\`\`python
# mcp_server.py
import json
import sys
import time
from typing import Dict, List, Optional, Union

def read_message():
    """Read a message from stdin."""
    line = sys.stdin.readline()
    return json.loads(line)

def write_message(message):
    """Write a message to stdout."""
    sys.stdout.write(json.dumps(message) + "\n")
    sys.stdout.flush()

def get_weather(location: str) -> Dict:
    """Get the weather for a location."""
    # In a real application, you would call a weather API here
    return {
        "temperature": 72,
        "unit": "fahrenheit",
        "description": "Sunny",
        "location": location,
    }

def search_web(query: str) -> Dict:
    """Search the web for information."""
    # In a real application, you would call a search API here
    return {
        "results": [
            {
                "title": "Example search result 1",
                "url": "https://example.com/1",
                "snippet": "This is an example search result.",
            },
            {
                "title": "Example search result 2",
                "url": "https://example.com/2",
                "snippet": "This is another example search result.",
            },
        ],
        "query": query,
    }

# Define the tools
tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state, e.g. San Francisco, CA",
                },
            },
            "required": ["location"],
        },
    },
    {
        "name": "search_web",
        "description": "Search the web for information",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query",
                },
            },
            "required": ["query"],
        },
    },
]

# Main loop
while True:
    message = read_message()
    
    if message["type"] == "tools":
        write_message({
            "type": "tools",
            "tools": tools,
        })
    elif message["type"] == "execute":
        tool_name = message["name"]
        arguments = message["arguments"]
        
        if tool_name == "get_weather":
            result = get_weather(arguments["location"])
        elif tool_name == "search_web":
            result = search_web(arguments["query"])
        else:
            result = {"error": f"Unknown tool: {tool_name}"}
        
        write_message({
            "type": "result",
            "result": result,
        })
    elif message["type"] == "close":
        break
\`\`\`

## Client

On the client side, you can create a simple React component that will make a POST request to the `/api/completion` endpoint when a button is clicked. The endpoint will generate text based on the input prompt and any tool calls that the model makes.

\`\`\`jsx
'use client';

import { useState } from 'react';

export default function Page() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate response');
      }
      
      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const text = decoder.decode(value);
        result += text;
        setResponse(result);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred while generating the response.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MCP Tools Demo</h1>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <label htmlFor="prompt" className="block mb-1">
            Enter your prompt:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Try asking about the weather in a specific location or to search for information..."
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Generating...' : 'Generate Response'}
        </button>
      </form>
      
      {response && (
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Response:</h2>
          <div className="whitespace-pre-wrap">{response}</div>
        </div>
      )}
    </div>
  );
}
\`\`\`

This implementation allows you to use tools defined in a separate MCP server with your AI models, providing a flexible way to extend the capabilities of your AI applications.
# Human-in-the-Loop with Next.js

When building agentic systems, it's important to add human-in-the-loop (HITL) functionality to ensure that users can approve actions before the system executes them. This recipe will describe how to build a low-level solution and then provide an example abstraction you could implement and customize based on your needs.

## Background

To understand how to implement this functionality, let's look at how tool calling works in a simple Next.js chatbot application with the AI SDK.

On the frontend, use the `useChat` hook to manage the message state and user interaction (including input and form submission handlers).

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8">
        <input
          className="w-full p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

On the backend, use the `streamText` function with tools to enable the model to call functions:

\`\`\`typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Define a tool for sending an email
  const sendEmail = tool({
    name: 'sendEmail',
    description: 'Send an email to a recipient',
    parameters: z.object({
      to: z.string().describe('The email address of the recipient'),
      subject: z.string().describe('The subject of the email'),
      body: z.string().describe('The body content of the email'),
    }),
    execute: async ({ to, subject, body }) => {
      // In a real application, you would call an email API here
      console.log(`Sending email to ${to} with subject "${subject}"`);
      
      // Simulate sending an email
      return {
        success: true,
        messageId: `email-${Date.now()}`,
        to,
        subject,
      };
    },
  });
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: [sendEmail],
  });
  
  return new Response(textStream);
}
\`\`\`

## Adding a Confirmation Step

To add human-in-the-loop functionality, we need to modify this flow to require user confirmation before executing tool calls. Here's how to implement this:

## Forward Tool Call To The Client

First, we need to modify the route handler to forward tool calls to the client instead of executing them immediately:

\`\`\`typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Define a tool for sending an email
  const sendEmail = tool({
    name: 'sendEmail',
    description: 'Send an email to a recipient',
    parameters: z.object({
      to: z.string().describe('The email address of the recipient'),
      subject: z.string().describe('The subject of the email'),
      body: z.string().describe('The body content of the email'),
    }),
    execute: async ({ to, subject, body }) => {
      // Instead of executing immediately, return a special response
      // that indicates this tool call needs confirmation
      return {
        __needsConfirmation: true,
        to,
        subject,
        body,
      };
    },
  });
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: [sendEmail],
  });
  
  return new Response(textStream);
}
\`\`\`

## Intercept Tool Call

Next, we need to modify the client to intercept tool calls that need confirmation:

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [pendingToolCall, setPendingToolCall] = useState(null);
  
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    onToolCall: async (toolCall) => {
      // Check if this tool call needs confirmation
      if (toolCall.result && toolCall.result.__needsConfirmation) {
        // Store the pending tool call
        setPendingToolCall(toolCall);
        
        // Return false to prevent automatic execution
        return false;
      }
      
      // For other tool calls, allow automatic execution
      return true;
    },
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
        </div>
      ))}
      
      {pendingToolCall && (
        <div className="border border-yellow-300 bg-yellow-50 p-4 rounded mb-4">
          <h3 className="font-bold">Confirm Action</h3>
          <p>The AI wants to send an email:</p>
          <ul className="list-disc pl-5 my-2">
            <li>To: {pendingToolCall.result.to}</li>
            <li>Subject: {pendingToolCall.result.subject}</li>
            <li>Body: {pendingToolCall.result.body}</li>
          </ul>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleConfirmation(true)}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Approve
            </button>
            <button
              onClick={() => handleConfirmation(false)}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8">
        <input
          className="w-full p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
          disabled={!!pendingToolCall}
        />
      </form>
    </div>
  );
}
\`\`\`

## Handle Confirmation Response

Finally, we need to handle the user's confirmation response:

\`\`\`jsx
// Add this function to the Chat component
const handleConfirmation = async (approved) => {
  if (!pendingToolCall) return;
  
  if (approved) {
    // Execute the tool call
    const response = await fetch('/api/execute-tool', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolName: pendingToolCall.name,
        arguments: pendingToolCall.result,
      }),
    });
    
    const result = await response.json();
    
    // Update the messages with the tool result
    setMessages((messages) => {
      const lastMessage = messages[messages.length - 1];
      
      return [
        ...messages.slice(0, -1),
        {
          ...lastMessage,
          toolResults: [
            ...(lastMessage.toolResults || []),
            {
              toolName: pendingToolCall.name,
              toolCallId: pendingToolCall.id,
              result,
            },
          ],
        },
      ];
    });
  } else {
    // Add a user message indicating rejection
    setMessages((messages) => [
      ...messages,
      {
        id: Date.now().toString(),
        role: 'user',
        content: 'I rejected the action.',
      },
    ]);
  }
  
  // Clear the pending tool call
  setPendingToolCall(null);
}
\`\`\`

And create a new API route to execute the tool:

\`\`\`typescript
// app/api/execute-tool/route.ts
import { z } from 'zod';

export async function POST(req: Request) {
  const { toolName, arguments: args } = await req.json();
  
  if (toolName === 'sendEmail') {
    // Remove the confirmation flag
    const { __needsConfirmation, ...emailArgs } = args;
    
    // In a real application, you would call an email API here
    console.log(`Sending email to ${emailArgs.to} with subject "${emailArgs.subject}"`);
    
    // Return the result
    return Response.json({
      success: true,
      messageId: `email-${Date.now()}`,
      to: emailArgs.to,
      subject: emailArgs.subject,
    });
  }
  
  return Response.json({
    error: 'Unknown tool',
  }, { status: 400 });
}
\`\`\`

## Building your own abstraction

The above implementation is quite low-level. Let's create a more reusable abstraction for human-in-the-loop functionality.

## Create Utility Functions

First, let's create some utility functions:

\`\`\`typescript
// lib/hitl.ts
import { z } from 'zod';
import { Tool } from 'ai';

// Type for tool definitions that require confirmation
export type ConfirmableTool<T extends z.ZodType> = {
  name: string;
  description: string;
  parameters: T;
  execute: (args: z.infer<T>) => Promise<any>;
  confirmationMessage?: (args: z.infer<T>) => string;
  requireConfirmation: boolean;
};

// Create a tool with confirmation capability
export function createConfirmableTool<T extends z.ZodType>({
  name,
  description,
  parameters,
  execute,
  confirmationMessage,
  requireConfirmation,
}: ConfirmableTool<T>): Tool {
  return {
    name,
    description,
    parameters,
    execute: async (args) => {
      if (requireConfirmation) {
        return {
          __needsConfirmation: true,
          __originalArgs: args,
          __confirmationMessage: confirmationMessage ? confirmationMessage(args) : null,
          ...args,
        };
      }
      
      return execute(args);
    },
  };
}

// Execute a confirmed tool
export async function executeConfirmedTool<T extends z.ZodType>(
  tool: ConfirmableTool<T>,
  args: any
) {
  // Remove the confirmation metadata
  const { __needsConfirmation, __originalArgs, __confirmationMessage, ...cleanArgs } = args;
  
  // Execute the tool with the original arguments
  return tool.execute(__originalArgs || cleanArgs);
}
\`\`\`

## Update Route Handler

Now, let's update our route handlers:

\`\`\`typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { createConfirmableTool } from '@/lib/hitl';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Define a tool for sending an email with confirmation
  const sendEmail = createConfirmableTool({
    name: 'sendEmail',
    description: 'Send an email to a recipient',
    parameters: z.object({
      to: z.string().describe('The email address of the recipient'),
      subject: z.string().describe('The subject of the email'),
      body: z.string().describe('The body content of the email'),
    }),
    execute: async ({ to, subject, body }) => {
      // In a real application, you would call an email API here
      console.log(`Sending email to ${to} with subject "${subject}"`);
      
      return {
        success: true,
        messageId: `email-${Date.now()}`,
        to,
        subject,
      };
    },
    confirmationMessage: ({ to, subject }) => 
      `Do you want to send an email to ${to} with subject "${subject}"?`,
    requireConfirmation: true,
  });
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: [sendEmail],
  });
  
  return new Response(textStream);
}

// app/api/execute-tool/route.ts
import { z } from 'zod';
import { executeConfirmedTool } from '@/lib/hitl';

// Define the tools (should be in a shared location in a real app)
const sendEmail = {
  name: 'sendEmail',
  description: 'Send an email to a recipient',
  parameters: z.object({
    to: z.string().describe('The email address of the recipient'),
    subject: z.string().describe('The subject of the email'),
    body: z.string().describe('The body content of the email'),
  }),
  execute: async ({ to, subject, body }) => {
    // In a real application, you would call an email API here
    console.log(`Sending email to ${to} with subject "${subject}"`);
    
    return {
      success: true,
      messageId: `email-${Date.now()}`,
      to,
      subject,
    };
  },
  requireConfirmation: true,
};

export async function POST(req: Request) {
  const { toolName, arguments: args } = await req.json();
  
  if (toolName === 'sendEmail') {
    const result = await executeConfirmedTool(sendEmail, args);
    return Response.json(result);
  }
  
  return Response.json({
    error: 'Unknown tool',
  }, { status: 400 });
}
\`\`\`

## Update Frontend

Finally, let's create a reusable component for handling confirmations:

\`\`\`jsx
// components/ConfirmationDialog.jsx
export default function ConfirmationDialog({ toolCall, onConfirm, onReject }) {
  if (!toolCall) return null;
  
  const { name, result } = toolCall;
  const confirmationMessage = result.__confirmationMessage || `Confirm ${name} action?`;
  
  return (
    <div className="border border-yellow-300 bg-yellow-50 p-4 rounded mb-4">
      <h3 className="font-bold">Confirm Action</h3>
      <p>{confirmationMessage}</p>
      
      <div className="mt-2 bg-white p-2 rounded border border-gray-200">
        <pre className="text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
      
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onConfirm(toolCall)}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Approve
        </button>
        <button
          onClick={() => onReject(toolCall)}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import ConfirmationDialog from '@/components/ConfirmationDialog';

export default function Chat() {
  const [pendingToolCall, setPendingToolCall] = useState(null);
  
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    onToolCall: async (toolCall) => {
      // Check if this tool call needs confirmation
      if (toolCall.result && toolCall.result.__needsConfirmation) {
        // Store the pending tool call
        setPendingToolCall(toolCall);
        
        // Return false to prevent automatic execution
        return false;
      }
      
      // For other tool calls, allow automatic execution
      return true;
    },
  });

  const handleConfirm = async (toolCall) => {
    // Execute the tool call
    const response = await fetch('/api/execute-tool', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolName: toolCall.name,
        arguments: toolCall.result,
      }),
    });
    
    const result = await response.json();
    
    // Update the messages with the tool result
    setMessages((messages) => {
      const lastMessage = messages[messages.length - 1];
      
      return [
        ...messages.slice(0, -1),
        {
          ...lastMessage,
          toolResults: [
            ...(lastMessage.toolResults || []),
            {
              toolName: toolCall.name,
              toolCallId: toolCall.id,
              result,
            },
          ],
        },
      ];
    });
    
    // Clear the pending tool call
    setPendingToolCall(null);
  };

  const handleReject = () => {
    // Add a user message indicating rejection
    setMessages((messages) => [
      ...messages,
      {
        id: Date.now().toString(),
        role: 'user',
        content: 'I rejected the action.',
      },
    ]);
    
    // Clear the pending tool call
    setPendingToolCall(null);
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
        </div>
      ))}
      
      <ConfirmationDialog
        toolCall={pendingToolCall}
        onConfirm={handleConfirm}
        onReject={handleReject}
      />

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8">
        <input
          className="w-full p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
          disabled={!!pendingToolCall}
        />
      </form>
    </div>
  );
}
\`\`\`

## Full Example

This implementation provides a reusable abstraction for adding human-in-the-loop functionality to your AI applications. You can customize the confirmation UI, add different types of confirmable tools, and implement more complex confirmation flows based on your specific requirements.

The key components of this implementation are:

1. A way to mark tools as requiring confirmation
2. A mechanism to intercept tool calls on the client side
3. A UI for displaying confirmation dialogs
4. A way to execute confirmed tool calls
5. A way to handle rejected tool calls

By following this pattern, you can ensure that your AI applications always get user approval before taking potentially sensitive actions.
# Send Custom Body from useChat

By default, `useChat` sends all messages as well as information from the request to the server. However, it is often desirable to control the body content that is sent to the server, e.g. to:

- only send the last message
- send additional data along with the message
- change the structure of the request body

The `experimental_prepareRequestBody` option allows you to customize the body content that is sent to the server. The function receives the message list, the request data, and the request body from the append call. It should return the body content that will be sent to the server.

> ⚠️ `experimental_prepareRequestBody` is an experimental feature and only available in React, Solid and Vue.

## Example

Let's create a chat interface that allows users to select a language for translation:

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export default function Chat() {
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    experimental_prepareRequestBody: (messages, data) => {
      // Return a custom body structure
      return {
        messages,
        targetLanguage,
        otherData: {
          timestamp: Date.now(),
          clientInfo: navigator.userAgent,
        },
      };
    },
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="mb-4">
        <label className="block mb-2">Translate to:</label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Italian">Italian</option>
          <option value="Japanese">Japanese</option>
        </select>
      </div>
      
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8">
        <input
          className="w-full p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something to translate..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

## Server

On the server side, we can access the custom body structure:

\`\`\`typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  // Parse the request body
  const body = await req.json();
  
  // Extract the custom fields
  const { messages, targetLanguage, otherData } = body;
  
  console.log('Target Language:', targetLanguage);
  console.log('Other Data:', otherData);
  
  // Create a system message that includes the target language
  const systemMessage = `You are a helpful assistant that translates text to ${targetLanguage}. Always respond in ${targetLanguage}, regardless of the input language.`;
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    system: systemMessage,
  });
  
  return new Response(textStream);
}
\`\`\`

This implementation allows you to send additional data along with the chat messages, which can be useful for customizing the behavior of your AI application based on user preferences or other contextual information.
# Render Visual Interface in Chat

An interesting consequence of language models that can call tools is that this ability can be used to render visual interfaces by streaming React components to the client.

## Client

Let's build an assistant that gets the weather for any city by calling the `getWeatherInformation` tool. Instead of returning text during the tool call, you will render a React component that displays the weather information on the client.

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

// Define a weather card component
function WeatherCard({ city, temperature, condition, humidity, windSpeed }) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg max-w-sm mx-auto my-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{city}</h2>
        <div className="text-3xl">
          {condition === 'Sunny' ? '☀️' : 
           condition === 'Cloudy' ? '☁️' : 
           condition === 'Rainy' ? '🌧️' : 
           condition === 'Snowy' ? '❄️' : '🌤️'}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-4xl font-bold">{temperature}°F</p>
        <p className="text-sm opacity-80">{condition}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="opacity-70">Humidity</p>
          <p className="font-semibold">{humidity}%</p>
        </div>
        <div>
          <p className="opacity-70">Wind</p>
          <p className="font-semibold">{windSpeed} mph</p>
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          
          {/* Render the message content */}
          {m.content}
          
          {/* Render any UI components from tool calls */}
          {m.role === 'assistant' && m.toolResults && m.toolResults.map((toolResult, i) => {
            if (toolResult.toolName === 'getWeatherInformation' && toolResult.result) {
              const weather = toolResult.result;
              return (
                <WeatherCard
                  key={i}
                  city={weather.city}
                  temperature={weather.temperature}
                  condition={weather.condition}
                  humidity={weather.humidity}
                  windSpeed={weather.windSpeed}
                />
              );
            }
            return null;
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8">
        <input
          className="w-full p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Ask about the weather in any city..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

## Server

Now, let's create a route handler for `/api/chat` that will handle the weather tool:

\`\`\`typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Define a tool for getting weather information
  const getWeatherInformation = tool({
    name: 'getWeatherInformation',
    description: 'Get current weather information for a city',
    parameters: z.object({
      city: z.string().describe('The name of the city to get weather for'),
    }),
    execute: async ({ city }) => {
      // In a real application, you would call a weather API here
      // This is mock data for demonstration purposes
      const weatherData = {
        city,
        temperature: Math.floor(Math.random() * 30) + 50, // Random temperature between 50-80°F
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 30, // Random humidity between 30-70%
        windSpeed: Math.floor(Math.random() * 15) + 5, // Random wind speed between 5-20 mph
      };
      
      return weatherData;
    },
  });
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: [getWeatherInformation],
    system: `You are a helpful weather assistant. When asked about the weather in a city, use the getWeatherInformation tool to fetch and display weather data.
    
After displaying the weather data, provide a brief natural language summary of the weather conditions.`,
  });
  
  return new Response(textStream);
}
\`\`\`

This implementation allows you to render rich, interactive UI components in response to user queries, creating a more engaging and informative chat experience. The weather card is just one example - you could create various specialized components for different types of information:

1. Charts and graphs for data visualization
2. Interactive maps for location-based queries
3. Product cards for e-commerce applications
4. Reservation forms for booking systems
5. Media players for audio/video content

By combining the power of language models with custom UI components, you can create chat interfaces that go beyond simple text responses and provide truly rich, interactive experiences.
# Stream Assistant Response

## Client

Let's create a simple chat interface that allows users to send messages to the assistant and receive responses. You will integrate the `useAssistant` hook from `@ai-sdk/react` to stream the messages and status.

\`\`\`jsx
// app/page.tsx
'use client';

import { Message, useAssistant } from 'ai/react';

export default function Page() {
  const { status, messages, input, submitMessage, handleInputChange } = useAssistant({ api: '/api/assistant' });

  return (
    <div className="flex flex-col gap-2">
      <div className="p-2">status: {status}</div>
      
      <div className="flex flex-col p-2 gap-2">
        {messages.map((message: Message) => (
          <div key={message.id} className={`flex flex-row gap-2 ${message.role === 'user' ? 'text-zinc-500' : 'w-full text-zinc-800'}`}>
            <div className="w-24">{message.role}</div>
            <div>{message.content}</div>
          </div>
        ))}
      </div>
      
      <form onSubmit={submitMessage} className="flex flex-row gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Say something..."
          className="flex-grow p-2 border border-gray-300 rounded"
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={status !== 'awaiting_message'}
        >
          Send
        </button>
      </form>
    </div>
  );
}
\`\`\`

## Server

Now, let's create a route handler for `/api/assistant` that will process the messages and generate responses using the OpenAI Assistant API:

\`\`\`typescript
// app/api/assistant/route.ts
import { StreamingTextResponse, AssistantResponse } from 'ai';
import { openai } from '@ai-sdk/openai';

// Create a new assistant or use an existing one
const assistant = openai.beta.assistants.retrieve('YOUR_ASSISTANT_ID');

// This is the route handler for the /api/assistant endpoint
export async function POST(req: Request) {
  // Parse the request body
  const { messages } = await req.json();

  // Create a thread if needed
  const threadId = req.headers.get('thread-id');
  const thread = threadId
    ? await openai.beta.threads.retrieve(threadId)
    : await openai.beta.threads.create();

  // Add a message to the thread
  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: messages[messages.length - 1].content,
  });

  // Run the assistant on the thread
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });

  // Create a response with the thread ID
  return AssistantResponse({ threadId: thread.id, runId: run.id }, { headers: { 'Content-Type': 'text/plain' } });
}
\`\`\`

This implementation allows you to create a chat interface that uses the OpenAI Assistant API to generate responses. The `useAssistant` hook handles the streaming of messages and status updates, providing a seamless user experience.

Key features of this implementation:

1. **Real-time streaming**: The assistant's responses are streamed in real-time, providing immediate feedback to the user.
2. **Status tracking**: The hook provides status updates (e.g., "awaiting_message", "in_progress") that can be used to update the UI accordingly.
3. **Thread management**: The implementation maintains conversation threads, allowing for contextual responses based on the conversation history.
4. **Seamless integration**: The `useAssistant` hook integrates smoothly with the OpenAI Assistant API, handling all the complexity of streaming and state management.

This approach is particularly useful when you want to leverage the capabilities of the OpenAI Assistant API, which includes features like retrieval, code interpretation, and function calling, all while providing a responsive and interactive user experience.
# Stream Assistant Response with Tools

Let's create a simple chat interface that allows users to send messages to the assistant and receive responses and give it the ability to use tools. You will integrate the `useAssistant` hook from `@ai-sdk/react` to stream the messages and status.

You will need to provide the list of tools on the OpenAI [Assistant Dashboard](https://platform.openai.com/assistants). You can use the following schema to create a tool to convert celsius to fahrenheit.

\`\`\`json
{
  "name": "celsiusToFahrenheit",
  "description": "convert celsius to fahrenheit.",
  "parameters": {
    "type": "object",
    "properties": {
      "value": {
        "type": "number",
        "description": "the value in celsius."
      }
    },
    "required": ["value"]
  }
}
\`\`\`

## Client

Let's create a chat interface that allows users to interact with an assistant that can convert temperatures:

\`\`\`jsx
// app/page.tsx
'use client';

import { Message, useAssistant } from 'ai/react';
import { useState } from 'react';

export default function Page() {
  const { status, messages, input, submitMessage, handleInputChange } = useAssistant({
    api: '/api/assistant',
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="mb-4 p-2 border rounded bg-gray-100">
        <p className="text-sm">Status: <span className="font-semibold">{status}</span></p>
      </div>
      
      {messages.map((message: Message) => (
        <div key={message.id} className="mb-4">
          <div className="font-semibold">
            {message.role === 'user' ? 'You:' : 'Assistant:'}
          </div>
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          {/* Display tool calls if any */}
          {message.role === 'assistant' && message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-2 border-l-2 border-blue-500 pl-2">
              <div className="text-sm text-gray-500">Tool Calls:</div>
              {message.toolCalls.map((toolCall) => (
                <div key={toolCall.id} className="mt-1 text-sm">
                  <div className="font-semibold">{toolCall.name}</div>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(toolCall.arguments, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
          
          {/* Display tool outputs if any */}
          {message.role === 'assistant' && message.toolResults && message.toolResults.length > 0 && (
            <div className="mt-2 border-l-2 border-green-500 pl-2">
              <div className="text-sm text-gray-500">Tool Results:</div>
              {message.toolResults.map((toolResult) => (
                <div key={toolResult.toolCallId} className="mt-1 text-sm">
                  <div className="font-semibold">{toolResult.toolName}</div>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(toolResult.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <form onSubmit={submitMessage} className="fixed bottom-0 w-full max-w-md mb-8">
        <input
          className="w-full p-2 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Ask about temperature conversion..."
          onChange={handleInputChange}
          disabled={status !== 'awaiting_message'}
        />
      </form>
    </div>
  );
}
\`\`\`

## Server

Now, let's create a route handler for `/api/assistant` that will process the messages and generate responses using the OpenAI Assistant API with tool support:

\`\`\`typescript
// app/api/assistant/route.ts
import { StreamingTextResponse, AssistantResponse } from 'ai';
import { openai } from '@ai-sdk/openai';

// Create a new assistant or use an existing one
// Make sure this assistant has the celsiusToFahrenheit tool configured in the OpenAI dashboard
const assistant = openai.beta.assistants.retrieve('YOUR_ASSISTANT_ID');

// This is the route handler for the /api/assistant endpoint
export async function POST(req: Request) {
  // Parse the request body
  const { messages, threadId: threadIdFromRequest } = await req.json();

  // Create a thread if needed
  const threadId = threadIdFromRequest || (await openai.beta.threads.create()).id;

  // Add a message to the thread
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: messages[messages.length - 1].content,
  });

  // Run the assistant on the thread
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistant.id,
  });

  // Create a response with the thread ID
  return AssistantResponse({ threadId, runId: run.id });
}

// This is the route handler for the /api/assistant/tool-callback endpoint
export async function POST(req: Request) {
  const { threadId, toolCallId, toolOutput } = await req.json();

  // Process the tool call and submit the output
  await openai.beta.threads.runs.submitToolOutputs(
    threadId,
    runId,
    {
      tool_outputs: [
        {
          tool_call_id: toolCallId,
          output: JSON.stringify(toolOutput),
        },
      ],
    }
  );

  return new Response('Tool output submitted', { status: 200 });
}
\`\`\`

For this example to work, you need to implement the actual tool functionality. Here's how you could implement the temperature conversion tool:

\`\`\`typescript
// lib/tools.ts
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

// app/api/assistant/tool/route.ts
import { celsiusToFahrenheit } from '@/lib/tools';

export async function POST(req: Request) {
  const { toolName, arguments: args } = await req.json();
  
  if (toolName === 'celsiusToFahrenheit') {
    const celsius = args.value;
    const fahrenheit = celsiusToFahrenheit(celsius);
    
    return Response.json({
      celsius,
      fahrenheit,
      formatted: `${celsius}°C is equal to ${fahrenheit.toFixed(1)}°F`
    });
  }
  
  return Response.json({ error: 'Unknown tool' }, { status: 400 });
}
\`\`\`

This implementation allows you to create a chat interface that uses the OpenAI Assistant API with tools to generate responses. The `useAssistant` hook handles the streaming of messages and status updates, providing a seamless user experience.

Key features of this implementation:

1. **Tool integration**: The assistant can call tools to perform specific tasks, such as converting temperatures.
2. **Real-time streaming**: The assistant's responses are streamed in real-time, providing immediate feedback to the user.
3. **Status tracking**: The hook provides status updates that can be used to update the UI accordingly.
4. **Thread management**: The implementation maintains conversation threads, allowing for contextual responses based on the conversation history.

This approach is particularly useful when you want to leverage the capabilities of the OpenAI Assistant API with tools, providing a responsive and interactive user experience with extended functionality beyond just text generation.
# Caching Middleware

Let's create a simple chat interface that uses `LanguageModelMiddleware` to cache the assistant's responses in fast KV storage.

## Client

Let's create a simple chat interface that allows users to send messages to the assistant and receive responses. You will integrate the `useChat` hook from `@ai-sdk/react` to stream responses.

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, error } = useChat({ api: '/api/chat' });

  if (error) return <div>{error.message}</div>;

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto space-y-4">
      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            <div>
              <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Say something..."
          className="w-full p-2 border border-gray-300 rounded shadow-xl"
        />
      </form>
    </div>
  );
}
\`\`\`

## Middleware

To implement caching, we'll create a middleware that uses a KV store to cache responses. This will help reduce API costs and improve response times for repeated queries.

\`\`\`typescript
// lib/cache-middleware.ts
import { LanguageModelMiddleware, LanguageModelV1 } from 'ai';
import { kv } from '@vercel/kv';

export const createCachingMiddleware = (): LanguageModelMiddleware => {
  return {
    name: 'caching-middleware',
    beforeInvoke: async (params) => {
      // Create a cache key based on the model, messages, and other parameters
      const cacheKey = createCacheKey(params);
      
      // Try to get the cached response
      const cachedResponse = await kv.get(cacheKey);
      
      if (cachedResponse) {
        console.log('Cache hit!');
        return {
          skip: true,
          value: cachedResponse,
        };
      }
      
      console.log('Cache miss');
      return { skip: false };
    },
    afterInvoke: async (params, response) => {
      // Create a cache key based on the model, messages, and other parameters
      const cacheKey = createCacheKey(params);
      
      // Cache the response with a TTL of 24 hours (86400 seconds)
      await kv.set(cacheKey, response, { ex: 86400 });
      
      return response;
    },
  };
};

// Helper function to create a deterministic cache key
function createCacheKey(params: any): string {
  // Extract relevant parameters for the cache key
  const { model, messages, temperature, maxTokens, topP, presencePenalty, frequencyPenalty } = params;
  
  // Create a normalized representation of the parameters
  const normalizedParams = {
    modelId: typeof model === 'string' ? model : model.id || model.name,
    messages: messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: temperature || 1,
    maxTokens: maxTokens || undefined,
    topP: topP || 1,
    presencePenalty: presencePenalty || 0,
    frequencyPenalty: frequencyPenalty || 0,
  };
  
  // Create a hash of the parameters
  return `ai-cache:${JSON.stringify(normalizedParams)}`;
}
\`\`\`

## Server

Now, let's create a route handler for `/api/chat` that will use our caching middleware:

\`\`\`typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createCachingMiddleware } from '@/lib/cache-middleware';

// Create the caching middleware
const cachingMiddleware = createCachingMiddleware();

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo').withMiddleware([cachingMiddleware]),
    messages,
    temperature: 0.7,
  });
  
  return new Response(textStream);
}
\`\`\`

This implementation provides several benefits:

1. **Reduced API costs**: By caching responses, you can significantly reduce the number of API calls to OpenAI, which can lead to substantial cost savings.

2. **Improved response times**: Cached responses are returned almost instantly, providing a better user experience for common queries.

3. **Reduced rate limiting issues**: By reducing the number of API calls, you're less likely to hit rate limits imposed by the API provider.

4. **Consistent responses**: For the same input, users will always get the same response, which can be desirable in many applications.

The caching middleware can be customized further to suit your specific needs:

- Adjust the TTL (time-to-live) based on how frequently your data changes
- Implement cache invalidation strategies for specific queries
- Add cache warming for common queries
- Implement different caching strategies for different types of queries

Remember to install the required dependencies:

\`\`\`bash
npm install @vercel/kv
\`\`\`

And configure your Vercel KV storage in your project settings if you're deploying to Vercel. For local development, you can use environment variables to configure the KV connection.
\n## Node.js Recipes\n
# Generate Text

The most basic LLM use case is generating text based on a prompt. For example, you may want to generate a response to a question or summarize a body of text. The `generateText` function can be used to generate text based on the input prompt.

\`\`\`javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-3.5-turbo'),
  prompt: 'Why is the sky blue?',
});

console.log(result);
\`\`\`

This simple example demonstrates how to use the `generateText` function to generate a response to a question. The function takes an object with the following properties:

- `model`: The language model to use for text generation. In this case, we're using OpenAI's GPT-3.5 Turbo model.
- `prompt`: The input prompt that the model will use to generate text.

The function returns a promise that resolves to an object containing the generated text. You can access the text using the `text` property of the result object.

You can also provide additional parameters to control the generation process:

\`\`\`javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4'),
  prompt: 'Write a short poem about artificial intelligence.',
  temperature: 0.7,
  maxTokens: 200,
  system: 'You are a creative poet who specializes in technology-themed poetry.',
});

console.log(result.text);
\`\`\`

In this example, we're using additional parameters:

- `temperature`: Controls the randomness of the generation. Higher values (e.g., 0.8) make the output more random, while lower values (e.g., 0.2) make it more deterministic.
- `maxTokens`: Limits the length of the generated text.
- `system`: Provides system instructions to guide the model's behavior.

The `generateText` function is a versatile tool for text generation tasks and can be used in various applications, such as:

- Answering questions
- Summarizing text
- Generating creative content
- Translating text
- Explaining concepts
- And much more

This function is the foundation for many more complex AI SDK features and provides a simple way to integrate text generation capabilities into your Node.js applications.
# Generate Text with Chat Prompt

Previously, we were able to generate text and objects using either a single message prompt, a system prompt, or a combination of both of them. However, there may be times when you want to generate text based on a series of messages.

A chat completion allows you to generate text based on a series of messages. This series of messages can be any series of interactions between any number of systems, but the most popular and relatable use case has been a series of messages that represent a conversation between a user and a model.

\`\`\`javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-3.5-turbo'),
  maxTokens: 1024,
  system: 'You are a helpful chatbot.',
  messages: [
    {
      role: 'user',
      content: 'Hello!',
    },
    {
      role: 'assistant',
      content: 'Hello! How can I help you today?',
    },
    {
      role: 'user',
      content: 'Can you explain what a chat prompt is?',
    },
  ],
});

console.log(result.text);
\`\`\`

In this example, we're using the `messages` parameter to provide a conversation history to the model. The conversation consists of three messages:

1. A user greeting
2. The assistant's response
3. A user question

The model will generate a response to the last message in the conversation, taking into account the entire conversation history.

The `messages` parameter is an array of objects, where each object represents a message in the conversation. Each message has two properties:

- `role`: The role of the message sender, which can be either `'user'` or `'assistant'`.
- `content`: The content of the message.

You can also include a `system` message to provide instructions or context to the model:

\`\`\`javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4'),
  system: 'You are a knowledgeable assistant specializing in programming languages.',
  messages: [
    {
      role: 'user',
      content: 'What are the main differences between JavaScript and Python?',
    },
  ],
});

console.log(result.text);
\`\`\`

In this example, the `system` message provides context about the assistant's expertise, which helps guide the model's response to the user's question.

Chat prompts are particularly useful for applications that involve multi-turn conversations, such as:

- Chatbots
- Virtual assistants
- Customer support systems
- Interactive tutorials
- Role-playing scenarios

By using chat prompts, you can create more natural and contextually aware interactions with language models in your Node.js applications.
# Generate Text with Image Prompt

Some language models that support vision capabilities accept images as part of the prompt. Here are some of the different formats you can use to include images as input.

## URL

\`\`\`javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4-turbo'),
  maxTokens: 512,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'What are the red things in this image?',
        },
        {
          type: 'image',
          image: new URL(
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Strawberries.jpg/2560px-Strawberries.jpg'
          ),
        },
      ],
    },
  ],
});

console.log(result.text);
\`\`\`

In this example, we're using a URL to include an image in the prompt. The `content` property of the message is an array of objects, where each object represents a part of the message. The first object is a text part, and the second object is an image part.

The image part has two properties:
- `type`: The type of the content, which is `'image'` in this case.
- `image`: The image to include, which is a URL object in this case.

## File Buffer

You can also include images as file buffers:

\`\`\`javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import fs from 'fs/promises';
import path from 'path';

async function generateTextWithImageBuffer() {
  // Read the image file as a buffer
  const imageBuffer = await fs.readFile(path.join(process.cwd(), 'path/to/your/image.jpg'));
  
  const result = await generateText({
    model: openai('gpt-4-vision-preview'),
    maxTokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Describe what you see in this image in detail.',
          },
          {
            type: 'image',
            image: imageBuffer,
          },
        ],
      },
    ],
  });
  
  console.log(result.text);
}

generateTextWithImageBuffer();
\`\`\`

In this example, we're reading an image file as a buffer and including it in the prompt. This is useful when you have local image files that you want to include in your prompts.

You can also include multiple images in a single prompt:

\`\`\`javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4-vision-preview'),
  maxTokens: 1024,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Compare and contrast these two images.',
        },
        {
          type: 'image',
          image: new URL('https://example.com/image1.jpg'),
        },
        {
          type: 'image',
          image: new URL('https://example.com/image2.jpg'),
        },
      ],
    },
  ],
});

console.log(result.text);
\`\`\`

This capability is particularly useful for applications that involve:

- Image analysis and description
- Visual question answering
- Content moderation
- Product identification
- Scene understanding
- Document analysis

By combining text and images in your prompts, you can create more powerful and context-aware applications that can understand and respond to visual information.
# Stream Text

Text generation can sometimes take a long time to complete, especially when you're generating a couple of paragraphs. In such cases, it is useful to stream the text to the client in real-time. This allows the client to display the generated text as it is being generated, rather than have users wait for it to complete before displaying the result.

## Without reader

\`\`\`javascript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-3.5-turbo'),
  prompt: 'Write a short story about a robot learning to feel emotions.',
  temperature: 0.7,
  maxTokens: 500,
});

// The result is a ReadableStream
console.log(result); // ReadableStream

// You can use the stream directly if you're in a server environment
// For example, in a Node.js HTTP server:
// response.writeHead(200, { 'Content-Type': 'text/plain' });
// result.pipeTo(new WritableStream({
//   write(chunk) {
//     response.write(chunk);
//   },
//   close() {
//     response.end();
//   }
// }));
\`\`\`

In this example, we're using the `streamText` function to generate text and stream it in real-time. The function returns a `ReadableStream` that you can use to read the generated text as it becomes available.

## With reader

If you want to process the streamed text in your application, you can use a reader to read from the stream:

\`\`\`javascript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

async function generateAndStreamText() {
  const stream = await streamText({
    model: openai('gpt-4'),
    prompt: 'Explain quantum computing in simple terms.',
    temperature: 0.5,
    maxTokens: 1000,
  });
  
  // Create a reader from the stream
  const reader = stream.getReader();
  
  let accumulatedText = '';
  
  // Read from the stream
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) {
      console.log('Stream complete!');
      console.log('Final text:', accumulatedText);
      break;
    }
    
    // Process the chunk of text
    accumulatedText += value;
    
    // You can do something with each chunk as it arrives
    console.log('Received chunk:', value);
    
    // For example, you could update a UI element
    // updateUIWithText(accumulatedText);
  }
}

generateAndStreamText().catch(console.error);
\`\`\`

In this example, we're using a reader to read from the stream and process each chunk of text as it arrives. This approach is useful when you want to:

1. Display the text to users in real-time
2. Process the text as it's being generated
3. Accumulate the text for later use
4. Implement custom handling for the streamed text

Streaming text generation provides several benefits:

- **Improved user experience**: Users see results immediately and can start reading while the rest of the text is being generated.
- **Faster perceived performance**: Even if the total generation time is the same, users perceive the application as faster because they see immediate results.
- **Ability to cancel early**: If users see that the generation is going in the wrong direction, they can cancel it early without waiting for the complete result.
- **Better handling of long outputs**: For very long outputs, streaming allows you to process and display the text incrementally, which is more efficient than waiting for the entire output.

This approach is particularly useful for applications like chatbots, content generation tools, and any scenario where real-time feedback is important.
# Stream Text with Chat Prompt

Text generation can sometimes take a long time to finish, especially when the response is big. In such cases, it is useful to stream the chat completion to the client in real-time. This allows the client to display the new message as it is being generated by the model, rather than have users wait for it to finish.

\`\`\`javascript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-3.5-turbo'),
  maxTokens: 1024,
  system: 'You are a helpful chatbot.',
  messages: [
    {
      role: 'user',
      content: 'Hello!',
    },
    {
      role: 'assistant',
      content: 'Hello! How can I help you today?',
    },
    {
      role: 'user',
      content: 'I need help with my computer.',
    },
  ],
});

// Process the stream
for await (const textPart of result.textStream) {
  // Each textPart is a chunk of the generated text
  console.log(textPart);
  
  // In a real application, you might send this to a client
  // or update a UI element
}

// Alternatively, you can use a reader to process the stream
const reader = result.textStream.getReader();

try {
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) {
      console.log('Stream complete!');
      break;
    }
    
    // Process the chunk of text
    console.log('Received chunk:', value);
  }
} finally {
  reader.releaseLock();
}
\`\`\`

In this example, we're using the `streamText` function to generate text based on a conversation history and stream it in real-time. The function takes the same parameters as `generateText`, but returns a `ReadableStream` that you can use to read the generated text as it becomes available.

The conversation is represented as an array of messages, where each message has a `role` (either 'user' or 'assistant') and `content` (the text of the message). The model will generate a response to the last message in the conversation, taking into account the entire conversation history.

You can also include a `system` message to provide instructions or context to the model:

\`\`\`javascript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-4'),
  system: 'You are a technical support specialist who helps users with computer problems.',
  messages: [
    {
      role: 'user',
      content: 'My computer is running very slowly. What should I check?',
    },
  ],
});

// Process the stream...
\`\`\`

Streaming chat completions is particularly useful for applications like:

- Chatbots and virtual assistants
- Customer support systems
- Interactive tutorials
- Any application where real-time feedback is important

By streaming the response, you can provide a more responsive and engaging user experience, especially for longer responses that would otherwise take a significant amount of time to generate completely before showing anything to the user.
# Stream Text with Image Prompt

Vision-language models can analyze images alongside text prompts to generate responses about visual content. This multimodal approach allows for rich interactions where you can ask questions about images, request descriptions, or analyze visual details. The combination of image and text inputs enables more sophisticated AI applications like visual question answering and image analysis.

\`\`\`javascript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import 'dotenv/config';
import fs from 'node:fs';

async function main() {
  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20240620'),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Describe the image in detail.' },
          { type: 'image', image: fs.readFileSync('./data/comic-cat.jpg') },
        ],
      },
    ],
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
\`\`\`

In this example, we're using the `streamText` function to generate a description of an image and stream the response in real-time. The function takes the same parameters as `generateText`, but returns a `ReadableStream` that you can use to read the generated text as it becomes available.

The content of the message is an array of objects, where each object represents a part of the message:
- The first object is a text part with the prompt "Describe the image in detail."
- The second object is an image part with the image file read from disk.

You can also use URLs for images:

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

async function streamImageAnalysis() {
  const result = streamText({
    model: openai('gpt-4-vision-preview'),
    maxTokens: 1000,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What's happening in this image?' },
          { 
            type: 'image', 
            image: new URL('https://example.com/images/scene.jpg')
          },
        ],
      },
    ],
  });

  // Process the stream
  for await (const chunk of result.textStream) {
    console.log(chunk); // In a real app, you might send this to a client
  }
}

streamImageAnalysis().catch(console.error);
\`\`\`

You can also include multiple images in a single prompt:

\`\`\`javascript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import fs from 'node:fs';

async function compareImages() {
  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20240620'),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Compare these two images and tell me the differences.' },
          { type: 'image', image: fs.readFileSync('./data/image1.jpg') },
          { type: 'image', image: fs.readFileSync('./data/image2.jpg') },
        ],
      },
    ],
  });

  let fullResponse = '';
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
    fullResponse += chunk;
  }
  
  return fullResponse;
}

compareImages().catch(console.error);
\`\`\`

Streaming text with image prompts is particularly useful for applications that require real-time analysis of visual content, such as:

- Interactive image description services
- Visual question answering systems
- Image content moderation
- Educational tools that explain visual concepts
- Accessibility applications for visually impaired users

By streaming the response, you provide a more responsive user experience, especially for detailed image analyses that might take longer to generate completely.
# Stream Text with File Prompt

Working with files in AI applications often requires analyzing documents, processing structured data, or extracting information from various file formats. File prompts allow you to send file content directly to the model, enabling tasks like document analysis, data extraction, or generating responses based on file contents.

\`\`\`javascript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import 'dotenv/config';
import fs from 'node:fs';

async function main() {
  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'What is an embedding model according to this document? Summarize the key points.',
          },
          {
            type: 'file',
            data: fs.readFileSync('./data/ai.pdf'),
            mimeType: 'application/pdf',
          },
        ],
      },
    ],
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

main().catch(console.error);
\`\`\`

In this example, we're using the `streamText` function to analyze a PDF document and stream the response in real-time. The function takes the same parameters as `generateText`, but returns a `ReadableStream` that you can use to read the generated text as it becomes available.

The content of the message is an array of objects, where each object represents a part of the message:
- The first object is a text part with the prompt asking about embedding models.
- The second object is a file part with the PDF document read from disk.

The file part has three properties:
- `type`: The type of the content, which is `'file'` in this case.
- `data`: The file content as a buffer.
- `mimeType`: The MIME type of the file, which helps the model understand the file format.

You can work with various file types, including:

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import fs from 'node:fs';

async function analyzeCSVData() {
  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this CSV data and tell me the key trends and insights.',
          },
          {
            type: 'file',
            data: fs.readFileSync('./data/sales_data.csv'),
            mimeType: 'text/csv',
          },
        ],
      },
    ],
  });

  let fullResponse = '';
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
    fullResponse += chunk;
  }
  
  return fullResponse;
}

analyzeCSVData().catch(console.error);
\`\`\`

You can also include multiple files in a single prompt:

\`\`\`javascript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import fs from 'node:fs';

async function compareDocuments() {
  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Compare these two documents and highlight the key differences.',
          },
          {
            type: 'file',
            data: fs.readFileSync('./data/document1.txt'),
            mimeType: 'text/plain',
          },
          {
            type: 'file',
            data: fs.readFileSync('./data/document2.txt'),
            mimeType: 'text/plain',
          },
        ],
      },
    ],
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

compareDocuments().catch(console.error);
\`\`\`

Streaming text with file prompts is particularly useful for applications that require real-time analysis of document content, such as:

- Document summarization services
- Data extraction and analysis tools
- Contract review systems
- Research assistants that work with academic papers
- Code analysis and explanation tools

By streaming the response, you provide a more responsive user experience, especially for large documents that might take longer to analyze completely.
# Generate Object with a Reasoning Model

Reasoning models, like [DeepSeek's](https://deepseek.ai/) R1, are gaining popularity due to their ability to understand and generate better responses to complex queries than non-reasoning models. You may want to use these models to generate structured data. However, most (like R1 and [OpenAI's](https://openai.com/) o1) do not support tool-calling or structured outputs.

One solution is to pass the output from a reasoning model through a smaller model that can output structured data (like gpt-4o-mini). These lightweight models can efficiently extract the structured data while adding very little overhead in terms of speed and cost.

\`\`\`javascript
import { deepseek } from '@ai-sdk/deepseek';
import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import 'dotenv/config';
import { z } from 'zod';

async function main() {
  const { text: rawOutput } = await generateText({
    model: deepseek('deepseek-reasoner'),
    prompt:
      'Predict the top 3 largest city by 2050. For each, return the city name, country, predicted population in millions, and a brief explanation of why it will grow.',
  });

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    prompt: rawOutput,
    schema: z.array(
      z.object({
        city: z.string(),
        country: z.string(),
        populationInMillions: z.number(),
        explanation: z.string(),
      })
    ),
  });

  console.log(JSON.stringify(object, null, 2));
}

main().catch(console.error);
\`\`\`

In this example, we're using a two-step process:

1. First, we use the `generateText` function with a reasoning model (DeepSeek Reasoner) to generate a detailed response about future city populations.
2. Then, we use the `generateObject` function with a smaller model (GPT-4o-mini) to extract structured data from the reasoning model's output.

The `generateObject` function takes three parameters:
- `model`: The language model to use for extracting structured data.
- `prompt`: The text to extract structured data from (in this case, the output from the reasoning model).
- `schema`: A Zod schema that defines the structure of the output object.

The function returns a promise that resolves to an object containing the extracted structured data.

You can also use this approach with other reasoning models:

\`\`\`javascript
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

async function analyzeCompanies() {
  const { text: analysis } = await generateText({
    model: anthropic('claude-3-opus-20240229'),
    system: "You are a financial analyst with expertise in technology companies.",
    messages: [
      {
        role: 'user',
        content: 'Analyze the top 3 AI companies and their competitive advantages.',
      },
    ],
  });

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    prompt: analysis,
    schema: z.array(
      z.object({
        companyName: z.string(),
        marketCap: z.string(),
        keyProducts: z.array(z.string()),
        competitiveAdvantages: z.array(z.string()),
        challenges: z.array(z.string()),
      })
    ),
  });

  return object;
}
\`\`\`

This approach offers several benefits:

1. **Best of both worlds**: You get the deep reasoning capabilities of advanced models and the structured output capabilities of smaller models.
2. **Cost efficiency**: The expensive reasoning model is only used for the complex reasoning task, while the cheaper model handles the simpler task of extracting structured data.
3. **Flexibility**: You can mix and match different models based on their strengths and your specific needs.
4. **Reliability**: The smaller model can reliably extract structured data even if the reasoning model's output is verbose or contains extraneous information.

This pattern is particularly useful for applications that require both complex reasoning and structured data, such as:

- Financial analysis tools
- Research assistants
- Data extraction from complex sources
- Decision support systems
- Automated report generation
# Generate Object

Earlier functions like `generateText` and `streamText` gave us the ability to generate unstructured text. However, if you want to generate structured data like JSON, you can provide a schema that describes the structure of your desired object to the `generateObject` function.

The function requires you to provide a schema using [zod](https://github.com/colinhacks/zod), a library for defining schemas for JavaScript objects. By using zod, you can also use it to validate the generated object and ensure that it conforms to the specified structure.

\`\`\`javascript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.string(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

console.log(JSON.stringify(result.object, null, 2));
\`\`\`

In this example, we're using the `generateObject` function to generate a structured recipe object. The function takes three parameters:

- `model`: The language model to use for generation.
- `schema`: A Zod schema that defines the structure of the output object.
- `prompt`: The input prompt that the model will use to generate the object.

The function returns a promise that resolves to an object containing the generated object. You can access the object using the `object` property of the result.

You can also use the `messages` parameter instead of `prompt` to provide a conversation history:

\`\`\`javascript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    analysis: z.object({
      sentiment: z.enum(['positive', 'neutral', 'negative']),
      topics: z.array(z.string()),
      summary: z.string(),
      keyPoints: z.array(z.string()),
    }),
  }),
  messages: [
    {
      role: 'user',
      content: 'Analyze the sentiment and topics in this customer feedback: "I love your product, but the customer service could be better. The interface is intuitive and the features are great, though I wish there were more customization options."',
    },
  ],
});

console.log(JSON.stringify(result.object, null, 2));
\`\`\`

You can create complex nested schemas to match your specific needs:

\`\`\`javascript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    movie: z.object({
      title: z.string(),
      year: z.number(),
      director: z.string(),
      actors: z.array(
        z.object({
          name: z.string(),
          role: z.string(),
        })
      ),
      genres: z.array(z.string()),
      ratings: z.object({
        imdb: z.number().min(0).max(10),
        rottenTomatoes: z.number().min(0).max(100),
        metacritic: z.number().min(0).max(100),
      }),
      plot: z.string(),
    }),
  }),
  prompt: 'Generate information about the movie "The Shawshank Redemption".',
});

console.log(JSON.stringify(result.object, null, 2));
\`\`\`

The `generateObject` function is particularly useful for applications that require structured data, such as:

- APIs that need to return JSON responses
- Data extraction and transformation
- Form validation and processing
- Database operations
- Configuration generation

By using the `generateObject` function with a well-defined schema, you can ensure that the generated data always conforms to your expected structure, making it easier to work with in your application.
# Stream Object

Object generation can sometimes take a long time to complete, especially when you're generating a large schema.

In Generative UI use cases, it is useful to stream the object to the client in real-time to render UIs as the object is being generated. You can use the `streamObject` function to generate partial object streams.

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const { partialObjectStream } = streamObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

for await (const partialObject of partialObjectStream) {
  console.clear();
  console.log(partialObject);
}
\`\`\`

In this example, we're using the `streamObject` function to generate a structured recipe object and stream it in real-time. The function takes the same parameters as `generateObject`, but returns a `ReadableStream` that you can use to read the generated object as it becomes available.

The `streamObject` function returns an object with a `partialObjectStream` property, which is an async iterable that yields partial objects as they are generated. Each partial object represents the current state of the generated object, which may be incomplete.

You can also use the `messages` parameter instead of `prompt` to provide a conversation history:

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

async function streamMovieAnalysis() {
  const { partialObjectStream } = streamObject({
    model: openai('gpt-4-turbo'),
    schema: z.object({
      movie: z.object({
        title: z.string(),
        director: z.string(),
        year: z.number(),
        genres: z.array(z.string()),
        analysis: z.object({
          themes: z.array(z.string()),
          cinematography: z.string(),
          acting: z.string(),
          soundtrack: z.string(),
          overall: z.string(),
        }),
        rating: z.number().min(1).max(10),
      }),
    }),
    messages: [
      {
        role: 'user',
        content: 'Analyze the movie "Inception" directed by Christopher Nolan.',
      },
    ],
  });

  // Create a UI rendering function
  const renderUI = (partialObject) => {
    // In a real application, this would update a UI component
    console.clear();
    console.log('Current state of the analysis:');
    console.log(JSON.stringify(partialObject, null, 2));
  };

  // Process the stream
  for await (const partialObject of partialObjectStream) {
    renderUI(partialObject);
  }
}

streamMovieAnalysis().catch(console.error);
\`\`\`

This approach is particularly useful for applications that need to display complex structured data as it's being generated, such as:

- Interactive dashboards
- Data visualization tools
- Form generators
- Configuration wizards
- Content management systems

By streaming the object generation, you can provide a more responsive user experience, especially for complex objects that might take longer to generate completely. Users can see the object being built in real-time, which can make the application feel more responsive and engaging.
# Stream Object with Image Prompt

Some language models that support vision capabilities accept images as part of the prompt. Here are some of the different formats you can use to include images as input.

## URL

\`\`\`javascript
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

async function main() {
  const { partialObjectStream } = streamObject({
    model: openai('gpt-4-turbo'),
    maxTokens: 512,
    schema: z.object({
      stamps: z.array(
        z.object({
          country: z.string(),
          date: z.string(),
          description: z.string(),
          features: z.array(z.string()),
          colors: z.array(z.string()),
          condition: z.string(),
        })
      ),
    }),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this stamp collection image and provide details about each visible stamp.',
          },
          {
            type: 'image',
            image: new URL(
              'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Stamp_collection.jpg/1280px-Stamp_collection.jpg'
            ),
          },
        ],
      },
    ],
  });

  // Process the stream
  for await (const partialObject of partialObjectStream) {
    console.clear();
    console.log(JSON.stringify(partialObject, null, 2));
  }
}

main().catch(console.error);
\`\`\`

In this example, we're using the `streamObject` function to analyze an image of stamps and stream structured data about each stamp in real-time. The function takes the same parameters as `generateObject`, but returns a `ReadableStream` that you can use to read the generated object as it becomes available.

The content of the message is an array of objects, where each object represents a part of the message:
- The first object is a text part with the prompt asking for stamp analysis.
- The second object is an image part with a URL to an image of stamps.

## File Buffer

You can also include images as file buffers:

\`\`\`javascript
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

async function analyzeImageWithStructuredOutput() {
  // Read the image file as a buffer
  const imageBuffer = await fs.readFile(path.join(process.cwd(), 'path/to/your/image.jpg'));
  
  const { partialObjectStream } = streamObject({
    model: openai('gpt-4-vision-preview'),
    schema: z.object({
      scene: z.object({
        location: z.string(),
        timeOfDay: z.string(),
        weather: z.string(),
        mainSubjects: z.array(z.string()),
        activities: z.array(z.string()),
        colors: z.array(z.string()),
        mood: z.string(),
        description: z.string(),
      }),
    }),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this image and provide structured information about the scene.',
          },
          {
            type: 'image',
            image: imageBuffer,
          },
        ],
      },
    ],
  });
  
  // Create a UI rendering function
  const renderUI = (partialObject) => {
    // In a real application, this would update a UI component
    console.clear();
    console.log('Current analysis:');
    console.log(JSON.stringify(partialObject, null, 2));
  };
  
  // Process the stream
  for await (const partialObject of partialObjectStream) {
    renderUI(partialObject);
  }
}

analyzeImageWithStructuredOutput().catch(console.error);
\`\`\`

This approach is particularly useful for applications that need to analyze images and provide structured data in real-time, such as:

- Image cataloging and organization tools
- Visual content analysis systems
- E-commerce product recognition
- Medical image analysis
- Real estate property assessment
- Art and collectibles appraisal

By streaming the object generation, you can provide a more responsive user experience, especially for complex analyses that might take longer to generate completely. Users can see the analysis being built in real-time, which can make the application feel more responsive and engaging.
# Record Token Usage After Streaming Object

When you're streaming structured data with `streamObject`, you may want to record the token usage for billing purposes.

## onFinish Callback

You can use the `onFinish` callback to record token usage. It is called when the stream is finished.

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const result = streamObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
  onFinish({ usage }) {
    console.log('Token usage:', usage);
  }
});

// Process the stream
for await (const partialObject of result.partialObjectStream) {
  console.clear();
  console.log(JSON.stringify(partialObject, null, 2));
}
\`\`\`

In this example, we're using the `onFinish` callback to log the token usage after the stream is finished. The callback receives an object with a `usage` property that contains information about the token usage.

The `usage` object typically includes:
- `promptTokens`: The number of tokens in the prompt
- `completionTokens`: The number of tokens in the completion
- `totalTokens`: The total number of tokens used

## usage Promise

You can also access the token usage through the `usage` promise returned by the `streamObject` function:

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

async function generateAndTrackUsage() {
  const { partialObjectStream, usage } = streamObject({
    model: openai('gpt-4-turbo'),
    schema: z.object({
      analysis: z.object({
        title: z.string(),
        summary: z.string(),
        keyPoints: z.array(z.string()),
        sentiment: z.enum(['positive', 'neutral', 'negative']),
      }),
    }),
    messages: [
      {
        role: 'user',
        content: 'Analyze this article about climate change...',
      },
    ],
  });

  // Process the stream
  for await (const partialObject of partialObjectStream) {
    // Update UI with partial object
    console.clear();
    console.log(JSON.stringify(partialObject, null, 2));
  }

  // After the stream is finished, get the usage
  const usageData = await usage;
  console.log('Token usage details:');
  console.log(`Prompt tokens: ${usageData.promptTokens}`);
  console.log(`Completion tokens: ${usageData.completionTokens}`);
  console.log(`Total tokens: ${usageData.totalTokens}`);
  
  // You might want to store this in a database for billing purposes
  await storeUsageInDatabase({
    timestamp: new Date(),
    model: 'gpt-4-turbo',
    promptTokens: usageData.promptTokens,
    completionTokens: usageData.completionTokens,
    totalTokens: usageData.totalTokens,
    cost: calculateCost(usageData, 'gpt-4-turbo'),
  });
}

// Helper function to calculate cost based on token usage and model
function calculateCost(usage, model) {
  // These rates would need to be updated based on current pricing
  const rates = {
    'gpt-4-turbo': {
      promptRate: 0.00001, // $0.01 per 1K tokens
      completionRate: 0.00003, // $0.03 per 1K tokens
    },
    // Add other models as needed
  };
  
  const { promptRate, completionRate } = rates[model];
  return (usage.promptTokens * promptRate) + (usage.completionTokens * completionRate);
}

// Mock function to store usage in a database
async function storeUsageInDatabase(usageRecord) {
  // In a real application, this would store the data in a database
  console.log('Stored usage record:', usageRecord);
}

generateAndTrackUsage().catch(console.error);
\`\`\`

This approach is particularly useful for applications that need to track token usage for billing or quota purposes, such as:

- SaaS applications with usage-based pricing
- Enterprise applications with departmental billing
- Applications with user quotas
- Systems that need to optimize token usage

By tracking token usage, you can ensure that you're accurately billing your users and managing your own costs when using language models.
\n\n## Guides\n\n
# Get Started with Computer Use Guide

With the [release of Computer Use in Claude 3.5 Sonnet](https://www.anthropic.com/news/claude-computer-use), you can now direct AI models to interact with computers like humans do - moving cursors, clicking buttons, and typing text. This capability enables automation of complex tasks while leveraging Claude's advanced reasoning abilities.

The AI SDK is a powerful TypeScript toolkit for building AI applications with large language models (LLMs) like Anthropic's Claude alongside popular frameworks like React, Next.js, Vue, Svelte, Node.js, and more. In this guide, you will learn how to integrate Computer Use into your AI SDK applications.

Computer Use is currently in beta with some [limitations](https://docs.anthropic.com/claude/docs/computer-use-beta). The feature may be error-prone at times. Anthropic recommends starting with low-risk tasks and implementing appropriate safety measures.

## Computer Use

Anthropic recently released a new version of the Claude 3.5 Sonnet model which is capable of 'Computer Use'. This allows the model to interact with computer interfaces through basic actions like:

## How It Works

## Available Tools

## Implementation Considerations

## Getting Started with the AI SDK

## Using Computer Tools with Text Generation

## Configure Multi-Step (Agentic) Generations

## Combine Multiple Tools

## Best Practices for Computer Use

## Security Measures
# Multi-Modal Chatbot Guide

In this guide, you will build a multi-modal AI-chatbot capable of understanding both images and PDFs.

Multi-modal refers to the ability of the chatbot to understand and generate responses in multiple formats, such as text, images, PDFs, and videos. In this example, we will focus on sending images and PDFs and generating text-based responses.

Different AI providers have varying levels of multi-modal support, for example:

* OpenAI (GPT-4o): Supports image input
* Anthropic (Sonnet 3.5): Supports image and PDF input
* Google (Gemini 2.0): Supports image and PDF input

For a complete list of providers that support both image and PDF inputs, visit the [providers documentation](https://ai-sdk.dev/docs/providers).

We'll first build a chatbot capable of generating responses based on an image input using OpenAI, then show how to switch providers to handle PDFs.

## Prerequisites

## Create Your Application

### Install dependencies

### Configure OpenAI API key

## Implementation Plan

### Create a Route Handler

### Wire up the UI

### Add Image Upload

## Running Your Application

## Working with PDFs

## Where to Next?
# Natural Language Postgres Guide

In this guide, you will learn how to build an app that uses AI to interact with a PostgreSQL database using natural language.

The application will:

* Generate SQL queries from a natural language input
* Explain query components in plain English
* Create a chart to visualise query results

You can find a completed version of this project at [natural-language-postgres.vercel.app](https://natural-language-postgres.vercel.app/).

## Project setup

This project uses the following stack:

* Next.js (App Router)
* AI SDK
* OpenAI
* Zod

## Project setup and data

### Clone repo

### About the dataset

### Project structure

### Existing components

## Building the application

### Generate SQL queries

#### Providing context

#### Create a Server Action

#### Update the frontend

### Explain SQL Queries

#### Create a Server Action

#### Update query viewer
# Get Started with OpenAI o1 Guide

With the [release of OpenAI's o1 series models](https://openai.com/blog/introducing-o1), there has never been a better time to start building AI applications, particularly those that require complex reasoning capabilities.

The AI SDK is a powerful TypeScript toolkit for building AI applications with large language models (LLMs) like OpenAI o1 alongside popular frameworks like React, Next.js, Vue, Svelte, Node.js, and more.

## OpenAI o1

OpenAI released a series of AI models designed to spend more time thinking before responding. They can reason through complex tasks and solve harder problems than previous models in science, coding, and math. These models, named the o1 series, are trained with reinforcement learning and can "think before they answer". As a result, they are able to produce a long internal chain of thought before responding to a prompt.

There are three reasoning models available in the API:

1. **o1**: Designed to reason about hard problems using broad general knowledge about the world.
2. **o1-preview**: The original preview version of o1 - slower than o1 but with similar capabilities.
3. **o1-mini**: A smaller, faster, and more affordable version of o1 with similar capabilities.

## Benchmarks

## Prompt Engineering for o1 Models

## Getting Started with the AI SDK

## Refining Reasoning Effort

## Generating Structured Data

## Tools

## Using Tools with the AI SDK

## Building Interactive Interfaces

## Get Started
\n\n## Next.js Recipes\n\n
# Caching Middleware

Let's create a simple chat interface that uses `LanguageModelMiddleware` to cache the assistant's responses in fast KV storage.

## Client

Let's create a simple chat interface that allows users to send messages to the assistant and receive responses. You will integrate the `useChat` hook from `@ai-sdk/react` to stream responses.

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, error } = useChat({ api: '/api/chat' });

  if (error) return <div>{error.message}</div>;

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto space-y-4">
      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            <div>
              <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Say something..."
          className="w-full p-2 border border-gray-300 rounded shadow-xl"
        />
      </form>
    </div>
  );
}
\`\`\`

## Middleware

To implement caching, we'll create a middleware that uses a KV store to cache responses. This will help reduce API costs and improve response times for repeated queries.

\`\`\`typescript
// lib/cache-middleware.ts
import { LanguageModelMiddleware, LanguageModelV1 } from 'ai';
import { kv } from '@vercel/kv';

export const createCachingMiddleware = (): LanguageModelMiddleware => {
  return {
    name: 'caching-middleware',
    beforeInvoke: async (params) => {
      // Create a cache key based on the model, messages, and other parameters
      const cacheKey = createCacheKey(params);
      
      // Try to get the cached response
      const cachedResponse = await kv.get(cacheKey);
      
      if (cachedResponse) {
        console.log('Cache hit!');
        return {
          skip: true,
          value: cachedResponse,
        };
      }
      
      console.log('Cache miss');
      return { skip: false };
    },
    afterInvoke: async (params, response) => {
      // Create a cache key based on the model, messages, and other parameters
      const cacheKey = createCacheKey(params);
      
      // Cache the response with a TTL of 24 hours (86400 seconds)
      await kv.set(cacheKey, response, { ex: 86400 });
      
      return response;
    },
  };
};

// Helper function to create a deterministic cache key
function createCacheKey(params: any): string {
  // Extract relevant parameters for the cache key
  const { model, messages, temperature, maxTokens, topP, presencePenalty, frequencyPenalty } = params;
  
  // Create a normalized representation of the parameters
  const normalizedParams = {
    modelId: typeof model === 'string' ? model : model.id || model.name,
    messages: messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: temperature || 1,
    maxTokens: maxTokens || undefined,
    topP: topP || 1,
    presencePenalty: presencePenalty || 0,
    frequencyPenalty: frequencyPenalty || 0,
  };
  
  // Create a hash of the parameters
  return `ai-cache:${JSON.stringify(normalizedParams)}`;
}
\`\`\`

## Server

Now, let's create a route handler for `/api/chat` that will use our caching middleware:

\`\`\`typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createCachingMiddleware } from '@/lib/cache-middleware';

// Create the caching middleware
const cachingMiddleware = createCachingMiddleware();

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo').withMiddleware([cachingMiddleware]),
    messages,
    temperature: 0.7,
  });
  
  return new Response(textStream);
}
\`\`\`

This implementation provides several benefits:

1. **Reduced API costs**: By caching responses, you can significantly reduce the number of API calls to OpenAI, which can lead to substantial cost savings.

2. **Improved response times**: Cached responses are returned almost instantly, providing a better user experience for common queries.

3. **Reduced rate limiting issues**: By reducing the number of API calls, you're less likely to hit rate limits imposed by the API provider.

4. **Consistent responses**: For the same input, users will always get the same response, which can be desirable in many applications.

The caching middleware can be customized further to suit your specific needs:

- Adjust the TTL (time-to-live) based on how frequently your data changes
- Implement cache invalidation strategies for specific queries
- Add cache warming for common queries
- Implement different caching strategies for different types of queries

Remember to install the required dependencies:

\`\`\`bash
npm install @vercel/kv
\`\`\`

And configure your Vercel KV storage in your project settings if you're deploying to Vercel. For local development, you can use environment variables to configure the KV connection.
# Call Tools

Some models allow developers to provide a list of tools that can be called at any time during a generation. This is useful for extending the capabilities of a language model to either use logic or data to interact with systems external to the model.

## Client

Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client. If the assistant responds with a tool call, the hook will automatically display them as well.

\`\`\`jsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
          
          {m.role === 'assistant' && m.toolCalls && m.toolCalls.length > 0 && (
            <div className="ml-4 mt-2 border-l-2 border-gray-300 pl-2">
              {m.toolCalls.map((toolCall, i) => (
                <div key={i} className="mb-2">
                  <strong>Tool Call: {toolCall.name}</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(toolCall.arguments, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
          
          {m.role === 'assistant' && m.toolResults && m.toolResults.length > 0 && (
            <div className="ml-4 mt-2 border-l-2 border-green-300 pl-2">
              {m.toolResults.map((toolResult, i) => (
                <div key={i} className="mb-2">
                  <strong>Tool Result: {toolResult.toolName}</strong>
                  <pre className="bg-green-50 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(toolResult.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/chat` that will generate the assistant's response based on the conversation history and stream it to the client. We'll define two tools: one for getting the weather and another for searching the web.

\`\`\`typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Define a tool for getting the weather
  const getWeather = tool({
    name: 'getWeather',
    description: 'Get the current weather in a given location',
    parameters: z.object({
      location: z.string().describe('The city and state, e.g. San Francisco, CA'),
    }),
    execute: async ({ location }) => {
      // In a real application, you would call a weather API here
      return {
        temperature: 72,
        unit: 'fahrenheit',
        description: 'Sunny',
        location,
      };
    },
  });
  
  // Define a tool for searching the web
  const searchWeb = tool({
    name: 'searchWeb',
    description: 'Search the web for information',
    parameters: z.object({
      query: z.string().describe('The search query'),
    }),
    execute: async ({ query }) => {
      // In a real application, you would call a search API here
      return {
        results: [
          {
            title: 'Example search result 1',
            url: 'https://example.com/1',
            snippet: 'This is an example search result.',
          },
          {
            title: 'Example search result 2',
            url: 'https://example.com/2',
            snippet: 'This is another example search result.',
          },
        ],
        query,
      };
    },
  });
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: [getWeather, searchWeb],
  });
  
  return new Response(textStream);
}
\`\`\`

This implementation allows the AI to call tools when needed to provide more accurate and up-to-date information to the user. The tools are defined on the server side and can execute any logic or API calls needed to fulfill the user's request.
# Call Tools in Multiple Steps

Some language models are great at calling tools in multiple steps to achieve a more complex task. This is particularly useful when the tools are dependent on each other and need to be executed in sequence during the same generation step.

## Client

Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client. If the assistant responds with a tool call, the hook will automatically display them as well.

To call tools in multiple steps, you can use the `maxSteps` option to specify the maximum number of steps that can be made before the model or the user responds with a text message. In this example, you will set it to `5` to allow for multiple tool calls.

\`\`\`jsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
          
          {m.role === 'assistant' && m.toolCalls && m.toolCalls.length > 0 && (
            <div className="ml-4 mt-2 border-l-2 border-gray-300 pl-2">
              <strong>Tool Calls:</strong>
              {m.toolCalls.map((toolCall, i) => (
                <div key={i} className="mb-2 mt-1">
                  <div className="font-medium">{toolCall.name}</div>
                  <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto text-sm">
                    {JSON.stringify(toolCall.arguments, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
          
          {m.role === 'assistant' && m.toolResults && m.toolResults.length > 0 && (
            <div className="ml-4 mt-2 border-l-2 border-green-300 pl-2">
              <strong>Tool Results:</strong>
              {m.toolResults.map((toolResult, i) => (
                <div key={i} className="mb-2 mt-1">
                  <div className="font-medium">{toolResult.toolName}</div>
                  <pre className="bg-green-50 p-2 rounded mt-1 overflow-auto text-sm">
                    {JSON.stringify(toolResult.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/chat` that will generate the assistant's response based on the conversation history and stream it to the client. We'll define multiple tools that can be called in sequence to solve a complex task.

\`\`\`typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Define a tool for searching for flights
  const searchFlights = tool({
    name: 'searchFlights',
    description: 'Search for available flights between two locations on a specific date',
    parameters: z.object({
      origin: z.string().describe('The origin airport code, e.g. LAX'),
      destination: z.string().describe('The destination airport code, e.g. JFK'),
      date: z.string().describe('The date of travel in YYYY-MM-DD format'),
    }),
    execute: async ({ origin, destination, date }) => {
      // In a real application, you would call a flight search API here
      return {
        flights: [
          {
            id: 'FL123',
            airline: 'Example Airlines',
            origin,
            destination,
            departureTime: `${date}T08:00:00`,
            arrivalTime: `${date}T11:30:00`,
            price: 299.99,
            currency: 'USD',
          },
          {
            id: 'FL456',
            airline: 'Sample Airways',
            origin,
            destination,
            departureTime: `${date}T14:15:00`,
            arrivalTime: `${date}T17:45:00`,
            price: 349.99,
            currency: 'USD',
          },
        ],
      };
    },
  });
  
  // Define a tool for getting flight details
  const getFlightDetails = tool({
    name: 'getFlightDetails',
    description: 'Get detailed information about a specific flight',
    parameters: z.object({
      flightId: z.string().describe('The ID of the flight'),
    }),
    execute: async ({ flightId }) => {
      // In a real application, you would call a flight details API here
      return {
        id: flightId,
        aircraft: 'Boeing 737-800',
        seatsAvailable: 42,
        amenities: ['Wi-Fi', 'Power outlets', 'In-flight entertainment'],
        baggageAllowance: {
          carryOn: '1 bag, up to 10kg',
          checked: '1 bag, up to 23kg',
        },
      };
    },
  });
  
  // Define a tool for booking a flight
  const bookFlight = tool({
    name: 'bookFlight',
    description: 'Book a flight for a passenger',
    parameters: z.object({
      flightId: z.string().describe('The ID of the flight to book'),
      passengerName: z.string().describe('The full name of the passenger'),
      passengerEmail: z.string().describe('The email address of the passenger'),
    }),
    execute: async ({ flightId, passengerName, passengerEmail }) => {
      // In a real application, you would call a booking API here
      return {
        bookingId: `BK-${Math.floor(Math.random() * 10000)}`,
        flightId,
        passengerName,
        passengerEmail,
        status: 'confirmed',
        bookingDate: new Date().toISOString(),
      };
    },
  });
  
  // Define a tool for sending a confirmation email
  const sendConfirmationEmail = tool({
    name: 'sendConfirmationEmail',
    description: 'Send a confirmation email for a booking',
    parameters: z.object({
      bookingId: z.string().describe('The ID of the booking'),
      recipientEmail: z.string().describe('The email address to send the confirmation to'),
    }),
    execute: async ({ bookingId, recipientEmail }) => {
      // In a real application, you would call an email API here
      return {
        emailId: `EM-${Math.floor(Math.random() * 10000)}`,
        recipientEmail,
        subject: 'Flight Booking Confirmation',
        sentAt: new Date().toISOString(),
        status: 'sent',
      };
    },
  });
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: [searchFlights, getFlightDetails, bookFlight, sendConfirmationEmail],
    maxSteps: 5, // Allow up to 5 sequential tool calls
  });
  
  return new Response(textStream);
}
\`\`\`

This implementation allows the AI to call tools in a sequence to complete a complex task, such as searching for flights, getting details about a specific flight, booking the flight, and sending a confirmation email. The `maxSteps` parameter ensures that the model can make multiple tool calls in sequence before generating a final text response to the user.
# Call Tools in Parallel

Some language models support calling tools in parallel. This is particularly useful when multiple tools are independent of each other and can be executed in parallel during the same generation step.

## Client

Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client. If the assistant responds with tool calls, the hook will automatically display them as well.

\`\`\`jsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
          
          {m.role === 'assistant' && m.toolCalls && m.toolCalls.length > 0 && (
            <div className="ml-4 mt-2 border-l-2 border-gray-300 pl-2">
              <strong>Tool Calls:</strong>
              {m.toolCalls.map((toolCall, i) => (
                <div key={i} className="mb-2 mt-1">
                  <div className="font-medium">{toolCall.name}</div>
                  <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto text-sm">
                    {JSON.stringify(toolCall.arguments, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
          
          {m.role === 'assistant' && m.toolResults && m.toolResults.length > 0 && (
            <div className="ml-4 mt-2 border-l-2 border-green-300 pl-2">
              <strong>Tool Results:</strong>
              {m.toolResults.map((toolResult, i) => (
                <div key={i} className="mb-2 mt-1">
                  <div className="font-medium">{toolResult.toolName}</div>
                  <pre className="bg-green-50 p-2 rounded mt-1 overflow-auto text-sm">
                    {JSON.stringify(toolResult.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/chat` that will generate the assistant's response based on the conversation history and stream it to the client. We'll define multiple tools that can be called in parallel.

\`\`\`typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Define a tool for getting the weather
  const getWeather = tool({
    name: 'getWeather',
    description: 'Get the current weather in a given location',
    parameters: z.object({
      location: z.string().describe('The city and state, e.g. San Francisco, CA'),
    }),
    execute: async ({ location }) => {
      // In a real application, you would call a weather API here
      return {
        temperature: 72,
        unit: 'fahrenheit',
        description: 'Sunny',
        location,
      };
    },
  });
  
  // Define a tool for getting the time
  const getTime = tool({
    name: 'getTime',
    description: 'Get the current time in a given timezone',
    parameters: z.object({
      timezone: z.string().describe('The timezone, e.g. America/New_York'),
    }),
    execute: async ({ timezone }) => {
      // In a real application, you would get the actual time for the timezone
      return {
        time: new Date().toLocaleTimeString('en-US', { timeZone: timezone }),
        timezone,
      };
    },
  });
  
  // Define a tool for currency conversion
  const convertCurrency = tool({
    name: 'convertCurrency',
    description: 'Convert an amount from one currency to another',
    parameters: z.object({
      amount: z.number().describe('The amount to convert'),
      from: z.string().describe('The currency to convert from, e.g. USD'),
      to: z.string().describe('The currency to convert to, e.g. EUR'),
    }),
    execute: async ({ amount, from, to }) => {
      // In a real application, you would call a currency conversion API here
      const rates = {
        USD: { EUR: 0.92, GBP: 0.79, JPY: 153.45 },
        EUR: { USD: 1.09, GBP: 0.86, JPY: 167.23 },
        GBP: { USD: 1.27, EUR: 1.16, JPY: 194.24 },
        JPY: { USD: 0.0065, EUR: 0.006, GBP: 0.0051 },
      };
      
      const rate = rates[from]?.[to] || 1;
      const convertedAmount = amount * rate;
      
      return {
        originalAmount: amount,
        originalCurrency: from,
        convertedAmount,
        convertedCurrency: to,
        rate,
      };
    },
  });
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: [getWeather, getTime, convertCurrency],
    maxSteps: 3, // Allow up to 3 parallel tool calls
  });
  
  return new Response(textStream);
}
\`\`\`

You will use the `maxSteps` to specify the maximum number of steps that the model can take when generating a response. This allows the model to make multiple tool calls in parallel during a single step, which can significantly improve response time when dealing with independent operations.

This implementation allows the AI to call multiple tools in parallel when needed, making the response generation more efficient when multiple pieces of information are required simultaneously.
# Chat with PDFs

Some language models like Anthropic's Claude Sonnet 3.5 and Google's Gemini 2.0 can understand PDFs and respond to questions about their contents. In this example, we'll show you how to build a chat interface that accepts PDF uploads.

This example requires a provider that supports PDFs, such as Anthropic's Claude 3.7, Google's Gemini 2.5, or OpenAI's GPT-4.1. Check the [provider documentation](https://ai-sdk.dev/docs/providers) for up-to-date support information.

## Implementation

## Server

Create a route handler that will use Anthropic's Claude model to process messages and PDFs:

\`\`\`typescript
// app/api/chat/route.ts
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, data } = await req.json();
  
  // The last message is the user's message
  const lastMessageIndex = messages.length - 1;
  
  // We create a new array of messages, where we modify the last message
  // to include the PDF if it exists
  const messagesWithPDF = messages.map((message, i) => {
    if (i === lastMessageIndex && message.role === 'user' && data?.pdfBase64) {
      return {
        ...message,
        content: [
          {
            type: 'text',
            text: message.content,
          },
          {
            type: 'file',
            file_data: {
              type: 'pdf',
              data: data.pdfBase64,
            },
          },
        ],
      };
    }
    return message;
  });

  const textStream = await streamText({
    model: anthropic('claude-3-sonnet-20240229'),
    messages: messagesWithPDF,
    temperature: 0.7,
    max_tokens: 1000,
  });

  return new Response(textStream);
}
\`\`\`

## Client

Now, let's create a React component that will allow the user to upload a PDF and chat with the AI about its contents:

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';
import { useState, useRef } from 'react';

export default function Chat() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfBase64, setPdfBase64] = useState('');
  const fileInputRef = useRef(null);
  
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: {
      pdfBase64: pdfBase64 || undefined,
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      
      // Convert PDF to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result.split(',')[1];
        setPdfBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPdf = () => {
    setPdfFile(null);
    setPdfBase64('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="mb-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="mb-2"
        />
        {pdfFile && (
          <div className="flex items-center">
            <span className="mr-2">
              PDF: {pdfFile.name} ({Math.round(pdfFile.size / 1024)} KB)
            </span>
            <button
              onClick={clearPdf}
              className="px-2 py-1 text-sm text-white bg-red-500 rounded"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md p-2 mb-8 bg-white border border-gray-300 rounded shadow-xl">
        <input
          className="w-full p-2 border border-gray-300 rounded"
          value={input}
          onChange={handleInputChange}
          placeholder={pdfFile ? "Ask about the PDF..." : "Upload a PDF first..."}
          disabled={!pdfFile}
        />
      </form>
    </div>
  );
}
\`\`\`

This implementation allows users to upload PDF documents and ask questions about their contents, with the AI model processing and responding to queries based on the PDF's information.
# Generate Image with Chat Prompt

When building a chatbot, you may want to allow the user to generate an image. This can be done by creating a tool that generates an image using the `experimental_generateImage` function from the AI SDK.

## Server

Let's create an endpoint at `/api/chat` that generates the assistant's response based on the conversation history. You will also define a tool called `generateImage` that will generate an image based on the assistant's response.

\`\`\`typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { experimental_generateImage, Message, streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(request: Request) {
  const { messages }: { messages: Message[] } = await request.json();

  // filter through messages and remove base64 image data to avoid token limits
  const formattedMessages = messages.map(m => {
    if (m.role === 'assistant' && m.toolResults) {
      return {
        ...m,
        toolResults: m.toolResults.map(tr => {
          if (tr.toolName === 'generateImage') {
            return {
              ...tr,
              result: 'base64 image data removed for token optimization',
            };
          }
          return tr;
        }),
      };
    }
    return m;
  });

  const generateImage = tool({
    name: 'generateImage',
    description: 'Generate an image based on a text prompt',
    parameters: z.object({
      prompt: z.string().describe('The prompt to generate an image from'),
    }),
    execute: async ({ prompt }) => {
      const { image } = await experimental_generateImage({
        model: openai('dall-e-3'),
        prompt,
      });

      return image;
    },
  });

  const textStream = await streamText({
    model: openai('gpt-4-vision-preview'),
    messages: formattedMessages,
    tools: [generateImage],
  });

  return new Response(textStream);
}
\`\`\`

## Client

Now, let's create a React component that will display a chat interface and allow the user to generate images.

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import Image from 'next/image';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const [imagePrompt, setImagePrompt] = useState('');

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
          {m.toolResults?.map((toolResult, i) => (
            <div key={i}>
              {toolResult.toolName === 'generateImage' && (
                <Image
                  src={`data:image/png;base64,${toolResult.result}`}
                  alt="Generated image"
                  width={512}
                  height={512}
                  style={{ marginTop: '1rem' }}
                />
              )}
            </div>
          ))}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something or ask for an image..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

With this implementation, users can ask the AI to generate images, and the AI will use the `generateImage` tool to create and display the requested images in the chat interface.
# Generate Object

Earlier functions like `generateText` and `streamText` gave us the ability to generate unstructured text. However, if you want to generate structured data like JSON, you can provide a schema that describes the structure of your desired object to the `generateObject` function.

The function requires you to provide a schema using [zod](https://zod.dev/), a library for defining schemas for JavaScript objects. By using zod, you can also use it to validate the generated object and ensure that it conforms to the specified structure.

## Client

Let's create a simple React component that will make a POST request to the `/api/completion` endpoint when a button is clicked. The endpoint will return the generated object based on the input prompt and we'll display it.

\`\`\`jsx
// app/page.tsx
'use client';

import { useState } from 'react';

export default function Page() {
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate Notification</h1>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        disabled={isLoading}
        onClick={async () => {
          setIsLoading(true);
          await fetch('/api/completion', {
            method: 'POST',
            body: JSON.stringify({
              prompt: 'Generate a notification about a new feature release',
            }),
          }).then(response => {
            response.json().then(json => {
              setNotification(json);
              setIsLoading(false);
            });
          });
        }}
      >
        {isLoading ? 'Generating...' : 'Generate Notification'}
      </button>
      
      {notification && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold">{notification.title}</h2>
          <p className="text-gray-700 mt-2">{notification.message}</p>
          <div className="mt-2 flex justify-between">
            <span className="text-sm text-gray-500">Priority: {notification.priority}</span>
            <span className="text-sm text-gray-500">Type: {notification.type}</span>
          </div>
          <div className="mt-4 flex gap-2">
            {notification.actions.map((action, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded text-sm ${
                  action.primary ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/completion` that will generate an object based on the input prompt. The route will call the `generateObject` function from the `ai` module, which will then generate an object based on the input prompt and return it.

\`\`\`typescript
// app/api/completion/route.ts
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  // Define the schema for the notification object
  const notificationSchema = z.object({
    title: z.string().describe('The title of the notification'),
    message: z.string().describe('The message body of the notification'),
    priority: z.enum(['low', 'medium', 'high']).describe('The priority level of the notification'),
    type: z.enum(['info', 'warning', 'error', 'success']).describe('The type of notification'),
    actions: z.array(
      z.object({
        label: z.string().describe('The label for the action button'),
        primary: z.boolean().describe('Whether this is the primary action'),
      })
    ).describe('The action buttons for the notification'),
  });
  
  const notification = await generateObject({
    model: openai('gpt-4-turbo', { structuredOutputs: true }),
    schema: notificationSchema,
    prompt,
    system: 'You are a helpful assistant that generates notification objects.',
  });
  
  return Response.json(notification);
}
\`\`\`

This implementation allows you to generate structured data objects that conform to a specified schema, making it easier to work with AI-generated content in a type-safe manner.
# Generate Object with File Prompt through Form Submission

This feature is limited to model providers that support PDF inputs (Anthropic, Google Gemini, and Google Vertex).

With select models, you can send PDFs (files) as part of your prompt. Let's create a simple Next.js application that allows a user to upload a PDF send it to an LLM for summarization.

## Client

On the frontend, create a form that allows the user to upload a PDF. When the form is submitted, send the PDF to the `/api/analyze` route.

\`\`\`jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze PDF');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF Analyzer</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block mb-2">Upload PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 w-full"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">What would you like to know about this document?</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full h-24"
            placeholder="E.g., Summarize the main points, Extract key information, etc."
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !file}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {isLoading ? 'Analyzing...' : 'Analyze PDF'}
        </button>
      </form>
      
      {result && (
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Analysis Results</h2>
          <div className="mb-4">
            <h3 className="font-medium">Summary</h3>
            <p>{result.summary}</p>
          </div>
          <div className="mb-4">
            <h3 className="font-medium">Key Points</h3>
            <ul className="list-disc pl-5">
              {result.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Document Type</h3>
            <p>{result.documentType}</p>
          </div>
        </div>
      )}
    </div>
  );
}
\`\`\`

## Server

Create a route handler that processes the uploaded PDF and uses the `generateObject` function to analyze it:

\`\`\`typescript
// app/api/analyze/route.ts
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;
    
    if (!file || !description) {
      return Response.json(
        { error: 'File and description are required' },
        { status: 400 }
      );
    }
    
    // Convert file to base64
    const fileBuffer = await file.arrayBuffer();
    const fileBase64 = Buffer.from(fileBuffer).toString('base64');
    
    // Define the schema for the analysis result
    const analysisSchema = z.object({
      summary: z.string().describe('A concise summary of the document'),
      keyPoints: z.array(z.string()).describe('List of key points from the document'),
      documentType: z.string().describe('The type of document (e.g., research paper, report, manual)'),
    });
    
    // Generate the analysis
    const analysis = await generateObject({
      model: anthropic('claude-3-sonnet-20240229'),
      schema: analysisSchema,
      prompt: [
        {
          type: 'text',
          text: `${description}. Please analyze the attached PDF document.`,
        },
        {
          type: 'file',
          file_data: {
            type: 'pdf',
            data: fileBase64,
          },
        },
      ],
      system: 'You are an expert document analyzer. Provide detailed and accurate analysis of PDF documents.',
    });
    
    return Response.json(analysis);
  } catch (error) {
    console.error('Error processing PDF:', error);
    return Response.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}
\`\`\`

This implementation allows users to upload PDF files and receive structured analysis results based on their specific queries about the document content.
# Generate Text

A situation may arise when you need to generate text based on a prompt. For example, you may want to generate a response to a question or summarize a body of text. The `generateText` function can be used to generate text based on the input prompt.

## Client

Let's create a simple React component that will make a POST request to the `/api/completion` endpoint when a button is clicked. The endpoint will generate text based on the input prompt.

\`\`\`jsx
import { useState } from 'react';

export default function Page() {
  const [generation, setGeneration] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div>
      <button
        onClick={async () => {
          setIsLoading(true);
          await fetch('/api/completion', {
            method: 'POST',
            body: JSON.stringify({
              prompt: 'Why is the sky blue?',
            }),
          }).then(response => {
            response.json().then(json => {
              setGeneration(json.text);
              setIsLoading(false);
            });
          });
        }}
      >
        Generate
      </button>
      <div>{isLoading ? 'Loading...' : generation}</div>
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/completion` that will generate text based on the input prompt. The route will call the `generateText` function from the `ai` module, which will then generate text based on the input prompt and return it.

app/api/completion/route.ts

\`\`\`typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();
  
  const { text } = await generateText({
    model: openai('gpt-4'),
    system: 'You are a helpful assistant.',
    prompt,
  });
  
  return Response.json({ text });
}
\`\`\`
# Generate Text with Chat Prompt

Previously, you were able to generate text and objects using either a single message prompt, a system prompt, or a combination of both of them. However, there may be times when you want to generate text based on a series of messages.

A chat completion allows you to generate text based on a series of messages. This series of messages can be any series of interactions between any number of systems, but the most popular and relatable use case has been a series of messages that represent a conversation between a user and a model.

## Client

Let's create a simple React component that will make a POST request to the `/api/completion` endpoint when a button is clicked. The endpoint will generate text based on the input prompt.

\`\`\`jsx
import { useState } from 'react';

export default function Page() {
  const [generation, setGeneration] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div>
      <button
        onClick={async () => {
          setIsLoading(true);
          await fetch('/api/completion', {
            method: 'POST',
            body: JSON.stringify({
              prompt: 'Why is the sky blue?',
            }),
          }).then(response => {
            response.json().then(json => {
              setGeneration(json.text);
              setIsLoading(false);
            });
          });
        }}
      >
        Generate
      </button>
      <div>{isLoading ? 'Loading...' : generation}</div>
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/completion` that will generate text based on the input prompt. The route will call the `generateText` function from the `ai` module, which will then generate text based on the input prompt and return it.

app/api/completion/route.ts

\`\`\`typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();
  
  const { text } = await generateText({
    model: openai('gpt-4'),
    system: 'You are a helpful assistant.',
    prompt,
  });
  
  return Response.json({ text });
}
\`\`\`
# Human-in-the-Loop with Next.js

When building agentic systems, it's important to add human-in-the-loop (HITL) functionality to ensure that users can approve actions before the system executes them. This recipe will describe how to build a low-level solution and then provide an example abstraction you could implement and customize based on your needs.

## Background

To understand how to implement this functionality, let's look at how tool calling works in a simple Next.js chatbot application with the AI SDK.

On the frontend, use the `useChat` hook to manage the message state and user interaction (including input and form submission handlers).

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8">
        <input
          className="w-full p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

On the backend, use the `streamText` function with tools to enable the model to call functions:

\`\`\`typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Define a tool for sending an email
  const sendEmail = tool({
    name: 'sendEmail',
    description: 'Send an email to a recipient',
    parameters: z.object({
      to: z.string().describe('The email address of the recipient'),
      subject: z.string().describe('The subject of the email'),
      body: z.string().describe('The body content of the email'),
    }),
    execute: async ({ to, subject, body }) => {
      // In a real application, you would call an email API here
      console.log(`Sending email to ${to} with subject "${subject}"`);
      
      // Simulate sending an email
      return {
        success: true,
        messageId: `email-${Date.now()}`,
        to,
        subject,
      };
    },
  });
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: [sendEmail],
  });
  
  return new Response(textStream);
}
\`\`\`

## Adding a Confirmation Step

To add human-in-the-loop functionality, we need to modify this flow to require user confirmation before executing tool calls. Here's how to implement this:

## Forward Tool Call To The Client

First, we need to modify the route handler to forward tool calls to the client instead of executing them immediately:

\`\`\`typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Define a tool for sending an email
  const sendEmail = tool({
    name: 'sendEmail',
    description: 'Send an email to a recipient',
    parameters: z.object({
      to: z.string().describe('The email address of the recipient'),
      subject: z.string().describe('The subject of the email'),
      body: z.string().describe('The body content of the email'),
    }),
    execute: async ({ to, subject, body }) => {
      // Instead of executing immediately, return a special response
      // that indicates this tool call needs confirmation
      return {
        __needsConfirmation: true,
        to,
        subject,
        body,
      };
    },
  });
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: [sendEmail],
  });
  
  return new Response(textStream);
}
\`\`\`

## Intercept Tool Call

Next, we need to modify the client to intercept tool calls that need confirmation:

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [pendingToolCall, setPendingToolCall] = useState(null);
  
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    onToolCall: async (toolCall) => {
      // Check if this tool call needs confirmation
      if (toolCall.result && toolCall.result.__needsConfirmation) {
        // Store the pending tool call
        setPendingToolCall(toolCall);
        
        // Return false to prevent automatic execution
        return false;
      }
      
      // For other tool calls, allow automatic execution
      return true;
    },
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
        </div>
      ))}
      
      {pendingToolCall && (
        <div className="border border-yellow-300 bg-yellow-50 p-4 rounded mb-4">
          <h3 className="font-bold">Confirm Action</h3>
          <p>The AI wants to send an email:</p>
          <ul className="list-disc pl-5 my-2">
            <li>To: {pendingToolCall.result.to}</li>
            <li>Subject: {pendingToolCall.result.subject}</li>
            <li>Body: {pendingToolCall.result.body}</li>
          </ul>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleConfirmation(true)}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Approve
            </button>
            <button
              onClick={() => handleConfirmation(false)}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8">
        <input
          className="w-full p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
          disabled={!!pendingToolCall}
        />
      </form>
    </div>
  );
}
\`\`\`

## Handle Confirmation Response

Finally, we need to handle the user's confirmation response:

\`\`\`jsx
// Add this function to the Chat component
const handleConfirmation = async (approved) => {
  if (!pendingToolCall) return;
  
  if (approved) {
    // Execute the tool call
    const response = await fetch('/api/execute-tool', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolName: pendingToolCall.name,
        arguments: pendingToolCall.result,
      }),
    });
    
    const result = await response.json();
    
    // Update the messages with the tool result
    setMessages((messages) => {
      const lastMessage = messages[messages.length - 1];
      
      return [
        ...messages.slice(0, -1),
        {
          ...lastMessage,
          toolResults: [
            ...(lastMessage.toolResults || []),
            {
              toolName: pendingToolCall.name,
              toolCallId: pendingToolCall.id,
              result,
            },
          ],
        },
      ];
    });
  } else {
    // Add a user message indicating rejection
    setMessages((messages) => [
      ...messages,
      {
        id: Date.now().toString(),
        role: 'user',
        content: 'I rejected the action.',
      },
    ]);
  }
  
  // Clear the pending tool call
  setPendingToolCall(null);
}
\`\`\`

And create a new API route to execute the tool:

\`\`\`typescript
// app/api/execute-tool/route.ts
import { z } from 'zod';

export async function POST(req: Request) {
  const { toolName, arguments: args } = await req.json();
  
  if (toolName === 'sendEmail') {
    // Remove the confirmation flag
    const { __needsConfirmation, ...emailArgs } = args;
    
    // In a real application, you would call an email API here
    console.log(`Sending email to ${emailArgs.to} with subject "${emailArgs.subject}"`);
    
    // Return the result
    return Response.json({
      success: true,
      messageId: `email-${Date.now()}`,
      to: emailArgs.to,
      subject: emailArgs.subject,
    });
  }
  
  return Response.json({
    error: 'Unknown tool',
  }, { status: 400 });
}
\`\`\`

## Building your own abstraction

The above implementation is quite low-level. Let's create a more reusable abstraction for human-in-the-loop functionality.

## Create Utility Functions

First, let's create some utility functions:

\`\`\`typescript
// lib/hitl.ts
import { z } from 'zod';
import { Tool } from 'ai';

// Type for tool definitions that require confirmation
export type ConfirmableTool<T extends z.ZodType> = {
  name: string;
  description: string;
  parameters: T;
  execute: (args: z.infer<T>) => Promise<any>;
  confirmationMessage?: (args: z.infer<T>) => string;
  requireConfirmation: boolean;
};

// Create a tool with confirmation capability
export function createConfirmableTool<T extends z.ZodType>({
  name,
  description,
  parameters,
  execute,
  confirmationMessage,
  requireConfirmation,
}: ConfirmableTool<T>): Tool {
  return {
    name,
    description,
    parameters,
    execute: async (args) => {
      if (requireConfirmation) {
        return {
          __needsConfirmation: true,
          __originalArgs: args,
          __confirmationMessage: confirmationMessage ? confirmationMessage(args) : null,
          ...args,
        };
      }
      
      return execute(args);
    },
  };
}

// Execute a confirmed tool
export async function executeConfirmedTool<T extends z.ZodType>(
  tool: ConfirmableTool<T>,
  args: any
) {
  // Remove the confirmation metadata
  const { __needsConfirmation, __originalArgs, __confirmationMessage, ...cleanArgs } = args;
  
  // Execute the tool with the original arguments
  return tool.execute(__originalArgs || cleanArgs);
}
\`\`\`

## Update Route Handler

Now, let's update our route handlers:

\`\`\`typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { createConfirmableTool } from '@/lib/hitl';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Define a tool for sending an email with confirmation
  const sendEmail = createConfirmableTool({
    name: 'sendEmail',
    description: 'Send an email to a recipient',
    parameters: z.object({
      to: z.string().describe('The email address of the recipient'),
      subject: z.string().describe('The subject of the email'),
      body: z.string().describe('The body content of the email'),
    }),
    execute: async ({ to, subject, body }) => {
      // In a real application, you would call an email API here
      console.log(`Sending email to ${to} with subject "${subject}"`);
      
      return {
        success: true,
        messageId: `email-${Date.now()}`,
        to,
        subject,
      };
    },
    confirmationMessage: ({ to, subject }) => 
      `Do you want to send an email to ${to} with subject "${subject}"?`,
    requireConfirmation: true,
  });
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: [sendEmail],
  });
  
  return new Response(textStream);
}

// app/api/execute-tool/route.ts
import { z } from 'zod';
import { executeConfirmedTool } from '@/lib/hitl';

// Define the tools (should be in a shared location in a real app)
const sendEmail = {
  name: 'sendEmail',
  description: 'Send an email to a recipient',
  parameters: z.object({
    to: z.string().describe('The email address of the recipient'),
    subject: z.string().describe('The subject of the email'),
    body: z.string().describe('The body content of the email'),
  }),
  execute: async ({ to, subject, body }) => {
    // In a real application, you would call an email API here
    console.log(`Sending email to ${to} with subject "${subject}"`);
    
    return {
      success: true,
      messageId: `email-${Date.now()}`,
      to,
      subject,
    };
  },
  requireConfirmation: true,
};

export async function POST(req: Request) {
  const { toolName, arguments: args } = await req.json();
  
  if (toolName === 'sendEmail') {
    const result = await executeConfirmedTool(sendEmail, args);
    return Response.json(result);
  }
  
  return Response.json({
    error: 'Unknown tool',
  }, { status: 400 });
}
\`\`\`

## Update Frontend

Finally, let's create a reusable component for handling confirmations:

\`\`\`jsx
// components/ConfirmationDialog.jsx
export default function ConfirmationDialog({ toolCall, onConfirm, onReject }) {
  if (!toolCall) return null;
  
  const { name, result } = toolCall;
  const confirmationMessage = result.__confirmationMessage || `Confirm ${name} action?`;
  
  return (
    <div className="border border-yellow-300 bg-yellow-50 p-4 rounded mb-4">
      <h3 className="font-bold">Confirm Action</h3>
      <p>{confirmationMessage}</p>
      
      <div className="mt-2 bg-white p-2 rounded border border-gray-200">
        <pre className="text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
      
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onConfirm(toolCall)}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Approve
        </button>
        <button
          onClick={() => onReject(toolCall)}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import ConfirmationDialog from '@/components/ConfirmationDialog';

export default function Chat() {
  const [pendingToolCall, setPendingToolCall] = useState(null);
  
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    onToolCall: async (toolCall) => {
      // Check if this tool call needs confirmation
      if (toolCall.result && toolCall.result.__needsConfirmation) {
        // Store the pending tool call
        setPendingToolCall(toolCall);
        
        // Return false to prevent automatic execution
        return false;
      }
      
      // For other tool calls, allow automatic execution
      return true;
    },
  });

  const handleConfirm = async (toolCall) => {
    // Execute the tool call
    const response = await fetch('/api/execute-tool', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toolName: toolCall.name,
        arguments: toolCall.result,
      }),
    });
    
    const result = await response.json();
    
    // Update the messages with the tool result
    setMessages((messages) => {
      const lastMessage = messages[messages.length - 1];
      
      return [
        ...messages.slice(0, -1),
        {
          ...lastMessage,
          toolResults: [
            ...(lastMessage.toolResults || []),
            {
              toolName: toolCall.name,
              toolCallId: toolCall.id,
              result,
            },
          ],
        },
      ];
    });
    
    // Clear the pending tool call
    setPendingToolCall(null);
  };

  const handleReject = () => {
    // Add a user message indicating rejection
    setMessages((messages) => [
      ...messages,
      {
        id: Date.now().toString(),
        role: 'user',
        content: 'I rejected the action.',
      },
    ]);
    
    // Clear the pending tool call
    setPendingToolCall(null);
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
        </div>
      ))}
      
      <ConfirmationDialog
        toolCall={pendingToolCall}
        onConfirm={handleConfirm}
        onReject={handleReject}
      />

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8">
        <input
          className="w-full p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
          disabled={!!pendingToolCall}
        />
      </form>
    </div>
  );
}
\`\`\`

## Full Example

This implementation provides a reusable abstraction for adding human-in-the-loop functionality to your AI applications. You can customize the confirmation UI, add different types of confirmable tools, and implement more complex confirmation flows based on your specific requirements.

The key components of this implementation are:

1. A way to mark tools as requiring confirmation
2. A mechanism to intercept tool calls on the client side
3. A UI for displaying confirmation dialogs
4. A way to execute confirmed tool calls
5. A way to handle rejected tool calls

By following this pattern, you can ensure that your AI applications always get user approval before taking potentially sensitive actions.
# Markdown Chatbot with Memoization

When building a chatbot with Next.js and the AI SDK, you'll likely want to render the model's responses in Markdown format using a library like `react-markdown`. However, this can have negative performance implications as the Markdown is re-rendered on each new token received from the streaming response.

As conversations get longer and more complex, this performance impact becomes exponentially worse since the entire conversation history is re-rendered with each new token.

This recipe uses memoization - a performance optimization technique where the results of expensive function calls are cached and reused to avoid unnecessary re-computation. In this case, parsed Markdown blocks are memoized to prevent them from being re-parsed and re-rendered on each token update, which means that once a block is fully parsed, it's cached and reused rather than being regenerated. This approach significantly improves rendering performance for long conversations by eliminating redundant parsing and rendering operations.

## Server

\`\`\`typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const textStream = await streamText({
    model: openai('gpt-4'),
    messages,
    temperature: 0.7,
  });
  
  return new Response(textStream);
}
\`\`\`

## Memoized Markdown Component

Create a memoized Markdown component that efficiently renders Markdown content:

\`\`\`tsx
// components/MemoizedMarkdown.tsx
'use client';

import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// This component will only re-render if the content prop changes
const MemoizedMarkdown = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  // Custom comparison function to determine if re-render is needed
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

MemoizedMarkdown.displayName = 'MemoizedMarkdown';

export default MemoizedMarkdown;
\`\`\`

## Client

Now, let's create a chat interface that uses the memoized Markdown component:

\`\`\`tsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import MemoizedMarkdown from '../components/MemoizedMarkdown';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Markdown Chat with Memoization</h1>
      
      <div className="flex-1 overflow-y-auto mb-4 border border-gray-300 rounded-md p-4 max-h-[70vh]">
        {messages.map((message, i) => (
          <div 
            key={i} 
            className={`mb-4 p-3 rounded-lg ${
              message.role === 'user' ? 'bg-blue-100 ml-auto max-w-md' : 'bg-gray-100 mr-auto max-w-md'
            }`}
          >
            <div className="font-bold mb-1">
              {message.role === 'user' ? 'You' : 'AI'}
            </div>
            <div className="prose prose-sm max-w-none">
              <MemoizedMarkdown content={message.content} />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
\`\`\`

This implementation significantly improves performance when rendering Markdown in streaming chat responses, especially for longer conversations, by avoiding redundant parsing and rendering operations.
# Model Context Protocol (MCP) Tools

The AI SDK supports Model Context Protocol (MCP) tools by offering a lightweight client that exposes a `tools` method for retrieving tools from a MCP server. After use, the client should always be closed to release resources.

## Server

Let's create a route handler for `/api/completion` that will generate text based on the input prompt and MCP tools that can be called at any time during a generation. The route will call the `streamText` function from the `ai` module, which will then generate text based on the input prompt and stream it to the client.

To use the `StreamableHTTPClientTransport`, you will need to install the official Typescript SDK for Model Context Protocol:

\`\`\`bash
$ pnpm install @modelcontextprotocol/sdk
\`\`\`

\`\`\`typescript
// app/api/completion/route.ts
import { experimental_createMCPClient, streamText } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  // Create an MCP client
  const client = experimental_createMCPClient({
    transport: new Experimental_StdioMCPTransport({
      pythonCommand: 'python',
      scriptPath: './mcp_server.py',
    }),
  });
  
  try {
    // Get the tools from the MCP server
    const tools = await client.tools();
    
    // Generate text with the tools
    const textStream = await streamText({
      model: {
        provider: 'anthropic',
        model: 'claude-3-opus-20240229',
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
      prompt,
      system: 'You are a helpful assistant with access to tools.',
      tools,
    });
    
    return new Response(textStream);
  } finally {
    // Always close the client to release resources
    await client.close();
  }
}
\`\`\`

You'll also need to create a Python script that implements the MCP server:

\`\`\`python
# mcp_server.py
import json
import sys
import time
from typing import Dict, List, Optional, Union

def read_message():
    """Read a message from stdin."""
    line = sys.stdin.readline()
    return json.loads(line)

def write_message(message):
    """Write a message to stdout."""
    sys.stdout.write(json.dumps(message) + "\n")
    sys.stdout.flush()

def get_weather(location: str) -> Dict:
    """Get the weather for a location."""
    # In a real application, you would call a weather API here
    return {
        "temperature": 72,
        "unit": "fahrenheit",
        "description": "Sunny",
        "location": location,
    }

def search_web(query: str) -> Dict:
    """Search the web for information."""
    # In a real application, you would call a search API here
    return {
        "results": [
            {
                "title": "Example search result 1",
                "url": "https://example.com/1",
                "snippet": "This is an example search result.",
            },
            {
                "title": "Example search result 2",
                "url": "https://example.com/2",
                "snippet": "This is another example search result.",
            },
        ],
        "query": query,
    }

# Define the tools
tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state, e.g. San Francisco, CA",
                },
            },
            "required": ["location"],
        },
    },
    {
        "name": "search_web",
        "description": "Search the web for information",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query",
                },
            },
            "required": ["query"],
        },
    },
]

# Main loop
while True:
    message = read_message()
    
    if message["type"] == "tools":
        write_message({
            "type": "tools",
            "tools": tools,
        })
    elif message["type"] == "execute":
        tool_name = message["name"]
        arguments = message["arguments"]
        
        if tool_name == "get_weather":
            result = get_weather(arguments["location"])
        elif tool_name == "search_web":
            result = search_web(arguments["query"])
        else:
            result = {"error": f"Unknown tool: {tool_name}"}
        
        write_message({
            "type": "result",
            "result": result,
        })
    elif message["type"] == "close":
        break
\`\`\`

## Client

On the client side, you can create a simple React component that will make a POST request to the `/api/completion` endpoint when a button is clicked. The endpoint will generate text based on the input prompt and any tool calls that the model makes.

\`\`\`jsx
'use client';

import { useState } from 'react';

export default function Page() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate response');
      }
      
      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const text = decoder.decode(value);
        result += text;
        setResponse(result);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred while generating the response.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MCP Tools Demo</h1>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <label htmlFor="prompt" className="block mb-1">
            Enter your prompt:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Try asking about the weather in a specific location or to search for information..."
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Generating...' : 'Generate Response'}
        </button>
      </form>
      
      {response && (
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Response:</h2>
          <div className="whitespace-pre-wrap">{response}</div>
        </div>
      )}
    </div>
  );
}
\`\`\`

This implementation allows you to use tools defined in a separate MCP server with your AI models, providing a flexible way to extend the capabilities of your AI applications.
# Render Visual Interface in Chat

An interesting consequence of language models that can call tools is that this ability can be used to render visual interfaces by streaming React components to the client.

## Client

Let's build an assistant that gets the weather for any city by calling the `getWeatherInformation` tool. Instead of returning text during the tool call, you will render a React component that displays the weather information on the client.

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

// Define a weather card component
function WeatherCard({ city, temperature, condition, humidity, windSpeed }) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg max-w-sm mx-auto my-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{city}</h2>
        <div className="text-3xl">
          {condition === 'Sunny' ? '☀️' : 
           condition === 'Cloudy' ? '☁️' : 
           condition === 'Rainy' ? '🌧️' : 
           condition === 'Snowy' ? '❄️' : '🌤️'}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-4xl font-bold">{temperature}°F</p>
        <p className="text-sm opacity-80">{condition}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="opacity-70">Humidity</p>
          <p className="font-semibold">{humidity}%</p>
        </div>
        <div>
          <p className="opacity-70">Wind</p>
          <p className="font-semibold">{windSpeed} mph</p>
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          
          {/* Render the message content */}
          {m.content}
          
          {/* Render any UI components from tool calls */}
          {m.role === 'assistant' && m.toolResults && m.toolResults.map((toolResult, i) => {
            if (toolResult.toolName === 'getWeatherInformation' && toolResult.result) {
              const weather = toolResult.result;
              return (
                <WeatherCard
                  key={i}
                  city={weather.city}
                  temperature={weather.temperature}
                  condition={weather.condition}
                  humidity={weather.humidity}
                  windSpeed={weather.windSpeed}
                />
              );
            }
            return null;
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8">
        <input
          className="w-full p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Ask about the weather in any city..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

## Server

Now, let's create a route handler for `/api/chat` that will handle the weather tool:

\`\`\`typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Define a tool for getting weather information
  const getWeatherInformation = tool({
    name: 'getWeatherInformation',
    description: 'Get current weather information for a city',
    parameters: z.object({
      city: z.string().describe('The name of the city to get weather for'),
    }),
    execute: async ({ city }) => {
      // In a real application, you would call a weather API here
      // This is mock data for demonstration purposes
      const weatherData = {
        city,
        temperature: Math.floor(Math.random() * 30) + 50, // Random temperature between 50-80°F
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 30, // Random humidity between 30-70%
        windSpeed: Math.floor(Math.random() * 15) + 5, // Random wind speed between 5-20 mph
      };
      
      return weatherData;
    },
  });
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: [getWeatherInformation],
    system: `You are a helpful weather assistant. When asked about the weather in a city, use the getWeatherInformation tool to fetch and display weather data.
    
After displaying the weather data, provide a brief natural language summary of the weather conditions.`,
  });
  
  return new Response(textStream);
}
\`\`\`

This implementation allows you to render rich, interactive UI components in response to user queries, creating a more engaging and informative chat experience. The weather card is just one example - you could create various specialized components for different types of information:

1. Charts and graphs for data visualization
2. Interactive maps for location-based queries
3. Product cards for e-commerce applications
4. Reservation forms for booking systems
5. Media players for audio/video content

By combining the power of language models with custom UI components, you can create chat interfaces that go beyond simple text responses and provide truly rich, interactive experiences.
# Send Custom Body from useChat

By default, `useChat` sends all messages as well as information from the request to the server. However, it is often desirable to control the body content that is sent to the server, e.g. to:

- only send the last message
- send additional data along with the message
- change the structure of the request body

The `experimental_prepareRequestBody` option allows you to customize the body content that is sent to the server. The function receives the message list, the request data, and the request body from the append call. It should return the body content that will be sent to the server.

> ⚠️ `experimental_prepareRequestBody` is an experimental feature and only available in React, Solid and Vue.

## Example

Let's create a chat interface that allows users to select a language for translation:

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export default function Chat() {
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    experimental_prepareRequestBody: (messages, data) => {
      // Return a custom body structure
      return {
        messages,
        targetLanguage,
        otherData: {
          timestamp: Date.now(),
          clientInfo: navigator.userAgent,
        },
      };
    },
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="mb-4">
        <label className="block mb-2">Translate to:</label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Italian">Italian</option>
          <option value="Japanese">Japanese</option>
        </select>
      </div>
      
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md mb-8">
        <input
          className="w-full p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something to translate..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

## Server

On the server side, we can access the custom body structure:

\`\`\`typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  // Parse the request body
  const body = await req.json();
  
  // Extract the custom fields
  const { messages, targetLanguage, otherData } = body;
  
  console.log('Target Language:', targetLanguage);
  console.log('Other Data:', otherData);
  
  // Create a system message that includes the target language
  const systemMessage = `You are a helpful assistant that translates text to ${targetLanguage}. Always respond in ${targetLanguage}, regardless of the input language.`;
  
  const textStream = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    system: systemMessage,
  });
  
  return new Response(textStream);
}
\`\`\`

This implementation allows you to send additional data along with the chat messages, which can be useful for customizing the behavior of your AI application based on user preferences or other contextual information.
# Stream Assistant Response

## Client

Let's create a simple chat interface that allows users to send messages to the assistant and receive responses. You will integrate the `useAssistant` hook from `@ai-sdk/react` to stream the messages and status.

\`\`\`jsx
// app/page.tsx
'use client';

import { Message, useAssistant } from 'ai/react';

export default function Page() {
  const { status, messages, input, submitMessage, handleInputChange } = useAssistant({ api: '/api/assistant' });

  return (
    <div className="flex flex-col gap-2">
      <div className="p-2">status: {status}</div>
      
      <div className="flex flex-col p-2 gap-2">
        {messages.map((message: Message) => (
          <div key={message.id} className={`flex flex-row gap-2 ${message.role === 'user' ? 'text-zinc-500' : 'w-full text-zinc-800'}`}>
            <div className="w-24">{message.role}</div>
            <div>{message.content}</div>
          </div>
        ))}
      </div>
      
      <form onSubmit={submitMessage} className="flex flex-row gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Say something..."
          className="flex-grow p-2 border border-gray-300 rounded"
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={status !== 'awaiting_message'}
        >
          Send
        </button>
      </form>
    </div>
  );
}
\`\`\`

## Server

Now, let's create a route handler for `/api/assistant` that will process the messages and generate responses using the OpenAI Assistant API:

\`\`\`typescript
// app/api/assistant/route.ts
import { StreamingTextResponse, AssistantResponse } from 'ai';
import { openai } from '@ai-sdk/openai';

// Create a new assistant or use an existing one
const assistant = openai.beta.assistants.retrieve('YOUR_ASSISTANT_ID');

// This is the route handler for the /api/assistant endpoint
export async function POST(req: Request) {
  // Parse the request body
  const { messages } = await req.json();

  // Create a thread if needed
  const threadId = req.headers.get('thread-id');
  const thread = threadId
    ? await openai.beta.threads.retrieve(threadId)
    : await openai.beta.threads.create();

  // Add a message to the thread
  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: messages[messages.length - 1].content,
  });

  // Run the assistant on the thread
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });

  // Create a response with the thread ID
  return AssistantResponse({ threadId: thread.id, runId: run.id }, { headers: { 'Content-Type': 'text/plain' } });
}
\`\`\`

This implementation allows you to create a chat interface that uses the OpenAI Assistant API to generate responses. The `useAssistant` hook handles the streaming of messages and status updates, providing a seamless user experience.

Key features of this implementation:

1. **Real-time streaming**: The assistant's responses are streamed in real-time, providing immediate feedback to the user.
2. **Status tracking**: The hook provides status updates (e.g., "awaiting_message", "in_progress") that can be used to update the UI accordingly.
3. **Thread management**: The implementation maintains conversation threads, allowing for contextual responses based on the conversation history.
4. **Seamless integration**: The `useAssistant` hook integrates smoothly with the OpenAI Assistant API, handling all the complexity of streaming and state management.

This approach is particularly useful when you want to leverage the capabilities of the OpenAI Assistant API, which includes features like retrieval, code interpretation, and function calling, all while providing a responsive and interactive user experience.
# Stream Assistant Response with Tools

Let's create a simple chat interface that allows users to send messages to the assistant and receive responses and give it the ability to use tools. You will integrate the `useAssistant` hook from `@ai-sdk/react` to stream the messages and status.

You will need to provide the list of tools on the OpenAI [Assistant Dashboard](https://platform.openai.com/assistants). You can use the following schema to create a tool to convert celsius to fahrenheit.

\`\`\`json
{
  "name": "celsiusToFahrenheit",
  "description": "convert celsius to fahrenheit.",
  "parameters": {
    "type": "object",
    "properties": {
      "value": {
        "type": "number",
        "description": "the value in celsius."
      }
    },
    "required": ["value"]
  }
}
\`\`\`

## Client

Let's create a chat interface that allows users to interact with an assistant that can convert temperatures:

\`\`\`jsx
// app/page.tsx
'use client';

import { Message, useAssistant } from 'ai/react';
import { useState } from 'react';

export default function Page() {
  const { status, messages, input, submitMessage, handleInputChange } = useAssistant({
    api: '/api/assistant',
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="mb-4 p-2 border rounded bg-gray-100">
        <p className="text-sm">Status: <span className="font-semibold">{status}</span></p>
      </div>
      
      {messages.map((message: Message) => (
        <div key={message.id} className="mb-4">
          <div className="font-semibold">
            {message.role === 'user' ? 'You:' : 'Assistant:'}
          </div>
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          {/* Display tool calls if any */}
          {message.role === 'assistant' && message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-2 border-l-2 border-blue-500 pl-2">
              <div className="text-sm text-gray-500">Tool Calls:</div>
              {message.toolCalls.map((toolCall) => (
                <div key={toolCall.id} className="mt-1 text-sm">
                  <div className="font-semibold">{toolCall.name}</div>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(toolCall.arguments, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
          
          {/* Display tool outputs if any */}
          {message.role === 'assistant' && message.toolResults && message.toolResults.length > 0 && (
            <div className="mt-2 border-l-2 border-green-500 pl-2">
              <div className="text-sm text-gray-500">Tool Results:</div>
              {message.toolResults.map((toolResult) => (
                <div key={toolResult.toolCallId} className="mt-1 text-sm">
                  <div className="font-semibold">{toolResult.toolName}</div>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(toolResult.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <form onSubmit={submitMessage} className="fixed bottom-0 w-full max-w-md mb-8">
        <input
          className="w-full p-2 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Ask about temperature conversion..."
          onChange={handleInputChange}
          disabled={status !== 'awaiting_message'}
        />
      </form>
    </div>
  );
}
\`\`\`

## Server

Now, let's create a route handler for `/api/assistant` that will process the messages and generate responses using the OpenAI Assistant API with tool support:

\`\`\`typescript
// app/api/assistant/route.ts
import { StreamingTextResponse, AssistantResponse } from 'ai';
import { openai } from '@ai-sdk/openai';

// Create a new assistant or use an existing one
// Make sure this assistant has the celsiusToFahrenheit tool configured in the OpenAI dashboard
const assistant = openai.beta.assistants.retrieve('YOUR_ASSISTANT_ID');

// This is the route handler for the /api/assistant endpoint
export async function POST(req: Request) {
  // Parse the request body
  const { messages, threadId: threadIdFromRequest } = await req.json();

  // Create a thread if needed
  const threadId = threadIdFromRequest || (await openai.beta.threads.create()).id;

  // Add a message to the thread
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: messages[messages.length - 1].content,
  });

  // Run the assistant on the thread
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistant.id,
  });

  // Create a response with the thread ID
  return AssistantResponse({ threadId, runId: run.id });
}

// This is the route handler for the /api/assistant/tool-callback endpoint
export async function POST(req: Request) {
  const { threadId, toolCallId, toolOutput } = await req.json();

  // Process the tool call and submit the output
  await openai.beta.threads.runs.submitToolOutputs(
    threadId,
    runId,
    {
      tool_outputs: [
        {
          tool_call_id: toolCallId,
          output: JSON.stringify(toolOutput),
        },
      ],
    }
  );

  return new Response('Tool output submitted', { status: 200 });
}
\`\`\`

For this example to work, you need to implement the actual tool functionality. Here's how you could implement the temperature conversion tool:

\`\`\`typescript
// lib/tools.ts
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

// app/api/assistant/tool/route.ts
import { celsiusToFahrenheit } from '@/lib/tools';

export async function POST(req: Request) {
  const { toolName, arguments: args } = await req.json();
  
  if (toolName === 'celsiusToFahrenheit') {
    const celsius = args.value;
    const fahrenheit = celsiusToFahrenheit(celsius);
    
    return Response.json({
      celsius,
      fahrenheit,
      formatted: `${celsius}°C is equal to ${fahrenheit.toFixed(1)}°F`
    });
  }
  
  return Response.json({ error: 'Unknown tool' }, { status: 400 });
}
\`\`\`

This implementation allows you to create a chat interface that uses the OpenAI Assistant API with tools to generate responses. The `useAssistant` hook handles the streaming of messages and status updates, providing a seamless user experience.

Key features of this implementation:

1. **Tool integration**: The assistant can call tools to perform specific tasks, such as converting temperatures.
2. **Real-time streaming**: The assistant's responses are streamed in real-time, providing immediate feedback to the user.
3. **Status tracking**: The hook provides status updates that can be used to update the UI accordingly.
4. **Thread management**: The implementation maintains conversation threads, allowing for contextual responses based on the conversation history.

This approach is particularly useful when you want to leverage the capabilities of the OpenAI Assistant API with tools, providing a responsive and interactive user experience with extended functionality beyond just text generation.
# Stream Object

Object generation can sometimes take a long time to complete, especially when you're generating a large schema. In such cases, it is useful to stream the object generation process to the client in real-time. This allows the client to display the generated object as it is being generated, rather than have users wait for it to complete before displaying the result.

## Object Mode

The `streamObject` function allows you to specify different output strategies using the `output` parameter. By default, the output mode is set to `object`, which will generate exactly the structured object that you specify in the schema option.

## Schema

It is helpful to set up the schema in a separate file that is imported on both the client and server.

\`\`\`typescript
// lib/schema.ts
import { z } from 'zod';

export const notificationSchema = z.object({
  title: z.string().describe('The title of the notification'),
  message: z.string().describe('The message body of the notification'),
  priority: z.enum(['low', 'medium', 'high']).describe('The priority level of the notification'),
  type: z.enum(['info', 'warning', 'error', 'success']).describe('The type of notification'),
  actions: z.array(
    z.object({
      label: z.string().describe('The label for the action button'),
      primary: z.boolean().describe('Whether this is the primary action'),
    })
  ).describe('The action buttons for the notification'),
});

export type Notification = z.infer<typeof notificationSchema>;
\`\`\`

## Client

Let's create a React component that will display the notification as it's being generated:

\`\`\`jsx
// app/page.tsx
'use client';

import { useState } from 'react';
import { useStreamObject } from 'ai/react';
import { Notification } from '@/lib/schema';

export default function Page() {
  const [prompt, setPrompt] = useState('Generate a notification about a new feature release');
  
  const { object, isLoading, error, stop } = useStreamObject<Notification>({
    api: '/api/stream-object',
    initialObject: {
      title: '',
      message: '',
      priority: 'medium',
      type: 'info',
      actions: [],
    },
    body: {
      prompt,
    },
  });

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Stream Notification Object</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter prompt..."
        />
      </div>
      
      <button
        onClick={() => useStreamObject.reload()}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 mr-2"
      >
        {isLoading ? 'Generating...' : 'Generate Notification'}
      </button>
      
      {isLoading && (
        <button
          onClick={stop}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stop
        </button>
      )}
      
      {error && (
        <div className="mt-4 p-2 text-red-500 border border-red-300 rounded bg-red-50">
          {error.message}
        </div>
      )}
      
      {object && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold">{object.title}</h2>
          <p className="text-gray-700 mt-2">{object.message}</p>
          <div className="mt-2 flex justify-between">
            <span className="text-sm text-gray-500">Priority: {object.priority}</span>
            <span className="text-sm text-gray-500">Type: {object.type}</span>
          </div>
          <div className="mt-4 flex gap-2">
            {object.actions.map((action, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded text-sm ${
                  action.primary ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
\`\`\`

## Server

Now, let's create a route handler for `/api/stream-object` that will stream the object generation process:

\`\`\`typescript
// app/api/stream-object/route.ts
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { notificationSchema } from '@/lib/schema';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const objectStream = await streamObject({
    model: openai('gpt-4-turbo', { structuredOutputs: true }),
    schema: notificationSchema,
    prompt,
    system: 'You are a helpful assistant that generates notification objects.',
  });
  
  return new Response(objectStream);
}
\`\`\`

## Loading State and Stopping the Stream

The `useStreamObject` hook provides an `isLoading` state and a `stop` function that allows you to control the streaming process. You can use these to show a loading indicator and provide a way for users to cancel the generation if it's taking too long.

## Array Mode

The `streamObject` function also supports an `array` output mode, which is useful when you want to generate a list of items that grows over time.

## Schema

\`\`\`typescript
// lib/schema.ts
import { z } from 'zod';

export const todoItemSchema = z.object({
  id: z.string().describe('A unique identifier for the todo item'),
  title: z.string().describe('The title of the todo item'),
  completed: z.boolean().describe('Whether the todo item is completed'),
  priority: z.enum(['low', 'medium', 'high']).describe('The priority of the todo item'),
});

export type TodoItem = z.infer<typeof todoItemSchema>;

export const todoListSchema = z.array(todoItemSchema);
\`\`\`

## Client

\`\`\`jsx
// app/page.tsx
'use client';

import { useState } from 'react';
import { useStreamObject } from 'ai/react';
import { TodoItem } from '@/lib/schema';

export default function Page() {
  const [prompt, setPrompt] = useState('Generate a list of todo items for a software developer');
  
  const { object: todoItems, isLoading, error, stop } = useStreamObject<TodoItem[]>({
    api: '/api/stream-array',
    initialObject: [],
    body: {
      prompt,
    },
  });

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Stream Todo List</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter prompt..."
        />
      </div>
      
      <button
        onClick={() => useStreamObject.reload()}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 mr-2"
      >
        {isLoading ? 'Generating...' : 'Generate Todo List'}
      </button>
      
      {isLoading && (
        <button
          onClick={stop}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stop
        </button>
      )}
      
      {error && (
        <div className="mt-4 p-2 text-red-500 border border-red-300 rounded bg-red-50">
          {error.message}
        </div>
      )}
      
      {todoItems && todoItems.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Todo Items ({todoItems.length})</h2>
          <ul className="border rounded divide-y">
            {todoItems.map((item) => (
              <li key={item.id} className="p-3 flex items-center justify-between">
                <div>
                  <span className={item.completed ? 'line-through text-gray-500' : ''}>
                    {item.title}
                  </span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    item.priority === 'high' ? 'bg-red-100 text-red-800' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={item.completed}
                  readOnly
                  className="h-5 w-5"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
\`\`\`

## Server

\`\`\`typescript
// app/api/stream-array/route.ts
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { todoListSchema } from '@/lib/schema';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const objectStream = await streamObject({
    model: openai('gpt-4-turbo', { structuredOutputs: true }),
    schema: todoListSchema,
    prompt,
    system: 'You are a helpful assistant that generates todo lists.',
    output: 'array',
  });
  
  return new Response(objectStream);
}
\`\`\`

## No Schema Mode

You can also use `streamObject` without a schema, which will stream the raw JSON output from the model.

## Client

\`\`\`jsx
// app/page.tsx
'use client';

import { useState } from 'react';
import { useStreamObject } from 'ai/react';

export default function Page() {
  const [prompt, setPrompt] = useState('Generate a JSON object with information about a random country');
  
  const { object, isLoading, error, stop } = useStreamObject({
    api: '/api/stream-raw',
    body: {
      prompt,
    },
  });

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Stream Raw JSON</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter prompt..."
        />
      </div>
      
      <button
        onClick={() => useStreamObject.reload()}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 mr-2"
      >
        {isLoading ? 'Generating...' : 'Generate JSON'}
      </button>
      
      {isLoading && (
        <button
          onClick={stop}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stop
        </button>
      )}
      
      {error && (
        <div className="mt-4 p-2 text-red-500 border border-red-300 rounded bg-red-50">
          {error.message}
        </div>
      )}
      
      {object && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Generated JSON</h2>
          <pre className="p-4 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(object, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
\`\`\`

## Server

\`\`\`typescript
// app/api/stream-raw/route.ts
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const objectStream = await streamObject({
    model: openai('gpt-4-turbo', { structuredOutputs: true }),
    prompt,
    system: 'You are a helpful assistant that generates JSON data.',
  });
  
  return new Response(objectStream);
}
\`\`\`
# Stream Text

Text generation can sometimes take a long time to complete, especially when you're generating a couple of paragraphs. In such cases, it is useful to stream the text generation process to the client in real-time. This allows the client to display the generated text as it is being generated, rather than have users wait for it to complete before displaying the result.

## Client

Let's create a simple React component that imports the `useCompletion` hook from the `@ai-sdk/react` module. The `useCompletion` hook will call the `/api/completion` endpoint when a button is clicked. The endpoint will generate text based on the input prompt and stream it to the client.

\`\`\`jsx
'use client';

import { useCompletion } from 'ai/react';

export default function Page() {
  const { completion, input, handleInputChange, handleSubmit, isLoading } = useCompletion();

  return (
    <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
      <form onSubmit={handleSubmit} className="flex mb-4">
        <input
          className="border border-gray-300 rounded-l p-2 flex-1"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question"
        />
        <button
          className="bg-blue-500 text-white rounded-r px-4"
          type="submit"
          disabled={isLoading}
        >
          Generate
        </button>
      </form>
      <div className="whitespace-pre-wrap">
        {completion}
      </div>
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/completion` that will generate text based on the input prompt and stream it to the client.

\`\`\`typescript
// app/api/completion/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const textStream = await streamText({
    model: openai('gpt-4'),
    system: 'You are a helpful assistant.',
    prompt,
  });
  
  return new Response(textStream);
}
\`\`\`

This implementation allows for real-time text streaming, providing a more responsive user experience compared to waiting for the entire generation to complete before displaying anything.
# Stream Text Multi-Step

You may want to have different steps in your stream where each step has different settings, e.g. models, tools, or system prompts.

With `createDataStreamResponse` and `sendFinish` / `sendStart` options when merging into the data stream, you can control when the finish and start events are sent to the client, allowing you to have different steps in a single assistant UI message.

## Server

\`\`\`typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { createDataStreamResponse, streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: async dataStream => {
      // step 1 example: forced tool call
      const result1 = await streamText({
        model: openai('gpt-4o-mini', { structuredOutputs: true }),
        system: 'Extract the user goal from the conversation.',
        messages,
        tools: [
          tool({
            name: 'extractGoal',
            description: 'Extract the user goal from the conversation',
            parameters: z.object({
              goal: z.string().describe('The user goal'),
            }),
          }),
        ],
        forceToolCall: 'extractGoal',
      });

      await dataStream.append(result1);
      await dataStream.sendFinish();

      // step 2 example: different model and system prompt
      const result2 = await streamText({
        model: openai('gpt-4o'),
        system: 'You are a helpful assistant. Use the extracted goal to provide a helpful response.',
        messages: [
          ...messages,
          {
            role: 'assistant',
            content: 'I understand your goal. Let me help you with that.',
          },
        ],
      });

      await dataStream.sendStart();
      await dataStream.append(result2);
    },
  });
}
\`\`\`

## Client

Now, let's create a React component that will display the chat interface:

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

This implementation allows for multi-step processing in a single assistant response, enabling more complex interactions while maintaining a seamless user experience.
# Stream Text with Chat Prompt

Chat completion can sometimes take a long time to finish, especially when the response is big. In such cases, it is useful to stream the chat completion to the client in real-time. This allows the client to display the new message as it is being generated by the model, rather than have users wait for it to finish.

## Client

Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client.

\`\`\`jsx
'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
\`\`\`

## Server

Let's create a route handler for `/api/chat` that will generate the assistant's response based on the conversation history and stream it to the client.

\`\`\`typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const textStream = await streamText({
    model: openai('gpt-4'),
    messages,
  });
  
  return new Response(textStream);
}
\`\`\`

This implementation allows for real-time streaming of chat responses, providing a more responsive user experience compared to waiting for the entire response to complete before displaying anything.
# Stream Text with Image Prompt

Vision models such as GPT-4 can process both text and images. In this example, we will show you how to send an image URL along with the user's message to the model.

## Using Image URLs

## Server

We split the user's message into two parts: the text and the image URL. We then send both parts to the model. The last message is the user's message, and we add the image URL to it.

\`\`\`typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  // 'data' contains the additional data that you have sent:
  const { messages, data } = await req.json();

  // The last message is the user's message
  const lastMessageIndex = messages.length - 1;
  
  // We create a new array of messages, where we modify the last message
  // to include the image URL
  const messagesWithImage = messages.map((message, i) => {
    if (i === lastMessageIndex && message.role === 'user') {
      return {
        ...message,
        content: [
          {
            type: 'text',
            text: message.content,
          },
          {
            type: 'image_url',
            image_url: {
              url: data.imageUrl,
            },
          },
        ],
      };
    }
    return message;
  });

  const textStream = await streamText({
    model: openai('gpt-4-vision-preview'),
    messages: messagesWithImage,
    temperature: 0.7,
    max_tokens: 500,
  });

  return new Response(textStream);
}
\`\`\`

## Client

Now, let's create a React component that will allow the user to enter a message and an image URL, and then send both to the server.

\`\`\`jsx
// app/page.tsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';
import Image from 'next/image';

export default function Chat() {
  const [imageUrl, setImageUrl] = useState('');
  
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: {
      imageUrl,
    },
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m, index) => (
        <div
          key={index}
          className="whitespace-pre-wrap"
          style={{ marginBottom: '1rem' }}
        >
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
          {m.role === 'user' && imageUrl && index === messages.length - 1 && (
            <div>
              <Image
                src={imageUrl}
                alt="User provided image"
                width={300}
                height={300}
                style={{ objectFit: 'contain', marginTop: '0.5rem' }}
              />
            </div>
          )}
        </div>
      ))}

      <div className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl">
        <input
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL..."
        />
        <form onSubmit={handleSubmit}>
          <input
            className="w-full p-2 border border-gray-300 rounded"
            value={input}
            onChange={handleInputChange}
            placeholder="Say something about the image..."
          />
        </form>
      </div>
    </div>
  );
}
\`\`\`

This implementation allows users to provide both text and image inputs, enabling the AI to analyze and respond to visual content alongside textual queries.
\n\n## Node.js Recipes\n\n
# Call Tools in Multiple Steps

Models call tools to gather information or perform actions that are not directly available to the model. When tool results are available, the model can use them to generate another response.

You can enable multi-step tool calls in `generateText` by setting the `maxSteps` option to a number greater than 1. This option specifies the maximum number of steps (i.e., LLM calls) that can be made to prevent infinite loops.

\`\`\`javascript
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const { text } = await generateText({
  model: openai('gpt-4-turbo'),
  maxSteps: 5,
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }: { location: string }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
  },
  prompt: 'What is the weather in San Francisco?',
});

console.log(text);
\`\`\`

In this example, the model can call the `weather` tool to get the current temperature in San Francisco. The `maxSteps` option is set to 5, which means the model can make up to 5 LLM calls to complete the task.

The model might decide to call the `weather` tool multiple times for different locations or to refine its response based on the tool results.

## Multi-step tool calls with conversation history

You can also use multi-step tool calls with conversation history:

\`\`\`javascript
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const { text } = await generateText({
  model: openai('gpt-4-turbo'),
  maxSteps: 3,
  tools: {
    search: tool({
      description: 'Search for information on a topic',
      parameters: z.object({
        query: z.string().describe('The search query'),
      }),
      execute: async ({ query }: { query: string }) => {
        // In a real application, this would call a search API
        return {
          results: [
            { title: 'Paris - Wikipedia', snippet: 'Paris is the capital of France...' },
            { title: 'Visit Paris - Official Website', snippet: 'Plan your trip to Paris...' },
          ],
        };
      },
    }),
    weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }: { location: string }) => ({
        location,
        temperature: 22,
        conditions: 'Partly cloudy',
      }),
    }),
  },
  messages: [
    { role: 'user', content: 'I want to visit Paris next week. What should I know?' },
  ],
});

console.log(text);
\`\`\`

In this example, the model might first call the `search` tool to get information about Paris, and then call the `weather` tool to get the current weather in Paris, before generating a final response that incorporates both pieces of information.

## Handling complex multi-step workflows

For more complex workflows, you can use multiple tools and higher `maxSteps` values:

\`\`\`javascript
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const { text } = await generateText({
  model: openai('gpt-4-turbo'),
  maxSteps: 10,
  tools: {
    search: tool({
      description: 'Search for information on a topic',
      parameters: z.object({
        query: z.string().describe('The search query'),
      }),
      execute: async ({ query }: { query: string }) => {
        // Simulate search results
        return {
          results: [
            { title: 'Result 1', snippet: 'Information about ' + query },
            { title: 'Result 2', snippet: 'More details about ' + query },
          ],
        };
      },
    }),
    getRestaurants: tool({
      description: 'Get restaurants in a location',
      parameters: z.object({
        location: z.string().describe('The location to search for restaurants'),
        cuisine: z.string().optional().describe('The type of cuisine'),
      }),
      execute: async ({ location, cuisine }: { location: string; cuisine?: string }) => {
        // Simulate restaurant data
        return {
          restaurants: [
            { name: 'Restaurant A', cuisine: cuisine || 'Various', rating: 4.5 },
            { name: 'Restaurant B', cuisine: cuisine || 'Various', rating: 4.2 },
          ],
        };
      },
    }),
    getHotels: tool({
      description: 'Get hotels in a location',
      parameters: z.object({
        location: z.string().describe('The location to search for hotels'),
        checkIn: z.string().optional().describe('Check-in date (YYYY-MM-DD)'),
        checkOut: z.string().optional().describe('Check-out date (YYYY-MM-DD)'),
      }),
      execute: async ({ location, checkIn, checkOut }: { location: string; checkIn?: string; checkOut?: string }) => {
        // Simulate hotel data
        return {
          hotels: [
            { name: 'Hotel X', stars: 4, price: '$150/night' },
            { name: 'Hotel Y', stars: 5, price: '$250/night' },
          ],
        };
      },
    }),
  },
  messages: [
    { role: 'user', content: 'I\'m planning a trip to Tokyo next month. Can you help me find information about the city, good restaurants, and hotels?' },
  ],
});

console.log(text);
\`\`\`

In this example, the model might make multiple tool calls in sequence:
1. First, call the `search` tool to get general information about Tokyo
2. Then, call the `getRestaurants` tool to find restaurants in Tokyo
3. Finally, call the `getHotels` tool to find hotels in Tokyo

The model will then generate a comprehensive response that incorporates all the information it gathered from these tool calls.

Multi-step tool calls are particularly useful for:
- Complex information gathering tasks
- Tasks that require multiple sources of information
- Interactive assistants that need to respond to follow-up questions
- Workflows that involve sequential operations
# Embed Text

Text embeddings are numerical representations of text that capture semantic meaning, allowing machines to understand and process language in a mathematical way. These vector representations are crucial for many AI applications, as they enable tasks like semantic search, document similarity comparison, and content recommendation.

This example demonstrates how to convert text into embeddings using a text embedding model. The resulting embedding is a high-dimensional vector that represents the semantic meaning of the input text. For a more practical application of embeddings, check out our RAG example which shows how embeddings can be used for document retrieval.

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import 'dotenv/config';

async function main() {
  const { embedding, usage } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: 'sunny day at the beach',
  });

  console.log(embedding);
  console.log(usage);
}

main().catch(console.error);
\`\`\`

## Understanding Text Embeddings

Text embeddings convert words, phrases, or documents into numerical vectors in a high-dimensional space. In this space, semantically similar texts are positioned closer together, allowing for mathematical operations on language.

For example, the embedding for "sunny day at the beach" would be positioned closer to "warm afternoon by the ocean" than to "cold night in the mountains" in the embedding space.

## Use Cases for Text Embeddings

Text embeddings enable a wide range of applications:

1. **Semantic Search**: Find documents based on meaning rather than keyword matching
2. **Document Clustering**: Group similar documents together
3. **Content Recommendation**: Suggest related content based on similarity
4. **Text Classification**: Categorize text based on its content
5. **Anomaly Detection**: Identify outliers in text data
6. **Retrieval Augmented Generation (RAG)**: Enhance LLM responses with relevant information

## Working with Different Embedding Models

The AI SDK supports various embedding models from different providers. Here's how you can use them:

### OpenAI Embeddings

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

const { embedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'The quick brown fox jumps over the lazy dog',
});
\`\`\`

### Cohere Embeddings

\`\`\`javascript
import { cohere } from '@ai-sdk/cohere';
import { embed } from 'ai';

const { embedding } = await embed({
  model: cohere.embedding('embed-english-v3.0'),
  value: 'The quick brown fox jumps over the lazy dog',
});
\`\`\`

### Mistral Embeddings

\`\`\`javascript
import { mistral } from '@ai-sdk/mistral';
import { embed } from 'ai';

const { embedding } = await embed({
  model: mistral.embedding('mistral-embed'),
  value: 'The quick brown fox jumps over the lazy dog',
});
\`\`\`

## Embedding Multiple Texts

For embedding a single text, use the `embed` function. If you need to embed multiple texts efficiently, see the "Embed Text in Batch" recipe.

## Tracking Token Usage

The `embed` function returns both the embedding and usage information:

\`\`\`javascript
const { embedding, usage } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'This is a sample text to embed',
});

console.log('Token usage:', usage);
\`\`\`

The `usage` object typically includes:
- `promptTokens`: The number of tokens in the input text
- `totalTokens`: The total number of tokens used

## Storing and Using Embeddings

Once you have generated embeddings, you can store them in a vector database for efficient similarity search:

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import { ChromaClient } from 'chromadb';

async function storeEmbeddings() {
  // Initialize Chroma client
  const client = new ChromaClient();
  const collection = await client.createCollection({
    name: "documents",
  });

  // Generate embedding
  const text = "Important information about AI development";
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });

  // Store document with its embedding
  await collection.add({
    ids: ["doc1"],
    embeddings: [embedding],
    metadatas: [{ source: "article", date: new Date().toISOString() }],
    documents: [text],
  });
}
\`\`\`

## Comparing Text Similarity

You can use embeddings to compare the similarity between texts:

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

async function compareSimilarity(text1, text2) {
  // Generate embeddings for both texts
  const { embedding: embedding1 } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text1,
  });

  const { embedding: embedding2 } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text2,
  });

  // Calculate cosine similarity
  const similarity = cosineSimilarity(embedding1, embedding2);
  return similarity;
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (mag1 * mag2);
}

// Example usage
compareSimilarity(
  "I love hiking in the mountains",
  "Mountain trekking is my favorite hobby"
).then(similarity => {
  console.log(`Similarity score: ${similarity}`);
});
\`\`\`

Text embeddings are a powerful tool for working with language data in a mathematical way, enabling a wide range of applications in natural language processing and AI.
# Embed Text in Batch

When working with large datasets or multiple pieces of text, processing embeddings one at a time can be inefficient. Batch embedding allows you to convert multiple text inputs into embeddings simultaneously, significantly improving performance and reducing API calls. This is particularly useful when processing documents, chat messages, or any collection of text that needs to be vectorized.

This example shows how to embed multiple text inputs in a single operation using the AI SDK. For single text embedding, see our Embed Text example, or for a practical application, check out our RAG example which demonstrates how batch embeddings can be used in a document retrieval system.

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import 'dotenv/config';

async function main() {
  const { embeddings, usage } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: [
      'sunny day at the beach',
      'rainy afternoon in the city',
      'snowy night in the mountains',
    ],
  });

  console.log(embeddings);
  console.log(usage);
}

main().catch(console.error);
\`\`\`

## Benefits of Batch Embedding

Batch embedding offers several advantages over processing texts one at a time:

1. **Reduced API Calls**: Instead of making separate API calls for each text, you make a single call for multiple texts.
2. **Improved Performance**: Processing multiple texts in a single request is more efficient and faster.
3. **Cost Efficiency**: Many embedding providers charge per API call, so reducing the number of calls can lower costs.
4. **Simplified Code**: Batch processing can make your code cleaner when working with collections of text.

## Working with Different Embedding Models

The AI SDK supports batch embedding with various providers:

### OpenAI Batch Embeddings

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';

const { embeddings } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: [
    'The quick brown fox jumps over the lazy dog',
    'The early bird catches the worm',
    'Actions speak louder than words',
  ],
});
\`\`\`

### Cohere Batch Embeddings

\`\`\`javascript
import { cohere } from '@ai-sdk/cohere';
import { embedMany } from 'ai';

const { embeddings } = await embedMany({
  model: cohere.embedding('embed-english-v3.0'),
  values: [
    'The quick brown fox jumps over the lazy dog',
    'The early bird catches the worm',
    'Actions speak louder than words',
  ],
});
\`\`\`

### Mistral Batch Embeddings

\`\`\`javascript
import { mistral } from '@ai-sdk/mistral';
import { embedMany } from 'ai';

const { embeddings } = await embedMany({
  model: mistral.embedding('mistral-embed'),
  values: [
    'The quick brown fox jumps over the lazy dog',
    'The early bird catches the worm',
    'Actions speak louder than words',
  ],
});
\`\`\`

## Tracking Token Usage

The `embedMany` function returns both the embeddings and usage information:

\`\`\`javascript
const { embeddings, usage } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: [
    'First text to embed',
    'Second text to embed',
    'Third text to embed',
  ],
});

console.log('Token usage:', usage);
\`\`\`

The `usage` object typically includes:
- `promptTokens`: The total number of tokens in all input texts
- `totalTokens`: The total number of tokens used

## Storing Batch Embeddings in a Vector Database

You can efficiently store batch embeddings in a vector database for similarity search:

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import { ChromaClient } from 'chromadb';

async function storeBatchEmbeddings() {
  // Initialize Chroma client
  const client = new ChromaClient();
  const collection = await client.createCollection({
    name: "documents",
  });

  // Sample documents
  const documents = [
    "AI is transforming how we interact with technology",
    "Machine learning algorithms improve with more data",
    "Natural language processing enables human-like text generation",
    "Computer vision systems can identify objects in images",
  ];

  // Generate embeddings for all documents in a single call
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: documents,
  });

  // Prepare IDs and metadata
  const ids = documents.map((_, i) => `doc${i + 1}`);
  const metadatas = documents.map((_, i) => ({ 
    source: "article", 
    index: i,
    date: new Date().toISOString() 
  }));

  // Store documents with their embeddings
  await collection.add({
    ids: ids,
    embeddings: embeddings,
    metadatas: metadatas,
    documents: documents,
  });
}
\`\`\`

## Processing Large Datasets

When working with very large datasets, you might need to process embeddings in chunks to avoid hitting API limits:

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import fs from 'fs';

async function processLargeDataset(filePath, chunkSize = 100) {
  // Read data from file
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const texts = data.map(item => item.text);
  
  // Process in chunks
  const allEmbeddings = [];
  
  for (let i = 0; i < texts.length; i += chunkSize) {
    const chunk = texts.slice(i, i + chunkSize);
    console.log(`Processing chunk ${i/chunkSize + 1} of ${Math.ceil(texts.length/chunkSize)}`);
    
    const { embeddings } = await embedMany({
      model: openai.embedding('text-embedding-3-small'),
      values: chunk,
    });
    
    allEmbeddings.push(...embeddings);
    
    // Optional: Add a small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return allEmbeddings;
}
\`\`\`

## Comparing Multiple Texts for Similarity

You can use batch embeddings to efficiently compare multiple texts for similarity:

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';

async function findSimilarTexts(query, candidates) {
  // Get embeddings for query and all candidates in one batch
  const allTexts = [query, ...candidates];
  
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: allTexts,
  });
  
  // Extract query embedding and candidate embeddings
  const queryEmbedding = embeddings[0];
  const candidateEmbeddings = embeddings.slice(1);
  
  // Calculate similarity scores
  const similarities = candidateEmbeddings.map((embedding, index) => {
    const similarity = cosineSimilarity(queryEmbedding, embedding);
    return {
      text: candidates[index],
      similarity,
    };
  });
  
  // Sort by similarity (highest first)
  return similarities.sort((a, b) => b.similarity - a.similarity);
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (mag1 * mag2);
}

// Example usage
const query = "How do neural networks work?";
const candidates = [
  "Neural networks are computational systems inspired by the human brain.",
  "Machine learning algorithms improve with more training data.",
  "Deep learning is a subset of machine learning using neural networks.",
  "Blockchain technology enables secure, decentralized transactions.",
];

findSimilarTexts(query, candidates).then(results => {
  console.log("Results ranked by similarity to query:");
  results.forEach((result, i) => {
    console.log(`${i+1}. ${result.text} (Score: ${result.similarity.toFixed(4)})`);
  });
});
\`\`\`

Batch embedding is a powerful technique for efficiently processing multiple texts, making it an essential tool for building applications that work with large text datasets.
# Generate Object

Earlier functions like `generateText` and `streamText` gave us the ability to generate unstructured text. However, if you want to generate structured data like JSON, you can provide a schema that describes the structure of your desired object to the `generateObject` function.

The function requires you to provide a schema using [zod](https://github.com/colinhacks/zod), a library for defining schemas for JavaScript objects. By using zod, you can also use it to validate the generated object and ensure that it conforms to the specified structure.

\`\`\`javascript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.string(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

console.log(JSON.stringify(result.object, null, 2));
\`\`\`

In this example, we're using the `generateObject` function to generate a structured recipe object. The function takes three parameters:

- `model`: The language model to use for generation.
- `schema`: A Zod schema that defines the structure of the output object.
- `prompt`: The input prompt that the model will use to generate the object.

The function returns a promise that resolves to an object containing the generated object. You can access the object using the `object` property of the result.

You can also use the `messages` parameter instead of `prompt` to provide a conversation history:

\`\`\`javascript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    analysis: z.object({
      sentiment: z.enum(['positive', 'neutral', 'negative']),
      topics: z.array(z.string()),
      summary: z.string(),
      keyPoints: z.array(z.string()),
    }),
  }),
  messages: [
    {
      role: 'user',
      content: 'Analyze the sentiment and topics in this customer feedback: "I love your product, but the customer service could be better. The interface is intuitive and the features are great, though I wish there were more customization options."',
    },
  ],
});

console.log(JSON.stringify(result.object, null, 2));
\`\`\`

You can create complex nested schemas to match your specific needs:

\`\`\`javascript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const result = await generateObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    movie: z.object({
      title: z.string(),
      year: z.number(),
      director: z.string(),
      actors: z.array(
        z.object({
          name: z.string(),
          role: z.string(),
        })
      ),
      genres: z.array(z.string()),
      ratings: z.object({
        imdb: z.number().min(0).max(10),
        rottenTomatoes: z.number().min(0).max(100),
        metacritic: z.number().min(0).max(100),
      }),
      plot: z.string(),
    }),
  }),
  prompt: 'Generate information about the movie "The Shawshank Redemption".',
});

console.log(JSON.stringify(result.object, null, 2));
\`\`\`

The `generateObject` function is particularly useful for applications that require structured data, such as:

- APIs that need to return JSON responses
- Data extraction and transformation
- Form validation and processing
- Database operations
- Configuration generation

By using the `generateObject` function with a well-defined schema, you can ensure that the generated data always conforms to your expected structure, making it easier to work with in your application.
# Generate Object with a Reasoning Model

Reasoning models, like [DeepSeek's](https://deepseek.ai/) R1, are gaining popularity due to their ability to understand and generate better responses to complex queries than non-reasoning models. You may want to use these models to generate structured data. However, most (like R1 and [OpenAI's](https://openai.com/) o1) do not support tool-calling or structured outputs.

One solution is to pass the output from a reasoning model through a smaller model that can output structured data (like gpt-4o-mini). These lightweight models can efficiently extract the structured data while adding very little overhead in terms of speed and cost.

\`\`\`javascript
import { deepseek } from '@ai-sdk/deepseek';
import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import 'dotenv/config';
import { z } from 'zod';

async function main() {
  const { text: rawOutput } = await generateText({
    model: deepseek('deepseek-reasoner'),
    prompt:
      'Predict the top 3 largest city by 2050. For each, return the city name, country, predicted population in millions, and a brief explanation of why it will grow.',
  });

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    prompt: rawOutput,
    schema: z.array(
      z.object({
        city: z.string(),
        country: z.string(),
        populationInMillions: z.number(),
        explanation: z.string(),
      })
    ),
  });

  console.log(JSON.stringify(object, null, 2));
}

main().catch(console.error);
\`\`\`

In this example, we're using a two-step process:

1. First, we use the `generateText` function with a reasoning model (DeepSeek Reasoner) to generate a detailed response about future city populations.
2. Then, we use the `generateObject` function with a smaller model (GPT-4o-mini) to extract structured data from the reasoning model's output.

The `generateObject` function takes three parameters:
- `model`: The language model to use for extracting structured data.
- `prompt`: The text to extract structured data from (in this case, the output from the reasoning model).
- `schema`: A Zod schema that defines the structure of the output object.

The function returns a promise that resolves to an object containing the extracted structured data.

You can also use this approach with other reasoning models:

\`\`\`javascript
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

async function analyzeCompanies() {
  const { text: analysis } = await generateText({
    model: anthropic('claude-3-opus-20240229'),
    system: "You are a financial analyst with expertise in technology companies.",
    messages: [
      {
        role: 'user',
        content: 'Analyze the top 3 AI companies and their competitive advantages.',
      },
    ],
  });

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    prompt: analysis,
    schema: z.array(
      z.object({
        companyName: z.string(),
        marketCap: z.string(),
        keyProducts: z.array(z.string()),
        competitiveAdvantages: z.array(z.string()),
        challenges: z.array(z.string()),
      })
    ),
  });

  return object;
}
\`\`\`

This approach offers several benefits:

1. **Best of both worlds**: You get the deep reasoning capabilities of advanced models and the structured output capabilities of smaller models.
2. **Cost efficiency**: The expensive reasoning model is only used for the complex reasoning task, while the cheaper model handles the simpler task of extracting structured data.
3. **Flexibility**: You can mix and match different models based on their strengths and your specific needs.
4. **Reliability**: The smaller model can reliably extract structured data even if the reasoning model's output is verbose or contains extraneous information.

This pattern is particularly useful for applications that require both complex reasoning and structured data, such as:

- Financial analysis tools
- Research assistants
- Data extraction from complex sources
- Decision support systems
- Automated report generation
# Generate Text

The most basic LLM use case is generating text based on a prompt. For example, you may want to generate a response to a question or summarize a body of text. The `generateText` function can be used to generate text based on the input prompt.

\`\`\`javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-3.5-turbo'),
  prompt: 'Why is the sky blue?',
});

console.log(result);
\`\`\`

This simple example demonstrates how to use the `generateText` function to generate a response to a question. The function takes an object with the following properties:

- `model`: The language model to use for text generation. In this case, we're using OpenAI's GPT-3.5 Turbo model.
- `prompt`: The input prompt that the model will use to generate text.

The function returns a promise that resolves to an object containing the generated text. You can access the text using the `text` property of the result object.

You can also provide additional parameters to control the generation process:

\`\`\`javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4'),
  prompt: 'Write a short poem about artificial intelligence.',
  temperature: 0.7,
  maxTokens: 200,
  system: 'You are a creative poet who specializes in technology-themed poetry.',
});

console.log(result.text);
\`\`\`

In this example, we're using additional parameters:

- `temperature`: Controls the randomness of the generation. Higher values (e.g., 0.8) make the output more random, while lower values (e.g., 0.2) make it more deterministic.
- `maxTokens`: Limits the length of the generated text.
- `system`: Provides system instructions to guide the model's behavior.

The `generateText` function is a versatile tool for text generation tasks and can be used in various applications, such as:

- Answering questions
- Summarizing text
- Generating creative content
- Translating text
- Explaining concepts
- And much more

This function is the foundation for many more complex AI SDK features and provides a simple way to integrate text generation capabilities into your Node.js applications.
# Generate Text with Chat Prompt

Previously, we were able to generate text and objects using either a single message prompt, a system prompt, or a combination of both of them. However, there may be times when you want to generate text based on a series of messages.

A chat completion allows you to generate text based on a series of messages. This series of messages can be any series of interactions between any number of systems, but the most popular and relatable use case has been a series of messages that represent a conversation between a user and a model.

\`\`\`javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-3.5-turbo'),
  maxTokens: 1024,
  system: 'You are a helpful chatbot.',
  messages: [
    {
      role: 'user',
      content: 'Hello!',
    },
    {
      role: 'assistant',
      content: 'Hello! How can I help you today?',
    },
    {
      role: 'user',
      content: 'Can you explain what a chat prompt is?',
    },
  ],
});

console.log(result.text);
\`\`\`

In this example, we're using the `messages` parameter to provide a conversation history to the model. The conversation consists of three messages:

1. A user greeting
2. The assistant's response
3. A user question

The model will generate a response to the last message in the conversation, taking into account the entire conversation history.

The `messages` parameter is an array of objects, where each object represents a message in the conversation. Each message has two properties:

- `role`: The role of the message sender, which can be either `'user'` or `'assistant'`.
- `content`: The content of the message.

You can also include a `system` message to provide instructions or context to the model:

\`\`\`javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4'),
  system: 'You are a knowledgeable assistant specializing in programming languages.',
  messages: [
    {
      role: 'user',
      content: 'What are the main differences between JavaScript and Python?',
    },
  ],
});

console.log(result.text);
\`\`\`

In this example, the `system` message provides context about the assistant's expertise, which helps guide the model's response to the user's question.

Chat prompts are particularly useful for applications that involve multi-turn conversations, such as:

- Chatbots
- Virtual assistants
- Customer support systems
- Interactive tutorials
- Role-playing scenarios

By using chat prompts, you can create more natural and contextually aware interactions with language models in your Node.js applications.
# Generate Text with Image Prompt

Some language models that support vision capabilities accept images as part of the prompt. Here are some of the different formats you can use to include images as input.

## URL

\`\`\`javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4-turbo'),
  maxTokens: 512,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'What are the red things in this image?',
        },
        {
          type: 'image',
          image: new URL(
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Strawberries.jpg/2560px-Strawberries.jpg'
          ),
        },
      ],
    },
  ],
});

console.log(result.text);
\`\`\`

In this example, we're using a URL to include an image in the prompt. The `content` property of the message is an array of objects, where each object represents a part of the message. The first object is a text part, and the second object is an image part.

The image part has two properties:
- `type`: The type of the content, which is `'image'` in this case.
- `image`: The image to include, which is a URL object in this case.

## File Buffer

You can also include images as file buffers:

\`\`\`javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import fs from 'fs/promises';
import path from 'path';

async function generateTextWithImageBuffer() {
  // Read the image file as a buffer
  const imageBuffer = await fs.readFile(path.join(process.cwd(), 'path/to/your/image.jpg'));
  
  const result = await generateText({
    model: openai('gpt-4-vision-preview'),
    maxTokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Describe what you see in this image in detail.',
          },
          {
            type: 'image',
            image: imageBuffer,
          },
        ],
      },
    ],
  });
  
  console.log(result.text);
}

generateTextWithImageBuffer();
\`\`\`

In this example, we're reading an image file as a buffer and including it in the prompt. This is useful when you have local image files that you want to include in your prompts.

You can also include multiple images in a single prompt:

\`\`\`javascript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4-vision-preview'),
  maxTokens: 1024,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Compare and contrast these two images.',
        },
        {
          type: 'image',
          image: new URL('https://example.com/image1.jpg'),
        },
        {
          type: 'image',
          image: new URL('https://example.com/image2.jpg'),
        },
      ],
    },
  ],
});

console.log(result.text);
\`\`\`

This capability is particularly useful for applications that involve:

- Image analysis and description
- Visual question answering
- Content moderation
- Product identification
- Scene understanding
- Document analysis

By combining text and images in your prompts, you can create more powerful and context-aware applications that can understand and respond to visual information.
# Local Caching Middleware

When developing AI applications, you'll often find yourself repeatedly making the same API calls during development. This can lead to increased costs and slower development cycles. A caching middleware allows you to store responses locally and reuse them when the same inputs are provided.

This approach is particularly useful in two scenarios:

1. **Iterating on UI/UX** - When you're focused on styling and user experience, you don't want to regenerate AI responses for every code change.
2. **Working on evals** - When developing evals, you need to repeatedly test the same prompts, but don't need new generations each time.

## Implementation

In this implementation, you create a JSON file to store responses. When a request is made, you first check if you have already seen this exact request. If you have, you return the cached response immediately (as a one-off generation or chunks of tokens). If not, you trigger the generation, save the response, and return it.

Make sure to add the path of your local cache to your `.gitignore` so you do not commit it.

### How it works

For regular generations, you store and retrieve complete responses. Instead, the streaming implementation captures each token as it arrives, stores the full sequence, and on cache hits uses the SDK's `simulateReadableStream` utility to recreate the token-by-token streaming experience at a controlled speed (defaults to 10ms between chunks).

This approach gives you the best of both worlds:

* Instant responses for repeated queries
* Preserved streaming behavior for UI development

The middleware handles all transformations needed to make cached responses indistinguishable from fresh ones, including normalizing tool calls and fixing timestamp formats.

### Middleware

\`\`\`typescript
import fs from 'fs';
import path from 'path';
import {
  type LanguageModelV1,
  type LanguageModelV1Middleware,
  type LanguageModelV1Prompt,
  type LanguageModelV1StreamPart,
  simulateReadableStream,
} from 'ai';

const CACHE_FILE = path.join(process.cwd(), '.cache/ai-cache.json');

export const cached = (model: LanguageModelV1) => {
  return {
    ...model,
    middleware: cacheMiddleware,
  };
};

const ensureCacheFile = () => {
  const cacheDir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  if (!fs.existsSync(CACHE_FILE)) {
    fs.writeFileSync(CACHE_FILE, '{}');
  }
};

const getCachedResult = (key: string | object) => {
  const cacheKey = typeof key === 'object' ? JSON.stringify(key) : key;
  try {
    const cacheContent = fs.readFileSync(CACHE_FILE, 'utf-8');
    const cache = JSON.parse(cacheContent);
    const result = cache[cacheKey];
    return result ?? null;
  } catch (error) {
    console.error('Cache error:', error);
    return null;
  }
};

const updateCache = (key: string, value: any) => {
  try {
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    const updatedCache = { ...cache, [key]: value };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(updatedCache, null, 2));
    console.log('Cache updated for key:', key);
  } catch (error) {
    console.error('Failed to update cache:', error);
  }
};

const cleanPrompt = (prompt: LanguageModelV1Prompt) => {
  return prompt.map(m => {
    if (m.role === 'assistant') {
      return {
        ...m,
        content: m.content.map(part =>
          part.type === 'tool-call' ? { ...part, toolCallId: 'cached' } : part
        ),
      };
    }
    if (m.role === 'tool') {
      return {
        ...m,
        toolCallId: 'cached',
      };
    }
    return m;
  });
};

const cacheMiddleware: LanguageModelV1Middleware = async (
  params,
  { stream, completion }
) => {
  ensureCacheFile();
  
  // Create a cache key from the parameters
  const cacheKey = JSON.stringify({
    prompt: cleanPrompt(params.prompt),
    temperature: params.temperature,
    maxTokens: params.maxTokens,
    topP: params.topP,
    presencePenalty: params.presencePenalty,
    frequencyPenalty: params.frequencyPenalty,
    tools: params.tools ? Object.keys(params.tools) : undefined,
  });

  // Check if we have a cached result
  const cachedResult = getCachedResult(cacheKey);

  if (cachedResult) {
    console.log('Cache hit!');
    
    if (params.stream) {
      // For streaming, simulate the stream from cached parts
      return {
        stream: simulateReadableStream(cachedResult.parts, { delay: 10 }),
      };
    } else {
      // For non-streaming, return the cached completion
      return {
        completion: cachedResult.completion,
      };
    }
  }

  console.log('Cache miss, generating...');

  if (params.stream) {
    // For streaming, capture all parts and cache them
    const parts: LanguageModelV1StreamPart[] = [];
    const streamResult = await stream();
    
    return {
      stream: new ReadableStream({
        async start(controller) {
          const reader = streamResult.stream.getReader();
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              parts.push(value);
              controller.enqueue(value);
            }
            
            controller.close();
            
            // Cache the parts for future use
            updateCache(cacheKey, { parts });
          } catch (error) {
            controller.error(error);
          }
        },
      }),
    };
  } else {
    // For non-streaming, cache the completion
    const result = await completion();
    updateCache(cacheKey, { completion: result.completion });
    return result;
  }
};
\`\`\`

## Using the Middleware

To use the caching middleware, wrap your model with the `cached` function:

\`\`\`typescript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { cached } from './cache-middleware';

// Wrap the model with the caching middleware
const cachedModel = cached(openai('gpt-4-turbo'));

// Use the cached model like any other model
const result = await generateText({
  model: cachedModel,
  prompt: 'Write a poem about programming',
});

console.log(result.text);
\`\`\`

For streaming:

\`\`\`typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { cached } from './cache-middleware';

// Wrap the model with the caching middleware
const cachedModel = cached(openai('gpt-4-turbo'));

// Use the cached model for streaming
const result = await streamText({
  model: cachedModel,
  prompt: 'Write a poem about programming',
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
\`\`\`

## Considerations

When using local caching middleware, keep these considerations in mind:

1. **Development Only**: This approach is intended for development and testing, not for production use.

2. **Cache Invalidation**: You may need to manually clear the cache when you want to generate fresh responses.

3. **Large Cache Files**: If you're testing with many different prompts, your cache file can grow quite large. Consider implementing a cache cleanup strategy.

4. **Security**: The cache file contains all your prompts and responses. Ensure it's properly secured and not committed to version control.

5. **Tool Calls**: When caching responses with tool calls, be aware that tool call IDs are normalized to ensure consistent caching.

6. **Streaming Simulation**: The streaming simulation attempts to mimic the original streaming behavior, but the timing might not be identical to real API calls.

7. **Error Handling**: The middleware includes basic error handling, but you might want to enhance it for your specific needs.

By implementing this caching middleware, you can significantly speed up your development process and reduce costs when working with AI models.
# Model Context Protocol (MCP) Tools

The AI SDK supports Model Context Protocol (MCP) tools by offering a lightweight client that exposes a `tools` method for retrieving tools from a MCP server. After use, the client should always be closed to release resources.

\`\`\`javascript
import { experimental_createMCPClient, generateText } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';
import { openai } from '@ai-sdk/openai';

let clientOne;
let clientTwo;
let clientThree;

try {
  // Initialize an MCP client to connect to a `stdio` MCP server:
  const transport = new Experimental_StdioMCPTransport({
    command: 'node',
    args: ['src/stdio/dist/server.js'],
  });
  clientOne = await experimental_createMCPClient({
    transport,
  });

  // Alternatively, you can connect to a Server-Sent Events (SSE) endpoint:
  clientTwo = await experimental_createMCPClient({
    transport: {
      type: 'sse',
      url: 'http://localhost:3000/sse',
    },
  });

  // Or use a custom transport:
  const transport = new MyCustomTransport({
    // ...
  });
  clientThree = await experimental_createMCPClient({
    transport,
  });

  // Retrieve tools from each client:
  const toolSetOne = await clientOne.tools();
  const toolSetTwo = await clientTwo.tools();
  const toolSetThree = await clientThree.tools();

  // Use the tools in a generateText call:
  const response = await generateText({
    model: openai('gpt-4o'),
    tools: {
      ...toolSetOne,
      ...toolSetTwo,
      ...toolSetThree,
    },
    content: 'Find products under $100',
  });

  console.log(response.text);
} finally {
  // Always close the clients to release resources:
  await Promise.all([clientOne.close(), clientTwo.close(), clientThree.close()]);
}
\`\`\`

## What is Model Context Protocol (MCP)?

Model Context Protocol (MCP) is a protocol for exposing tools to language models. It allows you to define tools in a separate process or service, and then use those tools in your AI SDK applications.

MCP tools can be particularly useful when:

1. You want to separate your tool implementations from your main application
2. You need to share tools across multiple applications
3. You want to implement tools in a different language or runtime
4. You need to run tools in a different security context

## Creating an MCP Server

Here's an example of creating a simple MCP server using the AI SDK's stdio transport:

\`\`\`javascript
// server.js
import { createMCPServer } from 'ai/mcp-stdio';
import { z } from 'zod';

const server = createMCPServer({
  tools: {
    search: {
      description: 'Search for products',
      parameters: z.object({
        query: z.string().describe('Search query'),
        maxResults: z.number().optional().describe('Maximum number of results to return'),
      }),
      execute: async ({ query, maxResults = 10 }) => {
        // In a real application, this would call a database or API
        return {
          results: [
            { id: '1', name: 'Product 1', price: 99.99 },
            { id: '2', name: 'Product 2', price: 49.99 },
            // ...more results
          ].slice(0, maxResults),
        };
      },
    },
    getProductDetails: {
      description: 'Get detailed information about a product',
      parameters: z.object({
        productId: z.string().describe('Product ID'),
      }),
      execute: async ({ productId }) => {
        // In a real application, this would call a database or API
        return {
          product: {
            id: productId,
            name: `Product ${productId}`,
            price: 99.99,
            description: 'A detailed product description...',
            specifications: {
              // ...
            },
          },
        };
      },
    },
  },
});

// Start the server
server.listen();
\`\`\`

## Creating an MCP Server with Express

You can also create an MCP server using Express for HTTP/SSE transport:

\`\`\`javascript
// express-server.js
import express from 'express';
import { createMCPServer } from 'ai/mcp-http';
import { z } from 'zod';

const app = express();
const port = 3000;

const server = createMCPServer({
  tools: {
    weather: {
      description: 'Get the weather for a location',
      parameters: z.object({
        location: z.string().describe('The location to get weather for'),
      }),
      execute: async ({ location }) => {
        // In a real application, this would call a weather API
        return {
          location,
          temperature: 72,
          conditions: 'Sunny',
        };
      },
    },
  },
});

// Mount the MCP server at the /sse endpoint
app.use('/sse', server.createExpressMiddleware());

app.listen(port, () => {
  console.log(`MCP server listening at http://localhost:${port}`);
});
\`\`\`

## Using MCP Tools with Other AI SDK Features

MCP tools can be combined with other AI SDK features, such as streaming and tool calling:

\`\`\`javascript
import { experimental_createMCPClient, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

async function main() {
  const client = await experimental_createMCPClient({
    transport: {
      type: 'sse',
      url: 'http://localhost:3000/sse',
    },
  });

  try {
    const tools = await client.tools();
    
    const result = streamText({
      model: openai('gpt-4o'),
      tools,
      maxSteps: 3, // Allow multiple tool calls
      messages: [
        { role: 'user', content: 'What\'s the weather like in New York and San Francisco?' },
      ],
    });

    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
  } finally {
    await client.close();
  }
}

main().catch(console.error);
\`\`\`

MCP tools provide a flexible way to extend your AI applications with custom functionality while maintaining a clean separation of concerns.
# Record Token Usage After Streaming Object

When you're streaming structured data with `streamObject`, you may want to record the token usage for billing purposes.

## onFinish Callback

You can use the `onFinish` callback to record token usage. It is called when the stream is finished.

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const result = streamObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
  onFinish({ usage }) {
    console.log('Token usage:', usage);
  }
});

// Process the stream
for await (const partialObject of result.partialObjectStream) {
  console.clear();
  console.log(JSON.stringify(partialObject, null, 2));
}
\`\`\`

In this example, we're using the `onFinish` callback to log the token usage after the stream is finished. The callback receives an object with a `usage` property that contains information about the token usage.

The `usage` object typically includes:
- `promptTokens`: The number of tokens in the prompt
- `completionTokens`: The number of tokens in the completion
- `totalTokens`: The total number of tokens used

## usage Promise

You can also access the token usage through the `usage` promise returned by the `streamObject` function:

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

async function generateAndTrackUsage() {
  const { partialObjectStream, usage } = streamObject({
    model: openai('gpt-4-turbo'),
    schema: z.object({
      analysis: z.object({
        title: z.string(),
        summary: z.string(),
        keyPoints: z.array(z.string()),
        sentiment: z.enum(['positive', 'neutral', 'negative']),
      }),
    }),
    messages: [
      {
        role: 'user',
        content: 'Analyze this article about climate change...',
      },
    ],
  });

  // Process the stream
  for await (const partialObject of partialObjectStream) {
    // Update UI with partial object
    console.clear();
    console.log(JSON.stringify(partialObject, null, 2));
  }

  // After the stream is finished, get the usage
  const usageData = await usage;
  console.log('Token usage details:');
  console.log(`Prompt tokens: ${usageData.promptTokens}`);
  console.log(`Completion tokens: ${usageData.completionTokens}`);
  console.log(`Total tokens: ${usageData.totalTokens}`);
  
  // You might want to store this in a database for billing purposes
  await storeUsageInDatabase({
    timestamp: new Date(),
    model: 'gpt-4-turbo',
    promptTokens: usageData.promptTokens,
    completionTokens: usageData.completionTokens,
    totalTokens: usageData.totalTokens,
    cost: calculateCost(usageData, 'gpt-4-turbo'),
  });
}

// Helper function to calculate cost based on token usage and model
function calculateCost(usage, model) {
  // These rates would need to be updated based on current pricing
  const rates = {
    'gpt-4-turbo': {
      promptRate: 0.00001, // $0.01 per 1K tokens
      completionRate: 0.00003, // $0.03 per 1K tokens
    },
    // Add other models as needed
  };
  
  const { promptRate, completionRate } = rates[model];
  return (usage.promptTokens * promptRate) + (usage.completionTokens * completionRate);
}

// Mock function to store usage in a database
async function storeUsageInDatabase(usageRecord) {
  // In a real application, this would store the data in a database
  console.log('Stored usage record:', usageRecord);
}

generateAndTrackUsage().catch(console.error);
\`\`\`

This approach is particularly useful for applications that need to track token usage for billing or quota purposes, such as:

- SaaS applications with usage-based pricing
- Enterprise applications with departmental billing
- Applications with user quotas
- Systems that need to optimize token usage

By tracking token usage, you can ensure that you're accurately billing your users and managing your own costs when using language models.
# Retrieval Augmented Generation

Retrieval Augmented Generation (RAG) is a technique that enhances the capabilities of language models by providing them with relevant information from external sources during the generation process. This approach allows the model to access and incorporate up-to-date or specific knowledge that may not be present in its original training data.

This example uses a simple in-memory vector database to store and retrieve relevant information. For a more in-depth guide, check out the RAG Chatbot Guide which will show you how to build a RAG chatbot with Next.js, Drizzle ORM and Postgres.

\`\`\`javascript
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { openai } from '@ai-sdk/openai';
import { cosineSimilarity, embed, embedMany, generateText } from 'ai';

async function main() {
  dotenv.config();

  // Create a simple in-memory vector database
  const db: { embedding: number[]; value: string }[] = [];

  // Load the essay text
  const essay = fs.readFileSync(path.join(__dirname, 'essay.txt'), 'utf8');
  
  // Split the essay into chunks
  const chunks = essay
    .split('\n\n')
    .map(chunk => chunk.trim())
    .filter(chunk => chunk.length > 0 && chunk !== '\n');

  // Generate embeddings for each chunk
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: chunks,
  });

  // Store the embeddings and chunks in our in-memory database
  embeddings.forEach((e, i) => {
    db.push({
      embedding: e,
      value: chunks[i],
    });
  });

  // User query
  const input = 
    'What were the two main things the author worked on before college?';

  // Generate embedding for the query
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: input,
  });

  // Find the most relevant chunks
  const relevantChunks = db
    .map(item => ({
      document: item,
      similarity: cosineSimilarity(embedding, item.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map(r => r.document.value)
    .join('\n\n');

  // Generate a response using the relevant chunks as context
  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt: `Answer the following question based only on the provided context:
            
            Context:
            ${relevantChunks}
            
            Question: ${input}`,
  });

  console.log(`Question: ${input}`);
  console.log(`Answer: ${text}`);
}

main().catch(console.error);
\`\`\`

## Understanding RAG

Retrieval Augmented Generation works by:

1. **Indexing**: Converting documents into vector embeddings and storing them in a vector database
2. **Retrieval**: Finding the most relevant documents for a given query
3. **Augmentation**: Providing these relevant documents as context to the language model
4. **Generation**: Having the model generate a response based on both the query and the retrieved context

This approach has several advantages:

- **Up-to-date information**: The model can access information that wasn't available during its training
- **Reduced hallucinations**: By grounding responses in specific documents, the model is less likely to generate incorrect information
- **Domain-specific knowledge**: The model can leverage specialized information from your document collection
- **Transparency**: You can trace responses back to source documents

## Building a Complete RAG System

A production-ready RAG system typically includes these components:

### 1. Document Processing

\`\`\`javascript
import fs from 'fs';
import path from 'path';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

async function processDocuments(directory) {
  // Load documents from various sources
  const files = fs.readdirSync(directory);
  const documents = [];

  for (const file of files) {
    const filePath = path.join(directory, file);
    if (file.endsWith('.pdf')) {
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();
      documents.push(...docs);
    } else if (file.endsWith('.txt')) {
      const text = fs.readFileSync(filePath, 'utf8');
      documents.push({ pageContent: text, metadata: { source: filePath } });
    }
  }

  // Split documents into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await textSplitter.splitDocuments(documents);
  return chunks;
}
\`\`\`

### 2. Vector Database Integration

\`\`\`javascript
import { ChromaClient } from 'chromadb';
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';

async function createVectorStore(chunks) {
  // Initialize Chroma client
  const client = new ChromaClient();
  
  // Create or get collection
  const collection = await client.getOrCreateCollection({
    name: "document_store",
  });

  // Generate embeddings for chunks
  const texts = chunks.map(chunk => chunk.pageContent);
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: texts,
  });

  // Prepare data for insertion
  const ids = chunks.map((_, i) => `id-${i}`);
  const metadatas = chunks.map(chunk => chunk.metadata);

  // Add documents to collection
  await collection.add({
    ids: ids,
    embeddings: embeddings,
    metadatas: metadatas,
    documents: texts,
  });

  return collection;
}
\`\`\`

### 3. Query Processing

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { embed, generateText } from 'ai';

async function queryDocuments(collection, query, topK = 5) {
  // Generate embedding for query
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  // Query the collection
  const results = await collection.query({
    queryEmbeddings: [embedding],
    nResults: topK,
  });

  // Extract relevant documents
  const relevantDocs = results.documents[0];
  const relevantSources = results.metadatas[0].map(meta => meta.source);

  return {
    documents: relevantDocs,
    sources: relevantSources,
  };
}
\`\`\`

### 4. Response Generation

\`\`\`javascript
async function generateResponse(query, relevantDocs) {
  const context = relevantDocs.join('\n\n');

  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt: `You are a helpful assistant that answers questions based on the provided context.
            If the answer cannot be found in the context, say "I don't have enough information to answer this question."
            Do not make up information that is not in the context.
            
            Context:
            ${context}
            
            Question: ${query}`,
  });

  return text;
}
\`\`\`

### 5. Putting It All Together

\`\`\`javascript
import dotenv from 'dotenv';

async function main() {
  dotenv.config();

  // Process documents (only needs to be done once)
  const chunks = await processDocuments('./documents');
  const collection = await createVectorStore(chunks);

  // Query processing (done for each user query)
  const query = "What are the key benefits of using RAG?";
  const { documents, sources } = await queryDocuments(collection, query);
  const response = await generateResponse(query, documents);

  console.log(`Question: ${query}`);
  console.log(`Answer: ${response}`);
  console.log(`Sources: ${sources.join(', ')}`);
}

main().catch(console.error);
\`\`\`

## Advanced RAG Techniques

### Hybrid Search

Combine semantic search (embeddings) with keyword search for better results:

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

async function hybridSearch(collection, query, topK = 5) {
  // Generate embedding for query
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  // Perform semantic search
  const semanticResults = await collection.query({
    queryEmbeddings: [embedding],
    nResults: topK,
  });

  // Perform keyword search
  const keywordResults = await collection.query({
    queryTexts: [query],
    nResults: topK,
  });

  // Combine and deduplicate results
  const combinedDocs = [...semanticResults.documents[0], ...keywordResults.documents[0]];
  const uniqueDocs = Array.from(new Set(combinedDocs));

  return uniqueDocs.slice(0, topK);
}
\`\`\`

### Query Decomposition

Break complex queries into simpler sub-queries:

\`\`\`javascript
async function decomposeQuery(query) {
  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt: `Break down the following complex query into 2-3 simpler sub-queries that together would help answer the original query:
            
            Complex query: ${query}
            
            Output the sub-queries as a numbered list, with one sub-query per line.`,
  });

  // Parse the sub-queries from the response
  const subQueries = text
    .split('\n')
    .filter(line => /^\d+\./.test(line))
    .map(line => line.replace(/^\d+\.\s*/, '').trim());

  return subQueries;
}
\`\`\`

### Re-ranking

Improve retrieval quality by re-ranking results:

\`\`\`javascript
async function reRankResults(query, documents, topK = 3) {
  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt: `Rate each document on a scale of 1-10 based on how relevant it is to the query: "${query}"
            
            ${documents.map((doc, i) => `Document ${i+1}: ${doc}`).join('\n\n')}
            
            Output only a JSON array of objects with 'index' and 'score' properties, like:
            [{"index": 1, "score": 8}, {"index": 2, "score": 5}, ...]`,
  });

  // Parse the scores from the response
  const scores = JSON.parse(text);
  
  // Sort documents by score and return top K
  const rankedDocs = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => documents[item.index - 1]);

  return rankedDocs;
}
\`\`\`

## Streaming RAG Responses

For a better user experience, you can stream the generated responses:

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

async function streamRagResponse(query, relevantDocs) {
  const context = relevantDocs.join('\n\n');

  const result = await streamText({
    model: openai('gpt-4o'),
    prompt: `You are a helpful assistant that answers questions based on the provided context.
            If the answer cannot be found in the context, say "I don't have enough information to answer this question."
            Do not make up information that is not in the context.
            
            Context:
            ${context}
            
            Question: ${query}`,
  });

  // In a real application, you would stream this to the client
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}
\`\`\`

## Considerations for Production RAG Systems

When implementing RAG in production, consider these factors:

1. **Scalability**: Use a dedicated vector database like Pinecone, Weaviate, or Chroma for large document collections
2. **Chunking Strategy**: Experiment with different chunk sizes and overlaps to find what works best for your data
3. **Embedding Models**: Choose embedding models that balance performance and cost
4. **Caching**: Cache embeddings and retrieved documents to improve performance and reduce costs
5. **Evaluation**: Regularly evaluate your RAG system's performance using metrics like relevance and answer accuracy
6. **Feedback Loop**: Implement a feedback mechanism to improve retrieval based on user interactions
7. **Cost Management**: Monitor API usage and implement rate limiting to control costs

By implementing these advanced techniques, you can build a robust RAG system that provides accurate, contextually relevant responses to user queries.
# Stream Object

Object generation can sometimes take a long time to complete, especially when you're generating a large schema.

In Generative UI use cases, it is useful to stream the object to the client in real-time to render UIs as the object is being generated. You can use the `streamObject` function to generate partial object streams.

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const { partialObjectStream } = streamObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

for await (const partialObject of partialObjectStream) {
  console.clear();
  console.log(partialObject);
}
\`\`\`

In this example, we're using the `streamObject` function to generate a structured recipe object and stream it in real-time. The function takes the same parameters as `generateObject`, but returns a `ReadableStream` that you can use to read the generated object as it becomes available.

The `streamObject` function returns an object with a `partialObjectStream` property, which is an async iterable that yields partial objects as they are generated. Each partial object represents the current state of the generated object, which may be incomplete.

You can also use the `messages` parameter instead of `prompt` to provide a conversation history:

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

async function streamMovieAnalysis() {
  const { partialObjectStream } = streamObject({
    model: openai('gpt-4-turbo'),
    schema: z.object({
      movie: z.object({
        title: z.string(),
        director: z.string(),
        year: z.number(),
        genres: z.array(z.string()),
        analysis: z.object({
          themes: z.array(z.string()),
          cinematography: z.string(),
          acting: z.string(),
          soundtrack: z.string(),
          overall: z.string(),
        }),
        rating: z.number().min(1).max(10),
      }),
    }),
    messages: [
      {
        role: 'user',
        content: 'Analyze the movie "Inception" directed by Christopher Nolan.',
      },
    ],
  });

  // Create a UI rendering function
  const renderUI = (partialObject) => {
    // In a real application, this would update a UI component
    console.clear();
    console.log('Current state of the analysis:');
    console.log(JSON.stringify(partialObject, null, 2));
  };

  // Process the stream
  for await (const partialObject of partialObjectStream) {
    renderUI(partialObject);
  }
}

streamMovieAnalysis().catch(console.error);
\`\`\`

This approach is particularly useful for applications that need to display complex structured data as it's being generated, such as:

- Interactive dashboards
- Data visualization tools
- Form generators
- Configuration wizards
- Content management systems

By streaming the object generation, you can provide a more responsive user experience, especially for complex objects that might take longer to generate completely. Users can see the object being built in real-time, which can make the application feel more responsive and engaging.
# Stream Object with Image Prompt

Some language models that support vision capabilities accept images as part of the prompt. Here are some of the different formats you can use to include images as input.

## URL

\`\`\`javascript
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

async function main() {
  const { partialObjectStream } = streamObject({
    model: openai('gpt-4-turbo'),
    maxTokens: 512,
    schema: z.object({
      stamps: z.array(
        z.object({
          country: z.string(),
          date: z.string(),
          description: z.string(),
          features: z.array(z.string()),
          colors: z.array(z.string()),
          condition: z.string(),
        })
      ),
    }),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this stamp collection image and provide details about each visible stamp.',
          },
          {
            type: 'image',
            image: new URL(
              'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Stamp_collection.jpg/1280px-Stamp_collection.jpg'
            ),
          },
        ],
      },
    ],
  });

  // Process the stream
  for await (const partialObject of partialObjectStream) {
    console.clear();
    console.log(JSON.stringify(partialObject, null, 2));
  }
}

main().catch(console.error);
\`\`\`

In this example, we're using the `streamObject` function to analyze an image of stamps and stream structured data about each stamp in real-time. The function takes the same parameters as `generateObject`, but returns a `ReadableStream` that you can use to read the generated object as it becomes available.

The content of the message is an array of objects, where each object represents a part of the message:
- The first object is a text part with the prompt asking for stamp analysis.
- The second object is an image part with a URL to an image of stamps.

## File Buffer

You can also include images as file buffers:

\`\`\`javascript
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

async function analyzeImageWithStructuredOutput() {
  // Read the image file as a buffer
  const imageBuffer = await fs.readFile(path.join(process.cwd(), 'path/to/your/image.jpg'));
  
  const { partialObjectStream } = streamObject({
    model: openai('gpt-4-vision-preview'),
    schema: z.object({
      scene: z.object({
        location: z.string(),
        timeOfDay: z.string(),
        weather: z.string(),
        mainSubjects: z.array(z.string()),
        activities: z.array(z.string()),
        colors: z.array(z.string()),
        mood: z.string(),
        description: z.string(),
      }),
    }),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this image and provide structured information about the scene.',
          },
          {
            type: 'image',
            image: imageBuffer,
          },
        ],
      },
    ],
  });
  
  // Create a UI rendering function
  const renderUI = (partialObject) => {
    // In a real application, this would update a UI component
    console.clear();
    console.log('Current analysis:');
    console.log(JSON.stringify(partialObject, null, 2));
  };
  
  // Process the stream
  for await (const partialObject of partialObjectStream) {
    renderUI(partialObject);
  }
}

analyzeImageWithStructuredOutput().catch(console.error);
\`\`\`

This approach is particularly useful for applications that need to analyze images and provide structured data in real-time, such as:

- Image cataloging and organization tools
- Visual content analysis systems
- E-commerce product recognition
- Medical image analysis
- Real estate property assessment
- Art and collectibles appraisal

By streaming the object generation, you can provide a more responsive user experience, especially for complex analyses that might take longer to generate completely. Users can see the analysis being built in real-time, which can make the application feel more responsive and engaging.
# Stream Text

Text generation can sometimes take a long time to complete, especially when you're generating a couple of paragraphs. In such cases, it is useful to stream the text to the client in real-time. This allows the client to display the generated text as it is being generated, rather than have users wait for it to complete before displaying the result.

## Without reader

\`\`\`javascript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-3.5-turbo'),
  prompt: 'Write a short story about a robot learning to feel emotions.',
  temperature: 0.7,
  maxTokens: 500,
});

// The result is a ReadableStream
console.log(result); // ReadableStream

// You can use the stream directly if you're in a server environment
// For example, in a Node.js HTTP server:
// response.writeHead(200, { 'Content-Type': 'text/plain' });
// result.pipeTo(new WritableStream({
//   write(chunk) {
//     response.write(chunk);
//   },
//   close() {
//     response.end();
//   }
// }));
\`\`\`

In this example, we're using the `streamText` function to generate text and stream it in real-time. The function returns a `ReadableStream` that you can use to read the generated text as it becomes available.

## With reader

If you want to process the streamed text in your application, you can use a reader to read from the stream:

\`\`\`javascript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

async function generateAndStreamText() {
  const stream = await streamText({
    model: openai('gpt-4'),
    prompt: 'Explain quantum computing in simple terms.',
    temperature: 0.5,
    maxTokens: 1000,
  });
  
  // Create a reader from the stream
  const reader = stream.getReader();
  
  let accumulatedText = '';
  
  // Read from the stream
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) {
      console.log('Stream complete!');
      console.log('Final text:', accumulatedText);
      break;
    }
    
    // Process the chunk of text
    accumulatedText += value;
    
    // You can do something with each chunk as it arrives
    console.log('Received chunk:', value);
    
    // For example, you could update a UI element
    // updateUIWithText(accumulatedText);
  }
}

generateAndStreamText().catch(console.error);
\`\`\`

In this example, we're using a reader to read from the stream and process each chunk of text as it arrives. This approach is useful when you want to:

1. Display the text to users in real-time
2. Process the text as it's being generated
3. Accumulate the text for later use
4. Implement custom handling for the streamed text

Streaming text generation provides several benefits:

- **Improved user experience**: Users see results immediately and can start reading while the rest of the text is being generated.
- **Faster perceived performance**: Even if the total generation time is the same, users perceive the application as faster because they see immediate results.
- **Ability to cancel early**: If users see that the generation is going in the wrong direction, they can cancel it early without waiting for the complete result.
- **Better handling of long outputs**: For very long outputs, streaming allows you to process and display the text incrementally, which is more efficient than waiting for the entire output.

This approach is particularly useful for applications like chatbots, content generation tools, and any scenario where real-time feedback is important.
# Stream Text with Chat Prompt

Text generation can sometimes take a long time to finish, especially when the response is big. In such cases, it is useful to stream the chat completion to the client in real-time. This allows the client to display the new message as it is being generated by the model, rather than have users wait for it to finish.

\`\`\`javascript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-3.5-turbo'),
  maxTokens: 1024,
  system: 'You are a helpful chatbot.',
  messages: [
    {
      role: 'user',
      content: 'Hello!',
    },
    {
      role: 'assistant',
      content: 'Hello! How can I help you today?',
    },
    {
      role: 'user',
      content: 'I need help with my computer.',
    },
  ],
});

// Process the stream
for await (const textPart of result.textStream) {
  // Each textPart is a chunk of the generated text
  console.log(textPart);
  
  // In a real application, you might send this to a client
  // or update a UI element
}

// Alternatively, you can use a reader to process the stream
const reader = result.textStream.getReader();

try {
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) {
      console.log('Stream complete!');
      break;
    }
    
    // Process the chunk of text
    console.log('Received chunk:', value);
  }
} finally {
  reader.releaseLock();
}
\`\`\`

In this example, we're using the `streamText` function to generate text based on a conversation history and stream it in real-time. The function takes the same parameters as `generateText`, but returns a `ReadableStream` that you can use to read the generated text as it becomes available.

The conversation is represented as an array of messages, where each message has a `role` (either 'user' or 'assistant') and `content` (the text of the message). The model will generate a response to the last message in the conversation, taking into account the entire conversation history.

You can also include a `system` message to provide instructions or context to the model:

\`\`\`javascript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-4'),
  system: 'You are a technical support specialist who helps users with computer problems.',
  messages: [
    {
      role: 'user',
      content: 'My computer is running very slowly. What should I check?',
    },
  ],
});

// Process the stream...
\`\`\`

Streaming chat completions is particularly useful for applications like:

- Chatbots and virtual assistants
- Customer support systems
- Interactive tutorials
- Any application where real-time feedback is important

By streaming the response, you can provide a more responsive and engaging user experience, especially for longer responses that would otherwise take a significant amount of time to generate completely before showing anything to the user.
# Stream Text with File Prompt

Working with files in AI applications often requires analyzing documents, processing structured data, or extracting information from various file formats. File prompts allow you to send file content directly to the model, enabling tasks like document analysis, data extraction, or generating responses based on file contents.

\`\`\`javascript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import 'dotenv/config';
import fs from 'node:fs';

async function main() {
  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'What is an embedding model according to this document? Summarize the key points.',
          },
          {
            type: 'file',
            data: fs.readFileSync('./data/ai.pdf'),
            mimeType: 'application/pdf',
          },
        ],
      },
    ],
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

main().catch(console.error);
\`\`\`

In this example, we're using the `streamText` function to analyze a PDF document and stream the response in real-time. The function takes the same parameters as `generateText`, but returns a `ReadableStream` that you can use to read the generated text as it becomes available.

The content of the message is an array of objects, where each object represents a part of the message:
- The first object is a text part with the prompt asking about embedding models.
- The second object is a file part with the PDF document read from disk.

The file part has three properties:
- `type`: The type of the content, which is `'file'` in this case.
- `data`: The file content as a buffer.
- `mimeType`: The MIME type of the file, which helps the model understand the file format.

You can work with various file types, including:

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import fs from 'node:fs';

async function analyzeCSVData() {
  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this CSV data and tell me the key trends and insights.',
          },
          {
            type: 'file',
            data: fs.readFileSync('./data/sales_data.csv'),
            mimeType: 'text/csv',
          },
        ],
      },
    ],
  });

  let fullResponse = '';
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
    fullResponse += chunk;
  }
  
  return fullResponse;
}

analyzeCSVData().catch(console.error);
\`\`\`

You can also include multiple files in a single prompt:

\`\`\`javascript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import fs from 'node:fs';

async function compareDocuments() {
  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Compare these two documents and highlight the key differences.',
          },
          {
            type: 'file',
            data: fs.readFileSync('./data/document1.txt'),
            mimeType: 'text/plain',
          },
          {
            type: 'file',
            data: fs.readFileSync('./data/document2.txt'),
            mimeType: 'text/plain',
          },
        ],
      },
    ],
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

compareDocuments().catch(console.error);
\`\`\`

Streaming text with file prompts is particularly useful for applications that require real-time analysis of document content, such as:

- Document summarization services
- Data extraction and analysis tools
- Contract review systems
- Research assistants that work with academic papers
- Code analysis and explanation tools

By streaming the response, you provide a more responsive user experience, especially for large documents that might take longer to analyze completely.
# Stream Text with Image Prompt

Vision-language models can analyze images alongside text prompts to generate responses about visual content. This multimodal approach allows for rich interactions where you can ask questions about images, request descriptions, or analyze visual details. The combination of image and text inputs enables more sophisticated AI applications like visual question answering and image analysis.

\`\`\`javascript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import 'dotenv/config';
import fs from 'node:fs';

async function main() {
  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20240620'),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Describe the image in detail.' },
          { type: 'image', image: fs.readFileSync('./data/comic-cat.jpg') },
        ],
      },
    ],
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
\`\`\`

In this example, we're using the `streamText` function to generate a description of an image and stream the response in real-time. The function takes the same parameters as `generateText`, but returns a `ReadableStream` that you can use to read the generated text as it becomes available.

The content of the message is an array of objects, where each object represents a part of the message:
- The first object is a text part with the prompt "Describe the image in detail."
- The second object is an image part with the image file read from disk.

You can also use URLs for images:

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

async function streamImageAnalysis() {
  const result = streamText({
    model: openai('gpt-4-vision-preview'),
    maxTokens: 1000,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What's happening in this image?' },
          { 
            type: 'image', 
            image: new URL('https://example.com/images/scene.jpg')
          },
        ],
      },
    ],
  });

  // Process the stream
  for await (const chunk of result.textStream) {
    console.log(chunk); // In a real app, you might send this to a client
  }
}

streamImageAnalysis().catch(console.error);
\`\`\`

You can also include multiple images in a single prompt:

\`\`\`javascript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import fs from 'node:fs';

async function compareImages() {
  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20240620'),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Compare these two images and tell me the differences.' },
          { type: 'image', image: fs.readFileSync('./data/image1.jpg') },
          { type: 'image', image: fs.readFileSync('./data/image2.jpg') },
        ],
      },
    ],
  });

  let fullResponse = '';
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
    fullResponse += chunk;
  }
  
  return fullResponse;
}

compareImages().catch(console.error);
\`\`\`

Streaming text with image prompts is particularly useful for applications that require real-time analysis of visual content, such as:

- Interactive image description services
- Visual question answering systems
- Image content moderation
- Educational tools that explain visual concepts
- Accessibility applications for visually impaired users

By streaming the response, you provide a more responsive user experience, especially for detailed image analyses that might take longer to generate completely.
# Web Search Agent

There are two approaches you can take to building a web search agent with the AI SDK:

1. Use a model that has native web-searching capabilities
2. Create a tool to access the web and return search results.

Both approaches have their advantages and disadvantages. Models with native search capabilities tend to be faster and there is no additional cost to make the search. The disadvantage is that you have less control over what is being searched, and the functionality is limited to models that support it.

Instead, by creating a tool, you can achieve more flexibility and greater control over your search queries. It allows you to customize your search strategy, specify search parameters, and you can use it with any LLM that supports tool calling. This approach will incur additional costs for the search API you use, but gives you complete control over the search experience.

## Using native web-search

There are several models that offer native web-searching capabilities (Perplexity, OpenAI, Gemini). Let's look at how you could build a Web Search Agent across providers.

### OpenAI Responses API

OpenAI's Responses API has a built-in web search tool that can be used to search the web and return search results. This tool is called `web_search_preview` and is accessed via the `openai` provider.

\`\`\`javascript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const { text, sources } = await generateText({
  model: openai.responses('gpt-4o-mini'),
  prompt: 'What happened in San Francisco last week?',
  web_search_preview: openai.tools.webSearchPreview(),
});

console.log(text);
console.log(sources);
\`\`\`

### Perplexity

Perplexity's Sonar models combines real-time web search with natural language processing. Each response is grounded in current web data and includes detailed citations.

\`\`\`javascript
import { perplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';

const { text, sources } = await generateText({
  model: perplexity('sonar-pro'),
  prompt: 'What are the latest developments in quantum computing?',
});

console.log(text);
console.log(sources);
\`\`\`

### Gemini

With compatible Gemini models, you can enable search grounding to give the model access to the latest information using Google search.

\`\`\`javascript
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const { text, sources, providerMetadata } = await generateText({
  model: google('gemini-1.5-pro', {
    useSearchGrounding: true,
  }),
  prompt: 
    'List the top 5 San Francisco news from the past week.' +
    'You must include the date of each article.',
});

console.log(text);
console.log(sources);

const metadata = providerMetadata?.google;
const groundingMetadata = metadata?.groundingMetadata;
const safetyRatings = metadata?.safetyRatings;
\`\`\`

## Building a web search tool

Let's look at how you can build tools that search the web and return results. These tools can be used with any model that supports tool calling, giving you maximum flexibility and control over your search experience. We'll examine several search API options that can be integrated as tools in your agent.

Unlike the native web search examples where searching is built into the model, using web search tools requires multiple steps. The language model will make two generations - the first to call the relevant web search tool (extracting search queries from the context), and the second to process the results and generate a response. This multi-step process is handled automatically when you set `maxSteps` to a value greater than 1.

By using `maxSteps`, you can automatically send tool results back to the language model alongside the original question, enabling the model to respond with information relevant to the user's query based on the search results. This creates a seamless experience where the agent can search the web and incorporate those findings into its response.

### Exa

Exa is a search API designed for AI. Let's look at how you could implement a search tool using Exa:

\`\`\`javascript
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import Exa from 'exa-js';

export const exa = new Exa(process.env.EXA_API_KEY);

export const webSearch = tool({
  description: 'Search the web for up-to-date information',
  parameters: z.object({
    query: z.string().min(1).max(100).describe('The search query'),
  }),
  execute: async ({ query }) => {
    const { results } = await exa.searchAndContents(query, {
      livecrawl: 'always',
    });
    
    return results.map(result => ({
      title: result.title,
      url: result.url,
      content: result.content,
      published: result.published,
    }));
  },
});

const { text } = await generateText({
  model: openai('gpt-4-turbo'),
  maxSteps: 3,
  tools: {
    webSearch,
  },
  messages: [
    { role: 'user', content: 'What are the latest developments in AI regulation?' },
  ],
});

console.log(text);
\`\`\`

### Firecrawl

Firecrawl is another search API that can be used to build a web search tool:

\`\`\`javascript
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import axios from 'axios';

export const firecrawlSearch = tool({
  description: 'Search the web for up-to-date information',
  parameters: z.object({
    query: z.string().min(1).max(100).describe('The search query'),
  }),
  execute: async ({ query }) => {
    const response = await axios.post(
      'https://api.firecrawl.dev/search',
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        },
      }
    );
    
    return response.data.results.map(result => ({
      title: result.title,
      url: result.url,
      snippet: result.snippet,
    }));
  },
});

const { text } = await generateText({
  model: openai('gpt-4-turbo'),
  maxSteps: 3,
  tools: {
    firecrawlSearch,
  },
  messages: [
    { role: 'user', content: 'What are the latest developments in renewable energy?' },
  ],
});

console.log(text);
\`\`\`

## Building a comprehensive web search agent

For a more comprehensive web search agent, you might want to combine multiple search tools and add additional functionality:

\`\`\`javascript
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import Exa from 'exa-js';
import axios from 'axios';

const exa = new Exa(process.env.EXA_API_KEY);

// General web search tool
const webSearch = tool({
  description: 'Search the web for general information',
  parameters: z.object({
    query: z.string().min(1).max(100).describe('The search query'),
  }),
  execute: async ({ query }) => {
    const { results } = await exa.searchAndContents(query, {
      livecrawl: 'always',
      numResults: 5,
    });
    
    return results.map(result => ({
      title: result.title,
      url: result.url,
      content: result.content.substring(0, 1000), // Limit content length
      published: result.published,
    }));
  },
});

// News-specific search tool
const newsSearch = tool({
  description: 'Search for recent news articles',
  parameters: z.object({
    query: z.string().min(1).max(100).describe('The news search query'),
    days: z.number().min(1).max(30).default(7).describe('How recent the news should be in days'),
  }),
  execute: async ({ query, days }) => {
    // This would be replaced with your actual news API call
    const response = await axios.get('https://news-api-example.com/search', {
      params: {
        q: query,
        from: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        apiKey: process.env.NEWS_API_KEY,
      },
    });
    
    return response.data.articles.map(article => ({
      title: article.title,
      url: article.url,
      source: article.source.name,
      publishedAt: article.publishedAt,
      description: article.description,
    }));
  },
});

// Academic search tool
const academicSearch = tool({
  description: 'Search for academic papers and research',
  parameters: z.object({
    query: z.string().min(1).max(100).describe('The academic search query'),
    yearFrom: z.number().min(1900).max(2030).optional().describe('Earliest publication year'),
  }),
  execute: async ({ query, yearFrom }) => {
    // This would be replaced with your actual academic API call
    const response = await axios.get('https://academic-api-example.com/search', {
      params: {
        q: query,
        year_from: yearFrom,
        apiKey: process.env.ACADEMIC_API_KEY,
      },
    });
    
    return response.data.papers.map(paper => ({
      title: paper.title,
      authors: paper.authors.join(', '),
      journal: paper.journal,
      year: paper.year,
      abstract: paper.abstract,
      doi: paper.doi,
    }));
  },
});

const { text } = await generateText({
  model: openai('gpt-4-turbo'),
  maxSteps: 5, // Allow multiple tool calls
  tools: {
    webSearch,
    newsSearch,
    academicSearch,
  },
  messages: [
    { role: 'system', content: 'You are a research assistant that helps users find information on the web. Use the appropriate search tools based on the user\'s query.' },
    { role: 'user', content: 'I need information about recent breakthroughs in fusion energy research, both from news sources and academic papers.' },
  ],
});

console.log(text);
\`\`\`

This comprehensive example demonstrates how you can build a sophisticated web search agent that can:

1. Choose the appropriate search tool based on the user's query
2. Make multiple search calls to gather information from different sources
3. Synthesize the information into a coherent response

By combining different search tools and allowing multiple steps, you can create a powerful web search agent that can handle complex research tasks and provide users with comprehensive, up-to-date information.
\n\n---\n\n**Note:** The recipe for 'Intercepting Fetch Requests' (Node.js) could not be included as the source page was inaccessible due to a server error (500 Internal Server Error) at the time of extraction.
