import dotenv from "dotenv";
dotenv.config();
import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  try {
    await client.connect();
    console.log("Connected successfully!");
    await client.end();
  } catch (err) {
    console.error("DB connection error:", err);
  }
}

test();
