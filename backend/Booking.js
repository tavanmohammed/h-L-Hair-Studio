import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },

  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  serviceCategory: { type: String, required: true },

  date: { type: String, required: true },     // YYYY-MM-DD
  time: { type: String, required: true },     // HH:mm
  endTime: { type: String, required: true },  // HH:mm
  durationMinutes: { type: Number, required: true },

  status: { type: String, default: "confirmed" }
}, { timestamps: true });

export default mongoose.model("Booking", BookingSchema);
