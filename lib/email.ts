const RESEND_API_URL = "https://api.resend.com/emails";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Unlike a would-be transactional sender, this one carries public-form input
// (name/message), not data this app already validated/normalized itself —
// always HTML-escaped before going into the email body. `reply_to` is the
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
