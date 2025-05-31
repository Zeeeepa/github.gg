import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core"
import { repositories } from "./repositories"
import { users } from "./users" // User who initiated the job, if applicable

export const aiAnalysisJobs = pgTable("ai_analysis_jobs", {
  id: serial("id").primaryKey(),
  repositoryId: integer("repository_id")
    .references(() => repositories.id, { onDelete: "cascade" })
    .notNull(),
  jobType: text("job_type", { enum: ["deep_wiki_generation", "code_review", "security_audit_suggestion"] }).notNull(),
  status: text("status", { enum: ["queued", "processing", "completed", "failed", "cancelled"] })
    .default("queued")
    .notNull(),
  inputPayload: jsonb("input_payload"), // e.g., specific file paths for code review, or monolith ref for wiki
  outputResult: jsonb("output_result"), // Store direct AI output or reference to it
  errorMessage: text("error_message"),
  initiatedByUserId: integer("initiated_by_user_id").references(() => users.id),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type AiAnalysisJob = typeof aiAnalysisJobs.$inferSelect
export type NewAiAnalysisJob = typeof aiAnalysisJobs.$inferInsert
