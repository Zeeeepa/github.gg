'use client';

import React, { useState } from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface RepositoryChatProps {
  owner: string;
  repo: string;
  ref?: string;
  className?: string;
}

export function RepositoryChat({ owner, repo, ref, className }: RepositoryChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const repositoryContext = { owner, repo, ref };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className || ''}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700"
          size="icon"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className || ''}`}>
      <Card className={`transition-all duration-300 shadow-2xl border-2 ${
        isMinimized 
          ? 'w-80 h-16' 
          : 'w-96 h-[32rem] lg:w-[28rem] lg:h-[36rem]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-50">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <div className="flex flex-col">
              <span className="font-medium text-sm">Repository Assistant</span>
              <span className="text-xs text-gray-600">{owner}/{repo}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Content */}
        {!isMinimized && (
          <div className="flex-1 h-full">
            <ChatInterface 
              repositoryContext={repositoryContext}
              className="border-0 rounded-none h-full"
            />
          </div>
        )}

        {/* Minimized State */}
        {isMinimized && (
          <div className="flex items-center justify-center p-2 text-sm text-gray-600">
            Click to expand chat
          </div>
        )}
      </Card>
    </div>
  );
}