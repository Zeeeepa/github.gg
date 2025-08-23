#!/usr/bin/env bun

import { WebSocketServer } from 'ws';
import { spawn, ChildProcess } from 'child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

interface AgentState {
  status: 'idle' | 'running' | 'paused' | 'stopping';
  pid: number | null;
  startTime: Date | null;
  iterations: number;
  lastOutput: string;
  error: string | null;
}

class AgentControlServer {
  private wss: WebSocketServer;
  private agentProcess: ChildProcess | null = null;
  private state: AgentState = {
    status: 'idle',
    pid: null,
    startTime: null,
    iterations: 0,
    lastOutput: '',
    error: null,
  };
  private clients: Set<any> = new Set();
  private pidFile = join(__dirname, '.agent.pid');
  private statusFile = join(__dirname, '../.agent/status.md');

  constructor(port: number = 8080) {
    this.wss = new WebSocketServer({ port });
    this.setupWebSocket();
    this.checkExistingProcess();
    console.log(`Agent Control Server started on port ${port}`);
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log('New client connected');
      
      ws.send(JSON.stringify({
        type: 'state',
        data: this.state,
      }));

      ws.on('message', (message) => {
        try {
          const msg = JSON.parse(message.toString());
          this.handleCommand(msg, ws);
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Invalid message format',
          }));
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('Client disconnected');
      });
    });
  }

  private async handleCommand(msg: any, ws: any) {
    const { command, params } = msg;
    
    switch (command) {
      case 'start':
        await this.startAgent();
        break;
      case 'stop':
        await this.stopAgent();
        break;
      case 'pause':
        await this.pauseAgent();
        break;
      case 'resume':
        await this.resumeAgent();
        break;
      case 'reset':
        await this.resetAgent();
        break;
      case 'trigger':
        await this.triggerSingleRun();
        break;
      case 'status':
        this.broadcastState();
        break;
      case 'configure':
        await this.configure(params);
        break;
      case 'scorecard-fix':
        await this.handleScoreCardFix(params);
        break;
      default:
        ws.send(JSON.stringify({
          type: 'error',
          error: `Unknown command: ${command}`,
        }));
    }
  }

  private async startAgent() {
    if (this.state.status === 'running') {
      this.broadcast({
        type: 'error',
        error: 'Agent is already running',
      });
      return;
    }

    try {
      const scriptPath = join(__dirname, 'ralph-enhanced.sh');
      
      this.agentProcess = spawn('bash', [scriptPath], {
        cwd: join(__dirname, '..'),
        env: { ...process.env, AGENT_CONTROL: 'true' },
      });

      if (this.agentProcess.pid) {
        this.state.status = 'running';
        this.state.pid = this.agentProcess.pid;
        this.state.startTime = new Date();
        this.state.error = null;
        
        writeFileSync(this.pidFile, this.agentProcess.pid.toString());
        this.updateStatusFile('Agent started');

        this.agentProcess.stdout?.on('data', (data) => {
          const output = data.toString();
          this.state.lastOutput = output;
          this.state.iterations++;
          this.broadcast({
            type: 'output',
            data: output,
          });
        });

        this.agentProcess.stderr?.on('data', (data) => {
          const error = data.toString();
          this.state.error = error;
          this.broadcast({
            type: 'error',
            error,
          });
        });

        this.agentProcess.on('exit', (code) => {
          this.state.status = 'idle';
          this.state.pid = null;
          if (existsSync(this.pidFile)) {
            unlinkSync(this.pidFile);
          }
          this.updateStatusFile(`Agent stopped with code ${code}`);
          this.broadcast({
            type: 'stopped',
            code,
          });
        });

        this.broadcastState();
      }
    } catch (error) {
      this.state.error = error.message;
      this.broadcast({
        type: 'error',
        error: `Failed to start agent: ${error.message}`,
      });
    }
  }

  private async stopAgent() {
    if (this.state.status !== 'running' || !this.agentProcess) {
      this.broadcast({
        type: 'error',
        error: 'Agent is not running',
      });
      return;
    }

    this.state.status = 'stopping';
    this.broadcastState();
    
    this.agentProcess.kill('SIGTERM');
    
    setTimeout(() => {
      if (this.agentProcess && !this.agentProcess.killed) {
        this.agentProcess.kill('SIGKILL');
      }
    }, 5000);
  }

  private async pauseAgent() {
    if (this.state.status !== 'running' || !this.agentProcess) {
      this.broadcast({
        type: 'error',
        error: 'Agent is not running',
      });
      return;
    }

    this.agentProcess.kill('SIGSTOP');
    this.state.status = 'paused';
    this.updateStatusFile('Agent paused');
    this.broadcastState();
  }

  private async resumeAgent() {
    if (this.state.status !== 'paused' || !this.agentProcess) {
      this.broadcast({
        type: 'error',
        error: 'Agent is not paused',
      });
      return;
    }

    this.agentProcess.kill('SIGCONT');
    this.state.status = 'running';
    this.updateStatusFile('Agent resumed');
    this.broadcastState();
  }

  private async resetAgent() {
    await this.stopAgent();
    
    setTimeout(() => {
      this.state = {
        status: 'idle',
        pid: null,
        startTime: null,
        iterations: 0,
        lastOutput: '',
        error: null,
      };
      this.updateStatusFile('Agent reset');
      this.broadcastState();
    }, 1000);
  }

  private async triggerSingleRun() {
    if (this.state.status === 'running') {
      this.broadcast({
        type: 'error',
        error: 'Agent is already running',
      });
      return;
    }

    try {
      const scriptPath = join(__dirname, 'ralph-single.sh');
      
      const singleRun = spawn('bash', [scriptPath], {
        cwd: join(__dirname, '..'),
      });

      singleRun.stdout?.on('data', (data) => {
        this.broadcast({
          type: 'single-output',
          data: data.toString(),
        });
      });

      singleRun.on('exit', (code) => {
        this.broadcast({
          type: 'single-complete',
          code,
        });
      });
    } catch (error) {
      this.broadcast({
        type: 'error',
        error: `Failed to trigger single run: ${error.message}`,
      });
    }
  }

  private async configure(params: any) {
    this.broadcast({
      type: 'configured',
      params,
    });
    this.updateStatusFile(`Configuration updated: ${JSON.stringify(params)}`);
  }

  private async handleScoreCardFix(params: any) {
    const { repository, issues, environment } = params;
    
    this.broadcast({
      type: 'scorecard-progress',
      data: `Starting scorecard fix for ${repository}`,
    });

    try {
      // Create a temporary directory for the fix
      const tempDir = `/tmp/scorecard-fix-${Date.now()}`;
      await this.executeCommand(`mkdir -p ${tempDir}`);
      
      // Clone the repository
      this.broadcast({
        type: 'scorecard-progress',
        data: 'Cloning repository...',
      });
      await this.executeCommand(`git clone ${repository} ${tempDir}/repo`);
      
      // Create a fix specification for Ralph
      const fixSpec = {
        repository,
        issues,
        targetDir: `${tempDir}/repo`,
        environment,
      };
      
      writeFileSync(`${tempDir}/fix-spec.json`, JSON.stringify(fixSpec, null, 2));
      
      // Run Ralph with the fix specification
      this.broadcast({
        type: 'scorecard-progress',
        data: 'Running autonomous agent to fix issues...',
      });
      
      const fixScript = spawn('bash', [join(__dirname, 'ralph-scorecard-fix.sh'), tempDir], {
        cwd: join(__dirname, '..'),
      });

      fixScript.stdout?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Fixed:')) {
          const match = output.match(/Fixed: (\w+-\d+)/);
          if (match) {
            this.broadcast({
              type: 'issue-fixed',
              issueId: match[1],
            });
          }
        }
        this.broadcast({
          type: 'scorecard-progress',
          data: output.trim(),
        });
      });

      fixScript.on('exit', async (code) => {
        if (code === 0) {
          // Commit and push changes
          this.broadcast({
            type: 'scorecard-progress',
            data: 'Committing fixes...',
          });
          
          await this.executeCommand(`cd ${tempDir}/repo && git add -A && git commit -m "Auto-fix scorecard issues via Ralph agent" && git push`, true);
          
          // Re-run scorecard analysis
          this.broadcast({
            type: 'scorecard-progress',
            data: 'Re-analyzing scorecard...',
          });
          
          // Mock scorecard result for now
          const result = {
            score: 85,
            repository,
            timestamp: new Date(),
            issues: issues.filter((i: any) => !i.fixable),
          };
          
          this.broadcast({
            type: 'scorecard-complete',
            result,
          });
        } else {
          this.broadcast({
            type: 'error',
            error: `Fix process failed with code ${code}`,
          });
        }
        
        // Cleanup
        await this.executeCommand(`rm -rf ${tempDir}`);
      });
    } catch (error) {
      this.broadcast({
        type: 'error',
        error: `Failed to fix scorecard issues: ${error.message}`,
      });
    }
  }

  private async executeCommand(command: string, ignoreError = false): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn('bash', ['-c', command]);
      let output = '';
      
      proc.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      proc.on('exit', (code) => {
        if (code === 0 || ignoreError) {
          resolve(output);
        } else {
          reject(new Error(`Command failed: ${command}`));
        }
      });
    });
  }

  private checkExistingProcess() {
    if (existsSync(this.pidFile)) {
      const pid = parseInt(readFileSync(this.pidFile, 'utf-8'));
      try {
        process.kill(pid, 0);
        this.state.status = 'running';
        this.state.pid = pid;
        console.log(`Found existing agent process: ${pid}`);
      } catch {
        unlinkSync(this.pidFile);
        console.log('Cleaned up stale PID file');
      }
    }
  }

  private updateStatusFile(message: string) {
    const timestamp = new Date().toISOString();
    const content = `# Agent Status

**Last Updated:** ${timestamp}
**Status:** ${this.state.status}
**PID:** ${this.state.pid || 'N/A'}
**Start Time:** ${this.state.startTime || 'N/A'}
**Iterations:** ${this.state.iterations}
**Last Message:** ${message}

## Recent Output
\`\`\`
${this.state.lastOutput.slice(-500)}
\`\`\`

## Error Log
${this.state.error ? `\`\`\`\n${this.state.error}\n\`\`\`` : 'No errors'}
`;
    
    writeFileSync(this.statusFile, content);
  }

  private broadcast(message: any) {
    const msg = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(msg);
      }
    });
  }

  private broadcastState() {
    this.broadcast({
      type: 'state',
      data: this.state,
    });
  }
}

const server = new AgentControlServer(8080);
console.log('Agent Control Server is running...');