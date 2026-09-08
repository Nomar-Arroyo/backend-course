import "dotenv/config";
import pg from "pg";

const { Client } = pg;
let ok = false;
for (let i = 0; i < 16; i++) {
  if (i) await new Promise((r) => setTimeout(r, 15000));
  const t = new Date().toLocaleTimeString();
  try {
    const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });
    await c.connect();
    const r = await c.query("select current_database() db");
    console.log(`[${t}] CONECTADO db=${r.rows[0].db}`);
    await c.end();
    ok = true;
    break;
  } catch (e) {
    console.log(`[${t}] intento ${i + 1}: ${e.code || "timeout"}`);
  }
}
process.exit(ok ? 0 : 1);
