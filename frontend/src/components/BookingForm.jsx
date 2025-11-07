import { useEffect, useMemo, useState } from "react";
import { servicesData } from "../data/servicesData.js"; // adjust the path if needed

/* ---------------------------
   Time + Date helpers
--------------------------- */
function pad(n) {
  return n.toString().padStart(2, "0");
}
function addMinutes(hhmm, mins) {
  const [h, m] = hhmm.split(":").map(Number);
  const t = h * 60 + m + mins;
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
}
// ✅ Local-date pretty printer to avoid the “one day ago” bug
function prettyLocalDate(ymd, locale = undefined) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d); // local date (no UTC shift)
  return dt.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
// today as YYYY-MM-DD (local)
function todayYMD() {
  const now = new Date();
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  return `${y}-${m}-${d}`;
}

export default function BookingForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    serviceId: "",
    serviceName: "",
    serviceCategory: "",
    date: "",
    time: "",
  });

  const [slots, setSlots] = useState([]);   // available slots from server
  const [open, setOpen] = useState("");     // day open time
  const [close, setClose] = useState("");   // day close time
  const [duration, setDuration] = useState(0);
  const [availError, setAvailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  /* ---------------------------
     Service change handler
  --------------------------- */
  const onServiceChange = (serviceId) => {
    let selected = null;
    let category = "";
    for (const group of Object.keys(servicesData)) {
      const found = servicesData[group].find((s) => s.id === serviceId);
      if (found) {
        selected = found;
        category = group;
        break;
      }
    }
    if (!selected) {
      // reset if empty selection
      setForm((f) => ({
        ...f,
        serviceId: "",
        serviceName: "",
        serviceCategory: "",
        time: "",
      }));
      return;
    }
    setForm((f) => ({
      ...f,
      serviceId: selected.id,
      serviceName: selected.name,
      serviceCategory: category,
      time: "", // clear previously selected time
    }));
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  /* ---------------------------
     Fetch availability slots
  --------------------------- */
  useEffect(() => {
    (async () => {
      if (!form.date || !form.serviceId) return;
      setAvailError("");
      setSlots([]);
      setOpen("");
      setClose("");
      setDuration(0);
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:4000/api/availability?date=${form.date}&serviceId=${form.serviceId}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        setSlots(data.slots || []);
        setOpen(data.open || "");
        setClose(data.close || "");
        setDuration(data.duration || 0);
      } catch (err) {
        setAvailError(String(err.message || err));
      } finally {
        setLoading(false);
      }
    })();
  }, [form.date, form.serviceId]);

  /* ---------------------------
     Build full timetable grid
  --------------------------- */
  const allSlots = useMemo(() => {
    if (!open || !close || !duration) return [];
    const arr = [];
    for (let t = open; addMinutes(t, duration) <= close; t = addMinutes(t, 15)) {
      arr.push(t);
    }
    return arr;
  }, [open, close, duration]);

  const availableSet = new Set(slots);
  const selectTime = (t) => setForm((f) => ({ ...f, time: t }));

  /* ---------------------------
     Submit booking
  --------------------------- */
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.time || !form.date || !form.serviceId) return;
    try {
      const res = await fetch("http://localhost:4000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Booking failed");

      // ✅ Use local-date pretty printer
      const prettyDate = prettyLocalDate(form.date);

      setSuccessMsg(
        `✅ Your appointment for ${form.serviceName} is booked successfully on ${prettyDate} at ${form.time}.`
      );
      setTimeout(() => setSuccessMsg(""), 120000);

      setForm({
        name: "",
        phone: "",
        email: "",
        serviceId: "",
        serviceName: "",
        serviceCategory: "",
        date: "",
        time: "",
      });
      setSlots([]);
    } catch (err) {
      alert("Booking failed: " + err.message);
    }
  };

  return (
    <div className="relative">
      {/* Success overlay */}
      {successMsg && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-white text-center p-8 rounded-2xl shadow-2xl max-w-lg">
            <p className="text-2xl font-bold text-green-700">{successMsg}</p>
          </div>
        </div>
      )}

      <form className="space-y-5" onSubmit={onSubmit}>
        <p className="text-sm text-gray-600">
          Hours: Mon–Fri <b>09:00–19:00</b> · Sat–Sun <b>10:00–18:00</b>
        </p>

        {/* Personal Info */}
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            className="border p-2 rounded"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={onChange}
            required
          />
          <input
            className="border p-2 rounded"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={onChange}
            required
          />
          <input
            className="border p-2 rounded"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>

        {/* Service dropdown */}
        <select
          className="border p-2 w-full rounded"
          name="serviceId"
          value={form.serviceId}
          onChange={(e) => onServiceChange(e.target.value)}
          required
        >
          <option value="">Select a Service</option>
          <optgroup label="Women">
            {servicesData.women.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} – {s.price}
              </option>
            ))}
          </optgroup>
          <optgroup label="Men">
            {servicesData.men.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} – {s.price}
              </option>
            ))}
          </optgroup>
          <optgroup label="Aesthetic">
            {servicesData.aesthetic.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} – {s.price}
              </option>
            ))}
          </optgroup>
        </select>

        {/* Date picker */}
        <input
          className="border p-2 w-full rounded"
          type="date"
          name="date"
          value={form.date}
          min={todayYMD()}            // prevent picking past days
          onChange={onChange}
          required
        />

        {availError && <p className="text-red-600 text-sm">{availError}</p>}
        {loading && <p className="text-gray-500 text-sm">Loading times...</p>}

        {/* Time grid */}
        {form.date && !loading && duration > 0 && allSlots.length > 0 && (
          <>
            <div className="text-sm text-gray-700 mb-2">
              Duration: <b>{duration} min</b>
              {open && close ? ` · Open ${open}–${close}` : ""}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {allSlots.map((t) => {
                const isAvailable = availableSet.has(t);
                const isSelected = form.time === t;
                const base =
                  "px-2 py-2 rounded border text-sm text-center transition";
                const cls = isSelected
                  ? `${base} bg-blue-500 text-white border-blue-700`
                  : isAvailable
                  ? `${base} bg-green-100 hover:bg-green-200 border-green-400 cursor-pointer`
                  : `${base} bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed`;
                return (
                  <button
                    key={t}
                    type="button"
                    className={cls}
                    onClick={() => isAvailable && selectTime(t)}
                    disabled={!isAvailable}
                  >
                    <div className="font-medium">{t}</div>
                    <div className="text-[11px] opacity-80">
                      → {addMinutes(t, duration)}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <button
          type="submit"
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          disabled={!form.date || !form.time || !form.serviceId}
        >
          Book Appointment
        </button>
      </form>
    </div>
  );
}
