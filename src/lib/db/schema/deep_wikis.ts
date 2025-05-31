import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core"
import { repositories } from "./repositories" // Assuming one main wiki per repo for now

export const deepWikis = pgTable("deep_wikis", {
  id: serial("id").primaryKey(),
  repositoryId: integer("repository_id")
    .references(() => repositories.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  content: jsonb("content").notNull(), // Structured JSON from AI: { overview: "...", architecture: "...", ... }
  version: integer("version").default(1).notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  modelUsed: text("model_used"), // e.g., "Gemini 2.5 Pro"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type DeepWiki = typeof deepWikis.$inferSelect
export type NewDeepWiki = typeof deepWikis.$inferInsert
