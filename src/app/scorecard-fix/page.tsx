'use client';

import React from 'react';
import { ScoreCardFixButton } from '../../../agent/scorecard-button';

export default function ScoreCardFixPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Repository ScoreCard Auto-Fix
        </h1>
        <p className="text-lg text-gray-600">
          Automatically analyze and fix repository issues using the Ralph AI Agent
        </p>
      </div>
      
      <ScoreCardFixButton />
    </div>
  );
}