import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// POST /api/admin/login  {email, password}
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await user.verifyPassword(password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  if (user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

// GET /api/admin/me  (protected check)
router.get("/me", requireAdmin, (req, res) => {
  res.json({
    ok: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

export default router;
