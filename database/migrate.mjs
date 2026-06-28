import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";
import dns from "dns";

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

// The HTTP endpoint for Neon SQL API is https://api.<region>.aws.neon.tech/sql
// Built by replacing the first subdomain of the host with "api"
const pgUrl = new URL(DATABASE_URL);
const hostParts = pgUrl.hostname.split(".");
hostParts[0] = "api";
const apiHost = hostParts.join(".");
const apiEndpoint = `https://${apiHost}/sql`;

const schema = readFileSync(resolve(__dirname, "schema.sql"), "utf-8");

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

function runQuery(query) {
  return new Promise((resolve, reject) => {
    dns.resolve(apiHost, (err, addresses) => {
      if (err) return reject(err);
      const ip = addresses[0];
      const body = JSON.stringify({ query });
      const options = {
        hostname: ip,
        port: 443,
        path: "/sql",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "neon-connection-string": DATABASE_URL,
          "Content-Length": Buffer.byteLength(body),
        },
        servername: apiHost,
        rejectUnauthorized: false,
      };
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error || parsed.message) {
              reject(new Error(parsed.message || parsed.error));
            } else {
              resolve(parsed);
            }
          } catch {
            reject(new Error(data));
          }
        });
      });
      req.on("error", reject);
      req.write(body);
      req.end();
    });
  });
}

async function migrate() {
  const statements = splitStatements(schema);
  console.log(`Found ${statements.length} statements to execute.\n`);

  for (const stmt of statements) {
    try {
      await runQuery(stmt + ";");
      console.log(`  OK: ${stmt.slice(0, 70)}...`);
    } catch (e) {
      console.error(`  FAIL: ${stmt.slice(0, 70)}...\n    ${e.message}`);
    }
  }
  console.log("\nMigration complete.");
}

migrate();
