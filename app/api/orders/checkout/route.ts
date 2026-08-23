import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { products } from "@/lib/products";
import {
  FRAME_PRICE_USD_CENTS,
  SHIPPING_LABEL,
  SHIPPING_RATES_USD_CENTS,
  shippingCountriesFor,
  type ShippingDestination,
} from "@/lib/orders";

// Never trust a client-supplied path as a redirect target verbatim — this
// only allows a same-site path (leading "/", not "//") so it can't be used
// to send someone off-site after Stripe checkout completes.
function safeReturnPath(raw: unknown): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

function isShippingDestination(value: unknown): value is ShippingDestination {
  return value === "CA" || value === "INTL";
}

// Creates a Stripe Checkout Session for a one-off frame purchase. Price and
// shipping are both computed server-side from the slug/destination — the
// client only picks which product and which shipping tier.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const rawDestination = body?.destination;
  const destination = isShippingDestination(rawDestination) ? rawDestination : null;
  const returnPath = safeReturnPath(body?.returnTo);

  const product = products.find((p) => p.slug === slug);
  if (!product || !destination) {
    return NextResponse.json({ error: "Invalid product or shipping destination" }, { status: 400 });
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
          unit_amount: FRAME_PRICE_USD_CENTS,
          product_data: {
            name: product.title,
            description: product.description,
            images: [`${siteUrl}${product.src}`],
          },
        },
        quantity: 1,
      },
    ],
    shipping_address_collection: { allowed_countries: shippingCountriesFor(destination) },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: SHIPPING_RATES_USD_CENTS[destination], currency: "usd" },
          display_name: `Shipping — ${SHIPPING_LABEL[destination]}`,
        },
      },
    ],
    // The only thread connecting the payment back to a specific order — this
    // app has no accounts/session system, so the webhook reads these back
    // from the Stripe event instead of a server-side session.
    metadata: { type: "frame_order", productSlug: product.slug, destination },
    success_url: `${siteUrl}${returnPath}${separator}order=success`,
    cancel_url: `${siteUrl}${returnPath}${separator}order=canceled`,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout" }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}
