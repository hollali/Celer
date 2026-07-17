import sql from "@/lib/neon";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const tickets = await sql`
      SELECT * FROM support_tickets
      WHERE user_id = ${user.dbUserId}
      ORDER BY created_at DESC LIMIT ${limit}
    `;

    return Response.json({ data: tickets }, { status: 200 });
  } catch (err) {
    console.error("GET /support-tickets error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const body = await request.json();
    const { subject, message, priority } = body;

    if (!subject || !message) {
      return Response.json({ error: "Missing subject or message" }, { status: 400 });
    }

    const trimmedSubject = String(subject).trim().slice(0, 200);
    const trimmedMessage = String(message).trim().slice(0, 5000);
    const validPriorities = ["low", "medium", "high", "urgent"];
    const priorityVal = validPriorities.includes(priority) ? priority : "medium";

    const result = await sql`
      INSERT INTO support_tickets (user_id, subject, message, priority)
      VALUES (${user.dbUserId}, ${trimmedSubject}, ${trimmedMessage}, ${priorityVal})
      RETURNING *
    `;

    return Response.json({ data: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /support-tickets error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
