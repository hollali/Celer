const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API = "https://api.paystack.co";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, amount, email, reference, rideData } = body;

    if (action === "initialize") {
      if (!amount || !email) {
        return Response.json(
          { error: "Missing amount or email" },
          { status: 400 }
        );
      }

      const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: String(Math.round(amount * 100)),
          email,
          reference: reference || undefined,
          metadata: rideData || {},
          callback_url: "celer://payment/callback",
        }),
      });

      const data = await response.json();

      if (!data.status) {
        return Response.json(
          { error: data.message || "Paystack initialization failed" },
          { status: 400 }
        );
      }

      return Response.json(
        {
          authorization_url: data.data.authorization_url,
          reference: data.data.reference,
          access_code: data.data.access_code,
        },
        { status: 200 }
      );
    }

    if (action === "verify") {
      if (!reference) {
        return Response.json(
          { error: "Missing reference" },
          { status: 400 }
        );
      }

      const response = await fetch(
        `${PAYSTACK_API}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
        }
      );

      const data = await response.json();

      if (!data.status || data.data.status !== "success") {
        return Response.json(
          { error: "Payment verification failed" },
          { status: 400 }
        );
      }

      return Response.json(
        {
          verified: true,
          amount: data.data.amount / 100,
          reference: data.data.reference,
          paid_at: data.data.paid_at,
        },
        { status: 200 }
      );
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Paystack error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
