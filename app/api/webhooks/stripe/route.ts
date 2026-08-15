import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { supabaseServer } from "@/lib/supabaseServer";
import { getStateConfig } from "@/lib/plates/stateConfig";
import { getAvailabilityBatch } from "@/lib/plates/availability";
import { getStripe } from "@/lib/stripe";
import { sendPlateAvailableEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  // Raw bytes, never request.json() — Stripe's signature check is over the
  // exact request body, and re-serializing a parsed object won't match it.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
  }

  // Always 200 for anything we don't specifically act on — a non-200 makes
  // Stripe retry, which only helps for events we actually handle.
  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const stateCode = session.metadata?.stateCode;
  const normalizedPlate = session.metadata?.normalizedPlate;
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  const email = session.customer_details?.email;
  if (!stateCode || !normalizedPlate || !paymentIntentId || !email) return;

  // Idempotent: Stripe redelivers events at-least-once. provider_payment_id
  // is unique — a duplicate delivery fails this insert and we short-circuit
  // instead of creating a second plate_watches row for the same payment.
  const { data: payment } = await supabaseServer
    .from("payments")
    .insert({
      provider: "stripe",
      provider_payment_id: paymentIntentId,
      amount: session.amount_total ?? 499,
      currency: session.currency ?? "usd",
      customer_email: email,
      status: "SUCCEEDED",
    })
    .select("id")
    .single();
  if (!payment) return;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: watch } = await supabaseServer
    .from("plate_watches")
    .insert({
      customer_email: email,
      state_code: stateCode,
      normalized_plate: normalizedPlate,
      expires_at: expiresAt,
      status: "ACTIVE",
      payment_id: payment.id,
      next_check_at: now.toISOString(),
    })
    .select("id")
    .single();
  if (!watch) return;

  const config = await getStateConfig(stateCode);
  if (!config) return;

  // Same-day first result instead of waiting for the next cron tick —
  // reuses the same entry point the cron job uses.
  const resultsByPlate = await getAvailabilityBatch(config, [normalizedPlate]);
  const result = resultsByPlate.get(normalizedPlate);
  const nextCheckAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  if (result?.status === "AVAILABLE") {
    await supabaseServer
      .from("plate_watches")
      .update({ status: "FOUND_AVAILABLE", alert_sent_at: new Date().toISOString() })
      .eq("id", watch.id);
    await sendPlateAvailableEmail({ to: email, plate: normalizedPlate, stateName: config.stateName });
  } else {
    await supabaseServer
      .from("plate_watches")
      .update({ last_checked_at: new Date().toISOString(), next_check_at: nextCheckAt })
      .eq("id", watch.id);
  }
}
