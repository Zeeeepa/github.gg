'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Square, 
  Pause, 
  RotateCcw, 
  Zap, 
  Settings,
  Activity,
  Terminal,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface AgentState {
  status: 'idle' | 'running' | 'paused' | 'stopping';
  pid: number | null;
  startTime: Date | null;
  iterations: number;
  lastOutput: string;
  error: string | null;
}

export default function AgentControlPage() {
  const [state, setState] = useState<AgentState>({
    status: 'idle',
    pid: null,
    startTime: null,
    iterations: 0,
    lastOutput: '',
    error: null,
  });
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
      setConnected(true);
      addLog('Connected to agent control server');
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      handleMessage(msg);
    };

    ws.onclose = () => {
      setConnected(false);
      addLog('Disconnected from agent control server');
      setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      addLog(`Connection error: ${error}`);
    };

    wsRef.current = ws;
  };

  const handleMessage = (msg: any) => {
    switch (msg.type) {
      case 'state':
        setState(msg.data);
        break;
      case 'output':
        addLog(`[OUTPUT] ${msg.data}`);
        break;
      case 'error':
        addLog(`[ERROR] ${msg.error}`, 'error');
        break;
      case 'stopped':
        addLog(`Agent stopped with code ${msg.code}`);
        break;
      case 'single-output':
        addLog(`[SINGLE] ${msg.data}`);
        break;
      case 'single-complete':
        addLog(`Single run completed with code ${msg.code}`);
        break;
      default:
        console.log('Unknown message type:', msg);
    }
  };

  const addLog = (message: string, type: 'info' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev.slice(-99), logEntry]);
  };

  const sendCommand = (command: string, params?: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ command, params }));
      addLog(`Sent command: ${command}`);
    } else {
      addLog('Not connected to server', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'stopping': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'stopping': return <Square className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatUptime = () => {
    if (!state.startTime) return 'N/A';
    const start = new Date(state.startTime);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Ralph Agent Control Panel</h1>
        <p className="text-gray-600">Manage and monitor the autonomous coding agent</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge className={`${getStatusColor(state.status)} text-white`}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(state.status)}
                  {state.status.toUpperCase()}
                </span>
              </Badge>
              <Badge variant="outline" className={connected ? 'border-green-500' : 'border-red-500'}>
                {connected ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                {connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Process Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div>PID: <span className="font-mono">{state.pid || 'N/A'}</span></div>
              <div>Uptime: <span className="font-mono">{formatUptime()}</span></div>
              <div>Iterations: <span className="font-mono">{state.iterations}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => sendCommand('trigger')}
              disabled={state.status === 'running'}
              className="w-full"
              variant="secondary"
            >
              <Zap className="w-4 h-4 mr-2" />
              Single Run
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Control Buttons</CardTitle>
          <CardDescription>Manage the agent lifecycle and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => sendCommand('start')}
              disabled={state.status === 'running' || state.status === 'paused'}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Agent
            </Button>

            <Button
              onClick={() => sendCommand('stop')}
              disabled={state.status === 'idle'}
              className="bg-red-600 hover:bg-red-700"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Agent
            </Button>

            <Button
              onClick={() => sendCommand(state.status === 'paused' ? 'resume' : 'pause')}
              disabled={state.status !== 'running' && state.status !== 'paused'}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Pause className="w-4 h-4 mr-2" />
              {state.status === 'paused' ? 'Resume' : 'Pause'}
            </Button>

            <Button
              onClick={() => {
                if (confirm('Are you sure you want to reset the agent?')) {
                  sendCommand('reset');
                }
              }}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Agent
            </Button>
          </div>

          {state.error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {state.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Agent Logs
          </CardTitle>
          <CardDescription>Real-time output from the agent process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-1 ${log.includes('[ERROR]') ? 'text-red-400' : ''}`}
                >
                  {log}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}