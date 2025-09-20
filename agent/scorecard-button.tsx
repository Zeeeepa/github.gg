'use client';

import React from 'react';
import { AgentQuickControl } from './button-interface';

export function ScoreCardFixButton() {
  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white">
      <h2 className="text-xl font-semibold mb-4">Ralph AI Agent Control</h2>
      <p className="text-gray-600 mb-4">
        Use the controls below to manage the Ralph AI agent for repository scorecard analysis and fixes.
      </p>
      <AgentQuickControl wsUrl="ws://localhost:8080" />
    </div>
  );
}