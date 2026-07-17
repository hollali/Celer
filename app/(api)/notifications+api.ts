import sql from "@/lib/neon";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

    let notifications;
    if (unreadOnly) {
      notifications = await sql`
        SELECT * FROM notifications
        WHERE user_id = ${user.dbUserId} AND is_read = FALSE
        ORDER BY created_at DESC LIMIT ${limit}
      `;
    } else {
      notifications = await sql`
        SELECT * FROM notifications
        WHERE user_id = ${user.dbUserId}
        ORDER BY created_at DESC LIMIT ${limit}
      `;
    }

    return Response.json({ data: notifications }, { status: 200 });
  } catch (err) {
    console.error("GET /notifications error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const body = await request.json();
    const { notification_id, mark_all_read } = body;

    if (mark_all_read) {
      await sql`
        UPDATE notifications SET is_read = TRUE
        WHERE user_id = ${user.dbUserId} AND is_read = FALSE
      `;
      return Response.json({ data: { updated: true } }, { status: 200 });
    }

    if (notification_id) {
      await sql`
        UPDATE notifications SET is_read = TRUE
        WHERE id = ${notification_id} AND user_id = ${user.dbUserId}
      `;
      return Response.json({ data: { updated: true } }, { status: 200 });
    }

    return Response.json({ error: "Missing notification_id or mark_all_read" }, { status: 400 });
  } catch (err) {
    console.error("PATCH /notifications error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const body = await request.json();
    const { title, body: notifBody, type, data } = body;

    if (!title || !notifBody) {
      return Response.json({ error: "Missing title or body" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO notifications (user_id, title, body, type, data)
      VALUES (${user.dbUserId}, ${title}, ${notifBody}, ${type || "general"}, ${JSON.stringify(data || {})})
      RETURNING *
    `;

    return Response.json({ data: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /notifications error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
