// src/pages/Admin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

/* ------------ Services ------------ */
const SERVICES = [
  // MEN
  { id: "m1", name: "Men Haircut", category: "men", minutes: 30 },
  { id: "m2", name: "Hair & Fade", category: "men", minutes: 30 },
  { id: "m3", name: "Beard Trim", category: "men", minutes: 30 },
  { id: "m4", name: "Kids Cut", category: "men", minutes: 30 },
  { id: "m5", name: "Wash & Haircut", category: "men", minutes: 30 },
  // WOMEN
  { id: "w1", name: "Women Haircut (Short)", category: "women", minutes: 30 },
  { id: "w2", name: "Women Haircut (Long)", category: "women", minutes: 30 },
  { id: "w3", name: "Women Color", category: "women", minutes: 60 },
  { id: "w4", name: "Highlights", category: "women", minutes: 60 },
  { id: "w5", name: "Bang/Fringe Trim", category: "women", minutes: 15 },
  { id: "w6", name: "Blowout / Styling", category: "women", minutes: 30 },
  // AESTHETIC
  { id: "a1", name: "Eyebrow Wax", category: "aesthetic", minutes: 15 },
  { id: "a2", name: "Upper Lip Wax", category: "aesthetic", minutes: 15 },
  { id: "a3", name: "Chin Wax", category: "aesthetic", minutes: 15 },
  { id: "a4", name: "Half Arm Wax", category: "aesthetic", minutes: 15 },
  { id: "a5", name: "Threading (Brows)", category: "aesthetic", minutes: 15 },
];
const SERVICE_BY_ID = Object.fromEntries(SERVICES.map(s => [s.id, s]));

/* ------------ Date helpers ------------ */
const pad2 = (n) => String(n).padStart(2, "0");
const fmtYMD = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
function todayYMD() { return fmtYMD(new Date()); }
function addDays(ymd, n) { const d = new Date(ymd + "T00:00:00"); d.setDate(d.getDate() + n); return fmtYMD(d); }
function startOfWeekYMD(ymd) { const d = new Date(ymd + "T00:00:00"); d.setDate(d.getDate() - d.getDay()); return fmtYMD(d); }
function weekDays(weekStartYmd) { return Array.from({ length: 7 }, (_, i) => addDays(weekStartYmd, i)); }
function compareHHMM(a = "", b = "") { return a.localeCompare(b); }
function monthStartYMD(baseYmd) { const d = new Date(baseYmd + "T00:00:00"); d.setDate(1); return fmtYMD(d); }
function endOfMonthYMD(baseYmd) { const d = new Date(baseYmd + "T00:00:00"); d.setMonth(d.getMonth() + 1, 0); return fmtYMD(d); }
function prevMonth(ymd) { const d = new Date(ymd + "T00:00:00"); d.setMonth(d.getMonth() - 1); return fmtYMD(d); }
function nextMonth(ymd) { const d = new Date(ymd + "T00:00:00"); d.setMonth(d.getMonth() + 1); return fmtYMD(d); }
function monthGrid(baseYmd) {
  const start = new Date(baseYmd + "T00:00:00");
  const month = start.getMonth();
  start.setDate(1);
  const firstDow = start.getDay();
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - firstDow);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return { ymd: fmtYMD(d), inMonth: d.getMonth() === month };
  });
}

/* ------------ Auth fetch helper ------------ */
function useAuthFetch() {
  return async (url, opts = {}) => {
    const token = localStorage.getItem("admintoken");
    const r = await fetch(API + url, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(opts.headers || {}),
        Authorization: token ? "Bearer " + token : "",
      },
    });
    let data = {};
    try { data = await r.json(); } catch {}
    if (!r.ok) {
      if (r.status === 401) {
        localStorage.removeItem("admintoken");
        window.location.href = "/admin-login";
      }
      throw new Error(data.error || `HTTP ${r.status}`);
    }
    return data;
  };
}

/* ------------ Rules summary ------------ */
function dayRuleSummary(rules, ymd) {
  const dayRules = rules.filter(r => r.date === ymd);
  return {
    isClosed: dayRules.some(r => r.kind === "closed"),
    hours: dayRules.find(r => r.kind === "hours"),
    blocks: dayRules.find(r => r.kind === "blocks"),
    dayRules,
  };
}

/* =========================================
   Admin Page (responsive/mobile-first)
========================================= */
export default function Admin() {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();

  // guard
  useEffect(() => {
    const token = localStorage.getItem("admintoken");
    if (!token) navigate("/admin-login");
  }, [navigate]);

  // anchors
  const today = useMemo(() => todayYMD(), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);
  const [selectedDay, setSelectedDay] = useState(today);
  const [weekStart, setWeekStart] = useState(startOfWeekYMD(today));
  const [monthAnchor, setMonthAnchor] = useState(monthStartYMD(today));
  const [showMonth, setShowMonth] = useState(false);

  // hours
  const [hours, setHours] = useState({
    weekday: { open: "09:00", close: "19:00" },
    weekend: { open: "10:00", close: "18:00" },
  });
  const [hoursMsg, setHoursMsg] = useState("");

  // bookings + rules
  const [bookings, setBookings] = useState([]);
  const [rules, setRules] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsErr, setBookingsErr] = useState("");
  const [rulesErr, setRulesErr] = useState("");

  // quick booking form
  const [qName, setQName] = useState("");
  const [qPhone, setQPhone] = useState("");
  const [qEmail, setQEmail] = useState(""); // optional
  const [qServiceId, setQServiceId] = useState(SERVICES[0].id);
  const [qDate, setQDate] = useState(today);
  const [qSlots, setQSlots] = useState([]);
  const [qTime, setQTime] = useState("");
  const [qMsg, setQMsg] = useState("");

  // rules form
  const [ruleDate, setRuleDate] = useState(today);
  const [ruleKind, setRuleKind] = useState("closed");
  const [ruleOpen, setRuleOpen] = useState("12:00");
  const [ruleClose, setRuleClose] = useState("16:00");
  const [ruleBlocks, setRuleBlocks] = useState([{ start: "13:00", end: "14:00" }]);
  const [ruleMsg, setRuleMsg] = useState("");

  /* derived */
  const days = weekDays(weekStart);
  const grid = useMemo(() => monthGrid(monthAnchor), [monthAnchor]);
  const thisMonthLabel = useMemo(() => {
    const d = new Date(monthAnchor + "T00:00:00");
    return d.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [monthAnchor]);

  const bookingsByDate = useMemo(() => {
    const map = {};
    for (const b of bookings) (map[b.date] ||= []).push(b);
    for (const k of Object.keys(map)) map[k].sort((a, b) => compareHHMM(a.time, b.time));
    return map;
  }, [bookings]);

  const todaysList = bookingsByDate[today] || [];
  const tomorrowsList = bookingsByDate[tomorrow] || [];
  const selectedList = bookingsByDate[selectedDay] || [];

  /* loaders */
  async function loadHours() {
    try { setHours(await authFetch("/api/admin/hours")); } catch {}
  }
  async function loadMonthBookings(anchorYmd) {
    try {
      setLoadingBookings(true); setBookingsErr("");
      const from = monthStartYMD(anchorYmd);
      const rows = await authFetch(`/api/admin/bookings?from=${from}`);
      const end = endOfMonthYMD(anchorYmd);
      setBookings(rows.filter(b => b.date >= from && b.date <= end));
    } catch (e) {
      setBookingsErr(e.message); setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }
  async function loadMonthRules(anchorYmd) {
    try {
      setRulesErr("");
      const from = monthStartYMD(anchorYmd);
      const rows = await authFetch(`/api/admin/rules?from=${from}`);
      const end = endOfMonthYMD(anchorYmd);
      setRules(rows.filter(r => r.date >= from && r.date <= end));
    } catch (e) {
      setRulesErr(e.message); setRules([]);
    }
  }

  useEffect(() => { loadHours(); }, []);
  useEffect(() => { loadMonthBookings(monthAnchor); }, [monthAnchor]);
  useEffect(() => { loadMonthRules(monthAnchor); }, [monthAnchor]);

  // availability for quick booking
  useEffect(() => {
    (async () => {
      setQSlots([]); setQTime("");
      try {
        const r = await fetch(`${API}/api/availability?date=${qDate}&serviceId=${qServiceId}`);
        const data = await r.json();
        if (r.ok) setQSlots(data.slots || []);
      } catch {}
    })();
  }, [qDate, qServiceId]);

  /* actions */
  async function saveHours() {
    try {
      setHoursMsg("");
      await authFetch("/api/admin/hours", {
        method: "PUT",
        body: JSON.stringify(hours),
      });
      setHoursMsg("Saved ✔");
      setTimeout(() => setHoursMsg(""), 1500);
    } catch (e) { setHoursMsg(e.message); }
  }

  // ADMIN booking (email optional) via protected route
  async function createBooking() {
    try {
      setQMsg("");
      if (!qName || !qPhone || !qServiceId || !qDate || !qTime) {
        setQMsg("Please fill name, phone, service, date, and time.");
        return;
      }
      const svc = SERVICE_BY_ID[qServiceId];
      const body = {
        name: qName,
        phone: qPhone,
        serviceId: qServiceId,
        serviceName: svc?.name || "",
        serviceCategory: svc?.category || "",
        date: qDate,
        time: qTime,
      };
      if (qEmail) body.email = qEmail; // optional

      await authFetch(`/api/admin/bookings`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setQMsg("Booked ✔");
      await loadMonthBookings(monthAnchor);
      setQName(""); setQPhone(""); setQEmail(""); setQTime("");
    } catch (e) {
      setQMsg(e.message);
    }
  }

  async function addRule() {
    try {
      setRuleMsg("");
      const body = { date: ruleDate, kind: ruleKind };
      if (ruleKind === "hours") { body.open = ruleOpen; body.close = ruleClose; }
      if (ruleKind === "blocks") { body.blocks = ruleBlocks; }
      const saved = await authFetch("/api/admin/rules", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setRules(r => [...r, saved].sort((a, b) => a.date.localeCompare(b.date)));
      if (qDate === ruleDate) {
        const r = await fetch(`${API}/api/availability?date=${qDate}&serviceId=${qServiceId}`);
        const data = await r.json(); if (r.ok) setQSlots(data.slots || []);
      }
      setRuleMsg("Saved ✔");
      setTimeout(() => setRuleMsg(""), 1500);
    } catch (e) { setRuleMsg(e.message); }
  }
  async function removeRule(id) {
    try {
      await authFetch(`/api/admin/rules/${id}`, { method: "DELETE" });
      setRules(r => r.filter(x => x._id !== id));
    } catch {}
  }

  /* UI bits (responsive-friendly) */
  function BookingCards({ rows }) {
    if (!rows?.length) return <div className="text-sm text-gray-500">No bookings.</div>;
    return (
      <div className="space-y-3">
        {rows.map(b => (
          <div key={b._id} className="rounded-xl border bg-white p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium text-sm sm:text-base">{b.time}–{b.endTime}</div>
              <div className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-gray-900 text-white">{b.serviceCategory}</div>
            </div>
            <div className="mt-1 text-sm">
              <div className="font-medium">{b.name}</div>
              <div className="text-gray-600">{b.serviceName}</div>
            </div>
            <div className="mt-1 text-xs text-gray-500 space-y-0.5">
              <div>{b.phone}</div>
              {b.email ? <div>{b.email}</div> : null}
            </div>
          </div>
        ))}
      </div>
    );
  }
  function BookingTable({ rows }) {
    if (!rows?.length) return <div className="text-sm text-gray-500">No bookings.</div>;
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Time</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Service</th>
              <th className="py-2 pr-4">Contact</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(b => (
              <tr key={b._id} className="border-b last:border-0">
                <td className="py-2 pr-4">{b.time}–{b.endTime}</td>
                <td className="py-2 pr-4">{b.name}</td>
                <td className="py-2 pr-4">{b.serviceCategory} / {b.serviceName}</td>
                <td className="py-2 pr-4">
                  <div>{b.phone}</div>
                  {b.email ? <div className="text-gray-500">{b.email}</div> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  function DayChip({ ymd }) {
    const isSel = ymd === selectedDay;
    const count = (bookingsByDate[ymd] || []).length;
    const info = dayRuleSummary(rules, ymd);
    return (
      <button
        onClick={() => { setSelectedDay(ymd); setRuleDate(ymd); }}
        className={`shrink-0 px-3 py-2 rounded-lg border text-[12px] sm:text-sm mr-2 min-w-[64px] active:scale-[.98] ${
          isSel ? "bg-black text-white border-black" : "bg-white"
        }`}
      >
        <div className="font-medium">
          {new Date(ymd + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" })} {ymd.slice(8,10)}
        </div>
        <div className="text-[11px]">
          {info.isClosed ? "Closed" : count ? `${count} bookings` : "—"}
        </div>
      </button>
    );
  }
  function DayCell({ cell }) {
    const count = (bookingsByDate[cell.ymd] || []).length;
    const info = dayRuleSummary(rules, cell.ymd);
    const isSel = cell.ymd === selectedDay;
    const isToday = cell.ymd === today;

    return (
      <button
        onClick={() => { setSelectedDay(cell.ymd); setRuleDate(cell.ymd); }}
        className={[
          "h-14 xs:h-16 sm:h-20 border p-1.5 sm:p-2 text-left relative transition touch-manipulation",
          cell.inMonth ? "bg-white" : "bg-gray-50 text-gray-400",
          isSel ? "ring-2 ring-black" : "",
          info.isClosed ? "opacity-60" : "",
        ].join(" ")}
        title={
          info.isClosed ? "Closed"
          : info.hours ? `Hours ${info.hours.open}–${info.hours.close}`
          : count ? `${count} bookings` : ""
        }
      >
        <div className="text-[11px] sm:text-xs">{cell.ymd.slice(8,10)}</div>
        {isToday && <span className="absolute top-1 right-1 text-[10px] px-1 rounded bg-black text-white">today</span>}
        {info.isClosed && <span className="absolute bottom-1 left-1 text-[10px] px-1 rounded bg-red-600 text-white">closed</span>}
        {info.hours && !info.isClosed && (
          <span className="absolute bottom-1 left-1 text-[10px] px-1 rounded bg-amber-600 text-white">
            {info.hours.open}-{info.hours.close}
          </span>
        )}
        {count > 0 && (
          <span className="absolute bottom-1 right-1 text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full bg-gray-900 text-white">
            {count}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Header (safe area for iPhone notch) */}
      <div
        className="sticky top-0 z-40 bg-gray-50/90 backdrop-blur border-b"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-screen-xl mx-auto px-3 sm:px-6 md:px-8">
          <div className="py-3 sm:py-4 flex items-center gap-2">
            <h1 className="text-base sm:text-lg md:text-xl font-bold">Admin</h1>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => { setSelectedDay(today); setWeekStart(startOfWeekYMD(today)); setMonthAnchor(monthStartYMD(today)); }}
                className="border px-3 py-2 rounded-lg text-sm active:scale-[.98]"
              >Today</button>
              <button
                onClick={() => { loadMonthBookings(monthAnchor); loadMonthRules(monthAnchor); }}
                className="border px-3 py-2 rounded-lg text-sm active:scale-[.98]"
              >Refresh</button>
            </div>
          </div>
        </div>
      </div>

      {/* Content container */}
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-6 sm:space-y-7">
        {/* Today & Tomorrow */}
        <section className="bg-white rounded-xl shadow">
          <div className="p-4 sm:p-5 text-base sm:text-lg font-semibold">Today & Tomorrow</div>
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4">
            <div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Today ({today})</div>
              <div className="md:hidden"><BookingCards rows={todaysList} /></div>
              <div className="hidden md:block"><BookingTable rows={todaysList} /></div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Tomorrow ({tomorrow})</div>
              <div className="md:hidden"><BookingCards rows={tomorrowsList} /></div>
              <div className="hidden md:block"><BookingTable rows={tomorrowsList} /></div>
            </div>
          </div>
        </section>

        {/* Calendar */}
        <section className="bg-white rounded-xl shadow">
          <div className="p-4 sm:p-5 text-base sm:text-lg font-semibold">Calendar & Day Details</div>
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4">
            {/* Week scroller */}
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="border px-3 py-2 rounded-lg active:scale-[.98]">‹ Prev</button>
              <div className="text-sm text-gray-600">
                {new Date(weekStart + "T00:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric" })} –{" "}
                {new Date(addDays(weekStart, 6) + "T00:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric" })}
              </div>
              <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="border px-3 py-2 rounded-lg active:scale-[.98] ml-auto">Next ›</button>
            </div>

            <div className="overflow-x-auto -mx-1 px-1">
              <div className="flex pb-1">{days.map(d => <DayChip key={d} ymd={d} />)}</div>
            </div>

            <button onClick={() => setShowMonth(v => !v)} className="w-full border px-3 py-2 rounded-lg active:scale-[.98]">
              {showMonth ? "Hide Full Month" : "Show Full Month"}
            </button>

            {showMonth && (
              <div className="border rounded-lg p-2 sm:p-3">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setMonthAnchor(prevMonth(monthAnchor))} className="border px-3 py-2 rounded-lg">‹</button>
                  <div className="font-medium text-sm sm:text-base">{thisMonthLabel}</div>
                  <button onClick={() => setMonthAnchor(nextMonth(monthAnchor))} className="border px-3 py-2 rounded-lg">›</button>
                  <div className="ml-auto text-xs sm:text-sm text-gray-500">
                    {loadingBookings ? "Loading…" : bookingsErr ? <span className="text-red-600">{bookingsErr}</span> : rulesErr ? <span className="text-red-600">{rulesErr}</span> : null}
                  </div>
                </div>
                <div className="grid grid-cols-7 text-[10px] sm:text-xs text-gray-600 mb-1 px-1">
                  <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded overflow-hidden">
                  {grid.map(cell => <DayCell key={cell.ymd} cell={cell} />)}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium mb-2">Bookings on {selectedDay}</h3>
              <div className="md:hidden"><BookingCards rows={selectedList} /></div>
              <div className="hidden md:block"><BookingTable rows={selectedList} /></div>
            </div>

            <div className="grid sm:grid-cols-3 gap-2">
              <button onClick={async()=>{ setRuleDate(selectedDay); setRuleKind("closed"); await addRule(); await loadMonthRules(monthAnchor); }} className="border px-3 py-2 rounded-lg hover:bg-gray-50 active:scale-[.98]">Close day</button>
              <button onClick={async()=>{ setRuleDate(selectedDay); setRuleKind("hours"); setRuleOpen("12:00"); setRuleClose("16:00"); await addRule(); await loadMonthRules(monthAnchor); }} className="border px-3 py-2 rounded-lg hover:bg-gray-50 active:scale-[.98]">12:00–16:00 hours</button>
              <button onClick={async()=>{ setRuleDate(selectedDay); setRuleKind("blocks"); setRuleBlocks([{start:"13:00", end:"14:00"}]); await addRule(); await loadMonthRules(monthAnchor); }} className="border px-3 py-2 rounded-lg hover:bg-gray-50 active:scale-[.98]">Lunch 13:00–14:00</button>
            </div>
          </div>
        </section>

        {/* Special rules */}
        <section className="bg-white rounded-xl shadow">
          <div className="p-4 sm:p-5 text-base sm:text-lg font-semibold">Special Hours & Closures</div>
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <input type="date" className="border rounded-lg p-3 min-h-11" value={ruleDate} onChange={e=>setRuleDate(e.target.value)} />
              <select className="border rounded-lg p-3 min-h-11" value={ruleKind} onChange={e=>setRuleKind(e.target.value)}>
                <option value="closed">Closed (all day)</option>
                <option value="hours">Override open/close</option>
                <option value="blocks">Block time ranges</option>
              </select>

              {ruleKind === "hours" && (
                <div className="flex gap-2">
                  <input type="time" className="border rounded-lg p-3 w-32 min-h-11" value={ruleOpen} onChange={e=>setRuleOpen(e.target.value)} />
                  <span className="self-center">to</span>
                  <input type="time" className="border rounded-lg p-3 w-32 min-h-11" value={ruleClose} onChange={e=>setRuleClose(e.target.value)} />
                </div>
              )}

              {ruleKind === "blocks" && (
                <div className="md:col-span-2">
                  <div className="space-y-2">
                    {ruleBlocks.map((b,i)=>(
                      <div key={i} className="flex gap-2">
                        <input type="time" className="border rounded-lg p-3 w-32 min-h-11" value={b.start} onChange={e=>{ const v=[...ruleBlocks]; v[i]={...v[i], start:e.target.value}; setRuleBlocks(v); }} />
                        <span className="self-center">to</span>
                        <input type="time" className="border rounded-lg p-3 w-32 min-h-11" value={b.end} onChange={e=>{ const v=[...ruleBlocks]; v[i]={...v[i], end:e.target.value}; setRuleBlocks(v); }} />
                        <button className="border px-3 py-2 rounded-lg active:scale-[.98]" onClick={()=>{ const v=[...ruleBlocks]; v.splice(i,1); setRuleBlocks(v.length? v : [{start:"13:00", end:"14:00"}]); }}>Remove</button>
                      </div>
                    ))}
                    <button className="border px-3 py-2 rounded-lg active:scale-[.98]" onClick={()=>setRuleBlocks([...ruleBlocks, {start:"13:00", end:"14:00"}])}>+ Add block</button>
                  </div>
                </div>
              )}

              <div className="md:col-span-3 flex gap-2 items-center">
                <button onClick={async()=>{ await addRule(); await loadMonthRules(monthAnchor); }} className="bg-black text-white px-4 py-2 rounded-lg active:scale-[.98] min-h-11">Save rule</button>
                {ruleMsg && <span className="text-sm">{ruleMsg}</span>}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">This month’s rules</h3>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Details</th>
                      <th className="py-2 pr-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.length===0 && <tr><td className="py-3" colSpan={4}>No rules yet.</td></tr>}
                    {rules.map(r=>(
                      <tr key={r._id} className="border-b last:border-0">
                        <td className="py-2 pr-4">{r.date}</td>
                        <td className="py-2 pr-4 capitalize">{r.kind}</td>
                        <td className="py-2 pr-4">
                          {r.kind==="closed" && "Closed all day"}
                          {r.kind==="hours" && `Open ${r.open} – ${r.close}`}
                          {r.kind==="blocks" && (r.blocks?.map((b,i)=>`${b.start}–${b.end}`).join(", ") || "—")}
                        </td>
                        <td className="py-2 pr-4">
                          <button onClick={()=>removeRule(r._id)} className="text-red-600">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Store Hours */}
        <section className="bg-white rounded-xl shadow">
          <div className="p-4 sm:p-5 text-base sm:text-lg font-semibold">Store Hours</div>
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border rounded-lg p-3 sm:p-4">
                <div className="font-medium mb-2">Weekday (Mon–Fri)</div>
                <div className="flex gap-2">
                  <input type="time" className="border rounded-lg p-3 w-32 min-h-11" value={hours.weekday.open}  onChange={e=>setHours(h=>({...h, weekday:{...h.weekday, open:e.target.value}}))}/>
                  <span className="self-center">to</span>
                  <input type="time" className="border rounded-lg p-3 w-32 min-h-11" value={hours.weekday.close} onChange={e=>setHours(h=>({...h, weekday:{...h.weekday, close:e.target.value}}))}/>
                </div>
              </div>
              <div className="border rounded-lg p-3 sm:p-4">
                <div className="font-medium mb-2">Weekend (Sat–Sun)</div>
                <div className="flex gap-2">
                  <input type="time" className="border rounded-lg p-3 w-32 min-h-11" value={hours.weekend.open}  onChange={e=>setHours(h=>({...h, weekend:{...h.weekend, open:e.target.value}}))}/>
                  <span className="self-center">to</span>
                  <input type="time" className="border rounded-lg p-3 w-32 min-h-11" value={hours.weekend.close} onChange={e=>setHours(h=>({...h, weekend:{...h.weekend, close:e.target.value}}))}/>
                </div>
              </div>
            </div>
            <div className="mt-1 flex gap-2 items-center">
              <button onClick={saveHours} className="bg-black text-white px-4 py-2 rounded-lg active:scale-[.98] min-h-11">Save</button>
              {hoursMsg && <span className="text-sm">{hoursMsg}</span>}
            </div>
            <p className="text-xs text-gray-500">Note: changes reset on server restart (in-memory).</p>
          </div>
        </section>

        {/* Quick Phone Booking */}
        <section className="bg-white rounded-xl shadow">
          <div className="p-4 sm:p-5 text-base sm:text-lg font-semibold">Quick Phone Booking</div>
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="border rounded-lg p-3 min-h-11" placeholder="Customer name" value={qName} onChange={e=>setQName(e.target.value)} />
              <input className="border rounded-lg p-3 min-h-11" placeholder="Phone" inputMode="tel" value={qPhone} onChange={e=>setQPhone(e.target.value)} />
              <input className="border rounded-lg p-3 min-h-11 sm:col-span-2" type="email" placeholder="Email (optional)" value={qEmail} onChange={e=>setQEmail(e.target.value)} />
              <select className="border rounded-lg p-3 min-h-11 sm:col-span-2" value={qServiceId} onChange={e=>setQServiceId(e.target.value)}>
                <optgroup label="Men">
                  {SERVICES.filter(s=>s.category==="men").map(s=><option key={s.id} value={s.id}>{s.id} — {s.name} ({s.minutes}m)</option>)}
                </optgroup>
                <optgroup label="Women">
                  {SERVICES.filter(s=>s.category==="women").map(s=><option key={s.id} value={s.id}>{s.id} — {s.name} ({s.minutes}m)</option>)}
                </optgroup>
                <optgroup label="Aesthetic">
                  {SERVICES.filter(s=>s.category==="aesthetic").map(s=><option key={s.id} value={s.id}>{s.id} — {s.name} ({s.minutes}m)</option>)}
                </optgroup>
              </select>
              <input type="date" className="border rounded-lg p-3 min-h-11" value={qDate} onChange={e=>setQDate(e.target.value)} />
              <select className="border rounded-lg p-3 min-h-11" value={qTime} onChange={e=>setQTime(e.target.value)}>
                <option value="">Select time</option>
                {qSlots.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <button onClick={createBooking} className="bg-black text-white px-4 py-2 rounded-lg active:scale-[.98] min-h-11">Create booking</button>
              {qMsg && <span className="text-sm">{qMsg}</span>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
