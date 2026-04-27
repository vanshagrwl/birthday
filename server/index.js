import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { Resend } from "resend";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_ORIGIN.split(",").map((s) => s.trim()),
    methods: ["POST", "GET"],
  })
);
app.use(express.json({ limit: "32kb" }));

const recentIps = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 8;

function rateLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = recentIps.get(ip) || { count: 0, windowStart: now };
  if (now - entry.windowStart > RATE_WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }
  entry.count += 1;
  recentIps.set(ip, entry);
  if (entry.count > RATE_MAX) {
    return res.status(429).json({ ok: false, error: "Too many requests. Try again in a minute." });
  }
  next();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/send-message", rateLimit, async (req, res) => {
  const raw = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!raw) {
    return res.status(400).json({ ok: false, error: "Message is required." });
  }
  if (raw.length > 4000) {
    return res.status(400).json({ ok: false, error: "Message is too long." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.MY_EMAIL_ADDRESS || "vansh251205@gmail.com").trim();

  if (!apiKey || !to) {
    console.error("Missing RESEND_API_KEY or MY_EMAIL_ADDRESS in server/.env");
    return res.status(503).json({
      ok: false,
      error: "Email is not configured on the server. Set RESEND_API_KEY and MY_EMAIL_ADDRESS in server/.env",
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
      console.error("Resend API error:", error);
      return res.status(500).json({ ok: false, error: error.message || "Could not send email." });
    }

    return res.status(200).json({ ok: true, id: data?.id ?? null });
  } catch (e) {
    console.error("Resend send error:", e);
    return res.status(500).json({ ok: false, error: e?.message || "Could not send email." });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
