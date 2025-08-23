# Ralph Agent Button Control System Documentation

## Overview

The Ralph Wiggum Autonomous Agent System now features a comprehensive button control interface that provides full lifecycle management of the autonomous coding agent. This system allows users to start, stop, pause, resume, and monitor the agent through an intuitive web interface.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                   Web Interface                          │
│              /agent-control (Next.js)                    │
└────────────────────────┬────────────────────────────────┘
                         │ WebSocket
                         ↓
┌─────────────────────────────────────────────────────────┐
│               Control Server (Port 8080)                 │
│             agent/control-server.ts                      │
└────────────────────────┬────────────────────────────────┘
                         │ Process Control
                         ↓
┌─────────────────────────────────────────────────────────┐
│                 Ralph Agent Process                      │
│           agent/ralph-enhanced.sh                        │
└──────────────────────────────────────────────────────────┘
```

## Features

### 1. Control Buttons

- **Start Agent** 🟢
  - Launches the autonomous agent in continuous loop mode
  - Creates PID file for process tracking
  - Updates status in `.agent/status.md`

- **Stop Agent** 🔴
  - Gracefully terminates the agent process
  - Sends SIGTERM signal, followed by SIGKILL if needed
  - Cleans up PID file

- **Pause/Resume** ⏸️
  - Temporarily suspends agent execution using SIGSTOP
  - Resumes with SIGCONT signal
  - Maintains process state during pause

- **Reset Agent** 🔄
  - Stops the current agent if running
  - Clears all state information
  - Ready for fresh start

- **Single Run** ⚡
  - Executes one iteration of the agent
  - Useful for testing or manual triggers
  - Doesn't affect the main loop process

### 2. Real-time Monitoring

- **Status Indicators**
  - Visual badges showing current agent state
  - Connection status to control server
  - Color-coded for quick recognition

- **Process Information**
  - Process ID (PID) display
  - Uptime tracking
  - Iteration counter

- **Live Logs**
  - Real-time streaming of agent output
  - Scrollable log window
  - Timestamp for each entry
  - Error highlighting

### 3. WebSocket Communication

The system uses bidirectional WebSocket communication for real-time updates:

```typescript
// Message Types
interface WSMessage {
  type: 'state' | 'output' | 'error' | 'stopped' | 'single-output';
  data?: any;
  error?: string;
  code?: number;
}
```

## File Structure

```
agent/
├── button-interface.tsx    # Reusable button components
├── control-server.ts       # WebSocket server & process manager
├── ralph.sh               # Original agent script
├── ralph-enhanced.sh      # Enhanced script with signal handling
├── ralph-single.sh        # Single iteration script
├── prompt.md              # Agent instructions
└── visualize.ts           # Output visualization

src/app/agent-control/
└── page.tsx               # Full control panel UI

.agent/
├── status.md              # Current status & logs
└── plan.md                # Implementation plans
```

## Usage Instructions

### Starting the System

1. **Start the Control Server**
   ```bash
   bun agent/control-server.ts
   ```
   The server will start on port 8080 and check for any existing agent processes.

2. **Access the Web Interface**
   Navigate to `http://localhost:3000/agent-control` in your browser.

3. **Control the Agent**
   Use the intuitive button interface to:
   - Start the continuous agent loop
   - Monitor real-time output
   - Pause/resume as needed
   - Trigger single runs for testing

### Configuration

Environment variables can be used to customize behavior:

```bash
# Set custom sleep time between iterations (default: 10 seconds)
export AGENT_SLEEP_TIME=20

# Run with control mode enabled
export AGENT_CONTROL=true
```

## Technical Details

### Signal Handling

The enhanced Ralph script (`ralph-enhanced.sh`) implements proper signal handling:

```bash
trap cleanup SIGTERM SIGINT    # Clean shutdown
trap pause_handler SIGTSTP     # Pause capability
trap resume_handler SIGCONT    # Resume capability
```

### Process Management

The control server maintains agent state and handles lifecycle:

```typescript
interface AgentState {
  status: 'idle' | 'running' | 'paused' | 'stopping';
  pid: number | null;
  startTime: Date | null;
  iterations: number;
  lastOutput: string;
  error: string | null;
}
```

### Status Persistence

The system maintains status in `.agent/status.md`:
- Last updated timestamp
- Current status
- Process ID
- Start time
- Iteration count
- Recent output
- Error logs

## Component Integration

### Button Component Props

```typescript
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
```

### Quick Control Component

For embedding in other pages:

```tsx
import { AgentQuickControl } from '@/agent/button-interface';

// Usage
<AgentQuickControl wsUrl="ws://localhost:8080" />
```

## Error Handling

The system includes comprehensive error handling:

- Automatic reconnection on WebSocket disconnect
- Graceful degradation when server is offline
- Process cleanup on unexpected termination
- Stale PID file detection and cleanup

## Security Considerations

- The control server runs locally on port 8080
- No authentication required for local development
- For production, implement proper authentication
- Consider using environment variables for sensitive configs

## Future Enhancements

Potential improvements for the button control system:

1. **Authentication & Authorization**
   - Add user authentication
   - Role-based access control

2. **Multi-Agent Support**
   - Manage multiple agents simultaneously
   - Agent pool management

3. **Advanced Monitoring**
   - Performance metrics
   - Resource usage tracking
   - Historical data visualization

4. **Configuration UI**
   - Visual configuration editor
   - Template management
   - Prompt editing interface

5. **Scheduling**
   - Cron-like scheduling
   - Event-based triggers
   - Conditional execution

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Ensure control server is running: `bun agent/control-server.ts`
   - Check port 8080 is not in use
   - Verify firewall settings

2. **Agent Won't Start**
   - Check Claude CLI is installed and configured
   - Verify file permissions on scripts
   - Check `.agent.pid` file doesn't exist from previous run

3. **Pause/Resume Not Working**
   - Ensure using `ralph-enhanced.sh` not `ralph.sh`
   - Check signal handling in your shell environment

## Conclusion

The Ralph Agent Button Control System provides a robust, user-friendly interface for managing autonomous coding agents. With real-time monitoring, comprehensive control buttons, and persistent state management, it offers a professional solution for agent lifecycle management.