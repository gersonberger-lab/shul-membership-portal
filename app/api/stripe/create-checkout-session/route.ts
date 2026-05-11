import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  const stripe = new Stripe(secretKey);
  const body = await request.json();
  const amount = Number(body.amount || 0);

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const origin = request.headers.get("origin") || "";
  const memberName = String(body.memberName || "Member");
  const memberEmail = String(body.memberEmail || "");
  const memberId = String(body.memberId || "");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: memberEmail || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: "Shul account payment",
            description: memberName,
          },
        },
      },
    ],
    metadata: { memberId, memberName },
    success_url: `${origin}/portal/pay/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/portal/pay/cancel`,
  });

  return NextResponse.json({ url: session.url });
}
