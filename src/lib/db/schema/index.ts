// This file will export all schemas for Drizzle Kit

export * from "./users"
export * from "./repositories"
export * from "./processed_repository_data"
export * from "./deep_wikis"
export * from "./repository_branches"
export * from "./repository_commits"
export * from "./ai_analysis_jobs"
export * from "./auth-adapter-schema" // For NextAuth.js Drizzle adapter

// Optional: Define relations here if you plan to use Drizzle's relational queries extensively.
// This can help Drizzle ORM understand how your tables are connected.
// Example:
/*
import { relations } from 'drizzle-orm';
import { users } from './users';
import { repositories } from './repositories';
import { processedRepositoryData } from './processed_repository_data';
import { deepWikis } from './deep_wikis';
import { repositoryBranches } from './repository_branches';
import { repositoryCommits } from './repository_commits';
import { aiAnalysisJobs } from './ai_analysis_jobs';
import { accounts, sessions } from './auth-adapter-schema';

export const usersRelations = relations(users, ({ many, one }) => ({
  repositoriesOwned: many(repositories, { relationName: 'repositoriesOwnedByUsers' }), // Repositories added by this user
  initiatedAiJobs: many(aiAnalysisJobs),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const repositoriesRelations = relations(repositories, ({ one, many }) => ({
  owner: one(users, {
    fields: [repositories.ownerId],
    references: [users.id],
    relationName: 'repositoriesOwnedByUsers',
  }),
  processedData: one(processedRepositoryData, {
    fields: [repositories.id],
    references: [processedRepositoryData.repositoryId],
  }),
  deepWiki: one(deepWikis, {
    fields: [repositories.id],
    references: [deepWikis.repositoryId],
  }),
  branches: many(repositoryBranches),
  commits: many(repositoryCommits),
  aiAnalysisJobs: many(aiAnalysisJobs),
}));

export const processedRepositoryDataRelations = relations(processedRepositoryData, ({ one }) => ({
  repository: one(repositories, {
    fields: [processedRepositoryData.repositoryId],
    references: [repositories.id],
  }),
}));

export const deepWikisRelations = relations(deepWikis, ({ one }) => ({
  repository: one(repositories, {
    fields: [deepWikis.repositoryId],
    references: [repositories.id],
  }),
}));

export const repositoryBranchesRelations = relations(repositoryBranches, ({ one }) => ({
  repository: one(repositories, {
    fields: [repositoryBranches.repositoryId],
    references: [repositories.id],
  }),
}));

export const repositoryCommitsRelations = relations(repositoryCommits, ({ one }) => ({
  repository: one(repositories, {
    fields: [repositoryCommits.repositoryId],
    references: [repositories.id],
  }),
}));

export const aiAnalysisJobsRelations = relations(aiAnalysisJobs, ({ one }) => ({
  repository: one(repositories, {
    fields: [aiAnalysisJobs.repositoryId],
    references: [repositories.id],
  }),
  initiatedByUser: one(users, {
    fields: [aiAnalysisJobs.initiatedByUserId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id],
	}),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));
*/
// For now, we'll keep it simple and just export the schemas.
// Uncomment and adjust the relations above if/when needed.
