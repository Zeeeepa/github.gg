#!/bin/bash

AGENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$AGENT_DIR")"
PID_FILE="$AGENT_DIR/.agent.pid"
STATUS_FILE="$PROJECT_ROOT/.agent/status.md"

echo "$$" > "$PID_FILE"

cleanup() {
    echo "Cleaning up..."
    rm -f "$PID_FILE"
    echo "Agent stopped at $(date)" >> "$STATUS_FILE"
    exit 0
}

pause_handler() {
    echo "Agent paused at $(date)" >> "$STATUS_FILE"
    kill -STOP $$
}

resume_handler() {
    echo "Agent resumed at $(date)" >> "$STATUS_FILE"
}

trap cleanup SIGTERM SIGINT
trap pause_handler SIGTSTP
trap resume_handler SIGCONT

echo "Agent started with PID $$ at $(date)" >> "$STATUS_FILE"
echo "Running enhanced Ralph agent..."

ITERATION=0

while :; do
    ITERATION=$((ITERATION + 1))
    echo "=== Iteration $ITERATION ==="
    
    cat "$AGENT_DIR/prompt.md" | \
        claude -p --output-format=stream-json --verbose --dangerously-skip-permissions \
        --add-dir="$PROJECT_ROOT" | \
        tee -a "$PROJECT_ROOT/claude_output.jsonl" | \
        bun "$AGENT_DIR/visualize.ts" --debug
    
    echo -e "===SLEEP===\n===SLEEP===\n"
    echo "Iteration $ITERATION completed at $(date)" >> "$STATUS_FILE"
    echo 'looping'
    
    SLEEP_TIME="${AGENT_SLEEP_TIME:-10}"
    sleep "$SLEEP_TIME"
done