import React from "react";
import { servicesData } from "../data/servicesData";

function Section({ title, items, showImages = true }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-semibold mb-6">{title}</h2>

      <div
        className={`grid ${
          showImages ? "md:grid-cols-3" : "md:grid-cols-2"
        } gap-8`}
      >
        {items.map((s) => (
          <div
            key={s.id}
            className="border border-black/10 rounded-2xl overflow-hidden bg-white hover:shadow-lg transition"
          >
            {showImages && (
              <img
                src={s.img}
                alt={s.name}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
            )}

            <div className="p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{s.name}</h3>
              <span className="text-base font-medium">{s.price}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Services() {
  return (
    <>
      <div className="max-w-6xl mx-auto px-6 pt-10">
        <h1 className="text-4xl font-semibold">Our Services</h1>
        <p className="text-black/60 mt-2">
          Explore professional services for women, men, and aesthetics.
        </p>
      </div>

      {/* Women’s Services */}
      <Section title="Women’s Services" items={servicesData.women} showImages={true} />

      {/* Men’s Services */}
      <Section title="Men’s Services" items={servicesData.men} showImages={true} />

      {/* Aesthetic Services (no images) */}
      <Section title="Aesthetic Services" items={servicesData.aesthetic} showImages={false} />
    </>
  );
}
