import { neon } from "@neondatabase/serverless";

const sql = neon(`${process.env.DATABASE_URL}`);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("user_email");

    let response;
    if (userEmail) {
      response = await sql`
        SELECT
          rides.ride_id,
          rides.origin_address,
          rides.destination_address,
          rides.origin_latitude,
          rides.origin_longitude,
          rides.destination_latitude,
          rides.destination_longitude,
          rides.ride_time,
          rides.fare_price,
          rides.payment_status,
          rides.created_at,
          json_build_object(
            'first_name', drivers.first_name,
            'last_name', drivers.last_name,
            'car_seats', drivers.car_seats
          ) AS driver
        FROM
          rides
        INNER JOIN
          drivers ON rides.driver_id = drivers.id
        WHERE
          rides.user_id = ${userEmail}
        ORDER BY
          rides.created_at DESC
        LIMIT 20;
      `;
    } else {
      response = await sql`
        SELECT
          rides.ride_id,
          rides.origin_address,
          rides.destination_address,
          rides.origin_latitude,
          rides.origin_longitude,
          rides.destination_latitude,
          rides.destination_longitude,
          rides.ride_time,
          rides.fare_price,
          rides.payment_status,
          rides.created_at,
          json_build_object(
            'first_name', drivers.first_name,
            'last_name', drivers.last_name,
            'car_seats', drivers.car_seats
          ) AS driver
        FROM
          rides
        INNER JOIN
          drivers ON rides.driver_id = drivers.id
        ORDER BY
          rides.created_at DESC
        LIMIT 20;
      `;
    }

    return Response.json({ data: response }, { status: 200 });
  } catch (error) {
    console.error("Error fetching rides:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      origin_address,
      destination_address,
      origin_latitude,
      origin_longitude,
      destination_latitude,
      destination_longitude,
      ride_time,
      fare_price,
      payment_status,
      driver_id,
      user_id,
    } = body;

    if (
      !origin_address ||
      !destination_address ||
      !origin_latitude ||
      !origin_longitude ||
      !destination_latitude ||
      !destination_longitude ||
      !ride_time ||
      !fare_price ||
      !payment_status ||
      !driver_id ||
      !user_id
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await sql`
      INSERT INTO rides (
        origin_address,
        destination_address,
        origin_latitude,
        origin_longitude,
        destination_latitude,
        destination_longitude,
        ride_time,
        fare_price,
        payment_status,
        driver_id,
        user_id
      ) VALUES (
        ${origin_address},
        ${destination_address},
        ${origin_latitude},
        ${origin_longitude},
        ${destination_latitude},
        ${destination_longitude},
        ${ride_time},
        ${fare_price},
        ${payment_status},
        ${driver_id},
        ${user_id}
      )
      RETURNING *;
    `;

    return Response.json({ data: response }, { status: 201 });
  } catch (error) {
    console.error("Error creating ride:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ride_id, payment_status } = body;

    if (!ride_id || !payment_status) {
      return Response.json(
        { error: "Missing ride_id or payment_status" },
        { status: 400 }
      );
    }

    const response = await sql`
      UPDATE rides
      SET payment_status = ${payment_status}
      WHERE ride_id = ${ride_id}
      RETURNING *;
    `;

    if (response.length === 0) {
      return Response.json({ error: "Ride not found" }, { status: 404 });
    }

    return Response.json({ data: response }, { status: 200 });
  } catch (error) {
    console.error("Error updating ride:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
