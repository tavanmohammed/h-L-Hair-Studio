import React from "react";
import { Link } from "react-router-dom";
import heshuImg from "../assets/background-heshu.png"; 

export default function BookWithHeshu() {
  return (
    <div
      className="relative rounded-[32px] overflow-hidden min-h-[400px] flex items-center justify-center text-center"
      style={{
        backgroundImage: `url(${heshuImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* CONTENT */}
      <div className="relative z-10 px-6 max-w-2xl text-white">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-300">
          Book With Heshu
        </p>

        <h2
          className="text-3xl md:text-4xl mt-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Your Personal Styling Experience
        </h2>

        <p className="mt-4 text-gray-200 leading-7">
          Book directly with Heshu for a personalized experience in hair,
          beauty, and styling tailored to your unique look.
        </p>

        <Link
          to="/booking"
          className="inline-block mt-6 px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}