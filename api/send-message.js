const { Resend } = require("resend");

const recentIps = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 8;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function rateLimit(ip) {
  const now = Date.now();
  const entry = recentIps.get(ip) || { count: 0, windowStart: now };
  if (now - entry.windowStart > RATE_WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }
  entry.count += 1;
  recentIps.set(ip, entry);
  return entry.count <= RATE_MAX;
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  if (!rateLimit(ip)) {
    return res.status(429).json({ ok: false, error: "Too many requests. Try again in a minute." });
  }

  const raw = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!raw) {
    return res.status(400).json({ ok: false, error: "Message is required." });
  }
  if (raw.length > 4000) {
    return res.status(400).json({ ok: false, error: "Message is too long." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.MY_EMAIL_ADDRESS || "").trim();
  if (!apiKey || !to) {
    return res.status(503).json({
      ok: false,
      error: "Email is not configured. Set RESEND_API_KEY and MY_EMAIL_ADDRESS in Vercel.",
    });
  }

  const resend = new Resend(apiKey);
  const safe = escapeHtml(raw).replace(/\r\n|\n|\r/g, "<br/>");

  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [to],
      subject: "New Message from Vanshika!",
      html: `<p><strong>Madam ji says:</strong></p><p>${safe}</p>`,
    });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message || "Could not send email." });
    }

    return res.status(200).json({ ok: true, id: data?.id ?? null });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "Could not send email." });
  }
};
