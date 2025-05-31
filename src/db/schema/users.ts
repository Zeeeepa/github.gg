import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  githubId: text("github_id").unique(), // Store GitHub user ID
  username: varchar("username", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).unique(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
