// Booking.js
import mongoose from "mongoose";
const BookingSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: false, trim: true, lowercase: true,
           match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"], },
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  serviceCategory: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  endTime: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  status: { type: String, default: "confirmed" },
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
