import * as dns from "dns";
import * as https from "https";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

const DATABASE_HOST = new URL(DATABASE_URL).hostname;

function buildEndpoint(host: string): string {
  const parts = host.split(".");
  parts[0] = "api";
  return parts.join(".");
}

function neonQuery(query: string, params: unknown[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const apiHost = buildEndpoint(DATABASE_HOST);
    dns.resolve(apiHost, (err, addresses) => {
      if (err) return reject(err);
      const ip = addresses[0];
      const body = JSON.stringify({ query, params });
      const options: https.RequestOptions = {
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
        res.setEncoding("utf8");
        res.on("data", (chunk: string) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error || parsed.message) {
              const err = new Error(parsed.message || parsed.error);
              (err as any).detail = parsed.detail;
              (err as any).hint = parsed.hint;
              reject(err);
            } else {
              resolve(parsed.rows ?? parsed);
            }
          } catch {
            reject(new Error(data));
          }
        });
      });
      req.on("error", reject);
      req.setTimeout(30000, () => req.destroy(new Error("Request timeout")));
      if (body) req.write(body);
      req.end();
    });
  });
}

function sql(
  strings: TemplateStringsArray | string,
  ...values: unknown[]
): Promise<any> {
  if (typeof strings === "string") {
    return neonQuery(strings, values);
  }
  let query = "";
  const params: unknown[] = [];
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < values.length) {
      const paramIndex = params.length + 1;
      query += `$${paramIndex}`;
      params.push(values[i]);
    }
  }
  return neonQuery(query, params);
}

export default sql;
