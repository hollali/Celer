import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = resolve(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const envVars = Object.fromEntries(
  envContent
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split("=", 2).map((s) => s.trim()))
);

const DATABASE_URL = envVars.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const schema = readFileSync(resolve(__dirname, "schema.sql"), "utf-8");

// Strip SQL comments (-- to end of line), then split by semicolons
function splitStatements(sql) {
  return sql
    .split("\n")
    .map((line) => line.replace(/--.*$/, "").trim())
    .filter((line) => line.length > 0)
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function migrate() {
  const statements = splitStatements(schema);
  console.log(`Found ${statements.length} statements to execute.\n`);

  for (const stmt of statements) {
    try {
      await sql.query(stmt + ";");
      console.log(`  OK: ${stmt.slice(0, 70)}...`);
    } catch (e) {
      console.error(`  FAIL: ${stmt.slice(0, 70)}...\n    ${e.message}`);
    }
  }
  console.log("\nMigration complete.");
}

migrate();
