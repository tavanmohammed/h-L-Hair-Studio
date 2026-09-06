import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { randomUUID } from "node:crypto";

import Booking from "./Booking.js";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

const ORIGINS = (
  process.env.CLIENT_ORIGIN || "http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);

      return cb(null, ORIGINS.includes(origin));
    },

    credentials: true,
  })
);

app.use(express.json());

const pad = (n) => n.toString().padStart(2, "0");

const toMin = (hhmm) => {
  const [h, m] = (hhmm || "00:00")
    .split(":")
    .map(Number);

  return h * 60 + m;
};

const fromMin = (mins) =>
  `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

const addMinutes = (hhmm, mins) =>
  fromMin(toMin(hhmm) + mins);

const overlap = (
  aStart,
  aEnd,
  bStart,
  bEnd
) =>
  toMin(aStart) < toMin(bEnd) &&
  toMin(bStart) < toMin(aEnd);

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || "";

  const token = auth.startsWith("Bearer ")
    ? auth.slice(7)
    : null;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Auth required" });
  }

  try {
    const payload = jwt.verify(
      token,
      JWT_SECRET
    );

    if (payload.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden" });
    }

    req.user = payload;

    next();
  } catch {
    return res
      .status(401)
      .json({ error: "Invalid token" });
  }
}

let HOURS = {
  regular: {
    weekday: {
      open: "11:00",
      close: "19:00",
    },

    saturday: {
      open: "11:00",
      close: "19:00",
    },

    sunday: {
      open: "11:00",
      close: "17:00",
    },
  },

  nails: {
    weekday: {
      open: "16:30",
      close: "19:00",
    },

    saturday: {
      open: "16:30",
      close: "19:00",
    },

    sunday: {
      open: "11:00",
      close: "17:00",
    },
  },
};

function getHoursForDate(
  yyyyMmDd,
  bookingType = "regular"
) {
  const d = new Date(
    yyyyMmDd + "T00:00:00"
  );

  const day = d.getDay();

  if (bookingType === "nails") {
    if (day === 1) return null;

    if (day === 0) {
      return HOURS.nails.sunday;
    }

    if (day === 6) {
      return HOURS.nails.saturday;
    }

    return HOURS.nails.weekday;
  }

  if (day === 1) return null;

  if (day === 0) {
    return HOURS.regular.sunday;
  }

  if (day === 6) {
    return HOURS.regular.saturday;
  }

  return HOURS.regular.weekday;
}

const DURATION_BY_ID = {
  // WOMEN
  w1: 30,
  w2: 45,
  w3: 60,
  w4: 60,
  w5: 15,
  w6: 30,

  // MEN
  m1: 30,
  m2: 45,
  m3: 15,
  m4: 30,
  m5: 45,
  m6: 30,
  m7: 30,

  // WAXING
  wx1: 15,
  wx2: 15,
  wx3: 15,
  wx4: 30,
  wx5: 45,

  // COLORING
  c1: 90,
  c2: 90,
  c3: 180,
  c4: 150,
  c5: 180,
  c6: 120,
  c7: 45,

  // NAILS
  n1: 30,
  n2: 45,
  n3: 45,
  n4: 60,
  n5: 60,
  n6: 60,
  n7: 30,
  n8: 20,
  n9: 45,
};

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

const transporter =
  SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        host: SMTP_HOST,

        port: Number(SMTP_PORT),

        secure:
          Number(SMTP_PORT) === 465,

        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },

        requireTLS:
          Number(SMTP_PORT) === 587,

        pool: true,

        connectionTimeout: 10000,
      })
    : null;

async function verifyEmailTransport() {
  if (!transporter) {
    console.warn(
      "SMTP not configured. Email disabled."
    );

    return;
  }

  try {
    await transporter.verify();

    console.log(
      "Mail transport verified"
    );
  } catch (e) {
    console.warn(
      "Mail transport verify failed:",
      e.message
    );
  }
}

function sendBookingConfirmation(
  booking
) {
  if (
    !transporter ||
    !booking.email
  ) {
    return Promise.resolve({
      ok: false,
      skipped: true,
    });
  }

  const subject =
    `${SITE_NAME} — Booking confirmed for ` +
    `${booking.date} at ${booking.time}`;

  const html = `
    <div style="font-family: Arial, sans-serif">

      <h2>
        ${SITE_NAME} — Booking Confirmed
      </h2>

      <p>
        Hi ${booking.name},
        thanks for booking with us!
      </p>

      <p>
        <strong>Service:</strong>
        ${booking.serviceCategory}
        —
        ${booking.serviceName}
      </p>

      <p>
        <strong>Date:</strong>
        ${booking.date}
      </p>

      <p>
        <strong>Time:</strong>
        ${booking.time}
        -
        ${booking.endTime}
      </p>

      <p>
        Need to make a change?
        Call ${STUDIO_PHONE}.
      </p>

      <p>
        ${STUDIO_ADDRESS}
      </p>

    </div>
  `;

  return transporter.sendMail({
    from:
      EMAIL_FROM || SMTP_USER,

    to: booking.email,

    replyTo: SMTP_USER,

    subject,

    html,
  });
}

const useDb = () =>
  mongoose.connection.readyState === 1;

const DEV_BOOKINGS = [];
const DEV_RULES = [];

let SpecialRule = null;
let SpecialRuleModelReady = false;

/*
  This helper is important.

  Old bookings may not contain
  bookingType.

  We treat old bookings as
  "regular".
*/
async function getBookingsForDate(
  date,
  bookingType
) {
  if (!useDb()) {
    return DEV_BOOKINGS.filter(
      (b) =>
        b.date === date &&
        (b.bookingType || "regular") ===
          bookingType &&
        b.status !== "cancelled"
    );
  }

  if (bookingType === "regular") {
    return Booking.find({
      date,

      status: {
        $ne: "cancelled",
      },

      $or: [
        {
          bookingType: "regular",
        },

        {
          bookingType: {
            $exists: false,
          },
        },

        {
          bookingType: null,
        },
      ],
    }).lean();
  }

  return Booking.find({
    date,

    bookingType,

    status: {
      $ne: "cancelled",
    },
  }).lean();
}

/*
  Safely calculate an existing
  booking's end time.

  This also protects old database
  records.
*/
function getBookingEndTime(
  booking
) {
  if (booking.endTime) {
    return booking.endTime;
  }

  const duration =
    booking.durationMinutes ||
    DURATION_BY_ID[
      booking.serviceId
    ] ||
    30;

  return addMinutes(
    booking.time,
    duration
  );
}

app.get("/", (_req, res) => {
  res
    .type("text")
    .send(
      "H&L Hair Studio API is running."
    );
});

app.get(
  "/health",
  (_req, res) => {
    res.json({
      ok: true,

      time:
        new Date().toISOString(),

      databaseConnected:
        useDb(),
    });
  }
);

app.post(
  "/api/auth/login",
  (req, res) => {
    const bodyPwd = (
      req.body?.password ?? ""
    ).trim();

    const envPwd = (
      process.env.ADMIN_PASSWORD ??
      ""
    ).trim();

    if (!envPwd) {
      return res.status(500).json({
        error:
          "Server misconfigured: ADMIN_PASSWORD not set",
      });
    }

    if (bodyPwd !== envPwd) {
      return res.status(401).json({
        error:
          "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        role: "admin",
      },

      JWT_SECRET,

      {
        expiresIn: "8h",
      }
    );

    res.json({
      token,
    });
  }
);

app.get(
  "/api/admin/me",
  requireAdmin,
  (req, res) => {
    res.json({
      ok: true,

      user: {
        role: req.user.role,
      },
    });
  }
);

/* =========================
   PUBLIC AVAILABILITY
========================= */

app.get(
  "/api/availability",
  async (req, res) => {
    try {
      const {
        date,
        serviceId,
        bookingType = "regular",
      } = req.query;

      if (!date || !serviceId) {
        return res.status(400).json({
          error:
            "Missing date or serviceId",
        });
      }

      const duration =
        DURATION_BY_ID[serviceId];

      if (!duration) {
        return res.status(400).json({
          error:
            `Unknown serviceId ${serviceId}`,
        });
      }

      const dayHours =
        getHoursForDate(
          date,
          bookingType
        );

      if (!dayHours) {
        return res.json({
          date,
          serviceId,
          bookingType,
          duration,
          open: "",
          close: "",
          slots: [],
        });
      }

      let {
        open,
        close,
      } = dayHours;

      let rules = [];

      if (
        useDb() &&
        SpecialRuleModelReady
      ) {
        rules =
          await SpecialRule.find({
            date,
          }).lean();
      } else {
        rules =
          DEV_RULES.filter(
            (r) => r.date === date
          );
      }

      if (
        rules.some(
          (r) =>
            r.kind === "closed"
        )
      ) {
        return res.json({
          date,
          serviceId,
          bookingType,
          duration,
          open,
          close,
          slots: [],
        });
      }

      const hoursRule =
        rules.find(
          (r) =>
            r.kind === "hours"
        );

      if (
        hoursRule?.open &&
        hoursRule?.close
      ) {
        open = hoursRule.open;
        close = hoursRule.close;
      }

      const bookings =
        await getBookingsForDate(
          date,
          bookingType
        );

      const candidates = [];

      for (
        let t = toMin(open);
        t + duration <=
        toMin(close);
        t += 15
      ) {
        const start =
          fromMin(t);

        const end =
          fromMin(
            t + duration
          );

        const busy =
          bookings.some(
            (booking) => {
              const existingEnd =
                getBookingEndTime(
                  booking
                );

              return overlap(
                start,
                end,
                booking.time,
                existingEnd
              );
            }
          );

        if (!busy) {
          candidates.push([
            start,
            end,
          ]);
        }
      }

      const blockRule =
        rules.find(
          (r) =>
            r.kind === "blocks"
        );

      const finalSlots =
        blockRule?.blocks
          ?.length
          ? candidates.filter(
              ([start, end]) =>
                !blockRule.blocks.some(
                  (block) =>
                    overlap(
                      start,
                      end,
                      block.start,
                      block.end
                    )
                )
            )
          : candidates;

      return res.json({
        date,
        serviceId,
        bookingType,
        duration,
        open,
        close,

        slots:
          finalSlots.map(
            ([start]) => start
          ),
      });
    } catch (error) {
      console.error(
        "Availability error:",
        error
      );

      return res
        .status(500)
        .json({
          error:
            "Failed to load availability",
        });
    }
  }
);

/* =========================
   PUBLIC CREATE BOOKING
========================= */

app.post(
  "/api/bookings",
  async (req, res) => {
    try {
      const {
        name,
        phone,
        email,
        serviceId,
        serviceName,
        serviceCategory,
        date,
        time,
        bookingType = "regular",
      } = req.body || {};

      const required = [
        "name",
        "phone",
        "email",
        "serviceId",
        "serviceName",
        "serviceCategory",
        "date",
        "time",
      ];

      const missing =
        required.filter(
          (key) =>
            !req.body?.[key]
        );

      if (missing.length) {
        return res
          .status(400)
          .json({
            error:
              `Missing: ${missing.join(
                ", "
              )}`,
          });
      }

      if (
        ![
          "regular",
          "nails",
        ].includes(bookingType)
      ) {
        return res
          .status(400)
          .json({
            error:
              "Invalid booking type",
          });
      }

      const durationMinutes =
        DURATION_BY_ID[
          serviceId
        ];

      if (
        !durationMinutes
      ) {
        return res
          .status(400)
          .json({
            error:
              "Invalid serviceId",
          });
      }

      const endTime =
        addMinutes(
          time,
          durationMinutes
        );

      const dayHours =
        getHoursForDate(
          date,
          bookingType
        );

      if (!dayHours) {
        return res
          .status(400)
          .json({
            error:
              "Store is closed on this date.",
          });
      }

      let {
        open,
        close,
      } = dayHours;

      let rules = [];

      if (
        useDb() &&
        SpecialRuleModelReady
      ) {
        rules =
          await SpecialRule.find({
            date,
          }).lean();
      } else {
        rules =
          DEV_RULES.filter(
            (r) =>
              r.date === date
          );
      }

      if (
        rules.some(
          (r) =>
            r.kind === "closed"
        )
      ) {
        return res
          .status(400)
          .json({
            error:
              "Store is closed on this date.",
          });
      }

      const hoursRule =
        rules.find(
          (r) =>
            r.kind === "hours"
        );

      if (
        hoursRule?.open &&
        hoursRule?.close
      ) {
        open =
          hoursRule.open;

        close =
          hoursRule.close;
      }

      if (
        toMin(time) <
          toMin(open) ||
        toMin(endTime) >
          toMin(close)
      ) {
        return res
          .status(400)
          .json({
            error:
              "Selected time is outside store hours.",
          });
      }

      const blockRule =
        rules.find(
          (r) =>
            r.kind === "blocks"
        );

      if (
        blockRule?.blocks
          ?.some(
            (block) =>
              overlap(
                time,
                endTime,
                block.start,
                block.end
              )
          )
      ) {
        return res
          .status(400)
          .json({
            error:
              "Selected time is blocked.",
          });
      }

      const sameDay =
        await getBookingsForDate(
          date,
          bookingType
        );

      const conflict =
        sameDay.some(
          (booking) => {
            const existingEnd =
              getBookingEndTime(
                booking
              );

            return overlap(
              time,
              endTime,
              booking.time,
              existingEnd
            );
          }
        );

      if (conflict) {
        return res
          .status(409)
          .json({
            error:
              "Time slot no longer available.",
          });
      }

      const doc = {
        name,
        phone,
        email,
        serviceId,
        serviceName,
        serviceCategory,
        bookingType,
        date,
        time,
        endTime,
        durationMinutes,
        status:
          "confirmed",
      };

      let booking;

      if (useDb()) {
        booking =
          await Booking.create(
            doc
          );
      } else {
        booking = {
          _id:
            randomUUID(),

          ...doc,
        };

        DEV_BOOKINGS.push(
          booking
        );
      }

      sendBookingConfirmation(
        booking
      ).catch((error) => {
        console.error(
          "Email failed:",
          error
        );
      });

      return res
        .status(201)
        .json({
          success: true,
          booking,
        });
    } catch (error) {
      console.error(
        "Booking error:",
        error
      );

      return res
        .status(500)
        .json({
          error:
            "Booking failed.",
        });
    }
  }
);

/* =========================
   ADMIN CREATE BOOKING
========================= */

app.post(
  "/api/admin/bookings",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        name,
        phone,
        email = "",
        serviceId,
        serviceName,
        serviceCategory,
        date,
        time,
        bookingType = "regular",
      } = req.body || {};

      const durationMinutes =
        DURATION_BY_ID[
          serviceId
        ];

      if (
        !durationMinutes
      ) {
        return res
          .status(400)
          .json({
            error:
              "Invalid serviceId",
          });
      }

      const endTime =
        addMinutes(
          time,
          durationMinutes
        );

      const sameDay =
        await getBookingsForDate(
          date,
          bookingType
        );

      const conflict =
        sameDay.some(
          (booking) => {
            const existingEnd =
              getBookingEndTime(
                booking
              );

            return overlap(
              time,
              endTime,
              booking.time,
              existingEnd
            );
          }
        );

      if (conflict) {
        return res
          .status(409)
          .json({
            error:
              "Time slot no longer available.",
          });
      }

      const doc = {
        name,
        phone,
        serviceId,
        serviceName,
        serviceCategory,
        bookingType,
        date,
        time,
        endTime,
        durationMinutes,
        status:
          "confirmed",
      };

      if (email) {
        doc.email =
          email;
      }

      let booking;

      if (useDb()) {
        booking =
          await Booking.create(
            doc
          );
      } else {
        booking = {
          _id:
            randomUUID(),

          ...doc,
        };

        DEV_BOOKINGS.push(
          booking
        );
      }

      if (email) {
        sendBookingConfirmation(
          booking
        ).catch((error) => {
          console.error(
            "Email failed:",
            error
          );
        });
      }

      return res
        .status(201)
        .json({
          success: true,
          booking,
        });
    } catch (error) {
      console.error(
        "Admin booking error:",
        error
      );

      return res
        .status(500)
        .json({
          error:
            "Booking failed.",
        });
    }
  }
);

/* =========================
   ADMIN LIST BOOKINGS
========================= */

app.get(
  "/api/admin/bookings",
  requireAdmin,
  async (req, res) => {
    try {
      const { from } =
        req.query;

      let rows = [];

      if (useDb()) {
        const query =
          from
            ? {
                date: {
                  $gte: from,
                },
              }
            : {};

        rows =
          await Booking.find(
            query
          )
            .sort({
              date: 1,
              time: 1,
            })
            .lean();
      } else {
        rows =
          DEV_BOOKINGS
            .filter(
              (b) =>
                !from ||
                b.date >= from
            )
            .sort(
              (a, b) =>
                (
                  a.date +
                  a.time
                ).localeCompare(
                  b.date +
                    b.time
                )
            );
      }

      return res.json(
        rows
      );
    } catch (error) {
      console.error(
        "Admin bookings error:",
        error
      );

      return res
        .status(500)
        .json({
          error:
            "Failed to load bookings",
        });
    }
  }
);

/* =========================
   ADMIN HOURS
========================= */

app.get(
  "/api/admin/hours",
  requireAdmin,
  (_req, res) => {
    res.json(HOURS);
  }
);

app.put(
  "/api/admin/hours",
  requireAdmin,
  (req, res) => {
    const {
      regular,
      nails,
    } = req.body || {};

    if (
      !regular ||
      !nails
    ) {
      return res
        .status(400)
        .json({
          error:
            "Missing regular or nails hours",
        });
    }

    HOURS = {
      regular,
      nails,
    };

    res.json({
      ok: true,
      HOURS,
    });
  }
);

/* =========================
   ADMIN SPECIAL RULES
========================= */

app.get(
  "/api/admin/rules",
  requireAdmin,
  async (req, res) => {
    try {
      const from =
        req.query.from;

      if (
        useDb() &&
        SpecialRuleModelReady
      ) {
        const query =
          from
            ? {
                date: {
                  $gte: from,
                },
              }
            : {};

        const rules =
          await SpecialRule.find(
            query
          )
            .sort({
              date: 1,
            })
            .lean();

        return res.json(
          rules
        );
      }

      const rules =
        DEV_RULES.filter(
          (r) =>
            !from ||
            r.date >= from
        );

      return res.json(
        rules
      );
    } catch (error) {
      return res
        .status(500)
        .json({
          error:
            "Failed to load rules",
        });
    }
  }
);

app.post(
  "/api/admin/rules",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        date,
        kind,
        open,
        close,
        blocks = [],
        note = "",
      } = req.body || {};

      if (
        !date ||
        !kind
      ) {
        return res
          .status(400)
          .json({
            error:
              "date and kind are required",
          });
      }

      if (
        ![
          "closed",
          "hours",
          "blocks",
        ].includes(kind)
      ) {
        return res
          .status(400)
          .json({
            error:
              "Invalid rule type",
          });
      }

      if (
        useDb() &&
        SpecialRuleModelReady
      ) {
        const rule =
          await SpecialRule.create({
            date,
            kind,
            open,
            close,
            blocks,
            note,
          });

        return res.json(
          rule
        );
      }

      const rule = {
        _id:
          randomUUID(),

        date,
        kind,
        open,
        close,
        blocks,
        note,
      };

      DEV_RULES.push(
        rule
      );

      return res.json(
        rule
      );
    } catch (error) {
      return res
        .status(500)
        .json({
          error:
            "Failed to save rule",
        });
    }
  }
);

app.delete(
  "/api/admin/rules/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        useDb() &&
        SpecialRuleModelReady
      ) {
        await SpecialRule.findByIdAndDelete(
          id
        );

        return res.json({
          ok: true,
        });
      }

      const index =
        DEV_RULES.findIndex(
          (r) =>
            r._id === id
        );

      if (index >= 0) {
        DEV_RULES.splice(
          index,
          1
        );
      }

      return res.json({
        ok: true,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          error:
            "Failed to delete rule",
        });
    }
  }
);

app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
  });
});

async function start() {
  try {
    if (
      process.env.MONGO_URI
    ) {
      await mongoose.connect(
        process.env.MONGO_URI,
        {
          serverSelectionTimeoutMS:
            10000,
        }
      );

      console.log(
        "MongoDB connected"
      );

      const blockSchema =
        new mongoose.Schema(
          {
            start: String,
            end: String,
          },
          {
            _id: false,
          }
        );

      const specialRuleSchema =
        new mongoose.Schema(
          {
            date: {
              type: String,
              required: true,
            },

            kind: {
              type: String,
              enum: [
                "closed",
                "hours",
                "blocks",
              ],
              required: true,
            },

            open: String,

            close: String,

            blocks: {
              type: [
                blockSchema,
              ],
              default: [],
            },

            note: {
              type: String,
              default: "",
            },
          },

          {
            timestamps: true,
          }
        );

      SpecialRule =
        mongoose.models
          .SpecialRule ||
        mongoose.model(
          "SpecialRule",
          specialRuleSchema
        );

      SpecialRuleModelReady =
        true;
    } else {
      console.log(
        "No MONGO_URI set — using in-memory storage"
      );
    }
  } catch (error) {
    console.error(
      "Mongo connection error:",
      error.message
    );
  }

  await verifyEmailTransport().catch(
    () => {}
  );

  app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        `Server running on port ${PORT}`
      );
    }
  );
}

start();
