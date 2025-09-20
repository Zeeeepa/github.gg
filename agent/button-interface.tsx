import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Pause, RotateCcw, Zap, Activity } from 'lucide-react';

interface AgentButtonProps {
  status: 'idle' | 'running' | 'paused' | 'stopping';
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onTrigger: () => void;
  compact?: boolean;
}

export const AgentControlButton: React.FC<AgentButtonProps> = ({
  status,
  onStart,
  onStop,
  onPause,
  onResume,
  onReset,
  onTrigger,
  compact = false,
}) => {
  const getMainAction = () => {
    switch (status) {
      case 'idle':
        return (
          <Button
            onClick={onStart}
            className="bg-green-600 hover:bg-green-700"
            size={compact ? 'sm' : 'default'}
          >
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
        );
      case 'running':
        return (
          <Button
            onClick={onStop}
            className="bg-red-600 hover:bg-red-700"
            size={compact ? 'sm' : 'default'}
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        );
      case 'paused':
        return (
          <Button
            onClick={onResume}
            className="bg-yellow-600 hover:bg-yellow-700"
            size={compact ? 'sm' : 'default'}
          >
            <Play className="w-4 h-4 mr-2" />
            Resume
          </Button>
        );
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <StatusIndicator status={status} />
        {getMainAction()}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {getMainAction()}
      
      {status === 'running' && (
        <Button
          onClick={onPause}
          variant="outline"
          className="border-yellow-500 text-yellow-600"
        >
          <Pause className="w-4 h-4 mr-2" />
          Pause
        </Button>
      )}
      
      <Button
        onClick={onTrigger}
        disabled={status === 'running'}
        variant="secondary"
      >
        <Zap className="w-4 h-4 mr-2" />
        Single Run
      </Button>
      
      <Button
        onClick={onReset}
        variant="outline"
        className="border-orange-500 text-orange-600"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset
      </Button>
    </div>
  );
};

interface StatusIndicatorProps {
  status: 'idle' | 'running' | 'paused' | 'stopping';
  showLabel?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  showLabel = true 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'stopping': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'running': return <Activity className="w-3 h-3 animate-pulse" />;
      case 'paused': return <Pause className="w-3 h-3" />;
      case 'stopping': return <Square className="w-3 h-3" />;
      default: return <div className="w-3 h-3 rounded-full bg-current" />;
    }
  };

  return (
    <Badge className={`${getStatusColor()} text-white`}>
      <span className="flex items-center gap-1">
        {getStatusIcon()}
        {showLabel && status.toUpperCase()}
      </span>
    </Badge>
  );
};

interface AgentQuickControlProps {
  wsUrl?: string;
}

export const AgentQuickControl: React.FC<AgentQuickControlProps> = ({ 
  wsUrl = 'ws://localhost:8080' 
}) => {
  const [status, setStatus] = React.useState<'idle' | 'running' | 'paused' | 'stopping'>('idle');
  const [connected, setConnected] = React.useState(false);
  const wsRef = React.useRef<WebSocket | null>(null);

  React.useEffect(() => {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => setConnected(true);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'state') {
        setStatus(msg.data.status);
      }
    };
    ws.onclose = () => setConnected(false);
    
    wsRef.current = ws;
    
    return () => ws.close();
  }, [wsUrl]);

  const sendCommand = (command: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ command }));
    }
  };

  if (!connected) {
    return (
      <Badge variant="outline" className="border-red-500">
        Agent Offline
      </Badge>
    );
  }

  return (
    <AgentControlButton
      status={status}
      onStart={() => sendCommand('start')}
      onStop={() => sendCommand('stop')}
      onPause={() => sendCommand('pause')}
      onResume={() => sendCommand('resume')}
      onReset={() => sendCommand('reset')}
      onTrigger={() => sendCommand('trigger')}
      compact
    />
  );
};