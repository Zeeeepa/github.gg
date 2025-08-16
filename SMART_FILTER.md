# AI-Powered Smart File Filtering

This document explains the new intelligent file filtering system for diagram generation.

## Overview

Instead of processing ALL repository files or using simple rule-based filtering, we now use AI to intelligently select the most relevant files for diagram generation.

## How It Works

### 1. **File Tree Analysis** 🌳
- Extract file tree structure (paths only, no content)
- Analyze project type, language, and framework
- Build hierarchical representation for AI

### 2. **AI File Selection** 🤖
- Send file tree + project metadata to Gemini AI
- AI analyzes structure and selects most relevant files/directories
- Returns specific file paths + reasoning + confidence score

### 3. **Targeted File Fetching** 📁
- Fetch ONLY the files selected by AI
- Much more efficient than processing hundreds of files
- Better diagram quality due to focused input

## Benefits

### 🎯 **Precision**
- AI understands project architecture patterns
- Selects files based on diagram type needs
- Adapts to different frameworks automatically

### ⚡ **Performance**
- Reduced file processing (30-50 files vs 500+)
- Lower token costs for diagram generation
- Faster processing times

### 🧠 **Intelligence**
- Understands relationships between files
- Identifies core vs peripheral components
- Considers diagram-specific requirements

## Configuration Options

```typescript
// Enable/disable AI file selection
useAIFileSelection: boolean = true

// Fallback to rule-based filtering if AI fails
enableSmartFilter: boolean = true

// Override max files (10-200)
maxFiles?: number
```

## Diagram-Specific Selection

### Flowchart
- Focuses on data flow and business logic
- Prioritizes API endpoints, services, components
- Shows system architecture

### Sequence Diagram
- Emphasizes request/response flows
- Includes API routes, controllers, middleware
- Traces interaction patterns

### Class Diagram
- Highlights data models and types
- Includes interfaces, schemas, entities
- Shows relationships and inheritance

### Gantt Chart
- Looks for project management files
- Includes README, TODO, configuration
- Focuses on development workflow

## Fallback System

If AI file selection fails:
1. **Rule-based filtering** - Uses scoring system based on file types
2. **Basic filtering** - Simple extension-based filtering
3. **No filtering** - Process all files (fallback of last resort)

## File Tree Example

```
📁 src/
  📁 api/
    📄 users.ts (2KB)
    📄 auth.ts (1.5KB)
  📁 components/
    📄 Button.tsx (800B)
    📄 Header.tsx (1.2KB)
  📄 index.ts (500B)
📄 package.json (2.5KB)
📁 tests/
  📄 user.test.ts (1KB)
```

**AI Selection for Flowchart:**
- ✅ `src/index.ts` (main entry point)
- ✅ `src/api/users.ts` (API endpoint)
- ✅ `src/api/auth.ts` (authentication logic)
- ✅ `package.json` (dependencies/config)
- ❌ `tests/` (not relevant for architecture)

## Usage

The AI file selection is enabled by default. You can disable it by setting:

```typescript
{
  useAIFileSelection: false,
  enableSmartFilter: true // Falls back to rule-based
}
```

## Monitoring

Check console logs for AI selection results:

```
🤖 AI analyzing 127 files for flowchart diagram...
🎯 AI selected 8 files + 2 directories  
💡 AI reasoning: Selected core API endpoints and main components
📊 AI confidence: 9/10
```

## Cost Impact

- **Before**: 500 files × 2KB avg = ~1MB of content to AI
- **After**: 30 files × 2KB avg = ~60KB of content to AI
- **Savings**: ~95% reduction in AI processing costs
- **Additional Cost**: Small file tree analysis (~5KB)
- **Net Savings**: ~90% cost reduction overall