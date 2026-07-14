import sql from "@/lib/neon";
import { withRetry } from "@/lib/neon";

export interface AuthUser {
  clerkId: string;
  email: string;
  dbUserId: number | null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function authenticateRequest(request: Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  const clerkId = payload.sub as string | undefined;
  if (!clerkId) {
    return null;
  }

  const email = (payload.email as string)
    || (payload.email_address as string)
    || "";

  const name = (payload.name as string)
    || [payload.given_name, payload.family_name].filter(Boolean).join(" ")
    || email.split("@")[0]
    || "User";

  let dbUserId: number | null = null;
  try {
    let userResult = await withRetry(() => sql`
      SELECT id FROM users WHERE clerk_id = ${clerkId} LIMIT 1;
    `);

    if (userResult.length === 0) {
      userResult = await withRetry(() => sql`
        INSERT INTO users (clerk_id, name, email)
        VALUES (${clerkId}, ${name}, ${email})
        ON CONFLICT (clerk_id) DO NOTHING
        RETURNING id
      `);
    }

    if (userResult.length > 0) {
      dbUserId = userResult[0].id;
    }
  } catch {
    return { clerkId, email, dbUserId: null };
  }

  return { clerkId, email, dbUserId };
}

export function unauthorizedResponse(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}
