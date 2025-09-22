'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatBubbleProps {
  repositoryContext?: {
    owner: string;
    repo: string;
    ref?: string;
  };
  className?: string;
}

export function ChatBubble({ repositoryContext, className }: ChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const bubbleContent = (
    <>
      {/* Chat bubble trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="chat-bubble-trigger"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat interface modal/panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed z-50 shadow-2xl ${
              isMinimized 
                ? 'bottom-6 right-6 w-80 h-16' 
                : 'bottom-6 right-6 w-96 h-[600px] md:w-[450px] md:h-[700px]'
            }`}
            data-testid="chat-bubble-panel"
          >
            <Card className="h-full flex flex-col overflow-hidden bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-blue-50/80">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    {isMinimized ? 'Chat' : 'AI Assistant'}
                  </h3>
                  {repositoryContext && !isMinimized && (
                    <span className="text-sm text-gray-600 ml-auto">
                      {repositoryContext.owner}/{repositoryContext.repo}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0"
                    data-testid="chat-bubble-minimize"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                    data-testid="chat-bubble-close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Chat interface content */}
              {!isMinimized && (
                <div className="flex-1 overflow-hidden">
                  <ChatInterface 
                    repositoryContext={repositoryContext}
                    className="h-full border-0 shadow-none"
                  />
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // Use portal to render outside of normal component tree
  return createPortal(bubbleContent, document.body);
}

// Hook for managing chat bubble state across the app
export function useChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen(!isOpen);
  
  const addUnreadMessage = () => {
    if (!isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const clearUnreadCount = () => setUnreadCount(0);

  useEffect(() => {
    if (isOpen) {
      clearUnreadCount();
    }
  }, [isOpen]);

  return {
    isOpen,
    unreadCount,
    openChat,
    closeChat,
    toggleChat,
    addUnreadMessage,
    clearUnreadCount
  };
}