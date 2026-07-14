import sql from "@/lib/neon";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api-auth";
import { MAX_MESSAGE_LENGTH, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "@/constants";

const VALID_SENDER_TYPES = ["user", "driver", "support", "safety", "promo"] as const;

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversation_id");
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "200")));
    const before = searchParams.get("before");

    if (!conversationId) {
      return Response.json({ error: "conversation_id is required" }, { status: 400 });
    }

    const convId = parseInt(conversationId);
    if (isNaN(convId)) {
      return Response.json({ error: "Invalid conversation_id" }, { status: 400 });
    }

    const ownership = await sql`
      SELECT id FROM conversations WHERE id = ${convId} AND user_id = ${user.dbUserId} LIMIT 1
    `;
    if (ownership.length === 0) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }

    let messages;
    if (before) {
      messages = await sql`
        SELECT id, conversation_id, sender_type, sender_name, text, created_at
        FROM messages
        WHERE conversation_id = ${convId} AND id < ${parseInt(before)}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      messages = await sql`
        SELECT id, conversation_id, sender_type, sender_name, text, created_at
        FROM messages
        WHERE conversation_id = ${convId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    await sql`
      UPDATE conversations SET user_unread = 0 WHERE id = ${convId} AND user_id = ${user.dbUserId}
    `;

    return Response.json({ data: messages.reverse() }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const body = await request.json();
    const { conversation_id, text } = body;

    if (!conversation_id || !text) {
      return Response.json(
        { error: "Missing required fields: conversation_id, text" },
        { status: 400 }
      );
    }

    const trimmedText = String(text).trim();
    if (trimmedText.length === 0) {
      return Response.json({ error: "Message cannot be empty" }, { status: 400 });
    }
    if (trimmedText.length > MAX_MESSAGE_LENGTH) {
      return Response.json(
        { error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` },
        { status: 400 }
      );
    }

    const convId = parseInt(conversation_id);
    if (isNaN(convId)) {
      return Response.json({ error: "Invalid conversation_id" }, { status: 400 });
    }

    const ownership = await sql`
      SELECT id FROM conversations WHERE id = ${convId} AND user_id = ${user.dbUserId} LIMIT 1
    `;
    if (ownership.length === 0) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const rateCheck = await sql`
      SELECT COUNT(*)::int as cnt FROM rate_limits
      WHERE user_id = ${user.dbUserId} AND endpoint = 'message'
        AND window_start > ${windowStart.toISOString()}
    `;
    if ((rateCheck[0]?.cnt ?? 0) >= RATE_LIMIT_MAX) {
      return Response.json({ error: "Too many messages. Please wait." }, { status: 429 });
    }
    await sql`
      INSERT INTO rate_limits (user_id, endpoint, window_start, request_count)
      VALUES (${user.dbUserId}, 'message', NOW(), 1)
    `;

    const userName = await sql`
      SELECT name FROM users WHERE id = ${user.dbUserId} LIMIT 1
    `;
    const senderName = userName[0]?.name || "User";

    const result = await sql`
      INSERT INTO messages (conversation_id, sender_type, sender_name, text)
      VALUES (${convId}, 'user', ${senderName}, ${trimmedText})
      RETURNING *
    `;

    await sql`
      UPDATE conversations
      SET last_message = ${trimmedText}, last_message_at = NOW(), user_unread = 0
      WHERE id = ${convId}
    `;

    return Response.json({ data: result }, { status: 201 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
