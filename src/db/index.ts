import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as dotenv from "dotenv"
import * as schema from "./schema" // Import all schemas

dotenv.config({ path: ".env.local" })

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not set for Drizzle client.")
}

const connectionString = process.env.POSTGRES_URL
const client = postgres(connectionString, { prepare: false }) // `prepare: false` is often recommended for serverless environments

export const db = drizzle(client, { schema })

// You might want to add a way to close the connection if needed,
// though for serverless functions, connections are typically managed per invocation.
