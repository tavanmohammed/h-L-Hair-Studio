import React from "react";
import { Link } from "react-router-dom";

export default function StylistHeshw() {
  return (
    <main className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-10 items-start">
      <div className="order-2 md:order-1">
        <h1 className="text-4xl font-semibold mb-4">Hair by Heshw</h1>
        <p className="text-neutral-700 mb-4">
  Heshw is a professional hair stylist with over <b>10 years of experience</b>
  in men’s and women’s hair cutting. Known for precision fades, layered cuts,
  and shaping techniques that match each client’s features and style.
</p>
<p className="text-neutral-700 mb-4">
  <b>Specialties:</b> skin fades, classic tapers, textured cuts, kids’ haircuts,
  beard shaping, and style finishing.
</p>
<p className="text-neutral-700 mb-4">
  <b>Approach:</b> every session begins with a detailed consultation to understand
  your look, lifestyle, and hair type — ensuring you leave with a fresh, clean,
  and confident style.
</p>
<p className="text-neutral-700 mb-6">
  <b>Philosophy:</b> sharp cuts, attention to detail, and a relaxed experience
  that makes every client feel their best.
</p>


        <div className="flex flex-wrap gap-3">
          <Link to="/book" className="bg-black text-white px-6 py-3 rounded-lg hover:opacity-80">
            Book with Heshw
          </Link>
          <Link to="/services" className="border border-black px-6 py-3 rounded-lg hover:bg-black hover:text-white">
            View Services
          </Link>
        </div>
      </div>

      <div className="order-1 md:order-2">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop"
          alt="Heshw, senior stylist"
          className="w-full h-[480px] object-cover rounded-2xl"
          loading="lazy"
        />
      </div>
    </main>
  );
}
