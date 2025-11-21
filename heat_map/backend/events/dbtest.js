import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    const { rows } = await pool.query("SELECT NOW()");
    console.log("✅ Connected! Server time:", rows[0].now);
  } catch (err) {
    console.error("❌ Connection error:", err);
  } finally {
    pool.end();
  }
})();
