// This file can be used to export all schemas for easier imports elsewhere
// For now, we'll keep them separate as individual files are clear.
// As the project grows, we might consolidate exports here.

export * from "./users"
export * from "./repositories"
export * from "./repository-processing-jobs"
export * from "./processed-repository-data"
export * from "./deep-wikis"
export * from "./chat-sessions"
export * from "./chat-messages"

// You might also define relations here if you prefer that pattern,
// though Drizzle ORM often handles relations implicitly or through explicit queries.
