const RESEND_API_URL = "https://api.resend.com/emails";

// Plain fetch against Resend's HTTP API — no SDK, matches this project's
// minimal-dependency style. Never throws: a failed alert for one watch
// shouldn't abort the cron run for the others, so callers just check the
// boolean and move on (the watch stays FOUND_AVAILABLE either way; a
// missed email isn't a reason to re-run the check).
export async function sendPlateAvailableEmail(params: {
  to: string;
  plate: string;
  stateName: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return false;

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: `Your watched plate "${params.plate}" is available in ${params.stateName}`,
        html: `<p>Good news — <strong>${params.plate}</strong> is now available in ${params.stateName}.</p><p>Head to the official DMV site to claim it before someone else does. This Plate Watch is now complete.</p>`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

interface ShippingAddress {
  city: string | null;
  country: string | null;
  line1: string | null;
  line2: string | null;
  postal_code: string | null;
  state: string | null;
}

// Notifies the seller (not the customer) that a frame order came in and
// needs to ship — there's no admin/orders dashboard yet, so this email is
// the only signal. Same never-throws contract as sendPlateAvailableEmail.
export async function sendFrameOrderEmail(params: {
  productTitle: string;
  customerEmail: string;
  shippingName: string;
  shippingAddress: ShippingAddress;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.ORDER_ALERT_EMAIL;
  if (!apiKey || !from || !to) return false;

  const addr = params.shippingAddress;
  const addressLines = [
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.postal_code].filter(Boolean).join(", "),
    addr.country,
  ]
    .filter(Boolean)
    .join("<br>");

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `New order: ${params.productTitle}`,
        html: `<p>New frame order paid — ship it out.</p><p><strong>${params.productTitle}</strong></p><p>Customer email: ${params.customerEmail}</p><p>Ship to:<br>${params.shippingName}<br>${addressLines}</p>`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Unlike the other two senders, this one carries public-form input (name/
// message), not data this app already validated/normalized itself — always
// HTML-escaped before going into the email body. `reply_to` is the
// customer's own address so replying from the inbox just works, rather
// than replying to the no-reply sending address.
export async function sendContactFormEmail(params: { name: string; email: string; message: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.ORDER_ALERT_EMAIL;
  if (!apiKey || !from || !to) return false;

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: params.email,
        subject: `Contact form: ${params.name}`,
        html: `<p>New contact form message.</p><p>From: ${escapeHtml(params.name)} (${escapeHtml(params.email)})</p><p>${escapeHtml(params.message).replace(/\n/g, "<br>")}</p>`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
