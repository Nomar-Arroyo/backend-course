import "dotenv/config";
import { readFileSync } from "node:fs";
import pg from "pg";

const { Client } = pg;
const c = new Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const base = "C:/Users/USUARIO/OneDrive/Documentos/ITSU/Tercer Trimestre/DBE/backend-course/activities/class-05/taller/project/database/migrations";
const files = ["001_create_requests.sql", "002_create_request_status_history.sql", "003_create_users.sql", "004_add_request_ownership.sql", "005_add_history_actor.sql"];
for (const f of files) {
  const sql = readFileSync(`${base}/${f}`, "utf8");
  await c.query(sql);
  console.log(`applied ${f}`);
}
await c.end();
console.log("ALL MIGRATIONS APPLIED");
