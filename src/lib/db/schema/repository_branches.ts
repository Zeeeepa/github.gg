import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core"
import { repositories } from "./repositories"

export const repositoryBranches = pgTable("repository_branches", {
  id: serial("id").primaryKey(),
  repositoryId: integer("repository_id")
    .references(() => repositories.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(), // e.g., "main", "develop", "feature/new-thing"
  lastCommitSha: text("last_commit_sha"),
  isDefault: boolean("is_default").default(false),
  // Potentially add last_analyzed_at if we do branch-specific analysis for DeepWiki
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type RepositoryBranch = typeof repositoryBranches.$inferSelect
export type NewRepositoryBranch = typeof repositoryBranches.$inferInsert
