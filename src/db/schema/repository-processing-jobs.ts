import { pgTable, serial, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core"
import { repositories } from "./repositories"

export const processingStatusEnum = ["pending", "processing", "completed", "failed", "queued"] as const

export const repositoryProcessingJobs = pgTable("repository_processing_jobs", {
  id: serial("id").primaryKey(),
  repositoryId: integer("repository_id")
    .references(() => repositories.id)
    .notNull(),
  status: varchar("status", { enum: processingStatusEnum, length: 50 }).default("queued").notNull(),
  jobType: varchar("job_type", { length: 100 }).notNull(), // e.g., 'initial_ingestion', 'deepwiki_generation', 'code_analysis'
  details: jsonb("details"), // Store any specific details about the job or errors
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type RepositoryProcessingJob = typeof repositoryProcessingJobs.$inferSelect
export type NewRepositoryProcessingJob = typeof repositoryProcessingJobs.$inferInsert
