# ContextWeaver TODO List

## Phase 1: Core Setup & UI Foundation (github.gg)

### Database & Auth
- [x] Define Drizzle ORM schemas for core entities (`users`, `repositories`, `processed_repository_data`, `deep_wikis`, `repository_branches`, `repository_commits`, `ai_analysis_jobs`).
- [x] Generate and apply initial Drizzle migrations.
- [x] Set up GitHub OAuth with NextAuth.js (`src/app/api/auth/[...nextauth]/route.ts`, `src/lib/db/schema/auth-adapter-schema.ts`, `src/types/next-auth.d.ts`).
- [x] Define Drizzle Adapter Schemas for NextAuth.js (`accounts`, `sessions`, `verificationTokens`).
- [x] Generate and apply Drizzle migrations for NextAuth.js adapter tables.
- [ ] **[In Progress]** Resolve NextAuth.js `CLIENT_FETCH_ERROR` (Verify Vercel Env Vars, GitHub OAuth Callback, Vercel Logs, Schema for `accounts.userId` and `sessions.userId` to `integer`).

### Global State & UI
- [x] Setup Zustand for global state management (`src/store/store.ts`).
- [x_DONE] Create `src/app/providers.tsx` for `SessionProvider` and `ThemeProvider`.
- [x_DONE] Update `src/app/layout.tsx` to use `Providers`.
- [x] Implement Header component with Sign In/Sign Out functionality.
- [x] Implement basic landing page structure based on screenshot (`src/app/page.tsx`).
- [x] Implement Zustand store for `currentRepositoryUrl`.
- [x] Connect Search Input to Zustand store.
- [ ] **[Current Task]** Update Zustand store for repository details (loading, data, error).
- [ ] **[Current Task]** Call repository details API from frontend and display data/loading/error states.

### Core Functionality
- [x] Create API Route to Fetch Basic Repository Details from GitHub
  - [x] Use authenticated user's GitHub token
  - [x] Fetch from `api.github.com/repos/{owner}/{repo}`
  - [x] Return name, description, stars, forks, default branch, etc.
- [x] Implement Repository Search/Input functionality.
- [x] Implement Repository Ingestion Service.
  - [x] Securely clone repository.
  - [x] Aggregate file structure and content into monolithic JSON.
  - [x] Analyze commit history.
  - [x] Store processed data in Vercel Blob.
  - [x] Trigger AI Knowledge Base Generation.
- [ ] Display Fetched Repository Details on Frontend.

### AI & Knowledge Base
- [x] Implement AI-Generated Knowledge Base (DeepWiki Style).
  - [x] Define detailed prompt for Gemini 2.5 Pro.
  - [x] Service to call Gemini API and store structured output.
  - [x] UI to display DeepWiki.
- [x] Implement Conversational AI Interface.
  - [x] Persistent chat panel component.
  - [x] Context-aware (current repository, page).
  - [x] Backend API route to stream responses from Gemini.
- [ ] Implement AI-Generated Knowledge Base (DeepWiki Style - `project.md` spec)
  - [ ] Define prompt for Gemini 2.5 Pro
  - [ ] API route to trigger DeepWiki generation
  - [ ] Store DeepWiki content in `deep_wikis` table
  - [ ] Frontend to display DeepWiki content
- [ ] Implement Conversational AI Interface ("Live" Chat - `project.md` spec)
  - [ ] Persistent chat panel
  - [ ] Context-aware (current repo, page)
  - [ ] Use Gemini 2.5 Pro via AI SDK
  - [ ] Features: Q&A, summarization, code generation, navigation, diagrams

## Phase 2: Advanced Features & Polish
- [ ] User dashboard to manage linked repositories
- [ ] Detailed code exploration features (file tree, code viewer with AI annotations)
- [ ] Socket.dev integration for dependency analysis
- [ ] Stripe integration for premium features/pricing tiers
- [ ] Proactive assistance features
- [ ] Refine UI/UX, error handling, performance optimizations

## Long Term / Vision
- [ ] Transform `github.gg` into full ContextWeaver platform
- [ ] Community features (sharing insights, discussions)
- [ ] Expand AI capabilities (e.g., automated code reviews, security vulnerability detection)
