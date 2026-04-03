import React from "react";
import { useNavigate } from "react-router-dom";
import { servicesData } from "../data/servicesData";
import backgroundImage from "../assets/coloring1.jpg";

const CATEGORIES = [
  { label: "Women",     href: "#women" },
  { label: "Men",       href: "#men" },
  { label: "Waxing",    href: "#waxing" },
  { label: "Coloring",  href: "#coloring" },
  { label: "Nails",     href: "#nails" },
  { label: "Aesthetic", href: "#aesthetic" },
];

const STATS = [
  { value: "6",        label: "Categories" },
  { value: "40+",      label: "Services" },
  { value: "Tue–Sun",  label: "Open" },
  { value: "Walk-ins", label: "Welcome" },
];

function Section({ id, title, items = [], showImages = true }) {
  const navigate = useNavigate();

  if (!items.length) return null;

  return (
    <section id={id} className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
        <div className="w-16 h-1 bg-pink-500 mx-auto mt-3 rounded-full"></div>
      </div>

      <div className={`grid ${showImages ? "sm:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"} gap-10`}>
        {items.map((s) => (
          <div
            key={s.id}
            className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300"
          >
            {showImages && s.img && (
              <div className="relative h-72 overflow-hidden">
                <img
                  src={s.img}
                  alt={s.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
                <div className="absolute bottom-0 p-5 text-white w-full">
                  <h3 className="text-xl font-semibold">{s.name}</h3>
                  <p className="text-sm opacity-80">{s.price}</p>
                </div>
              </div>
            )}

            {!showImages && (
              <div className="p-6 bg-white rounded-3xl border border-gray-100">
                <h3 className="text-lg font-semibold">{s.name}</h3>
                <p className="text-pink-600 font-bold mt-2">{s.price}</p>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => navigate("/booking")}
                className="bg-white text-black px-6 py-2 rounded-full font-medium shadow-lg hover:bg-pink-500 hover:text-white transition"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Services() {
  return (
    <div className="bg-white min-h-screen">

      {/* HERO */}
      <div className="relative text-center px-6 py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs text-white tracking-widest uppercase mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 inline-block" />
            H&amp;L Hair Studio
          </div>

          <h1 className="text-5xl md:text-6xl font-medium text-white tracking-tight leading-tight mb-5">
            Our services
          </h1>

          <p className="text-base text-white/70 leading-relaxed mb-9 max-w-sm mx-auto">
            Premium beauty services crafted to elevate your confidence and style.
          </p>

          <div className="flex flex-wrap gap-2.5 justify-center">
            {CATEGORIES.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" })}
                className="px-5 py-2 rounded-full border border-white/40 text-sm text-white hover:bg-white hover:text-gray-900 transition"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="flex border-t border-b border-gray-100 overflow-x-auto">
        {STATS.map(({ value, label }, i) => (
          <div
            key={label}
            className={`flex-1 min-w-[120px] py-5 text-center ${i < STATS.length - 1 ? "border-r border-gray-100" : ""}`}
          >
            <div className="text-xl font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* SECTIONS */}
      <div className="pt-6">
        <Section id="women"     title="Women's Services"           items={servicesData.women} />
        <Section id="men"       title="Men's Services"             items={servicesData.men} />
        <Section id="waxing"    title="Waxing Services"            items={servicesData.waxing} />
        <Section id="coloring"  title="Hair Coloring & Treatments" items={servicesData.coloring} />
        <Section id="nails"     title="Nail Services"              items={servicesData.nails} />
        <Section id="aesthetic" title="Aesthetic Services"         items={servicesData.aesthetic} showImages={false} />
      </div>
    </div>
  );
}