// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, trim: true },
    role: { type: String, enum: ["admin", "staff"], default: "staff" },
    passwordHash: { type: String, required: true }, // required for accounts that can log in
  },
  { timestamps: true }
);

// helpers for hashing & verify
UserSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};
UserSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

// make sure unique index is actually created in Mongo
UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("User", UserSchema);
