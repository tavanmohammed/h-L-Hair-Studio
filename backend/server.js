import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { randomUUID } from "node:crypto";

import Booking from "./Booking.js";

dotenv.config();

/* =====================================================
   BASIC CONFIG
===================================================== */

const app = express();

const PORT = Number(process.env.PORT) || 4000;

const JWT_SECRET =
  process.env.JWT_SECRET || "devsecret";

const ORIGINS = (
  process.env.CLIENT_ORIGIN ||
  "http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      return callback(
        null,
        ORIGINS.includes(origin)
      );
    },

    credentials: true,
  })
);

app.use(express.json());

/* =====================================================
   TIME HELPERS
===================================================== */

const pad = (n) =>
  String(n).padStart(2, "0");

const toMin = (hhmm) => {
  const [hours, minutes] = (
    hhmm || "00:00"
  )
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
};

const fromMin = (minutes) => {
  return `${pad(
    Math.floor(minutes / 60)
  )}:${pad(minutes % 60)}`;
};

const addMinutes = (
  time,
  minutes
) => {
  return fromMin(
    toMin(time) + minutes
  );
};

const overlap = (
  startA,
  endA,
  startB,
  endB
) => {
  return (
    toMin(startA) < toMin(endB) &&
    toMin(startB) < toMin(endA)
  );
};

/* =====================================================
   ADMIN AUTH
===================================================== */

function requireAdmin(
  req,
  res,
  next
) {
  const authHeader =
    req.headers.authorization || "";

  const token =
    authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

  if (!token) {
    return res.status(401).json({
      error: "Auth required",
    });
  }

  try {
    const payload = jwt.verify(
      token,
      JWT_SECRET
    );

    if (
      payload.role !== "admin"
    ) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    req.user = payload;

    next();
  } catch {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
}

/* =====================================================
   STORE HOURS
===================================================== */

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
  date,
  bookingType = "regular"
) {
  const d = new Date(
    `${date}T00:00:00`
  );

  const day = d.getDay();

  const group =
    bookingType === "nails"
      ? HOURS.nails
      : HOURS.regular;

  // Monday is normally closed.
  // Special admin hours can still open
  // a specific Monday.
  if (day === 1) {
    return {
      open: "",
      close: "",
      closedByDefault: true,
    };
  }

  if (day === 0) {
    return group.sunday;
  }

  if (day === 6) {
    return group.saturday;
  }

  return group.weekday;
}

/* =====================================================
   SERVICE DURATIONS
===================================================== */

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

/* =====================================================
   EMAIL
===================================================== */

const {
  SMTP_HOST = "smtp.gmail.com",
  SMTP_PORT = 587,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,

  SITE_NAME =
    "H&L Hair Studio",

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
          Number(SMTP_PORT) ===
          465,

        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },

        requireTLS:
          Number(SMTP_PORT) ===
          587,

        pool: true,

        connectionTimeout:
          10000,
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
  } catch (error) {
    console.warn(
      "Mail verification failed:",
      error.message
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
      skipped: true,
    });
  }

  const subject =
    `${SITE_NAME} — Booking confirmed ` +
    `for ${booking.date} at ${booking.time}`;

  const text = `
${SITE_NAME}

Hi ${booking.name},

Your appointment is confirmed.

Service:
${booking.serviceCategory} — ${booking.serviceName}

Date:
${booking.date}

Time:
${booking.time} - ${booking.endTime}

Phone:
${STUDIO_PHONE}

Address:
${STUDIO_ADDRESS}

${SITE_URL}
`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">

      <h2>
        ${SITE_NAME} — Booking Confirmed
      </h2>

      <p>
        Hi ${booking.name},
        thanks for booking with us.
      </p>

      <p>
        <strong>Service:</strong><br>
        ${booking.serviceCategory}
        —
        ${booking.serviceName}
      </p>

      <p>
        <strong>Date:</strong><br>
        ${booking.date}
      </p>

      <p>
        <strong>Time:</strong><br>
        ${booking.time}
        -
        ${booking.endTime}
      </p>

      ${
        STUDIO_PHONE
          ? `<p><strong>Phone:</strong><br>${STUDIO_PHONE}</p>`
          : ""
      }

      ${
        STUDIO_ADDRESS
          ? `<p><strong>Address:</strong><br>${STUDIO_ADDRESS}</p>`
          : ""
      }

    </div>
  `;

  return transporter.sendMail({
    from:
      EMAIL_FROM || SMTP_USER,

    to: booking.email,

    replyTo: SMTP_USER,

    subject,

    text,

    html,
  });
}

/* =====================================================
   DATABASE / FALLBACK
===================================================== */

const useDb = () =>
  mongoose.connection.readyState ===
  1;

const DEV_BOOKINGS = [];
const DEV_RULES = [];

let SpecialRule = null;

let SpecialRuleModelReady =
  false;

/* =====================================================
   BOOKING HELPERS
===================================================== */

/*
  IMPORTANT:

  Old bookings may not have
  bookingType because your old
  Booking schema did not contain it.

  Old bookings are treated as
  "regular".
*/

async function getBookingsForDate(
  date,
  bookingType = "regular"
) {
  if (!useDb()) {
    return DEV_BOOKINGS.filter(
      (booking) =>
        booking.date === date &&
        (
          booking.bookingType ||
          "regular"
        ) === bookingType &&
        booking.status !==
          "cancelled"
    );
  }

  if (
    bookingType === "regular"
  ) {
    return Booking.find({
      date,

      status: {
        $ne: "cancelled",
      },

      $or: [
        {
          bookingType:
            "regular",
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

/* =====================================================
   ROOT / HEALTH
===================================================== */

app.get(
  "/",
  (_req, res) => {
    res
      .type("text")
      .send(
        "H&L Hair Studio API is running."
      );
  }
);

app.get(
  "/health",
  (_req, res) => {
    res.json({
      ok: true,

      mongoConnected:
        useDb(),

      time:
        new Date().toISOString(),
    });
  }
);

/* =====================================================
   LOGIN
===================================================== */

app.post(
  "/api/auth/login",
  (req, res) => {
    const password = (
      req.body?.password || ""
    ).trim();

    const adminPassword = (
      process.env
        .ADMIN_PASSWORD || ""
    ).trim();

    if (!adminPassword) {
      return res.status(500).json({
        error:
          "ADMIN_PASSWORD is not configured.",
      });
    }

    if (
      password !==
      adminPassword
    ) {
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

    return res.json({
      token,
    });
  }
);

app.get(
  "/api/admin/me",
  requireAdmin,
  (req, res) => {
    return res.json({
      ok: true,

      user: {
        role: req.user.role,
      },
    });
  }
);

/* =====================================================
   PUBLIC AVAILABILITY
===================================================== */

app.get(
  "/api/availability",
  async (req, res) => {
    try {
      const {
        date,
        serviceId,
        bookingType = "regular",
      } = req.query;

      if (
        !date ||
        !serviceId
      ) {
        return res.status(400).json({
          error:
            "Missing date or serviceId",
        });
      }

      const duration =
        DURATION_BY_ID[
          serviceId
        ];

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
            (rule) =>
              rule.date === date
          );
      }

      // Entire day closed
      if (
        rules.some(
          (rule) =>
            rule.kind ===
            "closed"
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

      // Special hours
      const hoursRule =
        rules.find(
          (rule) =>
            rule.kind ===
            "hours"
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

      // Confirmed bookings only
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

      // Blocked ranges
      const blockRule =
        rules.find(
          (rule) =>
            rule.kind ===
            "blocks"
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

      return res.status(500).json({
        error:
          "Failed to load availability",
      });
    }
  }
);

/* =====================================================
   PUBLIC CREATE BOOKING
===================================================== */

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

        bookingType =
          "regular",
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
          (field) =>
            !req.body?.[
              field
            ]
        );

      if (
        missing.length
      ) {
        return res.status(400).json({
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
        ].includes(
          bookingType
        )
      ) {
        return res.status(400).json({
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
        return res.status(400).json({
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
        return res.status(400).json({
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
            (rule) =>
              rule.date === date
          );
      }

      if (
        rules.some(
          (rule) =>
            rule.kind ===
            "closed"
        )
      ) {
        return res.status(400).json({
          error:
            "Store is closed on this date.",
        });
      }

      const hoursRule =
        rules.find(
          (rule) =>
            rule.kind ===
            "hours"
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
        return res.status(400).json({
          error:
            "Selected time is outside store hours.",
        });
      }

      const blockRule =
        rules.find(
          (rule) =>
            rule.kind ===
            "blocks"
        );

      const blocked =
        blockRule?.blocks?.some(
          (block) =>
            overlap(
              time,
              endTime,
              block.start,
              block.end
            )
        );

      if (blocked) {
        return res.status(400).json({
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
            return overlap(
              time,
              endTime,
              booking.time,
              getBookingEndTime(
                booking
              )
            );
          }
        );

      if (conflict) {
        return res.status(409).json({
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
          error.message
        );
      });

      return res.status(201).json({
        success: true,
        booking,
      });
    } catch (error) {
      console.error(
        "Booking error:",
        error
      );

      return res.status(500).json({
        error:
          "Booking failed.",
      });
    }
  }
);

/* =====================================================
   ADMIN CREATE BOOKING
===================================================== */

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

        bookingType =
          "regular",
      } = req.body || {};

      const required = [
        "name",
        "phone",
        "serviceId",
        "serviceName",
        "serviceCategory",
        "date",
        "time",
      ];

      const missing =
        required.filter(
          (field) =>
            !req.body?.[
              field
            ]
        );

      if (
        missing.length
      ) {
        return res.status(400).json({
          error:
            `Missing: ${missing.join(
              ", "
            )}`,
        });
      }

      const durationMinutes =
        DURATION_BY_ID[
          serviceId
        ];

      if (
        !durationMinutes
      ) {
        return res.status(400).json({
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
          (booking) =>
            overlap(
              time,
              endTime,
              booking.time,
              getBookingEndTime(
                booking
              )
            )
        );

      if (conflict) {
        return res.status(409).json({
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
        doc.email = email;
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
            error.message
          );
        });
      }

      return res.status(201).json({
        success: true,
        booking,
      });
    } catch (error) {
      console.error(
        "Admin booking error:",
        error
      );

      return res.status(500).json({
        error:
          "Booking failed.",
      });
    }
  }
);

/* =====================================================
   ADMIN CANCEL BOOKING
===================================================== */

app.patch(
  "/api/admin/bookings/:id/cancel",
  requireAdmin,
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (useDb()) {
        const booking =
          await Booking.findById(
            id
          );

        if (!booking) {
          return res.status(404).json({
            error:
              "Booking not found",
          });
        }

        if (
          booking.status ===
          "cancelled"
        ) {
          return res.json({
            success: true,

            message:
              "Appointment is already cancelled.",

            booking,
          });
        }

        booking.status =
          "cancelled";

        booking.cancelledAt =
          new Date();

        await booking.save();

        return res.json({
          success: true,

          message:
            "Appointment cancelled successfully.",

          booking,
        });
      }

      const booking =
        DEV_BOOKINGS.find(
          (item) =>
            item._id === id
        );

      if (!booking) {
        return res.status(404).json({
          error:
            "Booking not found",
        });
      }

      booking.status =
        "cancelled";

      booking.cancelledAt =
        new Date();

      return res.json({
        success: true,

        message:
          "Appointment cancelled successfully.",

        booking,
      });
    } catch (error) {
      console.error(
        "Cancel booking error:",
        error
      );

      return res.status(500).json({
        error:
          "Failed to cancel appointment.",
      });
    }
  }
);

/* =====================================================
   ADMIN LIST BOOKINGS
===================================================== */

app.get(
  "/api/admin/bookings",
  requireAdmin,
  async (req, res) => {
    try {
      const { from } =
        req.query;

      let rows = [];

      if (useDb()) {
        const query = from
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
              (booking) =>
                !from ||
                booking.date >=
                  from
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

      return res.status(500).json({
        error:
          "Failed to load bookings",
      });
    }
  }
);

/* =====================================================
   ADMIN HOURS
===================================================== */

app.get(
  "/api/admin/hours",
  requireAdmin,
  (_req, res) => {
    return res.json(
      HOURS
    );
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
      return res.status(400).json({
        error:
          "Missing regular or nails hours",
      });
    }

    HOURS = {
      regular,
      nails,
    };

    return res.json({
      ok: true,
      HOURS,
    });
  }
);

/* =====================================================
   ADMIN SPECIAL RULES
===================================================== */

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
        const query = from
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
        DEV_RULES
          .filter(
            (rule) =>
              !from ||
              rule.date >= from
          )
          .sort(
            (a, b) =>
              a.date.localeCompare(
                b.date
              )
          );

      return res.json(
        rules
      );
    } catch (error) {
      console.error(
        "Rules load error:",
        error
      );

      return res.status(500).json({
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
        return res.status(400).json({
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
        return res.status(400).json({
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
      console.error(
        "Rule create error:",
        error
      );

      return res.status(500).json({
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
      const { id } =
        req.params;

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
          (rule) =>
            rule._id === id
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
      console.error(
        "Delete rule error:",
        error
      );

      return res.status(500).json({
        error:
          "Failed to delete rule",
      });
    }
  }
);

/* =====================================================
   404
===================================================== */

app.use(
  (req, res) => {
    return res.status(404).json({
      error: "Not found",
    });
  }
);

/* =====================================================
   START SERVER
===================================================== */

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
        "No MONGO_URI — using memory storage"
      );
    }
  } catch (error) {
    console.error(
      "MongoDB connection error:",
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
