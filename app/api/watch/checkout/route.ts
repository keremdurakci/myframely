import { NextRequest, NextResponse } from "next/server";
import { getStateConfig } from "@/lib/plates/stateConfig";
import { normalizePlate } from "@/lib/plates/normalize";
import { validatePlate } from "@/lib/plates/validation";
import { getStripe } from "@/lib/stripe";

const WATCH_PRICE_USD_CENTS = 499;

// Never trust a client-supplied path as a redirect target verbatim — this
// only allows a same-site path (leading "/", not "//") so it can't be used
// to send someone off-site after Stripe checkout completes.
function safeReturnPath(raw: unknown): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

// Creates a Stripe Checkout Session for a 30-day Plate Watch. Stripe's
// hosted page collects payment (and the customer's email) — no card data
// or email address is ever handled by our own server here.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const stateCode = typeof body?.stateCode === "string" ? body.stateCode.toUpperCase() : "";
  const rawPlate = typeof body?.plate === "string" ? body.plate : "";
  const returnPath = safeReturnPath(body?.returnTo);

  if (!stateCode || !rawPlate) {
    return NextResponse.json({ error: "stateCode and plate are required" }, { status: 400 });
  }

  const config = await getStateConfig(stateCode);
  if (!config || !config.liveCheckEnabled) {
    return NextResponse.json({ error: "Plate Watch isn't available for this state" }, { status: 400 });
  }

  const normalizedPlate = normalizePlate(rawPlate, config.rules);
  const validation = validatePlate(normalizedPlate, config.rules);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.reason }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const separator = returnPath.includes("?") ? "&" : "?";
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: WATCH_PRICE_USD_CENTS,
          product_data: {
            name: `Plate Watch — ${normalizedPlate} (${config.stateName})`,
            description: "Daily availability checks for 30 days, with an email alert the moment it's available.",
          },
        },
        quantity: 1,
      },
    ],
    // The only thread connecting the payment back to a specific plate —
    // this app has no accounts/session system, so the webhook reads these
    // back from the Stripe event instead of a server-side session.
    metadata: { stateCode: config.stateCode, normalizedPlate },
    success_url: `${siteUrl}${returnPath}${separator}watch=success`,
    cancel_url: `${siteUrl}${returnPath}${separator}watch=canceled`,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout" }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}
