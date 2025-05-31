import { pgTable, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core"
import { repositories } from "./repositories"
import { repositoryProcessingJobs } from "./repository-processing-jobs"

export const deepWikis = pgTable("deep_wikis", {
  id: serial("id").primaryKey(),
  repositoryId: integer("repository_id")
    .references(() => repositories.id)
    .notNull()
    .unique(), // Each repo has one DeepWiki
  jobId: integer("job_id").references(() => repositoryProcessingJobs.id), // Link to the job that generated this wiki
  content: jsonb("content").notNull(), // Store the structured wiki content (e.g., as JSON matching the DeepWiki spec)
  version: integer("version").default(1).notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type DeepWiki = typeof deepWikis.$inferSelect
export type NewDeepWiki = typeof deepWikis.$inferInsert
