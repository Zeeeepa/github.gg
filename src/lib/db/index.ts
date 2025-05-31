import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as dotenv from "dotenv"
import * as schema from "./schema" // Import all schemas

dotenv.config({
  path: ".env.local",
})

if (!process.env.POSTGRES_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(process.env.POSTGRES_URL, { prepare: false })
export const db = drizzle(client, { schema }) // Pass all schemas here

// Later, if you define relations in schema/index.ts, you might use them like:
// export const db = drizzle(client, { schema, relations });
