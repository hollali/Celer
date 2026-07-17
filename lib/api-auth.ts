import { verifyToken } from "@clerk/backend";
import sql, { withRetry } from "@/lib/neon";

export interface AuthUser {
  clerkId: string;
  email: string;
  dbUserId: number | null;
}

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

export async function authenticateRequest(request: Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  if (!token) {
    return null;
  }

  if (!clerkSecretKey) {
    console.error("CLERK_SECRET_KEY is not set — cannot verify tokens");
    return null;
  }

  let payload;
  try {
    payload = await verifyToken(token, { secretKey: clerkSecretKey });
  } catch (err) {
    console.error("JWT verification failed:", (err as Error).message);
    return null;
  }

  if (!payload?.sub) {
    return null;
  }

  const clerkId = payload.sub;
  const email = (payload.email as string) || "";

  const name =
    (payload.name as string) ||
    [payload.given_name, payload.family_name].filter(Boolean).join(" ") ||
    email.split("@")[0] ||
    "User";

  let dbUserId: number | null = null;
  try {
    let userResult = await withRetry(
      () => sql`
      SELECT id FROM users WHERE clerk_id = ${clerkId} LIMIT 1;
    `,
    );

    if (userResult.length === 0 && email) {
      userResult = await withRetry(
        () => sql`
        INSERT INTO users (clerk_id, name, email)
        VALUES (${clerkId}, ${name}, ${email})
        ON CONFLICT (email) DO UPDATE SET clerk_id = ${clerkId}
        RETURNING id
      `,
      );
    }

    if (userResult.length === 0) {
      userResult = await withRetry(
        () => sql`
        INSERT INTO users (clerk_id, name, email)
        VALUES (${clerkId}, ${name}, ${email})
        ON CONFLICT (clerk_id) DO NOTHING
        RETURNING id
      `,
      );
    }

    if (userResult.length > 0) {
      dbUserId = userResult[0].id;
    }
  } catch (err) {
    console.error("DB lookup/insert failed for clerk_id:", clerkId, (err as Error).message);
    return { clerkId, email, dbUserId: null };
  }

  return { clerkId, email, dbUserId };
}

export function unauthorizedResponse(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}
