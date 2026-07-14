import sql from "@/lib/neon";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    let settings = await sql`
      SELECT * FROM safety_settings WHERE user_id = ${user.dbUserId} LIMIT 1
    `;
    if (settings.length === 0) {
      settings = await sql`
        INSERT INTO safety_settings (user_id) VALUES (${user.dbUserId}) RETURNING *
      `;
    }

    const contacts = await sql`
      SELECT * FROM safety_contacts WHERE user_id = ${user.dbUserId}
    `;

    return Response.json({ data: { settings: settings[0], contacts } }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const body = await request.json();
    const { share_trip, emergency_alerts, audio_recording, check_in_interval } = body;

    await sql`
      INSERT INTO safety_settings (user_id, share_trip, emergency_alerts, audio_recording, check_in_interval)
      VALUES (${user.dbUserId}, ${share_trip ?? true}, ${emergency_alerts ?? true}, ${audio_recording ?? false}, ${check_in_interval ?? 5})
      ON CONFLICT (user_id) DO UPDATE SET
        share_trip = COALESCE(${share_trip ?? null}, safety_settings.share_trip),
        emergency_alerts = COALESCE(${emergency_alerts ?? null}, safety_settings.emergency_alerts),
        audio_recording = COALESCE(${audio_recording ?? null}, safety_settings.audio_recording),
        check_in_interval = COALESCE(${check_in_interval ?? null}, safety_settings.check_in_interval)
    `;

    const result = await sql`SELECT * FROM safety_settings WHERE user_id = ${user.dbUserId} LIMIT 1`;
    return Response.json({ data: result[0] }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const body = await request.json();
    const { name, phone, relationship } = body;

    if (!name || !phone) {
      return Response.json({ error: "Missing name or phone" }, { status: 400 });
    }

    const count = await sql`SELECT COUNT(*)::int as cnt FROM safety_contacts WHERE user_id = ${user.dbUserId}`;
    if ((count[0]?.cnt ?? 0) >= 5) {
      return Response.json({ error: "Maximum 5 trusted contacts" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO safety_contacts (user_id, name, phone, relationship)
      VALUES (${user.dbUserId}, ${name.trim()}, ${phone.trim()}, ${relationship || ""})
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
    const contactId = searchParams.get("contact_id");

    if (!contactId) {
      return Response.json({ error: "Missing contact_id" }, { status: 400 });
    }

    await sql`DELETE FROM safety_contacts WHERE id = ${parseInt(contactId)} AND user_id = ${user.dbUserId}`;
    return Response.json({ data: { deleted: true } }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
