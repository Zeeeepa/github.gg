import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core"
import { repositories } from "./repositories"
import { repositoryProcessingJobs } from "./repository-processing-jobs"

export const processedRepositoryData = pgTable("processed_repository_data", {
  id: serial("id").primaryKey(),
  repositoryId: integer("repository_id")
    .references(() => repositories.id)
    .notNull()
    .unique(), // Each repo has one primary processed data entry
  jobId: integer("job_id").references(() => repositoryProcessingJobs.id), // Link to the job that produced this data
  monolithicJsonPath: text("monolithic_json_path"), // Path in blob storage (Supabase Storage or Vercel Blob)
  commitHistoryPath: text("commit_history_path"), // Path for commit history data
  fileStructurePath: text("file_structure_path"), // Path for file structure data
  metadata: jsonb("metadata"), // Other metadata like analysis summaries, etc.
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type ProcessedRepositoryData = typeof processedRepositoryData.$inferSelect
export type NewProcessedRepositoryData = typeof processedRepositoryData.$inferInsert
