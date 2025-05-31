# ContextWeaver Development TODOs

## I. Project Setup & Core Infrastructure
- [x] Initialize Next.js project with Bun (Assumed mostly complete from github.gg base)
- [x] Setup PostgreSQL database (User confirmed done)
- [x] Integrate Drizzle ORM
    - [x] Define `users` table schema
    - [x] Define `repositories` table schema
    - [x] Define `processed_repository_data` table schema
    - [x] Define `deep_wikis` table schema
    - [x] Define `repository_branches` table schema
    - [x] Define `repository_commits` table schema
    - [x] Define `ai_analysis_jobs` table schema
- [ ] Setup GitHub OAuth for user authentication
- [ ] Basic UI layout (collapsible sidebar, main content area, persistent chat panel)
- [ ] Setup Zustand for global state management (`store.ts`)

## II. Repository Ingestion & Processing
- [ ] Backend API endpoint for initiating repository analysis (`/api/git/initiate-analysis`)
- [ ] Repository Processing Service
    - [ ] Secure cloning of repositories
    - [ ] File and content aggregation into monolithic JSON
    - [ ] Commit history and author analysis (initial pass)
    - [ ] Store processed data (monolith, commit history) in Vercel Blob
    - [ ] Update database with processing status and data pointers
- [ ] Trigger AI Knowledge Base Generation

## III. AI-Generated Knowledge Base (DeepWiki Style)
- [ ] AI Orchestration Layer for Gemini 2.5 Pro
    - [ ] Prompt engineering for DeepWiki generation
- [ ] Store AI-generated wiki content in database
- [ ] Frontend display for DeepWiki
    - [ ] Sidebar navigation for wiki sections
    - [ ] Render Markdown content
    - [ ] Render Mermaid diagrams

## IV. Conversational AI Interface ("Live" Chat)
- [ ] Persistent chat panel UI
- [ ] Backend API for chat (`/api/chat` using Vercel AI SDK `useChat`)
- [ ] Context-aware prompting (current repo, current file/wiki section)
- [ ] Implement chat capabilities:
    - [ ] Q&A
    - [ ] Summarization
    - [ ] Explanation
    - [ ] Code Generation (simple cases)
    - [ ] Navigation Assistance
    - [ ] Diagram Generation (on-the-fly Mermaid)
    - [ ] Triggering Actions (e.g., "run security audit")

## V. Advanced Features & Integrations
- [ ] Enhanced Code Browsing (Syntax highlighting, go-to-definition stubs)
- [ ] Author Intelligence & Contribution Analysis
- [ ] Security Audits (Socket.dev integration)
- [ ] AI Code Suggestions & PR Generation (Agentic capabilities)
- [ ] Stripe Integration for Subscriptions
- [ ] User Preferences & Settings

## VI. Refinement & Deployment
- [ ] Comprehensive testing
- [ ] UI/UX polishing
- [ ] Documentation
- [ ] Deployment to Vercel

---
*Self-correction: Added `repository_branches`, `repository_commits`, and `ai_analysis_jobs` to the Drizzle schemas for more granular control and tracking, which will be beneficial for features like branch-specific analysis and detailed commit history features.*
