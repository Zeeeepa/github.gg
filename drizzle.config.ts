import type { Config } from "drizzle-kit"
import * as dotenv from "dotenv"

dotenv.config({
  path: ".env.local", // Assuming your env vars are in .env.local
})

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not set")
}

export default {
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql", // 'postgresql' | 'mysql' | 'sqlite'
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
  // verbose: true, // For more detailed Drizzle Kit output
  // strict: true,  // To be stricter about schema definitions
} satisfies Config
