import sql from "@/lib/neon";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api-auth";
import { FARE_RATE_PER_MINUTE } from "@/constants";

const VALID_PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
const VALID_RIDE_STATUSES = ["requested", "accepted", "in_progress", "completed", "canceled"] as const;

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    // Auto-expire pending rides older than 30 minutes (fire-and-forget cleanup)
    sql`
      UPDATE rides
      SET ride_status = 'canceled', payment_status = 'failed'
      WHERE user_id = ${user.dbUserId}
        AND ride_status = 'requested'
        AND payment_status = 'pending'
        AND created_at < NOW() - INTERVAL '30 minutes'
    `.catch((e) => console.error("Auto-expire query failed:", e));

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;
    const status = searchParams.get("status");
    const rideId = searchParams.get("ride_id");

    if (rideId) {
      const result = await sql`
        SELECT
          rides.*,
          CASE WHEN drivers.id IS NOT NULL THEN
            json_build_object(
              'first_name', drivers.first_name,
              'last_name', drivers.last_name,
              'car_seats', drivers.car_seats
            )
          ELSE NULL END AS driver
        FROM rides
        LEFT JOIN drivers ON rides.driver_id = drivers.id
        WHERE rides.ride_id = ${parseInt(rideId)} AND rides.user_id = ${user.dbUserId}
        LIMIT 1
      `;
      if (result.length === 0) {
        return Response.json({ error: "Ride not found" }, { status: 404 });
      }
      return Response.json({ data: result[0] }, { status: 200 });
    }

    let response;
    if (status && VALID_RIDE_STATUSES.includes(status as typeof VALID_RIDE_STATUSES[number])) {
      response = await sql`
        SELECT
          rides.*,
          CASE WHEN drivers.id IS NOT NULL THEN
            json_build_object(
              'first_name', drivers.first_name,
              'last_name', drivers.last_name,
              'car_seats', drivers.car_seats
            )
          ELSE NULL END AS driver
        FROM rides
        LEFT JOIN drivers ON rides.driver_id = drivers.id
        WHERE rides.user_id = ${user.dbUserId} AND rides.ride_status = ${status}
        ORDER BY rides.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      response = await sql`
        SELECT
          rides.*,
          CASE WHEN drivers.id IS NOT NULL THEN
            json_build_object(
              'first_name', drivers.first_name,
              'last_name', drivers.last_name,
              'car_seats', drivers.car_seats
            )
          ELSE NULL END AS driver
        FROM rides
        LEFT JOIN drivers ON rides.driver_id = drivers.id
        WHERE rides.user_id = ${user.dbUserId}
        ORDER BY rides.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const countResult = await sql`
      SELECT COUNT(*)::int as total FROM rides WHERE user_id = ${user.dbUserId}
    `;

    return Response.json({
      data: response,
      pagination: {
        page,
        limit,
        total: countResult[0]?.total ?? 0,
      },
    }, { status: 200 });
  } catch (e) {
    console.error("GET /ride error:", e);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const body = await request.json();
    const {
      origin_address,
      destination_address,
      origin_latitude,
      origin_longitude,
      destination_latitude,
      destination_longitude,
      ride_time,
      driver_id,
    } = body;

    if (
      !origin_address ||
      !destination_address ||
      origin_latitude == null ||
      origin_longitude == null ||
      destination_latitude == null ||
      destination_longitude == null ||
      ride_time == null ||
      ride_time <= 0 ||
      !driver_id
    ) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (Math.abs(origin_latitude) > 90 || Math.abs(origin_longitude) > 180 ||
        Math.abs(destination_latitude) > 90 || Math.abs(destination_longitude) > 180) {
      return Response.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const driverCheck = await sql`
      SELECT id FROM drivers WHERE id = ${driver_id} LIMIT 1
    `;
    if (driverCheck.length === 0) {
      return Response.json({ error: "Driver not found" }, { status: 404 });
    }

    const serverPrice = Math.round(ride_time * FARE_RATE_PER_MINUTE * 100) / 100;

    const response = await sql`
      INSERT INTO rides (
        origin_address, destination_address,
        origin_latitude, origin_longitude,
        destination_latitude, destination_longitude,
        ride_time, fare_price, ride_status, payment_status,
        driver_id, user_id
      ) VALUES (
        ${origin_address}, ${destination_address},
        ${origin_latitude}, ${origin_longitude},
        ${destination_latitude}, ${destination_longitude},
        ${ride_time}, ${serverPrice}, ${"requested"}, ${"pending"},
        ${driver_id}, ${user.dbUserId}
      )
      RETURNING *
    `;

    await sql`
      UPDATE users SET total_trips = total_trips + 1 WHERE id = ${user.dbUserId}
    `;

    return Response.json({ data: response }, { status: 201 });
  } catch (e) {
    console.error("POST /ride error:", e);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const body = await request.json();
    const { ride_id, payment_status, ride_status } = body;

    if (!ride_id) {
      return Response.json({ error: "Missing ride_id" }, { status: 400 });
    }

    if (payment_status && !VALID_PAYMENT_STATUSES.includes(payment_status)) {
      return Response.json({ error: "Invalid payment_status" }, { status: 400 });
    }

    if (ride_status && !VALID_RIDE_STATUSES.includes(ride_status)) {
      return Response.json({ error: "Invalid ride_status" }, { status: 400 });
    }

    if (!payment_status && !ride_status) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    let response;
    if (payment_status && ride_status) {
      response = await sql`
        UPDATE rides
        SET payment_status = ${payment_status}, ride_status = ${ride_status},
            completed_at = CASE WHEN ${ride_status} = 'completed' THEN NOW() ELSE completed_at END
        WHERE ride_id = ${ride_id} AND user_id = ${user.dbUserId}
        RETURNING *
      `;
    } else if (payment_status) {
      response = await sql`
        UPDATE rides
        SET payment_status = ${payment_status}
        WHERE ride_id = ${ride_id} AND user_id = ${user.dbUserId}
        RETURNING *
      `;
    } else {
      response = await sql`
        UPDATE rides
        SET ride_status = ${ride_status},
            completed_at = CASE WHEN ${ride_status} = 'completed' THEN NOW() ELSE completed_at END
        WHERE ride_id = ${ride_id} AND user_id = ${user.dbUserId}
        RETURNING *
      `;
    }

    if (response.length === 0) {
      return Response.json({ error: "Ride not found" }, { status: 404 });
    }

    return Response.json({ data: response }, { status: 200 });
  } catch (e) {
    console.log("PATCH /ride error:", e);
    return Response.json({ error: "Internal Server Error", details: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const rideId = searchParams.get("ride_id");

    if (!rideId) {
      return Response.json({ error: "Missing ride_id" }, { status: 400 });
    }

    const result = await sql`
      UPDATE rides
      SET ride_status = 'canceled'
      WHERE ride_id = ${parseInt(rideId)} AND user_id = ${user.dbUserId}
        AND ride_status IN ('requested', 'accepted')
      RETURNING ride_id
    `;

    if (result.length === 0) {
      return Response.json({ error: "Ride not found or cannot be canceled" }, { status: 404 });
    }

    return Response.json({ data: { canceled: true, ride_id: result[0].ride_id } }, { status: 200 });
  } catch (e) {
    console.error("DELETE /ride error:", e);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
