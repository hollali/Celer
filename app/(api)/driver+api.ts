import sql from "@/lib/neon";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const vehicleType = searchParams.get("vehicle_type");

    let query = sql`
      SELECT
        id, first_name, last_name, profile_image_url, car_image_url,
        car_seats, rating, vehicle_type,
        current_latitude, current_longitude
      FROM drivers
      WHERE is_available = TRUE
    `;

    if (vehicleType) {
      query = sql`
        SELECT
          id, first_name, last_name, profile_image_url, car_image_url,
          car_seats, rating, vehicle_type,
          current_latitude, current_longitude
        FROM drivers
        WHERE is_available = TRUE AND vehicle_type = ${vehicleType}
      `;
    }

    const response = await query;

    response.sort((a: typeof response[0], b: typeof response[0]) => b.rating - a.rating);

    return Response.json({ data: response }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
