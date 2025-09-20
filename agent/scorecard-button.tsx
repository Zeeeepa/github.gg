import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  GitBranch, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  RefreshCcw,
  Wrench,
  ChevronRight,
  Code,
  Shield
} from 'lucide-react';

interface ScoreCardIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  file?: string;
  line?: number;
  fixable: boolean;
}

interface ScoreCardResult {
  score: number;
  issues: ScoreCardIssue[];
  repository: string;
  timestamp: Date;
}

interface ScoreCardFixButtonProps {
  wsUrl?: string;
  onAnalyze?: (repoUrl: string) => Promise<ScoreCardResult>;
  environment?: 'local' | 'freestyle' | 'e2b';
}

export const ScoreCardFixButton: React.FC<ScoreCardFixButtonProps> = ({ 
  wsUrl = 'ws://localhost:8080',
  onAnalyze,
  environment = 'local'
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [scoreCard, setScoreCard] = useState<ScoreCardResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'fixing' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState<string[]>([]);
  const [fixedIssues, setFixedIssues] = useState<string[]>([]);
  const wsRef = React.useRef<WebSocket | null>(null);

  React.useEffect(() => {
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      handleWebSocketMessage(msg);
    };
    
    wsRef.current = ws;
    
    return () => ws.close();
  }, [wsUrl]);

  const handleWebSocketMessage = (msg: any) => {
    switch (msg.type) {
      case 'scorecard-progress':
        setProgress(prev => [...prev, msg.data]);
        break;
      case 'issue-fixed':
        setFixedIssues(prev => [...prev, msg.issueId]);
        break;
      case 'scorecard-complete':
        setStatus('complete');
        setScoreCard(msg.result);
        break;
      case 'error':
        setStatus('error');
        setProgress(prev => [...prev, `Error: ${msg.error}`]);
        break;
    }
  };

  const analyzeRepository = async () => {
    if (!repoUrl) return;
    
    setStatus('analyzing');
    setProgress(['Analyzing repository scorecard...']);
    
    // Mock scorecard for demonstration
    const mockScoreCard: ScoreCardResult = {
      score: 65,
      repository: repoUrl,
      timestamp: new Date(),
      issues: [
        {
          id: 'sec-1',
          severity: 'critical',
          category: 'Security',
          description: 'Missing security headers in API responses',
          file: 'src/api/server.ts',
          line: 45,
          fixable: true
        },
        {
          id: 'dep-1',
          severity: 'high',
          category: 'Dependencies',
          description: 'Outdated dependencies with known vulnerabilities',
          fixable: true
        },
        {
          id: 'test-1',
          severity: 'medium',
          category: 'Testing',
          description: 'Missing test coverage for critical functions',
          file: 'src/core/auth.ts',
          fixable: true
        },
        {
          id: 'lint-1',
          severity: 'low',
          category: 'Code Quality',
          description: 'ESLint errors in 5 files',
          fixable: true
        }
      ]
    };
    
    setScoreCard(mockScoreCard);
    setStatus('idle');
    setProgress(prev => [...prev, 'Analysis complete']);
  };

  const fixIssues = async () => {
    if (!scoreCard) return;
    
    setStatus('fixing');
    setProgress(['Starting autonomous fix process...']);
    setFixedIssues([]);
    
    // Send command to control server
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        command: 'scorecard-fix',
        params: {
          repository: scoreCard.repository,
          issues: scoreCard.issues.filter(i => i.fixable),
          environment
        }
      }));
    }
    
    // Simulate fixing process
    const fixableIssues = scoreCard.issues.filter(i => i.fixable);
    for (let i = 0; i < fixableIssues.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setFixedIssues(prev => [...prev, fixableIssues[i].id]);
      setProgress(prev => [...prev, `Fixed: ${fixableIssues[i].description}`]);
    }
    
    // Re-run scorecard
    setProgress(prev => [...prev, 'Re-running scorecard...']);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newScore = Math.min(100, scoreCard.score + (fixableIssues.length * 8));
    setScoreCard({
      ...scoreCard,
      score: newScore,
      issues: scoreCard.issues.filter(i => !i.fixable)
    });
    
    setStatus('complete');
    setProgress(prev => [...prev, `Complete! New score: ${newScore}/100`]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Repository ScoreCard Fix
          </CardTitle>
          <CardDescription>
            Automatically analyze and fix repository issues using AI-powered agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">Repository URL</Label>
            <div className="flex gap-2">
              <Input
                id="repo-url"
                type="url"
                placeholder="https://github.com/user/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={status !== 'idle'}
                className="flex-1"
              />
              <Button
                onClick={analyzeRepository}
                disabled={!repoUrl || status !== 'idle'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {status === 'analyzing' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCcw className="w-4 h-4" />
                )}
                <span className="ml-2">Analyze</span>
              </Button>
            </div>
          </div>

          {/* Environment Selection */}
          <div className="flex items-center gap-4">
            <Label>Environment:</Label>
            <Badge variant="outline" className="px-3 py-1">
              <Code className="w-3 h-3 mr-1" />
              {environment === 'e2b' ? 'E2B Sandbox' : 
               environment === 'freestyle' ? 'Freestyle' : 'Local'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ScoreCard Results */}
      {scoreCard && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ScoreCard Results</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{scoreCard.score}</span>
                <span className="text-gray-500">/100</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Issues List */}
            <div className="space-y-2">
              {scoreCard.issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-3 rounded-lg border ${
                    fixedIssues.includes(issue.id) ? 'bg-green-50 border-green-300' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${getSeverityColor(issue.severity)} text-white text-xs`}>
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {issue.category}
                        </Badge>
                        {issue.fixable && (
                          <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                            <Wrench className="w-3 h-3 mr-1" />
                            Auto-fixable
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{issue.description}</p>
                      {issue.file && (
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                          {issue.file}:{issue.line}
                        </p>
                      )}
                    </div>
                    {fixedIssues.includes(issue.id) && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Fix Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={fixIssues}
                disabled={status === 'fixing' || status === 'complete'}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {status === 'fixing' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fixing Issues...
                  </>
                ) : status === 'complete' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Fix Complete
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4 mr-2" />
                    Auto-Fix {scoreCard.issues.filter(i => i.fixable).length} Issues
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Log */}
      {progress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Progress Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-lg max-h-48 overflow-y-auto font-mono text-xs">
              {progress.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 mt-0.5 text-green-400" />
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Export a simplified button for integration
export const ScoreCardQuickFixButton: React.FC<{ repoUrl?: string }> = ({ repoUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        <Shield className="w-4 h-4 mr-2" />
        Fix ScoreCard Issues
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">ScoreCard Auto-Fix</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </Button>
            </div>
            <ScoreCardFixButton />
          </div>
        </div>
      )}
    </>
  );
};