// Schema for NextAuth.js Drizzle Adapter
// See: https://authjs.dev/reference/adapter/drizzle

import { integer, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import type { AdapterAccount } from "@auth/core/adapters"
import { users } from "./users" // Import the main users table here

// Re-using our main users table definition for the adapter
// This requires our main `users` table to have fields compatible with what NextAuth expects,
// or we'd need to map them in the adapter configuration or callbacks.
// For simplicity, let's assume our `users` table from `./users.ts` is mostly compatible.
// We'll need `emailVerified` if using email provider, but for GitHub, it's less critical.
// The DrizzleAdapter will try to use `id`, `name`, `email`, `image` (avatarUrl), `emailVerified`.

// We will use the existing `users` table from `users.ts`.
// The DrizzleAdapter will create these tables if they don't exist,
// but it's better to define them explicitly for Drizzle Kit migrations.

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // Reference our main users table
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: uniqueIndex("account_user_id_idx").on(account.userId), // Ensure one account per provider for a user
  }),
)

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Reference our main users table
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
)

// We need to import the main `users` table here for the adapter to use it.
// This is a bit of a circular dependency if not handled carefully.
// A common pattern is to have a core `users` schema and then extend it or reference it.
// For now, let's ensure our main `users` table in `users.ts` has:
// - id (serial/text, primary key)
// - name (text, nullable)
// - email (text, unique, nullable for GitHub if not always provided)
// - emailVerified (timestamp, nullable) - DrizzleAdapter might add this if not present.
// - image (text, nullable) -> maps to our avatarUrl

// Re-exporting our main users table to be used by the adapter.
// This assumes `users.ts` is structured to be compatible.
// The DrizzleAdapter will use the `usersTable` config option.
