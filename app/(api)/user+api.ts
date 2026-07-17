import sql from "@/lib/neon";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api-auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_PHONE_LENGTH = 20;
const MAX_BIO_LENGTH = 500;

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const result = await sql`
      SELECT * FROM users WHERE id = ${user.dbUserId} LIMIT 1
    `;

    if (result.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ data: result[0] }, { status: 200 });
  } catch (err) {
    console.error("GET /user error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.clerkId) return unauthorizedResponse();

    const body = await request.json();
    const name = (body.name || "").trim().slice(0, MAX_NAME_LENGTH);
    const email = (body.email || user.email || "").trim().slice(0, MAX_EMAIL_LENGTH);

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    const existing = await sql`
      SELECT id FROM users WHERE clerk_id = ${user.clerkId} LIMIT 1
    `;

    if (existing.length > 0) {
      return Response.json({ data: existing[0] }, { status: 200 });
    }

    const result = await sql`
      INSERT INTO users (clerk_id, name, email)
      VALUES (${user.clerkId}, ${name}, ${email})
      RETURNING id, clerk_id, name, email
    `;

    return Response.json({ data: result[0] }, { status: 201 });
  } catch (err) {
    console.error("POST /user error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const body = await request.json();
    const { name, email, phone, bio, preferred_vehicle, marketing_opt_in, ride_updates } = body;

    const hasFields =
      name ||
      email ||
      phone != null ||
      bio != null ||
      preferred_vehicle ||
      marketing_opt_in != null ||
      ride_updates != null;

    if (!hasFields) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const trimmedName = name ? String(name).trim().slice(0, MAX_NAME_LENGTH) : undefined;
    const trimmedEmail = email ? String(email).trim().slice(0, MAX_EMAIL_LENGTH) : undefined;
    const trimmedPhone =
      phone != null ? String(phone).trim().slice(0, MAX_PHONE_LENGTH) : undefined;
    const trimmedBio = bio != null ? String(bio).trim().slice(0, MAX_BIO_LENGTH) : undefined;
    const trimmedVehicle = preferred_vehicle
      ? String(preferred_vehicle).trim().slice(0, 50)
      : undefined;

    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (trimmedEmail) {
      const existing = await sql`
        SELECT id FROM users WHERE email = ${trimmedEmail} AND id != ${user.dbUserId} LIMIT 1
      `;
      if (existing.length > 0) {
        return Response.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    const result = await sql`
      UPDATE users SET
        name = COALESCE(${trimmedName ?? null}, name),
        email = COALESCE(${trimmedEmail ?? null}, email),
        phone = COALESCE(${trimmedPhone ?? null}, phone),
        bio = COALESCE(${trimmedBio ?? null}, bio),
        preferred_vehicle = COALESCE(${trimmedVehicle ?? null}, preferred_vehicle),
        marketing_opt_in = COALESCE(${marketing_opt_in ?? null}, marketing_opt_in),
        ride_updates = COALESCE(${ride_updates ?? null}, ride_updates)
      WHERE id = ${user.dbUserId}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ data: result[0] }, { status: 200 });
  } catch (err) {
    console.error("PATCH /user error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    await sql`DELETE FROM users WHERE id = ${user.dbUserId}`;

    return Response.json({ data: { deleted: true } }, { status: 200 });
  } catch (err) {
    console.error("DELETE /user error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
