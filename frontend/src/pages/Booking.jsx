import BookingForm from "../components/BookingForm";
import { servicesData } from "../data/servicesData";

export default function Booking() {
  const mainCategories = [
    {
      key: "women",
      label: "Women",
      items: servicesData.women,
    },
    {
      key: "men",
      label: "Men",
      items: servicesData.men,
    },
    {
      key: "waxing",
      label: "Waxing",
      items: servicesData.waxing,
    },
    {
      key: "coloring",
      label: "Coloring",
      items: servicesData.coloring,
    },
  ];

  const nailsCategories = [
    {
      key: "nails",
      label: "Nails",
      items: servicesData.nails,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-3xl mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-medium">
          Booking
        </p>

        <h1
          className="mt-4 text-4xl sm:text-5xl text-gray-900 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Book Your Appointment
        </h1>

        <p className="mt-4 text-gray-600 leading-7 text-sm sm:text-base">
          Book your beauty services below. Nail appointments are booked
          separately because they are handled by a different specialist with
          different working hours.
        </p>
      </div>

      <div className="space-y-8">
        <BookingForm
          title="Hair, Waxing & Coloring"
          subtitle="Choose from women’s, men’s, waxing, and coloring services."
          categories={mainCategories}
          bookingType="regular"
          hoursLabel="Tue–Sat 11:00–19:00 · Sun 11:00–17:00"
        />

        <BookingForm
          title="Nail Booking"

          categories={nailsCategories}
          bookingType="nails"

        />
      </div>
    </section>
  );
}