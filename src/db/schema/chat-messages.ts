import { pgTable, serial, text, timestamp, integer, varchar, jsonb } from "drizzle-orm/pg-core"
import { chatSessions } from "./chat-sessions"
import { users } from "./users" // To know who sent the message (user or AI)

export const messageSenderEnum = ["user", "ai", "system"] as const

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .references(() => chatSessions.id)
    .notNull(),
  senderId: integer("sender_id").references(() => users.id), // Nullable if sender is 'ai' or 'system' not tied to a user record
  senderType: varchar("sender_type", { enum: messageSenderEnum, length: 50 }).notNull(),
  content: text("content").notNull(),
  contentType: varchar("content_type", { length: 50 }).default("text").notNull(), // e.g., 'text', 'code_block', 'diagram_mermaid'
  metadata: jsonb("metadata"), // e.g., tool calls, sources, processing time
  timestamp: timestamp("timestamp").defaultNow().notNull(),
})

export type ChatMessage = typeof chatMessages.$inferSelect
export type NewChatMessage = typeof chatMessages.$inferInsert
