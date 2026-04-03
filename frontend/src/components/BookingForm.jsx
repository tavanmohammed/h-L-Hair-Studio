import { useEffect, useMemo, useState } from "react";

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

function prettyLocalDate(ymd, locale = undefined) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function todayYMD() {
  const now = new Date();
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  return `${y}-${m}-${d}`;
}

/* ---------------------------
   API base
--------------------------- */
const API =
  (import.meta.env.VITE_API_URL &&
    import.meta.env.VITE_API_URL.replace(/\/$/, "")) ||
  "https://handlhair-studio.onrender.com";

export default function BookingForm({
  title,
  subtitle,
  categories,
  bookingType,
  hoursLabel,
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    serviceId: "",
    serviceName: "",
    serviceCategory: "",
    date: "",
    time: "",
    bookingType,
  });

  const [slots, setSlots] = useState([]);
  const [open, setOpen] = useState("");
  const [close, setClose] = useState("");
  const [duration, setDuration] = useState(0);
  const [availError, setAvailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onServiceChange = (serviceId) => {
    let selected = null;
    let selectedCategory = "";

    for (const category of categories) {
      const found = category.items.find((item) => item.id === serviceId);
      if (found) {
        selected = found;
        selectedCategory = category.key;
        break;
      }
    }

    if (!selected) {
      setForm((prev) => ({
        ...prev,
        serviceId: "",
        serviceName: "",
        serviceCategory: "",
        time: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      serviceId: selected.id,
      serviceName: selected.name,
      serviceCategory: selectedCategory,
      time: "",
    }));
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!form.date || !form.serviceId) return;

      setAvailError("");
      setSlots([]);
      setOpen("");
      setClose("");
      setDuration(0);

      try {
        setLoading(true);

        const params = new URLSearchParams({
          date: form.date,
          serviceId: form.serviceId,
          bookingType,
        });

        const res = await fetch(`${API}/api/availability?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || `HTTP ${res.status}`);
        }

        setSlots(data.slots || []);
        setOpen(data.open || "");
        setClose(data.close || "");
        setDuration(data.duration || 0);
      } catch (err) {
        setAvailError(String(err.message || err));
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [form.date, form.serviceId, bookingType]);

  const allSlots = useMemo(() => {
    if (!open || !close || !duration) return [];

    const result = [];
    for (let t = open; addMinutes(t, duration) <= close; t = addMinutes(t, 15)) {
      result.push(t);
    }
    return result;
  }, [open, close, duration]);

  const availableSet = new Set(slots);

  const selectTime = (time) => {
    setForm((prev) => ({
      ...prev,
      time,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.serviceId || !form.date || !form.time) return;

    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Booking failed");
      }

      const bookedServiceName = form.serviceName;
const bookedDate = form.date;
const bookedTime = form.time;
const prettyDate = prettyLocalDate(bookedDate);

setSuccessMsg(
  `Your appointment for ${bookedServiceName} is booked on ${prettyDate} at ${bookedTime}.`
);

      setForm({
        name: "",
        phone: "",
        email: "",
        serviceId: "",
        serviceName: "",
        serviceCategory: "",
        date: "",
        time: "",
        bookingType,
      });

      setSlots([]);
      setOpen("");
      setClose("");
      setDuration(0);

      setTimeout(() => {
        setSuccessMsg("");
      }, 7000);
    } catch (err) {
      alert("Booking failed: " + err.message);
    }
  };

  return (
    <div className="rounded-[28px] border border-gray-200 bg-white p-5 sm:p-7 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl text-gray-900 font-semibold">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm sm:text-base text-gray-600 leading-7">
            {subtitle}
          </p>
        )}
        <p className="mt-2 text-sm text-gray-500">{hoursLabel}</p>
      </div>

      {successMsg && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            className="border border-gray-300 p-3 rounded-xl outline-none focus:border-gray-900"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={onChange}
            required
          />
          <input
            className="border border-gray-300 p-3 rounded-xl outline-none focus:border-gray-900"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={onChange}
            required
          />
          <input
            className="border border-gray-300 p-3 rounded-xl outline-none focus:border-gray-900"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>

        <select
          className="border border-gray-300 p-3 w-full rounded-xl outline-none focus:border-gray-900"
          name="serviceId"
          value={form.serviceId}
          onChange={(e) => onServiceChange(e.target.value)}
          required
        >
          <option value="">Select a Service</option>

          {categories.map((group) => (
            <optgroup key={group.key} label={group.label}>
              {group.items.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} — {service.price}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <input
          className="border border-gray-300 p-3 w-full rounded-xl outline-none focus:border-gray-900"
          type="date"
          name="date"
          value={form.date}
          min={todayYMD()}
          onChange={onChange}
          required
        />

        {availError && <p className="text-sm text-red-600">{availError}</p>}
        {loading && <p className="text-sm text-gray-500">Loading times...</p>}

        {form.date && !loading && duration > 0 && allSlots.length > 0 && (
          <div>
            <div className="mb-3 text-sm text-gray-700">
              Duration: <b>{duration} min</b>
              {open && close ? ` · Open ${open}–${close}` : ""}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {allSlots.map((time) => {
                const isAvailable = availableSet.has(time);
                const isSelected = form.time === time;

                let classes =
                  "px-2 py-2 rounded-xl border text-sm text-center transition";

                if (isSelected) {
                  classes += " bg-gray-900 text-white border-gray-900";
                } else if (isAvailable) {
                  classes +=
                    " bg-green-50 hover:bg-green-100 border-green-300 cursor-pointer";
                } else {
                  classes +=
                    " bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";
                }

                return (
                  <button
                    key={time}
                    type="button"
                    className={classes}
                    onClick={() => isAvailable && selectTime(time)}
                    disabled={!isAvailable}
                  >
                    <div className="font-medium">{time}</div>
                    <div className="text-[11px] opacity-80">
                      → {addMinutes(time, duration)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!form.serviceId || !form.date || !form.time}
          className="w-full sm:w-auto rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition disabled:opacity-50"
        >
          Book Appointment
        </button>
      </form>
    </div>
  );
}