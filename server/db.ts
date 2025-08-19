// src/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema"; // all your tables
import "dotenv/config";

console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("DB_PASSWORD type:", typeof process.env.DB_PASSWORD, "value:", process.env.DB_PASSWORD);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
