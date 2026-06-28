import sql from "@/lib/neon";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("user_email");

    if (!userEmail) {
      return Response.json({ error: "user_email is required" }, { status: 400 });
    }

    const userResult = await sql`
      SELECT id FROM users WHERE email = ${userEmail} LIMIT 1;
    `;

    if (userResult.length === 0) {
      return Response.json({ data: [] }, { status: 200 });
    }

    const userId = userResult[0].id;

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
        WHERE c.user_id = ${userId}
        ORDER BY c.last_message_at DESC NULLS LAST
        LIMIT 50;
      `;
    } catch (dbError: any) {
      if (dbError?.message?.includes("relation") && dbError?.message?.includes("does not exist")) {
        console.warn("chat+api: conversations table does not exist — run database/migrate.mjs");
        return Response.json({ data: [] }, { status: 200 });
      }
      throw dbError;
    }

    return Response.json({ data: conversations }, { status: 200 });
  } catch (error) {
    console.error("chat+api error:", error);
    return Response.json(
      { error: "Internal Server Error", detail: String(error) },
      { status: 500 }
    );
  }
}
