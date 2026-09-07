import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  ...servicesData.women.map(
    (service) => ({
      ...service,
      category: "women",
      bookingType: "regular",
    })
  ),

  ...servicesData.men.map(
    (service) => ({
      ...service,
      category: "men",
      bookingType: "regular",
    })
  ),

  ...servicesData.waxing.map(
    (service) => ({
      ...service,
      category: "waxing",
      bookingType: "regular",
    })
  ),

  ...servicesData.coloring.map(
    (service) => ({
      ...service,
      category: "coloring",
      bookingType: "regular",
    })
  ),

  ...servicesData.nails.map(
    (service) => ({
      ...service,
      category: "nails",
      bookingType: "nails",
    })
  ),
];

/* =====================================================
   HELPERS
===================================================== */

function todayYMD() {
  const date = new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function prettyCategory(
  category
) {
  if (!category) {
    return "";
  }

  return (
    category.charAt(0).toUpperCase() +
    category.slice(1)
  );
}

function formatTime(time) {
  if (!time) {
    return "";
  }

  const [hourString, minute] =
    time.split(":");

  const hour =
    Number(hourString);

  const suffix =
    hour >= 12 ? "PM" : "AM";

  const hour12 =
    hour % 12 || 12;

  return `${hour12}:${minute} ${suffix}`;
}

/* =====================================================
   BOOKING
===================================================== */

export default function Booking() {
  const categories =
    useMemo(
      () => [
        ...new Set(
          SERVICES.map(
            (service) =>
              service.category
          )
        ),
      ],
      []
    );

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(
    categories[0] || ""
  );

  const [
    selectedServiceId,
    setSelectedServiceId,
  ] = useState("");

  const [
    selectedDate,
    setSelectedDate,
  ] = useState("");

  const [
    selectedTime,
    setSelectedTime,
  ] = useState("");

  const [
    availableSlots,
    setAvailableSlots,
  ] = useState([]);

  const [
    loadingSlots,
    setLoadingSlots,
  ] = useState(false);

  const [
    availabilityMessage,
    setAvailabilityMessage,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    formData,
    setFormData,
  ] = useState({
    fullName: "",
    phone: "",
    email: "",
    notes: "",
  });

  /* =====================================================
     DERIVED DATA
  ===================================================== */

  const filteredServices =
    useMemo(() => {
      return SERVICES.filter(
        (service) =>
          service.category ===
          selectedCategory
      );
    }, [selectedCategory]);

  const selectedService =
    useMemo(() => {
      return SERVICES.find(
        (service) =>
          String(service.id) ===
            String(
              selectedServiceId
            ) ||
          String(service._id) ===
            String(
              selectedServiceId
            )
      );
    }, [selectedServiceId]);

  /* =====================================================
     CATEGORY CHANGE
  ===================================================== */

  useEffect(() => {
    setSelectedServiceId("");
    setSelectedTime("");
    setAvailableSlots([]);
    setAvailabilityMessage("");
  }, [selectedCategory]);

  /* =====================================================
     AVAILABILITY
  ===================================================== */

  useEffect(() => {
    async function loadAvailability() {
      setAvailableSlots([]);
      setSelectedTime("");
      setAvailabilityMessage("");
      setErrorMessage("");

      if (
        !selectedDate ||
        !selectedService
      ) {
        return;
      }

      try {
        setLoadingSlots(true);

        const serviceId =
          selectedService.id ||
          selectedService._id;

        const bookingType =
          selectedService.bookingType ||
          "regular";

        const response =
          await fetch(
            `${API}/api/availability?date=${encodeURIComponent(
              selectedDate
            )}&serviceId=${encodeURIComponent(
              serviceId
            )}&bookingType=${encodeURIComponent(
              bookingType
            )}`
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load availability."
          );
        }

        const slots =
          data.slots || [];

        setAvailableSlots(
          slots
        );

        if (
          slots.length === 0
        ) {
          setAvailabilityMessage(
            "The salon is closed or there are no available appointments on this date."
          );
        }
      } catch (error) {
        console.error(
          "Availability error:",
          error
        );

        setAvailableSlots([]);

        setAvailabilityMessage(
          error.message ||
            "Unable to load available times."
        );
      } finally {
        setLoadingSlots(false);
      }
    }

    loadAvailability();
  }, [
    selectedDate,
    selectedService,
  ]);

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  function handleInputChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,

        [name]:
          value,
      })
    );
  }

  /* =====================================================
     SUBMIT BOOKING
  ===================================================== */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!selectedService) {
      setErrorMessage(
        "Please select a service."
      );

      return;
    }

    if (!selectedDate) {
      setErrorMessage(
        "Please select a date."
      );

      return;
    }

    if (!selectedTime) {
      setErrorMessage(
        "Please select an available time."
      );

      return;
    }

    if (
      !formData.fullName.trim()
    ) {
      setErrorMessage(
        "Please enter your full name."
      );

      return;
    }

    if (
      !formData.phone.trim()
    ) {
      setErrorMessage(
        "Please enter your phone number."
      );

      return;
    }

    if (
      !formData.email.trim()
    ) {
      setErrorMessage(
        "Please enter your email."
      );

      return;
    }

    try {
      setSubmitting(true);

      const serviceId =
        selectedService.id ||
        selectedService._id;

      const payload = {
        name:
          formData.fullName.trim(),

        phone:
          formData.phone.trim(),

        email:
          formData.email.trim(),

        serviceId,

        serviceName:
          selectedService.name,

        serviceCategory:
          selectedService.category,

        bookingType:
          selectedService.bookingType ||
          "regular",

        date:
          selectedDate,

        time:
          selectedTime,
      };

      const response =
        await fetch(
          `${API}/api/bookings`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create booking."
        );
      }

      setSuccessMessage(
        "Your appointment has been confirmed! A confirmation email will be sent to you."
      );

      setSelectedServiceId("");
      setSelectedDate("");
      setSelectedTime("");
      setAvailableSlots([]);
      setAvailabilityMessage("");

      setFormData({
        fullName: "",
        phone: "",
        email: "",
        notes: "",
      });
    } catch (error) {
      console.error(
        "Booking error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section className="min-h-screen bg-[#f5f5f3]">

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">

        {/* HEADER */}

        <div className="max-w-3xl">

          <h1 className="font-serif text-[42px] leading-tight text-[#555555] md:text-[60px]">
            Book an Appointment
          </h1>

          <p className="mt-5 text-lg leading-8 text-[#4f4f4f]">
            Choose your treatment,
            select a date and time,
            and submit your booking.
          </p>

        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.05fr]">

          {/* ==========================================
              SERVICES
          ========================================== */}

          <div className="rounded-[24px] border border-[#e7e4df] bg-white p-6">

            <h2 className="text-2xl font-semibold text-[#4a4a4a]">
              Choose a service
            </h2>

            {/* CATEGORY */}

            <div className="mt-6">

              <label className="block">

                <span className="mb-2 block text-sm font-medium text-[#4f4f4f]">
                  Category
                </span>

                <select
                  value={
                    selectedCategory
                  }
                  onChange={(
                    event
                  ) =>
                    setSelectedCategory(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none"
                >

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {prettyCategory(
                          category
                        )}
                      </option>
                    )
                  )}

                </select>

              </label>

            </div>

            {/* SERVICES */}

            <div className="mt-6">

              <span className="mb-3 block text-sm font-medium text-[#4f4f4f]">
                Services
              </span>

              <div className="max-h-[560px] space-y-4 overflow-y-auto pr-2">

                {filteredServices.map(
                  (service) => {
                    const id =
                      service.id ||
                      service._id;

                    const selected =
                      String(
                        selectedServiceId
                      ) ===
                      String(id);

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setSelectedServiceId(
                            id
                          );

                          setSelectedTime(
                            ""
                          );

                          setSuccessMessage(
                            ""
                          );

                          setErrorMessage(
                            ""
                          );
                        }}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-[#f2a482] bg-[#fff7f3]"
                            : "border-[#e7e4df] bg-white hover:border-[#d9d3cc]"
                        }`}
                      >

                        <div className="flex gap-4">

                          {service.image && (
                            <img
                              src={
                                service.image
                              }
                              alt={
                                service.name
                              }
                              className="h-24 w-24 rounded-xl object-cover"
                            />
                          )}

                          <div className="flex-1">

                            <div className="flex items-start justify-between gap-4">

                              <div>

                                <h3 className="text-lg font-semibold text-[#3f3f3f]">
                                  {
                                    service.name
                                  }
                                </h3>

                                {service.area && (
                                  <p className="mt-1 text-sm text-[#6a6a6a]">
                                    {
                                      service.area
                                    }
                                  </p>
                                )}

                              </div>

                              <div className="text-right">

                                {service.price !==
                                null &&
                                service.price !==
                                undefined ? (
                                  <p className="text-lg font-semibold text-[#3f3f3f]">
                                    
                                    {
                                      service.price
                                    }
                                  </p>
                                ) : (
                                  <p className="text-sm font-medium text-[#3f3f3f]">
                                    Custom
                                  </p>
                                )}

                              </div>

                            </div>

                            {service.duration && (
                              <p className="mt-3 text-sm text-[#5a5a5a]">
                                Duration:{" "}
                                {
                                  service.duration
                                }
                              </p>
                            )}

                            {service.description && (
                              <p className="mt-2 text-sm leading-7 text-[#5a5a5a]">
                                {
                                  service.description
                                }
                              </p>
                            )}

                          </div>

                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            </div>

          </div>

          {/* ==========================================
              CUSTOMER DETAILS
          ========================================== */}

          <div className="rounded-[24px] border border-[#e7e4df] bg-white p-6">

            <h2 className="text-2xl font-semibold text-[#4a4a4a]">
              Your details
            </h2>

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-6 space-y-5"
            >

              {/* SELECTED SERVICE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[#4f4f4f]">
                  Selected service
                </label>

                <input
                  type="text"
                  value={
                    selectedService
                      ? selectedService.name
                      : ""
                  }
                  readOnly
                  placeholder="Choose a service from the left"
                  className="w-full rounded-xl border border-gray-300 bg-[#faf9f7] px-4 py-3 outline-none"
                />

              </div>

              {/* DATE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[#4f4f4f]">
                  Preferred date
                </label>

                <input
                  type="date"
                  min={
                    todayYMD()
                  }
                  value={
                    selectedDate
                  }
                  onChange={(
                    event
                  ) => {
                    setSelectedDate(
                      event.target.value
                    );

                    setSelectedTime(
                      ""
                    );

                    setSuccessMessage(
                      ""
                    );

                    setErrorMessage(
                      ""
                    );
                  }}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
                  required
                />

                <p className="mt-2 text-sm text-[#6a6a6a]">
                  Monday is normally
                  closed. Special Monday
                  openings will appear
                  automatically when
                  available.
                </p>

              </div>

              {/* TIME */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[#4f4f4f]">
                  Preferred time
                </label>

                <select
                  value={
                    selectedTime
                  }
                  onChange={(
                    event
                  ) =>
                    setSelectedTime(
                      event.target.value
                    )
                  }
                  disabled={
                    !selectedService ||
                    !selectedDate ||
                    loadingSlots ||
                    availableSlots.length ===
                      0
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  required
                >

                  <option value="">

                    {!selectedService
                      ? "Select a service first"
                      : !selectedDate
                      ? "Select a date first"
                      : loadingSlots
                      ? "Loading available times..."
                      : availableSlots.length ===
                        0
                      ? "No available times"
                      : "Select a time"}

                  </option>

                  {availableSlots.map(
                    (time) => (
                      <option
                        key={time}
                        value={time}
                      >
                        {formatTime(
                          time
                        )}
                      </option>
                    )
                  )}

                </select>

                {availabilityMessage && (
                  <p className="mt-2 text-sm text-[#6a6a6a]">
                    {
                      availabilityMessage
                    }
                  </p>
                )}

              </div>

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[#4f4f4f]">
                  Full name
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={
                    formData.fullName
                  }
                  onChange={
                    handleInputChange
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
                  required
                />

              </div>

              {/* PHONE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[#4f4f4f]">
                  Phone number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleInputChange
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
                  required
                />

              </div>

              {/* EMAIL */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[#4f4f4f]">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleInputChange
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
                  required
                />

              </div>

              {/* NOTES */}

              <div>

                <label className="mb-2 block text-sm font-medium text-[#4f4f4f]">
                  Notes
                </label>

                <textarea
                  rows="5"
                  name="notes"
                  value={
                    formData.notes
                  }
                  onChange={
                    handleInputChange
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none"
                  placeholder="Anything we should know"
                />

              </div>

              {/* ERROR */}

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {
                    errorMessage
                  }
                </div>
              )}

              {/* SUCCESS */}

              {successMessage && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {
                    successMessage
                  }
                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={
                  submitting ||
                  !selectedService ||
                  !selectedDate ||
                  !selectedTime
                }
                className="w-full rounded-xl bg-[#f2a482] px-6 py-4 text-lg font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting..."
                  : "Confirm Booking"}
              </button>

            </form>

          </div>

        </div>

      </div>

    </section>
  );
}
