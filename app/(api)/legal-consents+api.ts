import sql from "@/lib/neon";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    let consents = await sql`
      SELECT * FROM legal_consents WHERE user_id = ${user.dbUserId} LIMIT 1
    `;
    if (consents.length === 0) {
      consents = await sql`
        INSERT INTO legal_consents (user_id) VALUES (${user.dbUserId}) RETURNING *
      `;
    }

    return Response.json({ data: consents[0] }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const body = await request.json();
    const { analytics_consent, marketing_consent } = body;

    await sql`
      INSERT INTO legal_consents (user_id, analytics_consent, marketing_consent)
      VALUES (${user.dbUserId}, ${analytics_consent ?? false}, ${marketing_consent ?? false})
      ON CONFLICT (user_id) DO UPDATE SET
        analytics_consent = COALESCE(${analytics_consent ?? null}, legal_consents.analytics_consent),
        marketing_consent = COALESCE(${marketing_consent ?? null}, legal_consents.marketing_consent)
    `;

    const result = await sql`SELECT * FROM legal_consents WHERE user_id = ${user.dbUserId} LIMIT 1`;
    return Response.json({ data: result[0] }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
