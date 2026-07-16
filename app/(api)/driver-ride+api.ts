import sql from "@/lib/neon";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api-auth";

async function findDriverByEmail(email: string) {
  const rows = await sql`SELECT id, status FROM drivers WHERE email = ${email} LIMIT 1`;
  return rows[0] || null;
}

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "check_status") {
      const driver = await findDriverByEmail(user.email);
      return Response.json({
        data: driver
          ? { exists: true, status: driver.status, driver_id: driver.id }
          : { exists: false, status: null, driver_id: null },
      }, { status: 200 });
    }

    const driver = await findDriverByEmail(user.email);
    if (!driver) {
      return Response.json({ error: "Driver profile not found" }, { status: 404 });
    }

    if (action === "pending" || action === "active" || action === "earnings") {
      if (driver.status !== "approved") {
        return Response.json({ error: "Driver account not approved", status: driver.status }, { status: 403 });
      }
    }

    const driverId = driver.id;

    if (action === "pending") {
      const lat = parseFloat(searchParams.get("lat") || "0");
      const lng = parseFloat(searchParams.get("lng") || "0");

      let query = sql`
        SELECT
          r.ride_id, r.origin_address, r.destination_address,
          r.fare_price, r.ride_time, r.ride_status, r.created_at,
          json_build_object('name', u.name) AS user
        FROM rides r
        JOIN users u ON r.user_id = u.id
        WHERE r.ride_status = 'requested' AND r.driver_id IS NULL
        ORDER BY r.created_at DESC
        LIMIT 20
      `;

      if (lat !== 0 && lng !== 0) {
        query = sql`
          SELECT
            r.ride_id, r.origin_address, r.destination_address,
            r.fare_price, r.ride_time, r.ride_status, r.created_at,
            json_build_object('name', u.name) AS user
          FROM rides r
          JOIN users u ON r.user_id = u.id
          WHERE r.ride_status = 'requested' AND r.driver_id IS NULL
            AND ST_DWithin(
              ST_MakePoint(r.origin_longitude, r.origin_latitude)::geography,
              ST_MakePoint(${lng}, ${lat})::geography,
              15000
            )
          ORDER BY r.created_at DESC
          LIMIT 20
        `;
      }

      const rides = await query;
      return Response.json({ data: rides }, { status: 200 });
    }

    if (action === "active") {
      const rides = await sql`
        SELECT
          r.ride_id, r.origin_address, r.destination_address,
          r.fare_price, r.ride_time, r.ride_status, r.created_at,
          json_build_object('name', u.name, 'phone', u.phone) AS user
        FROM rides r
        JOIN users u ON r.user_id = u.id
        WHERE r.driver_id = ${driverId}
          AND r.ride_status IN ('accepted', 'in_progress')
        ORDER BY r.created_at DESC
        LIMIT 1
      `;
      return Response.json({ data: rides[0] || null }, { status: 200 });
    }

    if (action === "earnings") {
      const totalResult = await sql`
        SELECT COALESCE(SUM(fare_price), 0)::real AS total_earnings,
               COUNT(*)::int AS total_rides
        FROM rides
        WHERE driver_id = ${driverId} AND ride_status = 'completed'
      `;
      const todayResult = await sql`
        SELECT COALESCE(SUM(fare_price), 0)::real AS today_earnings,
               COUNT(*)::int AS today_rides
        FROM rides
        WHERE driver_id = ${driverId} AND ride_status = 'completed'
          AND completed_at >= CURRENT_DATE
      `;
      const weekResult = await sql`
        SELECT COALESCE(SUM(fare_price), 0)::real AS week_earnings
        FROM rides
        WHERE driver_id = ${driverId} AND ride_status = 'completed'
          AND completed_at >= DATE_TRUNC('week', NOW())
      `;
      const recentRides = await sql`
        SELECT ride_id, origin_address, destination_address, fare_price, completed_at
        FROM rides
        WHERE driver_id = ${driverId} AND ride_status = 'completed'
        ORDER BY completed_at DESC
        LIMIT 10
      `;

      return Response.json({
        data: {
          total_earnings: totalResult[0]?.total_earnings || 0,
          total_rides: totalResult[0]?.total_rides || 0,
          today_earnings: todayResult[0]?.today_earnings || 0,
          today_rides: todayResult[0]?.today_rides || 0,
          week_earnings: weekResult[0]?.week_earnings || 0,
          recent_rides: recentRides,
        },
      }, { status: 200 });
    }

    if (action === "profile") {
      const driverData = await sql`
        SELECT id, first_name, last_name, profile_image_url, car_image_url,
               car_seats, rating, is_available, phone, email, vehicle_type,
               license_number, status, vehicle_make, vehicle_model, vehicle_year,
               vehicle_color, vehicle_plate, submitted_at, approved_at
        FROM drivers WHERE id = ${driverId} LIMIT 1
      `;
      return Response.json({ data: driverData[0] || null }, { status: 200 });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user?.dbUserId) return unauthorizedResponse();

    const body = await request.json();
    const { action } = body;

    if (action === "register_driver") {
      const {
        first_name, last_name, phone, email, vehicle_type,
        vehicle_make, vehicle_model, vehicle_year, vehicle_color,
        vehicle_plate, car_seats, license_number, documents,
      } = body;

      if (!first_name || !last_name || !phone || !email || !vehicle_make || !vehicle_model || !vehicle_plate || !license_number) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
      }

      const existing = await findDriverByEmail(email);
      if (existing) {
        return Response.json({ error: "A driver application already exists for this email" }, { status: 409 });
      }

      const docsJson = JSON.stringify(documents || {});

      const result = await sql`
        INSERT INTO drivers (
          clerk_id, first_name, last_name, phone, email,
          vehicle_type, vehicle_make, vehicle_model, vehicle_year,
          vehicle_color, vehicle_plate, car_seats, license_number,
          documents_url, status, submitted_at, profile_image_url
        ) VALUES (
          ${user.clerkId}, ${first_name}, ${last_name}, ${phone}, ${email},
          ${vehicle_type || "Economy"}, ${vehicle_make}, ${vehicle_model}, ${vehicle_year || null},
          ${vehicle_color}, ${vehicle_plate}, ${car_seats || 4}, ${license_number},
          ${docsJson}::jsonb, 'approved', NOW(), ${documents?.profile_photo || null}
        )
        RETURNING id, status
      `;

      return Response.json({
        data: {
          driver_id: result[0].id,
          status: result[0].status,
          message: "Driver application submitted successfully",
        },
      }, { status: 201 });
    }

    const driver = await findDriverByEmail(user.email);
    if (!driver) {
      return Response.json({ error: "Driver profile not found" }, { status: 404 });
    }

    if (driver.status !== "approved") {
      return Response.json({ error: "Driver account not approved", status: driver.status }, { status: 403 });
    }

    const driverId = driver.id;
    const { ride_id, is_available } = body;

    if (action === "accept") {
      if (!ride_id) {
        return Response.json({ error: "Missing ride_id" }, { status: 400 });
      }

      const result = await sql`
        UPDATE rides
        SET ride_status = 'accepted', driver_id = ${driverId}
        WHERE ride_id = ${ride_id} AND ride_status = 'requested' AND driver_id IS NULL
        RETURNING ride_id
      `;
      if (result.length === 0) {
        return Response.json({ error: "Ride not available or already taken" }, { status: 400 });
      }
      return Response.json({ data: { accepted: true, ride_id: result[0].ride_id } }, { status: 200 });
    }

    if (action === "decline") {
      return Response.json({ data: { declined: true } }, { status: 200 });
    }

    if (action === "start") {
      if (!ride_id) {
        return Response.json({ error: "Missing ride_id" }, { status: 400 });
      }
      const result = await sql`
        UPDATE rides SET ride_status = 'in_progress'
        WHERE ride_id = ${ride_id} AND driver_id = ${driverId} AND ride_status = 'accepted'
        RETURNING ride_id
      `;
      if (result.length === 0) {
        return Response.json({ error: "Ride not found or not in accepted state" }, { status: 400 });
      }
      return Response.json({ data: { started: true, ride_id: result[0].ride_id } }, { status: 200 });
    }

    if (action === "complete") {
      if (!ride_id) {
        return Response.json({ error: "Missing ride_id" }, { status: 400 });
      }
      const result = await sql`
        UPDATE rides SET ride_status = 'completed', completed_at = NOW()
        WHERE ride_id = ${ride_id} AND driver_id = ${driverId} AND ride_status = 'in_progress'
        RETURNING ride_id
      `;
      if (result.length === 0) {
        return Response.json({ error: "Ride not found or not in progress" }, { status: 400 });
      }
      return Response.json({ data: { completed: true, ride_id: result[0].ride_id } }, { status: 200 });
    }

    if (action === "cancel") {
      if (!ride_id) {
        return Response.json({ error: "Missing ride_id" }, { status: 400 });
      }
      const result = await sql`
        UPDATE rides SET ride_status = 'canceled', driver_id = NULL
        WHERE ride_id = ${ride_id} AND driver_id = ${driverId}
          AND ride_status IN ('accepted', 'in_progress')
        RETURNING ride_id
      `;
      if (result.length === 0) {
        return Response.json({ error: "Ride not found or cannot be canceled" }, { status: 400 });
      }
      return Response.json({ data: { canceled: true, ride_id: result[0].ride_id } }, { status: 200 });
    }

    if (action === "toggle_availability") {
      await sql`
        UPDATE drivers SET is_available = ${is_available}
        WHERE id = ${driverId}
      `;
      return Response.json({ data: { is_available } }, { status: 200 });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
