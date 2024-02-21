import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  driver: "pg", // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
  dbCredentials: {
    connectionString: process.env.PG_CONNECTION_STRING!,
  },
} satisfies Config;