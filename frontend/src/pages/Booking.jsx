import BookingForm from "../components/BookingForm.jsx";

export default function Booking() {
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
        <BookingForm />
      </div>
    </main>
  );
}
