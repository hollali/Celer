import sql from "@/lib/neon";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
      const result = await sql`
        SELECT * FROM promotions
        WHERE code = ${code.toUpperCase()} AND is_active = TRUE AND expires_at > NOW()
          AND (max_uses = -1 OR current_uses < max_uses)
        LIMIT 1
      `;
      if (result.length === 0) {
        return Response.json({ error: "Invalid or expired promo code" }, { status: 404 });
      }
      return Response.json({ data: result[0] }, { status: 200 });
    }

    const promos = await sql`
      SELECT * FROM promotions
      WHERE is_active = TRUE AND expires_at > NOW()
        AND (max_uses = -1 OR current_uses < max_uses)
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return Response.json({ data: promos }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const body = await request.json();
    const { code, ride_id } = body;

    if (!code) {
      return Response.json({ error: "Missing promo code" }, { status: 400 });
    }

    const promo = await sql`
      SELECT * FROM promotions
      WHERE code = ${code.toUpperCase()} AND is_active = TRUE AND expires_at > NOW()
        AND (max_uses = -1 OR current_uses < max_uses)
      LIMIT 1
    `;

    if (promo.length === 0) {
      return Response.json({ error: "Invalid or expired promo code" }, { status: 404 });
    }

    if (ride_id) {
      const ride = await sql`
        SELECT fare_price FROM rides WHERE ride_id = ${ride_id} AND user_id = ${user.dbUserId} LIMIT 1
      `;
      if (ride.length > 0 && Number(ride[0].fare_price) < promo[0].min_fare) {
        return Response.json({ error: "Minimum fare not met" }, { status: 400 });
      }
    }

    await sql`
      UPDATE promotions SET current_uses = current_uses + 1 WHERE id = ${promo[0].id}
    `;

    let discount = 0;
    if (ride_id) {
      const ride = await sql`
        SELECT fare_price FROM rides WHERE ride_id = ${ride_id} LIMIT 1
      `;
      if (ride.length > 0) {
        const fare = Number(ride[0].fare_price);
        discount = promo[0].discount_type === "percent"
          ? Math.round(fare * (promo[0].discount_value / 100) * 100) / 100
          : Math.min(promo[0].discount_value, fare);
      }
    }

    return Response.json({
      data: {
        ...promo[0],
        discount,
        final_fare: discount > 0 ? undefined : undefined,
      },
    }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
