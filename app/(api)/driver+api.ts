import sql from "@/lib/neon";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api-auth";

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const maxDistance = parseFloat(searchParams.get("max_distance") || "15");
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

    let filtered = response;
    if (lat !== 0 && lng !== 0) {
      filtered = response.filter((d: typeof response[0]) => {
        if (d.current_latitude == null || d.current_longitude == null) return true;
        const dist = haversineDistance(lat, lng, d.current_latitude, d.current_longitude);
        return dist <= maxDistance;
      });
    }

    filtered.sort((a: typeof filtered[0], b: typeof filtered[0]) => b.rating - a.rating);

    return Response.json({ data: filtered }, { status: 200 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
