// seedAdmin.js
import User from "./models/User.js";

export async function ensureAdmin() {
  const hasAdmin = await User.exists({ role: "admin" });
  if (hasAdmin) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASS;

  if (!email || !password) {
    console.warn("⚠ No admin exists and ADMIN_EMAIL/ADMIN_PASS not set. Skipping admin seed.");
    return;
  }

  const u = new User({ email, name: "Admin", role: "admin", passwordHash: "placeholder" });
  await u.setPassword(password);
  await u.save();
  console.log(`✅ Admin created: ${email}`);
}
