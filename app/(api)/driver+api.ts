import { neon } from "@neondatabase/serverless";

const sql = neon(`${process.env.DATABASE_URL}`);

export async function GET() {
  try {
    const response = await sql`
      SELECT
        id,
        first_name,
        last_name,
        profile_image_url,
        car_image_url,
        car_seats,
        rating
      FROM
        drivers
      ORDER BY
        rating DESC;
    `;

    return Response.json({ data: response }, { status: 200 });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
