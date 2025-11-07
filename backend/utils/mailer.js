// utils/mailer.js
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  SITE_NAME = "H&L Hair Studio",
  SITE_URL = "",
  STUDIO_PHONE = "",
  STUDIO_ADDRESS = "",
} = process.env;

// Gmail works with STARTTLS on 587 (secure:false)
export const transporter = nodemailer.createTransport({
  host: SMTP_HOST || "smtp.gmail.com",
  port: Number(SMTP_PORT || 587),
  secure: false, // STARTTLS
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

export async function verifyEmailTransport() {
  try {
    await transporter.verify();
    console.log("✅ Mail transport verified");
  } catch (e) {
    console.error("❌ Mail transport verify failed:", e);
  }
}

export async function sendBookingConfirmation(b) {
  const subject = `${SITE_NAME} — Booking confirmed for ${b.date} at ${b.time}`;
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
      <h2>${SITE_NAME} — Booking Confirmed</h2>
      <p>Hi ${b.name}, thanks for booking with us!</p>
      <p><b>Service:</b> ${b.serviceCategory} — ${b.serviceName}<br/>
         <b>Date:</b> ${b.date}<br/>
         <b>Time:</b> ${b.time}${b.endTime ? "–" + b.endTime : ""}</p>
      <p>Need changes? Reply to this email or call <b>${STUDIO_PHONE}</b>.</p>
      <p style="color:#555;font-size:12px">${STUDIO_ADDRESS} • <a href="${SITE_URL}">${SITE_URL}</a></p>
    </div>
  `;
  const text = `${SITE_NAME} — Booking Confirmed
Hi ${b.name},
Service: ${b.serviceCategory} — ${b.serviceName}
Date: ${b.date}
Time: ${b.time}${b.endTime ? "–" + b.endTime : ""}
Need changes? Reply to this email or call ${STUDIO_PHONE}.
${STUDIO_ADDRESS} • ${SITE_URL}`;

  // Important: Gmail wants FROM to match the authenticated user or the same mailbox
  const mail = {
    from: EMAIL_FROM || SMTP_USER,
    to: b.email,
    replyTo: SMTP_USER,
    subject,
    html,
    text,
  };

  return transporter.sendMail(mail);
}
