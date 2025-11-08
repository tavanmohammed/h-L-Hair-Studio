// server.js (ESM)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { randomUUID } from "node:crypto";

import Booking from "./Booking.js"; // Mongoose model (email is optional in the schema!)

dotenv.config();

/* =======================
   Basic config
======================= */
const app = express();
const PORT = Number(process.env.PORT) || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// Allow multiple client origins via comma-separated env
// e.g. CLIENT_ORIGIN="http://localhost:5173,https://your-frontend.onrender.com"
const ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

/* =======================
   Middleware
======================= */
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);          // curl / Postman
      return cb(null, ORIGINS.includes(origin));   // strict allow-list
    },
    credentials: true,
  })
);
app.use(express.json());

/* =======================
   Time helpers
======================= */
const pad = (n) => n.toString().padStart(2, "0");
const toMin = (hhmm) => { const [h, m] = (hhmm || "00:00").split(":").map(Number); return h * 60 + m; };
const fromMin = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
const addMinutes = (hhmm, mins) => fromMin(toMin(hhmm) + mins);
const overlap = (aStart, aEnd, bStart, bEnd) => toMin(aStart) < toMin(bEnd) && toMin(bStart) < toMin(aEnd);

/* =======================
   Store hours (in-memory defaults)
======================= */
let HOURS = {
  weekday: { open: "09:00", close: "19:00" },
  weekend: { open: "10:00", close: "18:00" },
};
function getHoursForDate(yyyyMmDd) {
  const d = new Date(yyyyMmDd + "T00:00:00");
  const day = d.getDay(); // 0 Sun .. 6 Sat
  return (day === 0 || day === 6) ? HOURS.weekend : HOURS.weekday;
}

/* =======================
   Service durations
======================= */
const DURATION_BY_ID = {
  // WOMEN
  w1: 30, w2: 30, w3: 60, w4: 60, w5: 15, w6: 30,
  // MEN
  m1: 30, m2: 30, m3: 30, m4: 30, m5: 30,
  // AESTHETIC
  a1: 15, a2: 15, a3: 15, a4: 15, a5: 15,
};

/* =======================
   Mailer (Gmail via App Password or any SMTP)
======================= */
const {
  SMTP_HOST = "smtp.gmail.com",
  SMTP_PORT = 587,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  SITE_NAME = "H&L Hair Studio",
  SITE_URL = "",
  STUDIO_PHONE = "",
  STUDIO_ADDRESS = "",
} = process.env;

const transporter = (SMTP_USER && SMTP_PASS)
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // 465 SSL; 587 STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      requireTLS: Number(SMTP_PORT) === 587,
      pool: true,
      connectionTimeout: 10000,
    })
  : null;

async function verifyEmailTransport() {
  console.log("[MAIL]", {
    host: SMTP_HOST, port: String(SMTP_PORT),
    user: SMTP_USER, from: EMAIL_FROM || SMTP_USER,
    passSet: !!SMTP_PASS,
  });
  if (!transporter) {
    console.warn("⚠️ SMTP not configured; email disabled.");
    return;
  }
  try {
    await transporter.verify();
    console.log("✅ Mail transport verified");
  } catch (e) {
    console.warn("⚠️ Mail transport verify failed (will still attempt on send):", e.code || e.message);
  }
}

function sendBookingConfirmation(b) {
  if (!transporter || !b.email) return Promise.resolve({ ok: false, skipped: true });

  const subject = `${SITE_NAME} — Booking confirmed for ${b.date} at ${b.time}`;
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
      <h2 style="margin:0 0 8px">${SITE_NAME} — Booking Confirmed</h2>
      <p style="margin:0 0 12px">Hi ${b.name}, thanks for booking with us!</p>
      <table role="presentation" style="width:100%;max-width:520px;border-collapse:collapse">
        <tr><td style="padding:8px;border:1px solid #eee;background:#fafafa;width:160px">Service</td><td style="padding:8px;border:1px solid #eee">${b.serviceCategory} — ${b.serviceName}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#fafafa">Date</td><td style="padding:8px;border:1px solid #eee">${b.date}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;background:#fafafa">Time</td><td style="padding:8px;border:1px solid #eee">${b.time}${b.endTime ? "–" + b.endTime : ""}</td></tr>
      </table>
      <p style="margin:12px 0">Need to make a change? Reply to this email or call <b>${STUDIO_PHONE}</b>.</p>
      <p style="margin:0;color:#555;font-size:12px">${STUDIO_ADDRESS}${SITE_URL ? " • <a href='${SITE_URL}'>${SITE_URL}</a>" : ""}</p>
    </div>
  `;
  const text = `${SITE_NAME} — Booking Confirmed
Hi ${b.name},
Service: ${b.serviceCategory} — ${b.serviceName}
Date: ${b.date}
Time: ${b.time}${b.endTime ? "–" + b.endTime : ""}
Need changes? Reply to this email or call ${STUDIO_PHONE}.
${STUDIO_ADDRESS}${SITE_URL ? " • " + SITE_URL : ""}`;

  return transporter.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to: b.email,
    replyTo: SMTP_USER,
    subject, html, text,
  });
}

/* =======================
   Storage + models
======================= */
const useDb = () => mongoose.connection.readyState === 1;
const DEV_BOOKINGS = []; // memory fallback
const DEV_RULES = [];    // memory fallback for special rules
let SpecialRule = null;  // defined after DB connects
let SpecialRuleModelReady = false;

/* =======================
   Health / Debug
======================= */
app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// List routes to prove what’s registered
app.get("/api/_debug/routes", (req, res) => {
  const routes = [];
  (app._router?.stack || []).forEach((m) => {
    if (m.route) {
      const methods = Object.keys(m.route.methods).join(",").toUpperCase();
      routes.push(`${methods} ${m.route.path}`);
    }
  });
  res.json({ routes });
});

// Env + connection hints
app.get("/api/_debug/whoami", (req, res) => {
  res.json({
    port: PORT,
    mongoConnected: useDb(),
    hasAdminPassword: Boolean((process.env.ADMIN_PASSWORD || "").trim()),
    origins: ORIGINS,
  });
});

/* =======================
   Auth (admin password only)
======================= */
app.post("/api/auth/login", (req, res) => {
  const bodyPwd = (req.body?.password ?? "").trim();
  const envPwd  = (process.env.ADMIN_PASSWORD ?? "").trim();

  if (!envPwd) return res.status(500).json({ error: "Server misconfigured: ADMIN_PASSWORD not set" });
  if (bodyPwd !== envPwd) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "8h" });
  res.json({ token });
});

function requireAdmin(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Auth required" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* =======================
   Availability
======================= */
app.get("/api/availability", async (req, res) => {
  try {
    const { date, serviceId } = req.query;
    if (!date || !serviceId) return res.status(400).json({ error: "Missing date or serviceId" });

    const duration = DURATION_BY_ID[serviceId];
    if (!duration) return res.status(400).json({ error: `Unknown serviceId ${serviceId}` });

    // base hours
    let { open, close } = getHoursForDate(date);

    // rules
    let rules = [];
    if (useDb() && SpecialRuleModelReady) {
      rules = await SpecialRule.find({ date }).lean();
    } else {
      rules = DEV_RULES.filter(r => r.date === date);
    }

    // closed all day?
    if (rules.some(r => r.kind === "closed")) {
      return res.json({ date, serviceId, duration, open, close, slots: [] });
    }

    // hours override?
    const hoursRule = rules.find(r => r.kind === "hours");
    if (hoursRule?.open && hoursRule?.close) {
      open = hoursRule.open;
      close = hoursRule.close;
    }

    // existing bookings
    let bookings = [];
    if (useDb()) bookings = await Booking.find({ date }).lean();
    else bookings = DEV_BOOKINGS.filter(b => b.date === date);

    // candidate slots (15-min step)
    const candidates = [];
    for (let t = toMin(open); t + duration <= toMin(close); t += 15) {
      const start = fromMin(t), end = fromMin(t + duration);
      const busy = bookings.some(b => overlap(start, end, b.time, b.endTime));
      if (!busy) candidates.push([start, end]);
    }

    // block ranges (optional)
    const blockRule = rules.find(r => r.kind === "blocks");
    const final = blockRule?.blocks?.length
      ? candidates.filter(([s,e]) => !blockRule.blocks.some(({ start, end }) => overlap(s, e, start, end)))
      : candidates;

    res.json({ date, serviceId, duration, open, close, slots: final.map(([s]) => s) });
  } catch (e) {
    console.error("availability error", e);
    res.status(500).json({ error: "Failed to load availability" });
  }
});

/* =======================
   Public: Create Booking (email REQUIRED)
======================= */
app.post("/api/bookings", async (req, res) => {
  try {
    const {
      name, phone, email,                // email required publicly
      serviceId, serviceName, serviceCategory,
      date, time,
    } = req.body || {};

    const required = ["name","phone","email","serviceId","serviceName","serviceCategory","date","time"];
    const missing = required.filter(k => !req.body?.[k]);
    if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(", ")}` });

    const durationMinutes = DURATION_BY_ID[serviceId];
    if (!durationMinutes) return res.status(400).json({ error: "Invalid serviceId" });

    const endTime = addMinutes(time, durationMinutes);

    // rules/hours checks
    let { open, close } = getHoursForDate(date);
    let rules = [];
    if (useDb() && SpecialRuleModelReady) rules = await SpecialRule.find({ date }).lean();
    else rules = DEV_RULES.filter(r => r.date === date);

    if (rules.some(r => r.kind === "closed")) {
      return res.status(400).json({ error: "Store is closed on this date." });
    }
    const hoursRule = rules.find(r => r.kind === "hours");
    if (hoursRule?.open && hoursRule?.close) { open = hoursRule.open; close = hoursRule.close; }
    if (!(toMin(time) >= toMin(open) && toMin(endTime) <= toMin(close))) {
      return res.status(400).json({ error: "Selected time is outside store hours." });
    }
    const blockRule = rules.find(r => r.kind === "blocks");
    if (blockRule?.blocks?.some(({ start, end }) => overlap(time, endTime, start, end))) {
      return res.status(400).json({ error: "Selected time is not available (blocked)." });
    }

    // conflict check
    let sameDay = [];
    if (useDb()) sameDay = await Booking.find({ date }).lean();
    else sameDay = DEV_BOOKINGS.filter(b => b.date === date);
    if (sameDay.some(b => overlap(time, endTime, b.time, b.endTime))) {
      return res.status(409).json({ error: "Time slot no longer available." });
    }

    // save
    let booking;
    if (useDb()) {
      booking = await Booking.create({
        name, phone, email,
        serviceId, serviceName, serviceCategory,
        date, time, durationMinutes, endTime, status: "confirmed",
      });
    } else {
      booking = {
        _id: randomUUID(),
        name, phone, email,
        serviceId, serviceName, serviceCategory,
        date, time, durationMinutes, endTime, status: "confirmed",
      };
      DEV_BOOKINGS.push(booking);
    }

    // email (fire-and-forget)
    sendBookingConfirmation(booking)
      .then(info => console.log("✉️ Email sent:", info?.messageId))
      .catch(err => console.error("❌ Email send failed:", err));

    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Booking failed." });
  }
});

/* =======================
   ADMIN: Create Booking (email OPTIONAL)
======================= */
app.post("/api/admin/bookings", requireAdmin, async (req, res) => {
  try {
    const {
      name, phone, email = "",
      serviceId, serviceName, serviceCategory,
      date, time,
    } = req.body || {};

    const required = ["name","phone","serviceId","serviceName","serviceCategory","date","time"];
    const missing = required.filter(k => !req.body?.[k]);
    if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(", ")}` });

    const durationMinutes = DURATION_BY_ID[serviceId];
    if (!durationMinutes) return res.status(400).json({ error: "Invalid serviceId" });
    const endTime = addMinutes(time, durationMinutes);

    // conflict (kept simple—admin can override hours if you want)
    const sameDay = useDb()
      ? await Booking.find({ date }).lean()
      : DEV_BOOKINGS.filter(b => b.date === date);

    const conflict = sameDay.some(b => {
      const bDur = DURATION_BY_ID[b.serviceId] || b.durationMinutes || 30;
      const bEnd = b.endTime || addMinutes(b.time, bDur);
      return overlap(time, endTime, b.time, bEnd);
    });
    if (conflict) return res.status(409).json({ error: "Time slot no longer available." });

    // build doc (only set email if present)
    const doc = {
      name, phone,
      serviceId, serviceName, serviceCategory,
      date, time, durationMinutes, endTime,
      status: "confirmed",
    };
    if (email) doc.email = email;

    let booking;
    if (useDb()) booking = await Booking.create(doc);
    else { booking = { _id: randomUUID(), ...doc }; DEV_BOOKINGS.push(booking); }

    if (email) {
      sendBookingConfirmation(booking).catch(e => console.error("email failed:", e));
    } else {
      console.log("📞 Admin phone booking — no email sent");
    }

    return res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error("Admin booking error:", err);
    return res.status(500).json({ error: "Booking failed." });
  }
});

/* =======================
   ADMIN: List bookings
======================= */
app.get("/api/admin/bookings", requireAdmin, async (req, res) => {
  try {
    const { from } = req.query;
    let rows = [];
    if (useDb()) {
      const q = from ? { date: { $gte: from } } : {};
      rows = await Booking.find(q).sort({ date: 1, time: 1 }).lean();
    } else {
      rows = DEV_BOOKINGS
        .filter(b => !from || b.date >= from)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    }
    res.json(rows);
  } catch (e) {
    console.error("admin bookings error", e);
    res.status(500).json({ error: "Failed to load bookings" });
  }
});

/* =======================
   ADMIN: Hours (in-memory)
======================= */
app.get("/api/admin/hours", requireAdmin, (_req, res) => res.json(HOURS));

app.put("/api/admin/hours", requireAdmin, (req, res) => {
  const { weekday, weekend } = req.body || {};
  const valid = (t) => /^\d{2}:\d{2}$/.test(t);
  if (!weekday || !weekend) return res.status(400).json({ error: "Missing weekday/weekend" });
  if (![weekday.open, weekday.close, weekend.open, weekend.close].every(valid)) {
    return res.status(400).json({ error: "Time format must be HH:mm" });
  }
  HOURS = { weekday: { ...weekday }, weekend: { ...weekend } };
  res.json({ ok: true, HOURS });
});

/* =======================
   ADMIN: Special Rules (DB-backed with memory fallback)
======================= */
app.get("/api/admin/rules", requireAdmin, async (req, res) => {
  try {
    const from = req.query.from;
    if (useDb() && SpecialRuleModelReady) {
      const q = from ? { date: { $gte: from } } : {};
      const rules = await SpecialRule.find(q).sort({ date: 1 }).lean();
      return res.json(rules);
    } else {
      const rules = DEV_RULES
        .filter(r => !from || r.date >= from)
        .sort((a, b) => a.date.localeCompare(b.date));
      return res.json(rules);
    }
  } catch (e) {
    console.error("rules list error", e);
    res.status(500).json({ error: "Failed to load rules" });
  }
});

app.post("/api/admin/rules", requireAdmin, async (req, res) => {
  try {
    const { date, kind, open, close, blocks = [], note = "" } = req.body || {};
    if (!date || !kind) return res.status(400).json({ error: "date and kind are required" });
    if (!["closed","hours","blocks"].includes(kind)) {
      return res.status(400).json({ error: "kind must be closed|hours|blocks" });
    }

    if (useDb() && SpecialRuleModelReady) {
      const rule = await SpecialRule.create({ date, kind, open, close, blocks, note });
      return res.json(rule);
    } else {
      const rule = { _id: randomUUID(), date, kind, open, close, blocks, note };
      DEV_RULES.push(rule);
      return res.json(rule);
    }
  } catch (e) {
    console.error("rules create error", e);
    res.status(500).json({ error: "Failed to save rule" });
  }
});

app.delete("/api/admin/rules/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (useDb() && SpecialRuleModelReady) {
      await SpecialRule.findByIdAndDelete(id);
      return res.json({ ok: true });
    } else {
      const idx = DEV_RULES.findIndex(r => r._id === id);
      if (idx >= 0) DEV_RULES.splice(idx, 1);
      return res.json({ ok: true });
    }
  } catch (e) {
    console.error("rules delete error", e);
    res.status(500).json({ error: "Failed to delete rule" });
  }
});

/* =======================
   TEMP: SMTP test
======================= */
app.post("/api/_test/email", async (req, res) => {
  try {
    if (!transporter) return res.status(400).json({ ok: false, error: "Mailer not configured" });
    const to = (req.body && req.body.to) || SMTP_USER;
    const info = await transporter.sendMail({
      from: EMAIL_FROM || SMTP_USER,
      to,
      subject: "Test email from Salon backend",
      text: "If you can read this, SMTP is working.",
    });
    res.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    console.error("Test email failed:", e);
    res.status(500).json({ ok: false, error: e.message, code: e.code });
  }
});

/* =======================
   404 handler LAST
======================= */
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.url}`);
  res.status(404).json({ error: "Not found" });
});

/* =======================
   Start
======================= */
async function start() {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
      console.log("✅ MongoDB connected");

      // Define SpecialRule model after DB up
      const blockSchema  = new mongoose.Schema({ start: String, end: String }, { _id: false });
      const specialRuleSchema = new mongoose.Schema({
        date:  { type: String, required: true }, // "YYYY-MM-DD"
        kind:  { type: String, enum: ["closed","hours","blocks"], required: true },
        open:  { type: String },
        close: { type: String },
        blocks:{ type: [blockSchema], default: [] },
        note:  { type: String, default: "" },
      }, { timestamps: true });

      SpecialRule = mongoose.models.SpecialRule || mongoose.model("SpecialRule", specialRuleSchema);
      SpecialRuleModelReady = true;
    } else {
      console.log("ℹ️ No MONGO_URI set — running with in-memory storage");
    }
  } catch (e) {
    console.error("⚠️ Mongo connect error (continuing without DB):", e.message);
  }

  // Verify mailer non-blocking
  await verifyEmailTransport().catch(() => {});

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server listening on 0.0.0.0:${PORT}`);
  });
}
start();
