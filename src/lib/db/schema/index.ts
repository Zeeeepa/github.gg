// This file will export all schemas for Drizzle Kit

export * from "./users"
export * from "./repositories"
export * from "./processed_repository_data"
export * from "./deep_wikis"
export * from "./repository_branches"
export * from "./repository_commits"
export * from "./ai_analysis_jobs"

// You might also want to define relations here if you're using Drizzle's relational queries extensively
// import { relations } from 'drizzle-orm';
// export const usersRelations = relations(users, ({ many }) => ({
//  repositories: many(repositories),
// }));
// ... and so on for other tables
