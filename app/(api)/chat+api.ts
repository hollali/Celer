import sql from "@/lib/neon";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

    let conversations;
    try {
      conversations = await sql`
        SELECT
          c.id,
          c.driver_id,
          c.is_support,
          c.is_safety,
          c.is_promo,
          c.last_message,
          c.last_message_at,
          c.user_unread,
          c.created_at,
          CASE
            WHEN c.is_support THEN 'Celer Support'
            WHEN c.is_safety THEN 'Safety Team'
            WHEN c.is_promo THEN 'Celer Rewards'
            WHEN d.first_name IS NOT NULL THEN d.first_name || ' ' || LEFT(d.last_name, 1) || '.'
            ELSE 'Unknown'
          END AS name,
          CASE
            WHEN c.is_support THEN '24/7 Help Desk'
            WHEN c.is_safety THEN 'Emergency Line'
            WHEN c.is_promo THEN 'Promotions & Offers'
            WHEN d.first_name IS NOT NULL THEN 'Your Driver'
            ELSE 'Unknown'
          END AS role,
          CASE
            WHEN c.is_support THEN '#2F855A'
            WHEN c.is_safety THEN '#E53E3E'
            WHEN c.is_promo THEN '#CA8A04'
            ELSE '#0286FF'
          END AS avatar_color,
          CASE
            WHEN c.is_support THEN 'CS'
            WHEN c.is_safety THEN 'ST'
            WHEN c.is_promo THEN 'CR'
            WHEN d.first_name IS NOT NULL THEN LEFT(d.first_name, 1) || LEFT(d.last_name, 1)
            ELSE '??'
          END AS avatar_initials,
          CASE
            WHEN c.is_support THEN 'support'
            WHEN c.is_safety THEN 'safety'
            WHEN c.is_promo THEN 'promo'
            ELSE 'driver'
          END AS type,
          CASE WHEN c.last_message_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (NOW() - c.last_message_at)) < 300
            ELSE FALSE
          END AS online
        FROM conversations c
        LEFT JOIN drivers d ON c.driver_id = d.id
        WHERE c.user_id = ${user.dbUserId}
        ORDER BY c.last_message_at DESC NULLS LAST
        LIMIT ${limit}
      `;
    } catch (dbError: any) {
      if (dbError?.message?.includes("relation") && dbError?.message?.includes("does not exist")) {
        return Response.json({ data: [] }, { status: 200 });
      }
      throw dbError;
    }

    return Response.json({ data: conversations }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const body = await request.json();
    const { driver_id, is_support, is_safety, is_promo } = body;

    const existing = await sql`
      SELECT id FROM conversations
      WHERE user_id = ${user.dbUserId}
        AND (${is_support || false} = FALSE OR is_support = TRUE)
        AND (${is_safety || false} = FALSE OR is_safety = TRUE)
        AND (${is_promo || false} = FALSE OR is_promo = TRUE)
        AND (${driver_id || null}::int IS NULL OR driver_id = ${driver_id || null})
      LIMIT 1
    `;

    if (existing.length > 0) {
      return Response.json({ data: { id: existing[0].id } }, { status: 200 });
    }

    const result = await sql`
      INSERT INTO conversations (user_id, driver_id, is_support, is_safety, is_promo)
      VALUES (
        ${user.dbUserId},
        ${driver_id || null},
        ${is_support || false},
        ${is_safety || false},
        ${is_promo || false}
      )
      RETURNING id
    `;

    return Response.json({ data: result[0] }, { status: 201 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
