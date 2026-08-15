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
