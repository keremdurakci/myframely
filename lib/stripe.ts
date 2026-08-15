import Stripe from "stripe";

// Server-side only — never import from a client component. Lazily
// constructed so the module can be imported (e.g. by tests or tooling)
// before STRIPE_SECRET_KEY exists in the environment.
export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(secretKey);
}
