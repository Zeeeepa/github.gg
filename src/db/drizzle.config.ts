import type { Config } from "drizzle-kit"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" }) // Ensure .env.local is loaded for Drizzle Kit

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not set.")
}

export default {
  schema: "./src/db/schema/*", // Point to all schema files
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL, // This should be your Supabase connection string
  },
  verbose: true,
  strict: true,
} satisfies Config
