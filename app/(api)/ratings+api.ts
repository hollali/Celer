import sql from "@/lib/neon";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const body = await request.json();
    const { ride_id, rating, comment } = body;

    if (!ride_id || !rating) {
      return Response.json({ error: "Missing ride_id or rating" }, { status: 400 });
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return Response.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const ride = await sql`
      SELECT ride_id, driver_id FROM rides
      WHERE ride_id = ${ride_id} AND user_id = ${user.dbUserId} AND ride_status = 'completed'
      LIMIT 1
    `;
    if (ride.length === 0) {
      return Response.json({ error: "Ride not found or not completed" }, { status: 404 });
    }

    const existing = await sql`
      SELECT id FROM ratings WHERE ride_id = ${ride_id} AND user_id = ${user.dbUserId} LIMIT 1
    `;
    if (existing.length > 0) {
      return Response.json({ error: "Already rated" }, { status: 409 });
    }

    const result = await sql`
      INSERT INTO ratings (ride_id, user_id, driver_id, rating, comment)
      VALUES (${ride_id}, ${user.dbUserId}, ${ride[0].driver_id}, ${ratingNum}, ${comment || ""})
      RETURNING *
    `;

    const driverRatings = await sql`
      SELECT AVG(rating)::real as avg_rating, COUNT(*)::int as count
      FROM ratings WHERE driver_id = ${ride[0].driver_id}
    `;
    if (driverRatings[0]) {
      await sql`
        UPDATE drivers SET rating = ${driverRatings[0].avg_rating}
        WHERE id = ${ride[0].driver_id}
      `;
    }

    return Response.json({ data: result[0] }, { status: 201 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
