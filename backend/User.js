import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: String,
  role: { type: String, enum: ["admin", "staff"], default: "staff" },
  passwordHash: String, // optional if you want real users later
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
