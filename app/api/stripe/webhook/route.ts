import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!secretKey || !webhookSecret || !supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Webhook is not fully configured." }, { status: 500 });
  }

  const stripe = new Stripe(secretKey);
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const memberId = session.metadata?.memberId;
  const amountTotal = Number(session.amount_total || 0) / 100;
  const paymentReference = String(session.payment_intent || session.id);

  if (!memberId || !amountTotal) {
    return NextResponse.json({ error: "Missing member or amount details." }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const description = `Card payment via Stripe - ${paymentReference}`;

  const { data: existing } = await supabase
    .from("ledger_entries")
    .select("id")
    .eq("description", description)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const today = new Date().toISOString().split("T")[0];

  const { error } = await supabase.from("ledger_entries").insert([
    {
      member_id: memberId,
      entry_date: today,
      entry_type: "payment",
      description,
      debit_amount: 0,
      credit_amount: amountTotal,
      status: "posted",
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
