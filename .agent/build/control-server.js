#!/usr/bin/env bun
// @bun

// agent/control-server.ts
import { WebSocketServer } from "ws";
import { spawn } from "child_process";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";
var __dirname = "/home/ubuntu/github.gg/agent";

class AgentControlServer {
  wss;
  agentProcess = null;
  state = {
    status: "idle",
    pid: null,
    startTime: null,
    iterations: 0,
    lastOutput: "",
    error: null
  };
  clients = new Set;
  pidFile = join(__dirname, ".agent.pid");
  statusFile = join(__dirname, "../.agent/status.md");
  constructor(port = 8080) {
    this.wss = new WebSocketServer({ port });
    this.setupWebSocket();
    this.checkExistingProcess();
    console.log(`Agent Control Server started on port ${port}`);
  }
  setupWebSocket() {
    this.wss.on("connection", (ws) => {
      this.clients.add(ws);
      console.log("New client connected");
      ws.send(JSON.stringify({
        type: "state",
        data: this.state
      }));
      ws.on("message", (message) => {
        try {
          const msg = JSON.parse(message.toString());
          this.handleCommand(msg, ws);
        } catch (error) {
          ws.send(JSON.stringify({
            type: "error",
            error: "Invalid message format"
          }));
        }
      });
      ws.on("close", () => {
        this.clients.delete(ws);
        console.log("Client disconnected");
      });
    });
  }
  async handleCommand(msg, ws) {
    const { command, params } = msg;
    switch (command) {
      case "start":
        await this.startAgent();
        break;
      case "stop":
        await this.stopAgent();
        break;
      case "pause":
        await this.pauseAgent();
        break;
      case "resume":
        await this.resumeAgent();
        break;
      case "reset":
        await this.resetAgent();
        break;
      case "trigger":
        await this.triggerSingleRun();
        break;
      case "status":
        this.broadcastState();
        break;
      case "configure":
        await this.configure(params);
        break;
      default:
        ws.send(JSON.stringify({
          type: "error",
          error: `Unknown command: ${command}`
        }));
    }
  }
  async startAgent() {
    if (this.state.status === "running") {
      this.broadcast({
        type: "error",
        error: "Agent is already running"
      });
      return;
    }
    try {
      const scriptPath = join(__dirname, "ralph-enhanced.sh");
      this.agentProcess = spawn("bash", [scriptPath], {
        cwd: join(__dirname, ".."),
        env: { ...process.env, AGENT_CONTROL: "true" }
      });
      if (this.agentProcess.pid) {
        this.state.status = "running";
        this.state.pid = this.agentProcess.pid;
        this.state.startTime = new Date;
        this.state.error = null;
        writeFileSync(this.pidFile, this.agentProcess.pid.toString());
        this.updateStatusFile("Agent started");
        this.agentProcess.stdout?.on("data", (data) => {
          const output = data.toString();
          this.state.lastOutput = output;
          this.state.iterations++;
          this.broadcast({
            type: "output",
            data: output
          });
        });
        this.agentProcess.stderr?.on("data", (data) => {
          const error = data.toString();
          this.state.error = error;
          this.broadcast({
            type: "error",
            error
          });
        });
        this.agentProcess.on("exit", (code) => {
          this.state.status = "idle";
          this.state.pid = null;
          if (existsSync(this.pidFile)) {
            unlinkSync(this.pidFile);
          }
          this.updateStatusFile(`Agent stopped with code ${code}`);
          this.broadcast({
            type: "stopped",
            code
          });
        });
        this.broadcastState();
      }
    } catch (error) {
      this.state.error = error.message;
      this.broadcast({
        type: "error",
        error: `Failed to start agent: ${error.message}`
      });
    }
  }
  async stopAgent() {
    if (this.state.status !== "running" || !this.agentProcess) {
      this.broadcast({
        type: "error",
        error: "Agent is not running"
      });
      return;
    }
    this.state.status = "stopping";
    this.broadcastState();
    this.agentProcess.kill("SIGTERM");
    setTimeout(() => {
      if (this.agentProcess && !this.agentProcess.killed) {
        this.agentProcess.kill("SIGKILL");
      }
    }, 5000);
  }
  async pauseAgent() {
    if (this.state.status !== "running" || !this.agentProcess) {
      this.broadcast({
        type: "error",
        error: "Agent is not running"
      });
      return;
    }
    this.agentProcess.kill("SIGSTOP");
    this.state.status = "paused";
    this.updateStatusFile("Agent paused");
    this.broadcastState();
  }
  async resumeAgent() {
    if (this.state.status !== "paused" || !this.agentProcess) {
      this.broadcast({
        type: "error",
        error: "Agent is not paused"
      });
      return;
    }
    this.agentProcess.kill("SIGCONT");
    this.state.status = "running";
    this.updateStatusFile("Agent resumed");
    this.broadcastState();
  }
  async resetAgent() {
    await this.stopAgent();
    setTimeout(() => {
      this.state = {
        status: "idle",
        pid: null,
        startTime: null,
        iterations: 0,
        lastOutput: "",
        error: null
      };
      this.updateStatusFile("Agent reset");
      this.broadcastState();
    }, 1000);
  }
  async triggerSingleRun() {
    if (this.state.status === "running") {
      this.broadcast({
        type: "error",
        error: "Agent is already running"
      });
      return;
    }
    try {
      const scriptPath = join(__dirname, "ralph-single.sh");
      const singleRun = spawn("bash", [scriptPath], {
        cwd: join(__dirname, "..")
      });
      singleRun.stdout?.on("data", (data) => {
        this.broadcast({
          type: "single-output",
          data: data.toString()
        });
      });
      singleRun.on("exit", (code) => {
        this.broadcast({
          type: "single-complete",
          code
        });
      });
    } catch (error) {
      this.broadcast({
        type: "error",
        error: `Failed to trigger single run: ${error.message}`
      });
    }
  }
  async configure(params) {
    this.broadcast({
      type: "configured",
      params
    });
    this.updateStatusFile(`Configuration updated: ${JSON.stringify(params)}`);
  }
  checkExistingProcess() {
    if (existsSync(this.pidFile)) {
      const pid = parseInt(readFileSync(this.pidFile, "utf-8"));
      try {
        process.kill(pid, 0);
        this.state.status = "running";
        this.state.pid = pid;
        console.log(`Found existing agent process: ${pid}`);
      } catch {
        unlinkSync(this.pidFile);
        console.log("Cleaned up stale PID file");
      }
    }
  }
  updateStatusFile(message) {
    const timestamp = new Date().toISOString();
    const content = `# Agent Status

**Last Updated:** ${timestamp}
**Status:** ${this.state.status}
**PID:** ${this.state.pid || "N/A"}
**Start Time:** ${this.state.startTime || "N/A"}
**Iterations:** ${this.state.iterations}
**Last Message:** ${message}

## Recent Output
\`\`\`
${this.state.lastOutput.slice(-500)}
\`\`\`

## Error Log
${this.state.error ? `\`\`\`
${this.state.error}
\`\`\`` : "No errors"}
`;
    writeFileSync(this.statusFile, content);
  }
  broadcast(message) {
    const msg = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(msg);
      }
    });
  }
  broadcastState() {
    this.broadcast({
      type: "state",
      data: this.state
    });
  }
}
var server = new AgentControlServer(8080);
console.log("Agent Control Server is running...");
