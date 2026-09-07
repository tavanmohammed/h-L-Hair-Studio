import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  servicesData,
} from "../data/servicesData";

/* =====================================================
   API
===================================================== */

const API =
  (
    import.meta.env.VITE_API_URL &&
    import.meta.env.VITE_API_URL.replace(
      /\/$/,
      ""
    )
  ) || "http://localhost:4000";

/* =====================================================
   SERVICES
===================================================== */

const SERVICES = [
  ...servicesData.women.map((service) => ({
    id: service.id,
    name: service.name,
    category: "women",
    bookingType: "regular",
  })),

  ...servicesData.men.map((service) => ({
    id: service.id,
    name: service.name,
    category: "men",
    bookingType: "regular",
  })),

  ...servicesData.waxing.map((service) => ({
    id: service.id,
    name: service.name,
    category: "waxing",
    bookingType: "regular",
  })),

  ...servicesData.coloring.map((service) => ({
    id: service.id,
    name: service.name,
    category: "coloring",
    bookingType: "regular",
  })),

  ...servicesData.nails.map((service) => ({
    id: service.id,
    name: service.name,
    category: "nails",
    bookingType: "nails",
  })),
];

const SERVICE_BY_ID =
  Object.fromEntries(
    SERVICES.map((service) => [
      service.id,
      service,
    ])
  );

/* =====================================================
   DATE HELPERS
===================================================== */

const pad2 = (number) =>
  String(number).padStart(
    2,
    "0"
  );

function fmtYMD(date) {
  return (
    `${date.getFullYear()}-` +
    `${pad2(
      date.getMonth() + 1
    )}-` +
    `${pad2(
      date.getDate()
    )}`
  );
}

function todayYMD() {
  return fmtYMD(
    new Date()
  );
}

function addDays(
  ymd,
  amount
) {
  const date =
    new Date(
      `${ymd}T00:00:00`
    );

  date.setDate(
    date.getDate() +
      amount
  );

  return fmtYMD(
    date
  );
}

function startOfWeekYMD(
  ymd
) {
  const date =
    new Date(
      `${ymd}T00:00:00`
    );

  date.setDate(
    date.getDate() -
      date.getDay()
  );

  return fmtYMD(
    date
  );
}

function weekDays(
  weekStart
) {
  return Array.from(
    {
      length: 7,
    },

    (_, index) =>
      addDays(
        weekStart,
        index
      )
  );
}

function monthStartYMD(
  ymd
) {
  const date =
    new Date(
      `${ymd}T00:00:00`
    );

  date.setDate(1);

  return fmtYMD(
    date
  );
}

function endOfMonthYMD(
  ymd
) {
  const date =
    new Date(
      `${ymd}T00:00:00`
    );

  date.setMonth(
    date.getMonth() + 1,
    0
  );

  return fmtYMD(
    date
  );
}

function prevMonth(
  ymd
) {
  const date =
    new Date(
      `${ymd}T00:00:00`
    );

  date.setMonth(
    date.getMonth() - 1
  );

  return fmtYMD(
    date
  );
}

function nextMonth(
  ymd
) {
  const date =
    new Date(
      `${ymd}T00:00:00`
    );

  date.setMonth(
    date.getMonth() + 1
  );

  return fmtYMD(
    date
  );
}

function monthGrid(
  ymd
) {
  const start =
    new Date(
      `${ymd}T00:00:00`
    );

  const month =
    start.getMonth();

  start.setDate(1);

  const gridStart =
    new Date(start);

  gridStart.setDate(
    start.getDate() -
      start.getDay()
  );

  return Array.from(
    {
      length: 42,
    },

    (_, index) => {
      const date =
        new Date(
          gridStart
        );

      date.setDate(
        gridStart.getDate() +
          index
      );

      return {
        ymd:
          fmtYMD(date),

        inMonth:
          date.getMonth() ===
          month,
      };
    }
  );
}

/* =====================================================
   AUTH FETCH
===================================================== */

function useAuthFetch() {
  return async (
    url,
    options = {}
  ) => {
    const token =
      localStorage.getItem(
        "admintoken"
      );

    const response =
      await fetch(
        API + url,
        {
          ...options,

          headers: {
            "Content-Type":
              "application/json",

            ...(
              options.headers ||
              {}
            ),

            Authorization:
              token
                ? `Bearer ${token}`
                : "",
          },
        }
      );

    let data = {};

    try {
      data =
        await response.json();
    } catch {
      // ignore
    }

    if (!response.ok) {
      if (
        response.status ===
        401
      ) {
        localStorage.removeItem(
          "admintoken"
        );

        window.location.href =
          "/admin-login";
      }

      throw new Error(
        data.error ||
          `HTTP ${response.status}`
      );
    }

    return data;
  };
}

/* =====================================================
   RULE SUMMARY
===================================================== */

function dayRuleSummary(
  rules,
  date
) {
  const dayRules =
    rules.filter(
      (rule) =>
        rule.date === date
    );

  return {
    isClosed:
      dayRules.some(
        (rule) =>
          rule.kind ===
          "closed"
      ),

    hours:
      dayRules.find(
        (rule) =>
          rule.kind ===
          "hours"
      ),

    blocks:
      dayRules.find(
        (rule) =>
          rule.kind ===
          "blocks"
      ),

    dayRules,
  };
}

/* =====================================================
   ADMIN COMPONENT
===================================================== */

export default function Admin() {
  const navigate =
    useNavigate();

  const authFetch =
    useAuthFetch();

  const today =
    useMemo(
      () => todayYMD(),
      []
    );

  const tomorrow =
    useMemo(
      () =>
        addDays(
          today,
          1
        ),
      [today]
    );

  const [
    selectedDay,
    setSelectedDay,
  ] = useState(today);

  const [
    weekStart,
    setWeekStart,
  ] = useState(
    startOfWeekYMD(
      today
    )
  );

  const [
    monthAnchor,
    setMonthAnchor,
  ] = useState(
    monthStartYMD(
      today
    )
  );

  const [
    showMonth,
    setShowMonth,
  ] = useState(false);

  /* =====================================================
     HOURS
  ===================================================== */

  const [
    hours,
    setHours,
  ] = useState({
    regular: {
      monday: {
        open: "",
        close: "",
      },

      weekday: {
        open: "11:00",
        close: "19:00",
      },

      saturday: {
        open: "11:00",
        close: "19:00",
      },

      sunday: {
        open: "11:00",
        close: "17:00",
      },
    },

    nails: {
      weekday: {
        open: "16:30",
        close: "19:00",
      },

      saturday: {
        open: "16:30",
        close: "19:00",
      },

      sunday: {
        open: "11:00",
        close: "17:00",
      },
    },
  });

  const [
    hoursMsg,
    setHoursMsg,
  ] = useState("");

  const [
    bookings,
    setBookings,
  ] = useState([]);

  const [
    rules,
    setRules,
  ] = useState([]);

  const [
    loadingBookings,
    setLoadingBookings,
  ] = useState(false);

  const [
    bookingsErr,
    setBookingsErr,
  ] = useState("");

  const [
    rulesErr,
    setRulesErr,
  ] = useState("");

  /* =====================================================
     QUICK BOOKING
  ===================================================== */

  const [
    qName,
    setQName,
  ] = useState("");

  const [
    qPhone,
    setQPhone,
  ] = useState("");

  const [
    qEmail,
    setQEmail,
  ] = useState("");

  const [
    qServiceId,
    setQServiceId,
  ] = useState(
    SERVICES[0]?.id || ""
  );

  const [
    qDate,
    setQDate,
  ] = useState(today);

  const [
    qSlots,
    setQSlots,
  ] = useState([]);

  const [
    qTime,
    setQTime,
  ] = useState("");

  const [
    qMsg,
    setQMsg,
  ] = useState("");

  /* =====================================================
     RULES
  ===================================================== */

  const [
    ruleDate,
    setRuleDate,
  ] = useState(today);

  const [
    ruleKind,
    setRuleKind,
  ] = useState(
    "closed"
  );

  const [
    ruleOpen,
    setRuleOpen,
  ] = useState(
    "12:00"
  );

  const [
    ruleClose,
    setRuleClose,
  ] = useState(
    "16:00"
  );

  const [
    ruleBlocks,
    setRuleBlocks,
  ] = useState([
    {
      start: "13:00",
      end: "14:00",
    },
  ]);

  const [
    ruleMsg,
    setRuleMsg,
  ] = useState("");

  /* =====================================================
     AUTH CHECK
  ===================================================== */

  useEffect(() => {
    const token =
      localStorage.getItem(
        "admintoken"
      );

    if (!token) {
      navigate(
        "/admin-login"
      );
    }
  }, [navigate]);

  /* =====================================================
     DERIVED DATA
  ===================================================== */

  const days =
    weekDays(
      weekStart
    );

  const grid =
    useMemo(
      () =>
        monthGrid(
          monthAnchor
        ),
      [monthAnchor]
    );

  const monthLabel =
    useMemo(() => {
      const date =
        new Date(
          `${monthAnchor}T00:00:00`
        );

      return date.toLocaleString(
        undefined,
        {
          month: "long",
          year: "numeric",
        }
      );
    }, [monthAnchor]);

  const bookingsByDate =
    useMemo(() => {
      const map = {};

      for (
        const booking of
        bookings
      ) {
        (
          map[
            booking.date
          ] ||= []
        ).push(
          booking
        );
      }

      for (
        const date of
        Object.keys(map)
      ) {
        map[date].sort(
          (a, b) =>
            (
              a.time || ""
            ).localeCompare(
              b.time || ""
            )
        );
      }

      return map;
    }, [bookings]);

  const todaysList =
    bookingsByDate[
      today
    ] || [];

  const tomorrowsList =
    bookingsByDate[
      tomorrow
    ] || [];

  const selectedList =
    bookingsByDate[
      selectedDay
    ] || [];

  /* =====================================================
     LOAD HOURS
  ===================================================== */

  async function loadHours() {
    try {
      const data =
        await authFetch(
          "/api/admin/hours"
        );

      setHours({
        regular: {
          monday: {
            open:
              data.regular
                ?.monday
                ?.open || "",

            close:
              data.regular
                ?.monday
                ?.close || "",
          },

          weekday:
            data.regular
              ?.weekday || {
              open: "11:00",
              close: "19:00",
            },

          saturday:
            data.regular
              ?.saturday || {
              open: "11:00",
              close: "19:00",
            },

          sunday:
            data.regular
              ?.sunday || {
              open: "11:00",
              close: "17:00",
            },
        },

        nails: {
          weekday:
            data.nails
              ?.weekday || {
              open: "16:30",
              close: "19:00",
            },

          saturday:
            data.nails
              ?.saturday || {
              open: "16:30",
              close: "19:00",
            },

          sunday:
            data.nails
              ?.sunday || {
              open: "11:00",
              close: "17:00",
            },
        },
      });
    } catch {
      // ignore
    }
  }

  async function loadMonthBookings(
    anchor
  ) {
    try {
      setLoadingBookings(
        true
      );

      setBookingsErr("");

      const from =
        monthStartYMD(
          anchor
        );

      const end =
        endOfMonthYMD(
          anchor
        );

      const rows =
        await authFetch(
          `/api/admin/bookings?from=${from}`
        );

      setBookings(
        rows.filter(
          (booking) =>
            booking.date >=
              from &&
            booking.date <=
              end
        )
      );
    } catch (error) {
      setBookingsErr(
        error.message
      );

      setBookings([]);
    } finally {
      setLoadingBookings(
        false
      );
    }
  }

  async function loadMonthRules(
    anchor
  ) {
    try {
      setRulesErr("");

      const from =
        monthStartYMD(
          anchor
        );

      const end =
        endOfMonthYMD(
          anchor
        );

      const rows =
        await authFetch(
          `/api/admin/rules?from=${from}`
        );

      setRules(
        rows.filter(
          (rule) =>
            rule.date >=
              from &&
            rule.date <=
              end
        )
      );
    } catch (error) {
      setRulesErr(
        error.message
      );

      setRules([]);
    }
  }

  async function loadAvailability() {
    setQSlots([]);
    setQTime("");

    try {
      const service =
        SERVICE_BY_ID[
          qServiceId
        ];

      if (!service) {
        return;
      }

      const bookingType =
        service.bookingType ||
        "regular";

      const response =
        await fetch(
          `${API}/api/availability?date=${qDate}&serviceId=${qServiceId}&bookingType=${bookingType}`
        );

      const data =
        await response.json();

      if (response.ok) {
        setQSlots(
          data.slots || []
        );
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadHours();
  }, []);

  useEffect(() => {
    loadMonthBookings(
      monthAnchor
    );
  }, [monthAnchor]);

  useEffect(() => {
    loadMonthRules(
      monthAnchor
    );
  }, [monthAnchor]);

  useEffect(() => {
    loadAvailability();
  }, [
    qDate,
    qServiceId,
  ]);

  /* =====================================================
     SAVE HOURS
  ===================================================== */

  async function saveHours() {
    try {
      setHoursMsg("");

      await authFetch(
        "/api/admin/hours",
        {
          method: "PUT",

          body:
            JSON.stringify(
              hours
            ),
        }
      );

      setHoursMsg(
        "Saved ✔"
      );

      await loadAvailability();

      setTimeout(
        () =>
          setHoursMsg(""),
        1500
      );
    } catch (error) {
      setHoursMsg(
        error.message
      );
    }
  }

  /* =====================================================
     CREATE BOOKING
  ===================================================== */

  async function createBooking() {
    try {
      setQMsg("");

      if (
        !qName ||
        !qPhone ||
        !qServiceId ||
        !qDate ||
        !qTime
      ) {
        setQMsg(
          "Please fill name, phone, service, date and time."
        );

        return;
      }

      const service =
        SERVICE_BY_ID[
          qServiceId
        ];

      const body = {
        name:
          qName,

        phone:
          qPhone,

        serviceId:
          qServiceId,

        serviceName:
          service?.name ||
          "",

        serviceCategory:
          service?.category ||
          "",

        bookingType:
          service?.bookingType ||
          "regular",

        date:
          qDate,

        time:
          qTime,
      };

      if (qEmail) {
        body.email =
          qEmail;
      }

      await authFetch(
        "/api/admin/bookings",
        {
          method: "POST",

          body:
            JSON.stringify(
              body
            ),
        }
      );

      setQMsg(
        "Booked ✔"
      );

      setQName("");
      setQPhone("");
      setQEmail("");
      setQTime("");

      await loadMonthBookings(
        monthAnchor
      );

      await loadAvailability();
    } catch (error) {
      setQMsg(
        error.message
      );
    }
  }

  /* =====================================================
     CANCEL BOOKING
  ===================================================== */

  async function cancelBooking(
    booking
  ) {
    const confirmed =
      window.confirm(
        `Cancel ${booking.name}'s appointment on ${booking.date} at ${booking.time}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await authFetch(
        `/api/admin/bookings/${booking._id}/cancel`,
        {
          method:
            "PATCH",
        }
      );

      await loadMonthBookings(
        monthAnchor
      );

      await loadAvailability();
    } catch (error) {
      window.alert(
        error.message ||
          "Failed to cancel appointment."
      );
    }
  }

  /* =====================================================
     SPECIAL RULES
  ===================================================== */

  async function addRule() {
    try {
      setRuleMsg("");

      if (
        ruleKind ===
          "hours" &&
        (
          !ruleOpen ||
          !ruleClose
        )
      ) {
        setRuleMsg(
          "Choose opening and closing times."
        );

        return;
      }

      const body = {
        date:
          ruleDate,

        kind:
          ruleKind,
      };

      if (
        ruleKind ===
        "hours"
      ) {
        body.open =
          ruleOpen;

        body.close =
          ruleClose;
      }

      if (
        ruleKind ===
        "blocks"
      ) {
        body.blocks =
          ruleBlocks;
      }

      await authFetch(
        "/api/admin/rules",
        {
          method: "POST",

          body:
            JSON.stringify(
              body
            ),
        }
      );

      await loadMonthRules(
        monthAnchor
      );

      await loadAvailability();

      setRuleMsg(
        "Saved ✔"
      );

      setTimeout(
        () =>
          setRuleMsg(""),
        1500
      );
    } catch (error) {
      setRuleMsg(
        error.message
      );
    }
  }

  async function removeRule(
    id
  ) {
    try {
      await authFetch(
        `/api/admin/rules/${id}`,
        {
          method:
            "DELETE",
        }
      );

      await loadMonthRules(
        monthAnchor
      );

      await loadAvailability();
    } catch {
      // ignore
    }
  }

  /* =====================================================
     BOOKING CARDS
  ===================================================== */

  function BookingCards({
    rows,
  }) {
    if (!rows?.length) {
      return (
        <div className="text-sm text-gray-500">
          No bookings.
        </div>
      );
    }

    return (
      <div className="space-y-3">

        {rows.map(
          (booking) => {
            const cancelled =
              booking.status ===
              "cancelled";

            return (
              <div
                key={
                  booking._id
                }
                className={`rounded-xl border bg-white p-4 shadow-sm ${
                  cancelled
                    ? "opacity-60"
                    : ""
                }`}
              >

                <div className="flex justify-between gap-3">

                  <div>

                    <div className="font-medium">
                      {booking.time}
                      {" – "}
                      {booking.endTime}
                    </div>

                    <div className="font-medium mt-1">
                      {booking.name}
                    </div>

                    <div className="text-sm text-gray-600">
                      {booking.serviceName}
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      {booking.phone}
                    </div>

                    {booking.email && (
                      <div className="text-xs text-gray-500">
                        {booking.email}
                      </div>
                    )}

                  </div>

                  <div>

                    {cancelled ? (
                      <span className="text-xs text-red-600">
                        Cancelled
                      </span>
                    ) : (
                      <span className="text-xs text-green-700">
                        Confirmed
                      </span>
                    )}

                  </div>

                </div>

                {!cancelled && (
                  <button
                    type="button"
                    onClick={() =>
                      cancelBooking(
                        booking
                      )
                    }
                    className="mt-3 border border-red-600 text-red-600 px-3 py-2 rounded-lg text-sm"
                  >
                    Cancel Appointment
                  </button>
                )}

              </div>
            );
          }
        )}

      </div>
    );
  }

  /* =====================================================
     BOOKING TABLE
  ===================================================== */

  function BookingTable({
    rows,
  }) {
    if (!rows?.length) {
      return (
        <div className="text-sm text-gray-500">
          No bookings.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead>

            <tr className="text-left border-b">

              <th className="py-2 pr-4">
                Time
              </th>

              <th className="py-2 pr-4">
                Name
              </th>

              <th className="py-2 pr-4">
                Service
              </th>

              <th className="py-2 pr-4">
                Contact
              </th>

              <th className="py-2 pr-4">
                Status
              </th>

              <th className="py-2">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {rows.map(
              (booking) => {
                const cancelled =
                  booking.status ===
                  "cancelled";

                return (
                  <tr
                    key={
                      booking._id
                    }
                    className={`border-b ${
                      cancelled
                        ? "opacity-60"
                        : ""
                    }`}
                  >

                    <td className="py-2 pr-4">
                      {booking.time}
                      {" – "}
                      {booking.endTime}
                    </td>

                    <td className="py-2 pr-4">
                      {booking.name}
                    </td>

                    <td className="py-2 pr-4">
                      {booking.serviceCategory}
                      {" / "}
                      {booking.serviceName}
                    </td>

                    <td className="py-2 pr-4">

                      <div>
                        {booking.phone}
                      </div>

                      {booking.email && (
                        <div className="text-gray-500">
                          {booking.email}
                        </div>
                      )}

                    </td>

                    <td className="py-2 pr-4">

                      {cancelled ? (
                        <span className="text-red-600">
                          Cancelled
                        </span>
                      ) : (
                        <span className="text-green-700">
                          Confirmed
                        </span>
                      )}

                    </td>

                    <td className="py-2">

                      {!cancelled && (
                        <button
                          type="button"
                          onClick={() =>
                            cancelBooking(
                              booking
                            )
                          }
                          className="border border-red-600 text-red-600 px-3 py-1.5 rounded-lg"
                        >
                          Cancel
                        </button>
                      )}

                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>

      </div>
    );
  }

  /* =====================================================
     DAY CHIP
  ===================================================== */

  function DayChip({
    ymd,
  }) {
    const selected =
      ymd ===
      selectedDay;

    const activeBookings =
      (
        bookingsByDate[
          ymd
        ] || []
      ).filter(
        (booking) =>
          booking.status !==
          "cancelled"
      );

    const info =
      dayRuleSummary(
        rules,
        ymd
      );

    const isMonday =
      new Date(
        `${ymd}T00:00:00`
      ).getDay() === 1;

    const regularMondayOpen =
      Boolean(
        hours.regular
          ?.monday
          ?.open &&
        hours.regular
          ?.monday
          ?.close
      );

    const specialHoursOpen =
      Boolean(
        info.hours?.open &&
        info.hours?.close
      );

    const mondayOpened =
      regularMondayOpen ||
      specialHoursOpen;

    const closed =
      info.isClosed ||
      (
        isMonday &&
        !mondayOpened
      );

    return (
      <button
        onClick={() => {
          setSelectedDay(
            ymd
          );

          setRuleDate(
            ymd
          );
        }}
        className={`shrink-0 px-3 py-2 rounded-lg border text-xs sm:text-sm mr-2 min-w-[70px] ${
          selected
            ? "bg-black text-white border-black"
            : "bg-white"
        }`}
      >

        <div className="font-medium">

          {new Date(
            `${ymd}T00:00:00`
          ).toLocaleDateString(
            undefined,
            {
              weekday:
                "short",
            }
          )}

          {" "}

          {ymd.slice(
            8,
            10
          )}

        </div>

        <div className="text-[11px]">

          {closed
            ? "Closed"
            : activeBookings.length
            ? `${activeBookings.length} bookings`
            : "Open"}

        </div>

      </button>
    );
  }

  /* =====================================================
     MONTH CELL
  ===================================================== */

  function DayCell({
    cell,
  }) {
    const activeBookings =
      (
        bookingsByDate[
          cell.ymd
        ] || []
      ).filter(
        (booking) =>
          booking.status !==
          "cancelled"
      );

    const info =
      dayRuleSummary(
        rules,
        cell.ymd
      );

    const selected =
      cell.ymd ===
      selectedDay;

    const isToday =
      cell.ymd ===
      today;

    const dateObj =
      new Date(
        `${cell.ymd}T00:00:00`
      );

    const isMonday =
      dateObj.getDay() === 1;

    const regularMondayOpen =
      Boolean(
        hours.regular
          ?.monday
          ?.open &&
        hours.regular
          ?.monday
          ?.close
      );

    const specialHoursOpen =
      Boolean(
        info.hours?.open &&
        info.hours?.close
      );

    const mondayOpened =
      regularMondayOpen ||
      specialHoursOpen;

    const closed =
      info.isClosed ||
      (
        isMonday &&
        !mondayOpened
      );

    return (
      <button
        onClick={() => {
          setSelectedDay(
            cell.ymd
          );

          setRuleDate(
            cell.ymd
          );
        }}
        className={[
          "h-16 sm:h-20 border p-2 text-left relative",

          cell.inMonth
            ? "bg-white"
            : "bg-gray-50 text-gray-400",

          selected
            ? "ring-2 ring-black"
            : "",

          closed
            ? "opacity-60"
            : "",
        ].join(" ")}
      >

        <div className="text-xs">
          {cell.ymd.slice(
            8,
            10
          )}
        </div>

        {isToday && (
          <span className="absolute top-1 right-1 text-[10px] bg-black text-white rounded px-1">
            today
          </span>
        )}

        {closed && (
          <span className="absolute bottom-1 left-1 text-[10px] bg-red-600 text-white rounded px-1">
            closed
          </span>
        )}

        {isMonday &&
          mondayOpened &&
          !info.isClosed && (
          <span className="absolute bottom-1 left-1 text-[10px] bg-green-700 text-white rounded px-1">
            open
          </span>
        )}

        {activeBookings.length >
          0 && (
          <span className="absolute bottom-1 right-1 text-[10px] bg-gray-900 text-white rounded-full px-2">
            {activeBookings.length}
          </span>
        )}

      </button>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-dvh bg-gray-50">

      {/* HEADER */}

      <div className="sticky top-0 z-40 bg-gray-50/90 backdrop-blur border-b">

        <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-3">

          <div className="flex items-center gap-2">

            <h1 className="font-bold text-xl">
              Admin
            </h1>

            <div className="ml-auto flex gap-2">

              <button
                onClick={() => {
                  setSelectedDay(
                    today
                  );

                  setWeekStart(
                    startOfWeekYMD(
                      today
                    )
                  );

                  setMonthAnchor(
                    monthStartYMD(
                      today
                    )
                  );
                }}
                className="border px-3 py-2 rounded-lg"
              >
                Today
              </button>

              <button
                onClick={() => {
                  loadMonthBookings(
                    monthAnchor
                  );

                  loadMonthRules(
                    monthAnchor
                  );

                  loadAvailability();
                }}
                className="border px-3 py-2 rounded-lg"
              >
                Refresh
              </button>

            </div>

          </div>

        </div>

      </div>

      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-6 space-y-6">

        {/* TODAY & TOMORROW */}

        <section className="bg-white rounded-xl shadow p-5">

          <h2 className="font-semibold text-lg mb-4">
            Today & Tomorrow
          </h2>

          <div className="space-y-6">

            <div>

              <h3 className="text-sm text-gray-600 mb-2">
                Today ({today})
              </h3>

              <div className="md:hidden">

                <BookingCards
                  rows={
                    todaysList
                  }
                />

              </div>

              <div className="hidden md:block">

                <BookingTable
                  rows={
                    todaysList
                  }
                />

              </div>

            </div>

            <div>

              <h3 className="text-sm text-gray-600 mb-2">
                Tomorrow ({tomorrow})
              </h3>

              <div className="md:hidden">

                <BookingCards
                  rows={
                    tomorrowsList
                  }
                />

              </div>

              <div className="hidden md:block">

                <BookingTable
                  rows={
                    tomorrowsList
                  }
                />

              </div>

            </div>

          </div>

        </section>

        {/* CALENDAR */}

        <section className="bg-white rounded-xl shadow p-5">

          <h2 className="font-semibold text-lg mb-4">
            Calendar & Day Details
          </h2>

          <div className="flex items-center gap-2 mb-4">

            <button
              onClick={() =>
                setWeekStart(
                  addDays(
                    weekStart,
                    -7
                  )
                )
              }
              className="border px-3 py-2 rounded-lg"
            >
              ‹ Prev
            </button>

            <button
              onClick={() =>
                setWeekStart(
                  addDays(
                    weekStart,
                    7
                  )
                )
              }
              className="ml-auto border px-3 py-2 rounded-lg"
            >
              Next ›
            </button>

          </div>

          <div className="overflow-x-auto mb-4">

            <div className="flex">

              {days.map(
                (day) => (
                  <DayChip
                    key={day}
                    ymd={day}
                  />
                )
              )}

            </div>

          </div>

          <button
            onClick={() =>
              setShowMonth(
                (current) =>
                  !current
              )
            }
            className="w-full border px-3 py-2 rounded-lg mb-4"
          >
            {showMonth
              ? "Hide Full Month"
              : "Show Full Month"}
          </button>

          {showMonth && (
            <div className="border rounded-lg p-3 mb-5">

              <div className="flex items-center mb-3">

                <button
                  onClick={() =>
                    setMonthAnchor(
                      prevMonth(
                        monthAnchor
                      )
                    )
                  }
                  className="border px-3 py-2 rounded-lg"
                >
                  ‹
                </button>

                <div className="font-medium ml-3">
                  {monthLabel}
                </div>

                <button
                  onClick={() =>
                    setMonthAnchor(
                      nextMonth(
                        monthAnchor
                      )
                    )
                  }
                  className="ml-auto border px-3 py-2 rounded-lg"
                >
                  ›
                </button>

              </div>

              {loadingBookings && (
                <p className="text-sm text-gray-500">
                  Loading...
                </p>
              )}

              {bookingsErr && (
                <p className="text-sm text-red-600">
                  {bookingsErr}
                </p>
              )}

              {rulesErr && (
                <p className="text-sm text-red-600">
                  {rulesErr}
                </p>
              )}

              <div className="grid grid-cols-7 text-xs text-gray-500 mb-1">

                {[
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                ].map(
                  (day) => (
                    <div
                      key={day}
                    >
                      {day}
                    </div>
                  )
                )}

              </div>

              <div className="grid grid-cols-7 gap-px bg-gray-200">

                {grid.map(
                  (cell) => (
                    <DayCell
                      key={
                        cell.ymd
                      }
                      cell={
                        cell
                      }
                    />
                  )
                )}

              </div>

            </div>
          )}

          <h3 className="font-medium mb-3">
            Bookings on {selectedDay}
          </h3>

          <div className="md:hidden">

            <BookingCards
              rows={
                selectedList
              }
            />

          </div>

          <div className="hidden md:block">

            <BookingTable
              rows={
                selectedList
              }
            />

          </div>

        </section>

        {/* SPECIAL HOURS */}

        <section className="bg-white rounded-xl shadow p-5">

          <h2 className="font-semibold text-lg mb-2">
            Special Hours & Closures
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Use this section to close one specific date,
            override the normal hours for a date,
            or block part of a day.
          </p>

          <div className="grid gap-3 md:grid-cols-3">

            <input
              type="date"
              value={
                ruleDate
              }
              onChange={(
                event
              ) =>
                setRuleDate(
                  event.target.value
                )
              }
              className="border rounded-lg p-3"
            />

            <select
              value={
                ruleKind
              }
              onChange={(
                event
              ) =>
                setRuleKind(
                  event.target.value
                )
              }
              className="border rounded-lg p-3"
            >

              <option value="closed">
                Closed all day
              </option>

              <option value="hours">
                Override hours
              </option>

              <option value="blocks">
                Block time
              </option>

            </select>

            {ruleKind ===
              "hours" && (

              <div className="flex gap-2">

                <input
                  type="time"
                  value={
                    ruleOpen
                  }
                  onChange={(
                    event
                  ) =>
                    setRuleOpen(
                      event.target.value
                    )
                  }
                  className="border rounded-lg p-3 w-full"
                />

                <input
                  type="time"
                  value={
                    ruleClose
                  }
                  onChange={(
                    event
                  ) =>
                    setRuleClose(
                      event.target.value
                    )
                  }
                  className="border rounded-lg p-3 w-full"
                />

              </div>

            )}

          </div>

          {ruleKind ===
            "blocks" && (

            <div className="mt-4 space-y-2">

              {ruleBlocks.map(
                (
                  block,
                  index
                ) => (

                  <div
                    key={index}
                    className="flex gap-2"
                  >

                    <input
                      type="time"
                      value={
                        block.start
                      }
                      onChange={(
                        event
                      ) => {
                        const next = [
                          ...ruleBlocks,
                        ];

                        next[index] = {
                          ...next[
                            index
                          ],

                          start:
                            event.target.value,
                        };

                        setRuleBlocks(
                          next
                        );
                      }}
                      className="border rounded-lg p-3"
                    />

                    <input
                      type="time"
                      value={
                        block.end
                      }
                      onChange={(
                        event
                      ) => {
                        const next = [
                          ...ruleBlocks,
                        ];

                        next[index] = {
                          ...next[
                            index
                          ],

                          end:
                            event.target.value,
                        };

                        setRuleBlocks(
                          next
                        );
                      }}
                      className="border rounded-lg p-3"
                    />

                  </div>

                )
              )}

              <button
                type="button"
                onClick={() =>
                  setRuleBlocks([
                    ...ruleBlocks,

                    {
                      start:
                        "13:00",

                      end:
                        "14:00",
                    },
                  ])
                }
                className="border px-3 py-2 rounded-lg"
              >
                + Add Block
              </button>

            </div>

          )}

          <div className="mt-4">

            <button
              type="button"
              onClick={
                addRule
              }
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Save Rule
            </button>

            {ruleMsg && (
              <span className="ml-3 text-sm">
                {ruleMsg}
              </span>
            )}

          </div>

          <div className="mt-6">

            <h3 className="font-medium mb-3">
              This month's rules
            </h3>

            {rules.length === 0 && (
              <p className="text-sm text-gray-500">
                No special rules this month.
              </p>
            )}

            {rules.map(
              (rule) => (

                <div
                  key={
                    rule._id
                  }
                  className="flex justify-between gap-3 border-b py-2"
                >

                  <div>

                    <strong>
                      {rule.date}
                    </strong>

                    {" — "}

                    {rule.kind ===
                    "hours" ? (
                      <>
                        {rule.open}
                        {" - "}
                        {rule.close}
                      </>
                    ) : rule.kind ===
                      "closed" ? (
                      <>
                        Closed all day
                      </>
                    ) : (
                      <>
                        Blocked time
                      </>
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeRule(
                        rule._id
                      )
                    }
                    className="text-red-600"
                  >
                    Delete
                  </button>

                </div>

              )
            )}

          </div>

        </section>

        {/* BOOKING HOURS */}

        <section className="bg-white rounded-xl shadow p-5">

          <h2 className="font-semibold text-lg mb-2">
            Booking Hours
          </h2>

          <p className="text-sm text-gray-600 mb-5">
            Monday hours below apply to the Regular Salon.
            Leave both Monday fields blank to keep the regular
            salon closed on Mondays.
          </p>

          {[
            [
              "Regular Salon",
              "regular",
            ],

            [
              "Nail Technician",
              "nails",
            ],
          ].map(
            ([
              label,
              type,
            ]) => {

              const dayOptions =
                type ===
                "regular"
                  ? [
                      [
                        "Monday",
                        "monday",
                      ],

                      [
                        "Tue–Fri",
                        "weekday",
                      ],

                      [
                        "Saturday",
                        "saturday",
                      ],

                      [
                        "Sunday",
                        "sunday",
                      ],
                    ]
                  : [
                      [
                        "Tue–Fri",
                        "weekday",
                      ],

                      [
                        "Saturday",
                        "saturday",
                      ],

                      [
                        "Sunday",
                        "sunday",
                      ],
                    ];

              return (
                <div
                  key={
                    type
                  }
                  className="mb-6"
                >

                  <h3 className="font-medium mb-3">
                    {label}
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                    {dayOptions.map(
                      ([
                        dayLabel,
                        key,
                      ]) => (

                        <div
                          key={
                            key
                          }
                          className="border rounded-lg p-3"
                        >

                          <div className="font-medium mb-2">
                            {dayLabel}
                          </div>

                          <div className="flex gap-2">

                            <input
                              type="time"
                              value={
                                hours[
                                  type
                                ]?.[
                                  key
                                ]?.open ||
                                ""
                              }
                              onChange={(
                                event
                              ) =>
                                setHours(
                                  (
                                    current
                                  ) => ({
                                    ...current,

                                    [
                                      type
                                    ]: {
                                      ...current[
                                        type
                                      ],

                                      [
                                        key
                                      ]: {
                                        ...(
                                          current[
                                            type
                                          ]?.[
                                            key
                                          ] ||
                                          {}
                                        ),

                                        open:
                                          event.target.value,
                                      },
                                    },
                                  })
                                )
                              }
                              className="border rounded-lg p-2 w-full"
                            />

                            <input
                              type="time"
                              value={
                                hours[
                                  type
                                ]?.[
                                  key
                                ]?.close ||
                                ""
                              }
                              onChange={(
                                event
                              ) =>
                                setHours(
                                  (
                                    current
                                  ) => ({
                                    ...current,

                                    [
                                      type
                                    ]: {
                                      ...current[
                                        type
                                      ],

                                      [
                                        key
                                      ]: {
                                        ...(
                                          current[
                                            type
                                          ]?.[
                                            key
                                          ] ||
                                          {}
                                        ),

                                        close:
                                          event.target.value,
                                      },
                                    },
                                  })
                                )
                              }
                              className="border rounded-lg p-2 w-full"
                            />

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>
              );
            }
          )}

          <button
            type="button"
            onClick={
              saveHours
            }
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Save Hours
          </button>

          {hoursMsg && (
            <span className="ml-3 text-sm">
              {hoursMsg}
            </span>
          )}

        </section>

        {/* QUICK PHONE BOOKING */}

        <section className="bg-white rounded-xl shadow p-5">

          <h2 className="font-semibold text-lg mb-4">
            Quick Phone Booking
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">

            <input
              placeholder="Customer name"
              value={
                qName
              }
              onChange={(
                event
              ) =>
                setQName(
                  event.target.value
                )
              }
              className="border rounded-lg p-3"
            />

            <input
              placeholder="Phone"
              value={
                qPhone
              }
              onChange={(
                event
              ) =>
                setQPhone(
                  event.target.value
                )
              }
              className="border rounded-lg p-3"
            />

            <input
              type="email"
              placeholder="Email (optional)"
              value={
                qEmail
              }
              onChange={(
                event
              ) =>
                setQEmail(
                  event.target.value
                )
              }
              className="border rounded-lg p-3 sm:col-span-2"
            />

            <select
              value={
                qServiceId
              }
              onChange={(
                event
              ) =>
                setQServiceId(
                  event.target.value
                )
              }
              className="border rounded-lg p-3 sm:col-span-2"
            >

              {SERVICES.map(
                (service) => (
                  <option
                    key={
                      service.id
                    }
                    value={
                      service.id
                    }
                  >
                    {service.name}
                    {" — "}
                    {service.category}
                  </option>
                )
              )}

            </select>

            <input
              type="date"
              value={
                qDate
              }
              onChange={(
                event
              ) =>
                setQDate(
                  event.target.value
                )
              }
              className="border rounded-lg p-3"
            />

            <select
              value={
                qTime
              }
              onChange={(
                event
              ) =>
                setQTime(
                  event.target.value
                )
              }
              className="border rounded-lg p-3"
            >

              <option value="">
                {qSlots.length
                  ? "Select time"
                  : "No available times"}
              </option>

              {qSlots.map(
                (slot) => (
                  <option
                    key={
                      slot
                    }
                    value={
                      slot
                    }
                  >
                    {slot}
                  </option>
                )
              )}

            </select>

          </div>

          <div className="mt-4">

            <button
              type="button"
              onClick={
                createBooking
              }
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Create Booking
            </button>

            {qMsg && (
              <span className="ml-3 text-sm">
                {qMsg}
              </span>
            )}

          </div>

        </section>

      </div>

    </div>
  );
}
