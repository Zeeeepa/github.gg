import { pgTable, serial, text, timestamp, integer, uniqueIndex, boolean } from "drizzle-orm/pg-core"
import { users } from "./users"

export const repositories = pgTable(
  "repositories",
  {
    id: serial("id").primaryKey(),
    ownerId: integer("owner_id")
      .references(() => users.id)
      .notNull(), // User who added the repo
    githubRepoId: text("github_repo_id").unique().notNull(), // Numeric ID from GitHub
    name: text("name").notNull(), // e.g., "my-awesome-project"
    fullName: text("full_name").notNull().unique(), // e.g., "username/my-awesome-project"
    description: text("description"),
    cloneUrl: text("clone_url").notNull(),
    htmlUrl: text("html_url").notNull(),
    defaultBranch: text("default_branch").notNull(),
    language: text("language"), // Primary language
    visibility: text("visibility", { enum: ["public", "private"] }).notNull(),
    isFork: boolean("is_fork"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    lastAnalyzedAt: timestamp("last_analyzed_at"),
    githubCreatedAt: timestamp("github_created_at"),
    githubUpdatedAt: timestamp("github_updated_at"),
  },
  (table) => {
    return {
      fullNameIdx: uniqueIndex("full_name_idx").on(table.fullName),
    }
  },
)

export type Repository = typeof repositories.$inferSelect
export type NewRepository = typeof repositories.$inferInsert
