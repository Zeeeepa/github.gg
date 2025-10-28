"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import {
  Sword,
  User,
  Sparkles,
  Trophy,
  X,
  Check,
  Target
} from 'lucide-react';
import type { BattleCriteria } from '@/lib/types/arena';
import { DEFAULT_BATTLE_CRITERIA } from '@/lib/constants/arena';
import { sanitizeText, sanitizeArray } from '@/lib/utils/sanitize';

const CRITERIA_LABELS: Record<BattleCriteria, { label: string; description: string }> = {
  code_quality: { 
    label: 'Code Quality', 
    description: 'Clean, maintainable, and well-structured code' 
  },
  project_complexity: { 
    label: 'Project Complexity', 
    description: 'Sophisticated and challenging projects' 
  },
  skill_diversity: { 
    label: 'Skill Diversity', 
    description: 'Range of technologies and languages' 
  },
  innovation: { 
    label: 'Innovation', 
    description: 'Creative solutions and novel approaches' 
  },
  documentation: { 
    label: 'Documentation', 
    description: 'Quality of READMEs and code comments' 
  },
  testing: { 
    label: 'Testing', 
    description: 'Test coverage and testing practices' 
  },
  architecture: { 
    label: 'Architecture', 
    description: 'System design and architectural patterns' 
  },
  performance: { 
    label: 'Performance', 
    description: 'Optimization and efficiency' 
  },
  security: { 
    label: 'Security', 
    description: 'Security best practices and awareness' 
  },
  maintainability: { 
    label: 'Maintainability', 
    description: 'Code maintainability and scalability' 
  },
};

interface BattleResult {
  error?: string;
  analysis?: {
    winner: string;
    reason: string;
    highlights: string[];
    recommendations: string[];
  };
  battle?: {
    id: string;
    scores: {
      challenger: { 
        total: number;
        breakdown: Record<string, number>;
      };
      opponent: { 
        total: number;
        breakdown: Record<string, number>;
      };
    } | null;
  };
  eloChange?: {
    challenger: { change: number; newRating: number };
    opponent: { change: number; newRating: number };
  };
}

export function ChallengeForm() {
  const searchParams = useSearchParams();
  const [opponentUsername, setOpponentUsername] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState<BattleCriteria[]>([...DEFAULT_BATTLE_CRITERIA]);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isBattling, setIsBattling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const eventSourceRef = useRef<EventSource | null>(null);

  const challengeMutation = trpc.arena.challengeDeveloper.useMutation();
  const { data: currentUser } = trpc.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useEffect(() => {
    const opponentFromQuery = searchParams.get('opponent');
    if (opponentFromQuery) {
      setOpponentUsername(opponentFromQuery);
    }
  }, [searchParams]);

  const handleChallenge = async () => {
    if (!opponentUsername.trim()) return;

    // Prevent self-challenge
    if (currentUser?.user?.name === opponentUsername.trim()) {
      setBattleResult({ error: 'You cannot challenge yourself!' });
      return;
    }

    try {
      setBattleResult(null);
      setIsBattling(true);
      setProgress(0);
      setStatusMessage('Creating battle challenge...');

      // Create challenge
      const battle = await challengeMutation.mutateAsync({
        opponentUsername: opponentUsername.trim(),
        criteria: selectedCriteria,
      });

      // Connect to SSE endpoint for real-time progress
      const eventSource = new EventSource(`/api/arena/battle?battleId=${battle.id}`);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('progress', (event) => {
        try {
          const data = JSON.parse(event.data);
          setProgress(data.progress || 0);
          setStatusMessage(sanitizeText(data.message));
        } catch (error) {
          console.error('Failed to parse progress event:', error);
        }
      });

      eventSource.addEventListener('complete', (event) => {
        try {
          const data = JSON.parse(event.data);
          setProgress(100);
          setIsBattling(false);
          eventSource.close();

          setBattleResult({
            battle: {
              id: battle.id,
              scores: {
                challenger: data.result?.challengerScore,
                opponent: data.result?.opponentScore,
              },
            },
            analysis: {
              winner: sanitizeText(data.result?.winner) || 'Unknown',
              reason: sanitizeText(data.result?.reason) || '',
              highlights: sanitizeArray(data.result?.highlights),
              recommendations: sanitizeArray(data.result?.recommendations),
            },
            eloChange: data.result?.eloChange,
          });

          // Reset form
          setOpponentUsername('');
          setSelectedCriteria([...DEFAULT_BATTLE_CRITERIA]);
        } catch (error) {
          console.error('Failed to parse battle complete event:', error);
          setIsBattling(false);
          eventSource.close();
          setBattleResult({ error: 'Battle completed but failed to parse results' });
        }
      });

      eventSource.addEventListener('error', (event) => {
        try {
          const messageEvent = event as MessageEvent;
          const data = messageEvent.data ? JSON.parse(messageEvent.data) : {};
          setIsBattling(false);
          eventSource.close();

          setBattleResult({ error: sanitizeText(data.message) || 'Battle failed. Please try again.' });
        } catch (error) {
          console.error('Failed to parse error event:', error);
          setIsBattling(false);
          eventSource.close();
          setBattleResult({ error: 'An error occurred during the battle' });
        }
      });

      eventSource.onerror = () => {
        setIsBattling(false);
        eventSource.close();

        setBattleResult({ error: 'Connection error. Please try again.' });
      };

    } catch (error) {
      console.error('Battle failed:', error);
      setBattleResult({ error: error instanceof Error ? error.message : 'Unknown error' });
      setIsBattling(false);
    }
  };

  const handleCriteriaToggle = (criterion: BattleCriteria) => {
    setSelectedCriteria(prev => 
      prev.includes(criterion)
        ? prev.filter(c => c !== criterion)
        : [...prev, criterion]
    );
  };

  const isFormValid = opponentUsername.trim() && selectedCriteria.length > 0 && currentUser?.user?.name !== opponentUsername.trim();
  const isPending = challengeMutation.isPending || isBattling;

  return (
    <>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Sword className="h-6 w-6" />
            Challenge a Developer
          </CardTitle>
          <CardDescription>
            Enter a GitHub username to challenge them to a code battle. Our AI will analyze both of your public repositories and determine a winner!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Opponent Username */}
          <div className="space-y-2">
            <Label htmlFor="opponent">Opponent&apos;s GitHub Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="opponent"
                placeholder="e.g. torvalds, tj, antfu"
                value={opponentUsername}
                onChange={(e) => setOpponentUsername(e.target.value)}
                disabled={isPending}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              You can challenge any developer, whether they&apos;re registered on github.gg or not!
            </p>
            {currentUser?.user?.name === opponentUsername.trim() && (
              <p className="text-sm text-red-600 font-medium">
                You cannot challenge yourself!
              </p>
            )}
          </div>

          {/* Criteria Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <Label>Battle Criteria</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Select the criteria that will be judged in this battle (choose 3-7)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(CRITERIA_LABELS).map(([key, info]) => {
                const criterion = key as BattleCriteria;
                const isSelected = selectedCriteria.includes(criterion);
                return (
                  <div
                    key={criterion}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-primary/5 border-primary' 
                        : 'bg-background border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleCriteriaToggle(criterion)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {isSelected ? <Check className="h-3 w-3" /> : null}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{info.label}</div>
                        <div className="text-xs text-muted-foreground">{info.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center">
              <Badge variant="outline">
                Selected: {selectedCriteria.length} criteria
              </Badge>
            </div>
          </div>

          {/* Challenge Button */}
          <Button
            onClick={handleChallenge}
            disabled={!isFormValid || isPending}
            size="lg"
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Battle in Progress...</span>
              </>
            ) : (
              <>
                <Sword className="h-4 w-4 mr-2" />
                Initiate Battle
              </>
            )}
          </Button>

          {/* Progress Indicator */}
          {isBattling && (
            <div className="space-y-2 pt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">{statusMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Battle Result */}
      {battleResult && (
        <Card className={battleResult.error ? "border-destructive" : "border-green-500"}>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {battleResult.error ? (
                <>
                  <X className="h-5 w-5 text-destructive" />
                  Battle Failed
                </>
              ) : (
                <>
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Battle Complete!
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {battleResult.error ? (
              <div className="text-center">
                <p className="text-destructive font-medium">{battleResult.error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setBattleResult(null)}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Winner Announcement */}
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold">
                    Winner: {battleResult.analysis?.winner} 🎉
                  </div>
                  <p className="text-muted-foreground">
                    {battleResult.analysis?.reason}
                  </p>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Your Score</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {battleResult.battle?.scores?.challenger?.total || 0}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Opponent Score</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {battleResult.battle?.scores?.opponent?.total || 0}
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                {battleResult.analysis?.highlights && battleResult.analysis.highlights.length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-3">Key Highlights</h3>
                    <ul className="space-y-2">
                      {battleResult.analysis.highlights.map((highlight: string, index: number) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {battleResult.analysis?.recommendations && battleResult.analysis.recommendations.length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {battleResult.analysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setBattleResult(null)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Challenge Another Developer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
} 