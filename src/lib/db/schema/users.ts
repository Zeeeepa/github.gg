import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  githubId: text("github_id").unique().notNull(),
  username: text("username").notNull(), // GitHub username
  avatarUrl: text("avatar_url"),
  email: text("email"), // Can be null if not provided by GitHub or user
  name: text("name"), // GitHub profile name
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
