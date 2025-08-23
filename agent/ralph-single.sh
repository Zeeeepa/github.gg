#!/bin/bash

AGENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$AGENT_DIR")"
STATUS_FILE="$PROJECT_ROOT/.agent/status.md"

echo "Single run triggered at $(date)" >> "$STATUS_FILE"
echo "Running single iteration..."

cat "$AGENT_DIR/prompt.md" | \
    claude -p --output-format=stream-json --verbose --dangerously-skip-permissions \
    --add-dir="$PROJECT_ROOT" | \
    tee -a "$PROJECT_ROOT/claude_output.jsonl" | \
    bun "$AGENT_DIR/visualize.ts" --debug

echo "Single run completed at $(date)" >> "$STATUS_FILE"