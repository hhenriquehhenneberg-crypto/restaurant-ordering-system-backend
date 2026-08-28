import "dotenv/config";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não foi definida no arquivo .env");
}

export const database = new Pool({
  connectionString: process.env.DATABASE_URL,
});
