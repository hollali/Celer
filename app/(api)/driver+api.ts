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

    const radiusKm = 15;
    const latDelta = radiusKm / 111.32;
    const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;

    const useLocation = lat !== 0 && lng !== 0;

    let query;
    if (useLocation && vehicleType) {
      query = sql`
        SELECT
          id, first_name, last_name, profile_image_url, car_image_url,
          car_seats, rating, vehicle_type,
          current_latitude, current_longitude
        FROM drivers
        WHERE is_available = TRUE
          AND vehicle_type = ${vehicleType}
          AND current_latitude BETWEEN ${minLat} AND ${maxLat}
          AND current_longitude BETWEEN ${minLng} AND ${maxLng}
      `;
    } else if (useLocation) {
      query = sql`
        SELECT
          id, first_name, last_name, profile_image_url, car_image_url,
          car_seats, rating, vehicle_type,
          current_latitude, current_longitude
        FROM drivers
        WHERE is_available = TRUE
          AND current_latitude BETWEEN ${minLat} AND ${maxLat}
          AND current_longitude BETWEEN ${minLng} AND ${maxLng}
      `;
    } else if (vehicleType) {
      query = sql`
        SELECT
          id, first_name, last_name, profile_image_url, car_image_url,
          car_seats, rating, vehicle_type,
          current_latitude, current_longitude
        FROM drivers
        WHERE is_available = TRUE AND vehicle_type = ${vehicleType}
      `;
    } else {
      query = sql`
        SELECT
          id, first_name, last_name, profile_image_url, car_image_url,
          car_seats, rating, vehicle_type,
          current_latitude, current_longitude
        FROM drivers
        WHERE is_available = TRUE
      `;
    }

    const response = await query;

    response.sort((a: (typeof response)[0], b: (typeof response)[0]) => b.rating - a.rating);

    return Response.json({ data: response }, { status: 200 });
  } catch (err) {
    console.error("GET /driver error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
