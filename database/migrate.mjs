import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = resolve(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const envVars = Object.fromEntries(
  envContent
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split("=", 2).map((s) => s.trim().replace(/^["']|["']$/g, "")))
);

const DATABASE_URL = envVars.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrate() {
  const schema = readFileSync(resolve(__dirname, "schema.sql"), "utf-8");

  // Split on semicolons that are NOT inside $$ blocks (function bodies)
  const statements = [];
  let current = "";
  let inDollarQuote = false;

  for (const line of schema.split("\n")) {
    const stripped = line.replace(/--.*$/, "").trim();
    if (!stripped && !current) continue;

    // Track $$ blocks (PL/pgSQL function bodies)
    const dollarCount = (stripped.match(/\$\$/g) || []).length;
    if (dollarCount % 2 === 1) {
      inDollarQuote = !inDollarQuote;
    }

    current += stripped + "\n";

    if (!inDollarQuote && stripped.endsWith(";")) {
      const stmt = current.trim();
      if (stmt.length > 0) {
        statements.push(stmt);
      }
      current = "";
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  console.log(`Found ${statements.length} statements to execute.\n`);

  for (const stmt of statements) {
    try {
      await sql.query(stmt);
      console.log(`  OK: ${stmt.slice(0, 80).replace(/\n/g, " ")}...`);
    } catch (e) {
      // Ignore "already exists" errors for CREATE TABLE/INDEX
      if (e.message?.includes("already exists")) {
        console.log(`  SKIP (exists): ${stmt.slice(0, 80).replace(/\n/g, " ")}...`);
      } else {
        console.error(`  FAIL: ${stmt.slice(0, 80).replace(/\n/g, " ")}...`);
        console.error(`    ${e.message}`);
      }
    }
  }
  console.log("\nMigration complete.");
}

migrate();
