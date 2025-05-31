import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core"
import { repositories } from "./repositories"

// Stores pointers to the large processed data blobs and metadata
export const processedRepositoryData = pgTable("processed_repository_data", {
  id: serial("id").primaryKey(),
  repositoryId: integer("repository_id")
    .references(() => repositories.id, { onDelete: "cascade" })
    .notNull()
    .unique(), // Each repo has one primary processed data entry
  monolithBlobUrl: text("monolith_blob_url").notNull(), // URL to the large JSON in Vercel Blob
  commitHistoryBlobUrl: text("commit_history_blob_url"), // URL to commit history JSON
  fileTreeJson: jsonb("file_tree_json"), // Smaller JSON representing file structure, can be stored directly
  processingStatus: text("processing_status", { enum: ["pending", "processing", "completed", "failed"] })
    .default("pending")
    .notNull(),
  errorMessage: text("error_message"), // If processing failed
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type ProcessedRepositoryData = typeof processedRepositoryData.$inferSelect
export type NewProcessedRepositoryData = typeof processedRepositoryData.$inferInsert
