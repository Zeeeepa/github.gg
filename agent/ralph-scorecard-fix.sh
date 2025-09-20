#!/bin/bash

# Ralph ScoreCard Fix Script
# This script runs the Ralph agent specifically to fix scorecard issues

TEMP_DIR="$1"
AGENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$AGENT_DIR")"

if [ -z "$TEMP_DIR" ]; then
    echo "Error: Temporary directory not specified"
    exit 1
fi

FIX_SPEC="$TEMP_DIR/fix-spec.json"
REPO_DIR="$TEMP_DIR/repo"

if [ ! -f "$FIX_SPEC" ]; then
    echo "Error: Fix specification not found"
    exit 1
fi

if [ ! -d "$REPO_DIR" ]; then
    echo "Error: Repository directory not found"
    exit 1
fi

echo "Starting ScoreCard fix process..."
echo "Repository: $REPO_DIR"
echo "Fix spec: $FIX_SPEC"

# Read the fix specification
ISSUES=$(jq -r '.issues[]' "$FIX_SPEC" 2>/dev/null || echo "[]")

# Create a custom prompt for Ralph with the scorecard issues
cat > "$TEMP_DIR/scorecard-prompt.md" << 'EOF'
# Ralph Wiggum - ScoreCard Fix Agent

You are an autonomous coding agent tasked with fixing repository scorecard issues.

## Target Repository
The repository is located at: REPO_PATH

## Issues to Fix
The following issues have been identified and need to be fixed:
ISSUES_LIST

## Instructions
1. Analyze each issue carefully
2. Implement appropriate fixes
3. Ensure code quality and security standards
4. Follow best practices for the language/framework
5. Test your changes where possible
6. For each fixed issue, output: "Fixed: [issue-id]"

## Priority Order
1. Critical security issues
2. High severity bugs
3. Dependency vulnerabilities
4. Code quality issues
5. Linting/formatting issues

Start fixing the issues now. Be autonomous and thorough.
EOF

# Replace placeholders in the prompt
sed -i "s|REPO_PATH|$REPO_DIR|g" "$TEMP_DIR/scorecard-prompt.md"

# Format issues for the prompt
echo "" >> "$TEMP_DIR/scorecard-prompt.md"
echo "### Issues Detail:" >> "$TEMP_DIR/scorecard-prompt.md"
jq -r '.issues[] | "- **\(.id)** [\(.severity)]: \(.description)\n  Category: \(.category)\n  \(if .file then "File: \(.file):\(.line // "")" else "" end)"' "$FIX_SPEC" >> "$TEMP_DIR/scorecard-prompt.md" 2>/dev/null

# Change to the repository directory
cd "$REPO_DIR"

# Run Claude with the scorecard fix prompt
echo "Running Claude to fix issues..."
cat "$TEMP_DIR/scorecard-prompt.md" | \
    claude -p --output-format=stream-json --verbose --dangerously-skip-permissions \
    --add-dir="$REPO_DIR" | \
    tee "$TEMP_DIR/fix-output.jsonl" | \
    bun "$AGENT_DIR/visualize.ts" --scorecard-mode

# Check if fixes were successful
if [ $? -eq 0 ]; then
    echo "ScoreCard fixes completed successfully"
    
    # Parse the output to identify fixed issues
    grep "Fixed:" "$TEMP_DIR/fix-output.jsonl" | while read -r line; do
        echo "$line"
    done
    
    exit 0
else
    echo "Error: ScoreCard fix process failed"
    exit 1
fi