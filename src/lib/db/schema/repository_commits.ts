import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core"
import { repositories } from "./repositories"

export const repositoryCommits = pgTable("repository_commits", {
  id: serial("id").primaryKey(),
  repositoryId: integer("repository_id")
    .references(() => repositories.id, { onDelete: "cascade" })
    .notNull(),
  sha: text("sha").notNull().unique(),
  message: text("message").notNull(),
  authorName: text("author_name"),
  authorEmail: text("author_email"),
  authorGithubUserId: text("author_github_user_id"), // If author can be mapped to a GitHub user ID
  committerName: text("committer_name"),
  committerEmail: text("committer_email"),
  committedAt: timestamp("committed_at").notNull(),
  // platformUserId: integer('platform_user_id').references(() => users.id), // If author/committer is a user of ContextWeaver
  additions: integer("additions"),
  deletions: integer("deletions"),
  totalChanges: integer("total_changes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type RepositoryCommit = typeof repositoryCommits.$inferSelect
export type NewRepositoryCommit = typeof repositoryCommits.$inferInsert
