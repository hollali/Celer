import sql from "@/lib/neon";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversation_id");
    const userEmail = searchParams.get("user_email");

    if (!conversationId) {
      return Response.json({ error: "conversation_id is required" }, { status: 400 });
    }

    let messages;
    try {
      messages = await sql`
        SELECT
          id,
          conversation_id,
          sender_type,
          sender_name,
          text,
          created_at
        FROM messages
        WHERE conversation_id = ${parseInt(conversationId)}
        ORDER BY created_at ASC
        LIMIT 200;
      `;
    } catch (dbError: any) {
      if (dbError?.message?.includes("relation") && dbError?.message?.includes("does not exist")) {
        console.warn("messages+api: messages table does not exist — run database/migrate.mjs");
        return Response.json({ data: [] }, { status: 200 });
      }
      throw dbError;
    }

    // Mark unread as 0 for this conversation
    if (userEmail) {
      try {
        const userResult = await sql`
          SELECT id FROM users WHERE email = ${userEmail} LIMIT 1;
        `;
        if (userResult.length > 0) {
          await sql`
            UPDATE conversations
            SET user_unread = 0
            WHERE id = ${parseInt(conversationId)}
              AND user_id = ${userResult[0].id};
          `;
        }
      } catch {
        // non-critical — skip
      }
    }

    return Response.json({ data: messages }, { status: 200 });
  } catch (error) {
    console.error("messages+api error:", error);
    return Response.json(
      { error: "Internal Server Error", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversation_id, sender_type, sender_name, text } = body;

    if (!conversation_id || !sender_type || !text) {
      return Response.json(
        { error: "Missing required fields: conversation_id, sender_type, text" },
        { status: 400 }
      );
    }

    let result;
    try {
      result = await sql`
        INSERT INTO messages (conversation_id, sender_type, sender_name, text)
        VALUES (${conversation_id}, ${sender_type}, ${sender_name || "User"}, ${text})
        RETURNING *;
      `;

      await sql`
        UPDATE conversations
        SET last_message = ${text}, last_message_at = NOW()
        WHERE id = ${conversation_id};
      `;
    } catch (dbError: any) {
      if (dbError?.message?.includes("relation") && dbError?.message?.includes("does not exist")) {
        console.warn("messages+api: messages table does not exist — run database/migrate.mjs");
        return Response.json({ error: "Database not migrated — run `node database/migrate.mjs`" }, { status: 503 });
      }
      throw dbError;
    }

    return Response.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error("messages+api error:", error);
    return Response.json(
      { error: "Internal Server Error", detail: String(error) },
      { status: 500 }
    );
  }
}
