import { pgTable, serial, text, varchar, integer, timestamp } from "drizzle-orm/pg-core"
import { users } from "./users" // Assuming users schema is in the same directory or accessible path

export const repositories = pgTable("repositories", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id")
    .references(() => users.id)
    .notNull(),
  githubRepoId: varchar("github_repo_id", { length: 256 }).unique().notNull(), // GitHub's own ID for the repo
  name: varchar("name", { length: 256 }).notNull(),
  fullName: varchar("full_name", { length: 512 }).notNull().unique(), // e.g., "owner/repo-name"
  description: text("description"),
  url: text("url").notNull(), // HTTPS URL to the repo
  sshUrl: text("ssh_url"),
  cloneUrl: text("clone_url"),
  defaultBranch: varchar("default_branch", { length: 256 }).notNull(),
  language: varchar("language", { length: 100 }),
  stars: integer("stars").default(0),
  forks: integer("forks").default(0),
  watchers: integer("watchers").default(0),
  openIssues: integer("open_issues").default(0),
  visibility: varchar("visibility", { length: 50 }), // e.g., 'public', 'private'
  lastPulledAt: timestamp("last_pulled_at"), // When we last fetched/updated info from GitHub
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type Repository = typeof repositories.$inferSelect
export type NewRepository = typeof repositories.$inferInsert
