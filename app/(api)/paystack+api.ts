import { authenticateRequest, unauthorizedResponse } from "@/lib/api-auth";
import sql from "@/lib/neon";
import crypto from "crypto";

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API = "https://api.paystack.co";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.endsWith("/webhook")) {
      return handleWebhook(request);
    }

    const user = await authenticateRequest(request);
    if (!user) return unauthorizedResponse();

    if (!paystackSecretKey) {
      return Response.json({ error: "Payment not configured" }, { status: 503 });
    }

    const body = await request.json();
    const { action, reference, rideData, phone, provider } = body;

    if (action === "initialize") {
      const rideId = rideData?.ride_id;
      if (!rideId) {
        return Response.json({ error: "Missing ride_id" }, { status: 400 });
      }

      const rides = await sql`
        SELECT ride_id, fare_price FROM rides
        WHERE ride_id = ${rideId} AND user_id = ${user.dbUserId}
        LIMIT 1
      `;
      if (rides.length === 0) {
        return Response.json({ error: "Ride not found" }, { status: 404 });
      }

      const dbAmount = Number(rides[0].fare_price);

      const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: String(Math.round(dbAmount * 100)),
          email: user.email,
          reference: reference || undefined,
          metadata: { ride_id: rideId, clerk_id: user.clerkId },
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

      try {
        await sql`
          INSERT INTO paystack_transactions (reference, ride_id, user_id, amount, status)
          VALUES (${data.data.reference}, ${rideId}, ${user.dbUserId}, ${Math.round(dbAmount * 100)}, 'pending')
        `;
      } catch {
        // Reference may already exist (idempotent)
      }

      return Response.json({
        authorization_url: data.data.authorization_url,
        reference: data.data.reference,
        access_code: data.data.access_code,
      }, { status: 200 });
    }

    if (action === "verify") {
      if (!reference) {
        return Response.json({ error: "Missing reference" }, { status: 400 });
      }

      const existingTx = await sql`
        SELECT id, status FROM paystack_transactions
        WHERE reference = ${reference} AND status = 'success'
        LIMIT 1
      `;
      if (existingTx.length > 0) {
        return Response.json({ verified: true, reference, already_verified: true }, { status: 200 });
      }

      const response = await fetch(`${PAYSTACK_API}/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${paystackSecretKey}` },
      });

      const data = await response.json();

      if (!data.status || data.data.status !== "success") {
        return Response.json({ error: "Payment verification failed" }, { status: 400 });
      }

      const txRecord = await sql`
        SELECT ride_id FROM paystack_transactions WHERE reference = ${reference} LIMIT 1
      `;

      const rideId = txRecord[0]?.ride_id;
      if (rideId) {
        const rides = await sql`
          SELECT fare_price FROM rides WHERE ride_id = ${rideId} LIMIT 1
        `;
        if (rides.length > 0) {
          const expectedAmount = Math.round(Number(rides[0].fare_price) * 100);
          const paidAmount = data.data.amount;
          if (paidAmount !== expectedAmount) {
            return Response.json({ error: "Amount mismatch" }, { status: 400 });
          }
        }

        await sql`
          UPDATE rides SET payment_status = 'paid', ride_status = 'accepted'
          WHERE ride_id = ${rideId} AND payment_status = 'pending'
        `;
      }

      await sql`
        UPDATE paystack_transactions
        SET status = 'success', verified_at = NOW()
        WHERE reference = ${reference}
      `;

      return Response.json({
        verified: true,
        amount: data.data.amount / 100,
        reference: data.data.reference,
        paid_at: data.data.paid_at,
      }, { status: 200 });
    }

    if (action === "initialize_momo") {
      const rideId = rideData?.ride_id;
      if (!rideId) {
        return Response.json({ error: "Missing ride_id" }, { status: 400 });
      }
      if (!user.dbUserId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      return initializeMomo(user as { dbUserId: number; clerkId: string; email: string }, rideId, phone, provider);
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function initializeMomo(
  user: { dbUserId: number; clerkId: string; email: string },
  rideId: number,
  phone: string,
  provider: string
) {
  if (!paystackSecretKey) {
    return Response.json({ error: "Payment not configured" }, { status: 503 });
  }

  if (!phone || !provider) {
    return Response.json({ error: "Phone number and provider are required" }, { status: 400 });
  }

  const validProviders = ["mtn", "vodafone", "airteltigo"];
  if (!validProviders.includes(provider.toLowerCase())) {
    return Response.json({ error: "Invalid provider. Use mtn, vodafone, or airteltigo" }, { status: 400 });
  }

  const rides = await sql`
    SELECT ride_id, fare_price FROM rides
    WHERE ride_id = ${rideId} AND user_id = ${user.dbUserId}
    LIMIT 1
  `;
  if (rides.length === 0) {
    return Response.json({ error: "Ride not found" }, { status: 404 });
  }

  const dbAmount = Number(rides[0].fare_price);

  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(Math.round(dbAmount * 100)),
      email: user.email,
      metadata: { ride_id: rideId, clerk_id: user.clerkId, phone, provider },
      channels: ["mobile_money"],
      mobile_money: {
        phone,
        provider: provider.toUpperCase(),
      },
      callback_url: "celer://payment/callback",
    }),
  });

  const data = await response.json();

  if (!data.status) {
    return Response.json(
      { error: data.message || "Paystack MoMo initialization failed" },
      { status: 400 }
    );
  }

  try {
    await sql`
      INSERT INTO paystack_transactions (reference, ride_id, user_id, amount, status)
      VALUES (${data.data.reference}, ${rideId}, ${user.dbUserId}, ${Math.round(dbAmount * 100)}, 'pending')
    `;
  } catch {
    // Reference may already exist (idempotent)
  }

  return Response.json({
    authorization_url: data.data.authorization_url,
    reference: data.data.reference,
    access_code: data.data.access_code,
  }, { status: 200 });
}

async function handleWebhook(request: Request) {
  if (!paystackSecretKey) {
    return Response.json({ error: "Payment not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  const hash = crypto
    .createHmac("sha512", paystackSecretKey)
    .update(body)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "hex");
  const hashBuf = Buffer.from(hash, "hex");

  if (sigBuf.length !== hashBuf.length || !crypto.timingSafeEqual(sigBuf, hashBuf)) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const { reference } = event.data;

    const existingTx = await sql`
      SELECT id, status FROM paystack_transactions
      WHERE reference = ${reference} AND status = 'success'
      LIMIT 1
    `;
    if (existingTx.length > 0) {
      return Response.json({ received: true }, { status: 200 });
    }

    const txRecord = await sql`
      SELECT ride_id, amount FROM paystack_transactions WHERE reference = ${reference} LIMIT 1
    `;
    const rideId = txRecord[0]?.ride_id;
    const expectedAmount = txRecord[0]?.amount;

    if (expectedAmount && event.data.amount !== expectedAmount) {
      console.log(`Paystack webhook amount mismatch: expected ${expectedAmount}, got ${event.data.amount}`);
      return Response.json({ error: "Amount mismatch" }, { status: 400 });
    }

    if (rideId) {
      await sql`
        UPDATE rides SET payment_status = 'paid', ride_status = 'accepted'
        WHERE ride_id = ${rideId} AND payment_status = 'pending'
      `;
    }

    await sql`
      UPDATE paystack_transactions
      SET status = 'success', verified_at = NOW()
      WHERE reference = ${reference}
    `;
  }

  return Response.json({ received: true }, { status: 200 });
}
