import sql from "@/lib/neon";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const places = await sql`
      SELECT * FROM saved_places WHERE user_id = ${user.dbUserId} ORDER BY created_at DESC
    `;

    return Response.json({ data: places }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const body = await request.json();
    const { label, address, latitude, longitude, icon } = body;

    if (!label || !address || latitude == null || longitude == null) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const count = await sql`SELECT COUNT(*)::int as cnt FROM saved_places WHERE user_id = ${user.dbUserId}`;
    if ((count[0]?.cnt ?? 0) >= 10) {
      return Response.json({ error: "Maximum 10 saved places" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO saved_places (user_id, label, address, latitude, longitude, icon)
      VALUES (${user.dbUserId}, ${label.trim()}, ${address.trim()}, ${latitude}, ${longitude}, ${icon || "location"})
      RETURNING *
    `;

    return Response.json({ data: result[0] }, { status: 201 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("place_id");

    if (!placeId) {
      return Response.json({ error: "Missing place_id" }, { status: 400 });
    }

    await sql`DELETE FROM saved_places WHERE id = ${parseInt(placeId)} AND user_id = ${user.dbUserId}`;

    return Response.json({ data: { deleted: true } }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
