// Schema for NextAuth.js Drizzle Adapter
// See: https://authjs.dev/reference/adapter/drizzle

import { integer, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import type { AdapterAccount } from "@auth/core/adapters"
import { users } from "./users" // Import the main users table

export const accounts = pgTable(
  "accounts",
  {
    userId: integer("user_id") // Changed from text to integer
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // Reference our main users table (users.id is serial/integer)
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
    userIdIdx: uniqueIndex("account_user_id_idx").on(account.userId),
  }),
)

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: integer("user_id") // Changed from text to integer
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
