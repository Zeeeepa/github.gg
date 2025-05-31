import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  githubId: text("github_id").unique(), // Made githubId nullable as it might not be available immediately or for all users
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  email: text("email").unique(), // Added .unique() constraint
  name: text("name"),
  emailVerified: timestamp("email_verified", { mode: "date" }), // Added emailVerified
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
