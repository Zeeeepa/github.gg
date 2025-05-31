import { pgTable, serial, timestamp, integer, varchar, jsonb, text } from "drizzle-orm/pg-core"
import { users } from "./users"
import { repositories } from "./repositories"

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  repositoryId: integer("repository_id").references(() => repositories.id), // Optional: link chat to a specific repo context
  title: varchar("title", { length: 255 }), // Optional: user-defined title for the session
  contextSummary: text("context_summary"), // AI-generated summary of the session's context
  metadata: jsonb("metadata"), // Any other relevant metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type ChatSession = typeof chatSessions.$inferSelect
export type NewChatSession = typeof chatSessions.$inferInsert
