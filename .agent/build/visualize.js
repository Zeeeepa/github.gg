#!/usr/bin/env bun
// @bun

// agent/visualize.ts
import { createInterface } from "readline";
var colors = {
  reset: "\x1B[0m",
  bright: "\x1B[1m",
  dim: "\x1B[2m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m"
};
function getTypeColor(type) {
  switch (type) {
    case "system":
      return colors.magenta;
    case "user":
      return colors.blue;
    case "assistant":
      return colors.green;
    case "tool_use":
      return colors.cyan;
    case "tool_result":
      return colors.yellow;
    case "message":
      return colors.dim;
    case "text":
      return colors.reset;
    default:
      return colors.reset;
  }
}
function formatTodoList(todos) {
  let output = `\uD83D\uDCCB ${colors.bright}${colors.cyan}Todo List Update${colors.reset}
`;
  const statusColors = {
    completed: colors.dim + colors.green,
    in_progress: colors.bright + colors.yellow,
    pending: colors.reset
  };
  const statusIcons = {
    completed: "\u2705",
    in_progress: "\uD83D\uDD04",
    pending: "\u23F8\uFE0F"
  };
  const priorityColors = {
    high: colors.red,
    medium: colors.yellow,
    low: colors.dim
  };
  todos.forEach((todo, index) => {
    const statusColor = statusColors[todo.status] || colors.reset;
    const statusIcon = statusIcons[todo.status] || "\u2753";
    const priorityColor = priorityColors[todo.priority] || colors.reset;
    const checkbox = todo.status === "completed" ? "\u2611\uFE0F" : "\u2610";
    output += `  ${checkbox} ${statusIcon} ${statusColor}${todo.content}${colors.reset}`;
    output += ` ${priorityColor}[${todo.priority}]${colors.reset}`;
    if (todo.status === "in_progress") {
      output += ` ${colors.bright}${colors.yellow}\u2190 ACTIVE${colors.reset}`;
    }
    output += `
`;
  });
  const completed = todos.filter((t) => t.status === "completed").length;
  const inProgress = todos.filter((t) => t.status === "in_progress").length;
  const pending = todos.filter((t) => t.status === "pending").length;
  output += `
  ${colors.dim}\uD83D\uDCCA Progress: ${colors.green}${completed} completed${colors.reset}`;
  output += `${colors.dim}, ${colors.yellow}${inProgress} active${colors.reset}`;
  output += `${colors.dim}, ${colors.reset}${pending} pending${colors.reset}`;
  output += `${colors.dim} (${Math.round(completed / todos.length * 100)}% done)${colors.reset}`;
  return output;
}
function formatConcise(json) {
  const type = json.type || "unknown";
  const typeColor = getTypeColor(type);
  let output = `\u23FA ${typeColor}${type.charAt(0).toUpperCase() + type.slice(1)}${colors.reset}`;
  if (type === "assistant" && json.message?.content?.[0]?.name === "TodoWrite") {
    const toolInput = json.message.content[0].input;
    if (toolInput?.todos && Array.isArray(toolInput.todos)) {
      return formatTodoList(toolInput.todos);
    }
  }
  if (type === "assistant" && json.message?.content?.[0]?.name) {
    const toolName = json.message.content[0].name;
    const toolInput = json.message.content[0].input;
    let toolDisplay = `${colors.cyan}${toolName}${colors.reset}`;
    if (toolInput) {
      const keyArgs = [];
      if (toolInput.file_path)
        keyArgs.push(toolInput.file_path);
      else if (toolInput.path)
        keyArgs.push(toolInput.path);
      else if (toolInput.pattern)
        keyArgs.push(`"${toolInput.pattern}"`);
      else if (toolInput.command)
        keyArgs.push(toolInput.command);
      else if (toolInput.cmd)
        keyArgs.push(toolInput.cmd);
      else if (toolInput.query)
        keyArgs.push(`"${toolInput.query}"`);
      else if (toolInput.description)
        keyArgs.push(toolInput.description);
      else if (toolInput.prompt)
        keyArgs.push(`"${toolInput.prompt.substring(0, 30)}..."`);
      else if (toolInput.url)
        keyArgs.push(toolInput.url);
      if (keyArgs.length > 0) {
        toolDisplay += `(${colors.green}${keyArgs[0]}${colors.reset})`;
      }
    }
    output = `\u23FA ${toolDisplay}`;
    if (toolInput) {
      const additionalArgs = [];
      if (toolName === "Bash" && toolInput.cwd) {
        additionalArgs.push(`cwd: ${toolInput.cwd}`);
      }
      if (toolInput.limit)
        additionalArgs.push(`limit: ${toolInput.limit}`);
      if (toolInput.offset)
        additionalArgs.push(`offset: ${toolInput.offset}`);
      if (toolInput.include)
        additionalArgs.push(`include: ${toolInput.include}`);
      if (toolInput.old_string && toolInput.new_string) {
        additionalArgs.push(`replace: "${toolInput.old_string.substring(0, 20)}..." \u2192 "${toolInput.new_string.substring(0, 20)}..."`);
      }
      if (toolInput.timeout)
        additionalArgs.push(`timeout: ${toolInput.timeout}ms`);
      if (additionalArgs.length > 0) {
        output += `
  \u23BF  ${colors.dim}${additionalArgs.join(", ")}${colors.reset}`;
      }
    }
  } else if (type === "tool_result" && json.name) {
    output += `(${colors.cyan}${json.name}${colors.reset})`;
  } else if (type === "user" && json.message?.content?.[0]) {
    const content = json.message.content[0];
    if (content.type === "tool_result") {
      output = `\u23FA ${colors.yellow}Tool Result${colors.reset}`;
      if (content.content) {
        const resultText = typeof content.content === "string" ? content.content : JSON.stringify(content.content);
        const lines = resultText.split(`
`);
        const chars = resultText.length;
        output += `
  \u23BF  ${colors.dim}${lines.length} lines, ${chars} chars${colors.reset}`;
        if (content.is_error) {
          output += ` ${colors.red}ERROR${colors.reset}`;
        }
        if (lines.length > 0 && lines[0].trim()) {
          output += `
  \u23BF  ${colors.reset}${lines[0]}${colors.reset}`;
        }
        if (lines.length > 1 && lines[1].trim()) {
          output += `
      ${colors.dim}${lines[1]}${colors.reset}`;
        }
      }
    } else if (content.text) {
      const text = content.text.substring(0, 50);
      output += `: ${colors.dim}${text}${text.length === 50 ? "..." : ""}${colors.reset}`;
    }
  } else if (type === "system" && json.subtype) {
    output += `(${colors.dim}${json.subtype}${colors.reset})`;
  }
  if (type === "assistant" && json.message?.content) {
    const textContent = json.message.content.find((c) => c.type === "text");
    if (textContent?.text) {
      const lines = textContent.text.split(`
`).slice(0, 3);
      output += `
  \u23BF  ${colors.reset}${lines[0]}${colors.reset}`;
      if (lines.length > 1) {
        output += `
      ${colors.dim}${lines[1]}${colors.reset}`;
      }
      if (lines.length > 2) {
        output += `
      ${colors.dim}${lines[2]}${colors.reset}`;
      }
      if (textContent.text.split(`
`).length > 3) {
        output += `
      ${colors.dim}...${colors.reset}`;
      }
    }
  }
  let summary = "";
  if (json.message?.usage) {
    const usage = json.message.usage;
    summary = `${usage.input_tokens || 0}/${usage.output_tokens || 0} tokens`;
  } else if (json.output && typeof json.output === "string") {
    summary = `${json.output.length} chars output`;
  } else if (json.message?.content?.length) {
    summary = `${json.message.content.length} content items`;
  } else if (json.tools?.length) {
    summary = `${json.tools.length} tools available`;
  }
  if (summary) {
    output += `
  \u23BF  ${colors.dim}${summary}${colors.reset}`;
  }
  return output;
}
async function processStream() {
  const rl = createInterface({
    input: process.stdin,
    crlfDelay: Infinity
  });
  const debugMode = process.argv.includes("--debug");
  const toolCalls = new Map;
  const pendingResults = new Map;
  let lastLine = null;
  let isLastAssistantMessage = false;
  rl.on("line", (line) => {
    if (line.trim()) {
      const timestamp = debugMode ? `${colors.dim}[${new Date().toISOString()}]${colors.reset} ` : "";
      try {
        const json = JSON.parse(line);
        if (json.type === "assistant" && json.message?.content?.[0]?.id) {
          const toolCall = json.message.content[0];
          const toolId = toolCall.id;
          toolCalls.set(toolId, {
            toolCall: json,
            timestamp
          });
          if (pendingResults.has(toolId)) {
            const result = pendingResults.get(toolId);
            displayToolCallWithResult(toolCall, json, result.toolResult, result.timestamp, timestamp);
            pendingResults.delete(toolId);
          } else {
            process.stdout.write(`${timestamp + formatConcise(json)}
`);
            process.stdout.write(`${colors.dim}  \u23BF  Waiting for result...${colors.reset}

`);
          }
        } else if (json.type === "user" && json.message?.content?.[0]?.type === "tool_result") {
          const toolResult = json.message.content[0];
          const toolId = toolResult.tool_use_id;
          if (toolCalls.has(toolId)) {
            const stored = toolCalls.get(toolId);
            displayToolCallWithResult(stored.toolCall.message.content[0], stored.toolCall, json, stored.timestamp, timestamp);
            toolCalls.delete(toolId);
          } else {
            pendingResults.set(toolId, {
              toolResult: json,
              timestamp
            });
          }
        } else if (json.type === "result" && json.result) {
          process.stdout.write(`${timestamp + formatConcise(json)}

`);
          process.stdout.write(`${colors.bright}${colors.green}=== Final Result ===${colors.reset}

`);
          process.stdout.write(`${json.result}
`);
        } else {
          process.stdout.write(`${timestamp + formatConcise(json)}

`);
        }
        lastLine = json;
        isLastAssistantMessage = json.type === "assistant" && !json.message?.content?.[0]?.id;
      } catch (_error) {
        process.stdout.write(`${timestamp}${colors.red}\u23FA Parse Error${colors.reset}
`);
        process.stdout.write(`  \u23BF  ${colors.dim}${line.substring(0, 50)}...${colors.reset}

`);
      }
    }
  });
  rl.on("close", () => {
    if (isLastAssistantMessage && lastLine?.message?.content?.[0]?.text) {
      process.stdout.write(`
${colors.bright}${colors.green}=== Final Assistant Message ===${colors.reset}

`);
      process.stdout.write(`${lastLine.message.content[0].text}
`);
    }
  });
}
function displayToolCallWithResult(toolCall, toolCallJson, toolResultJson, callTimestamp, resultTimestamp) {
  process.stdout.write(`${callTimestamp}${formatConcise(toolCallJson)}
`);
  const toolResult = toolResultJson.message.content[0];
  const isError = toolResult.is_error;
  const resultIcon = isError ? "\u274C" : "\u2705";
  const resultColor = isError ? colors.red : colors.green;
  process.stdout.write(`  ${resultTimestamp}${resultIcon} ${resultColor}Tool Result${colors.reset}`);
  if (toolResult.content) {
    const resultText = typeof toolResult.content === "string" ? toolResult.content : JSON.stringify(toolResult.content);
    const lines = resultText.split(`
`);
    const chars = resultText.length;
    process.stdout.write(` ${colors.dim}(${lines.length} lines, ${chars} chars)${colors.reset}`);
    if (isError) {
      process.stdout.write(` ${colors.red}ERROR${colors.reset}`);
    }
    const linesToShow = Math.min(3, lines.length);
    for (let i = 0;i < linesToShow; i++) {
      if (lines[i].trim()) {
        const lineColor = i === 0 ? colors.reset : colors.dim;
        process.stdout.write(`
    \u23BF  ${lineColor}${lines[i]}${colors.reset}`);
      }
    }
    if (lines.length > linesToShow) {
      process.stdout.write(`
    \u23BF  ${colors.dim}... ${lines.length - linesToShow} more lines${colors.reset}`);
    }
  }
  process.stdout.write(`

`);
}
if (__require.main == __require.module) {
  processStream().catch(console.error);
}
