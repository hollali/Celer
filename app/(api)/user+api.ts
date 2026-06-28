import sql from "@/lib/neon";

export async function POST(request: Request) {
	try {
		const { name, email, clerkId } = await request.json();

		if (!name || !email || !clerkId) {
			return Response.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		const response = await sql`
        INSERT INTO users (name, email, clerk_id)
        VALUES (${name}, ${email}, ${clerkId})
        ON CONFLICT (clerk_id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email
        RETURNING *;
        `;

		return new Response(JSON.stringify({ data: response }), {
			status: 201,
		});
	} catch (error) {
		console.error("Error creating user:", error);
		return Response.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
