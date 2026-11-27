require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  console.log("🚀 Iniciando migração do schema 'trilha' no PostgreSQL...");
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("✅ Migração concluída com sucesso! Todas as tabelas foram criadas no schema 'trilha'.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Erro ao executar migração:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
