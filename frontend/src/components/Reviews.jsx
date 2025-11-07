import React, { useState } from "react";

const testimonials = [
  {
    id: 1,
    name: "Kimm Pinkney",
    rating: 5,
    text:
      "Heshw was amazing! I came in for a women’s haircut and left feeling so confident. The layers were blended perfectly and the style lasted all week. Highly recommend!",
    avatar: "https://i.pravatar.cc/80?img=5",
  },
  {
    id: 2,
    name: "Michael A.",
    rating: 5,
    text:
      "Best men’s cut I’ve had in years. The fade was flawless, and the attention to detail was next-level. Quick, friendly, and professional service every single time.",
    avatar: "https://i.pravatar.cc/80?img=12",
  },
  {
    id: 3,
    name: "Sara L.",
    rating: 5,
    text:
      "I absolutely love my new haircut! It’s stylish but easy to manage. The salon was spotless and welcoming, and the stylist really listened to what I wanted.",
    avatar: "https://i.pravatar.cc/80?img=32",
  },
  {
    id: 4,
    name: "David K.",
    rating: 5,
    text:
      "Clean fade, sharp edges, and exactly the look I wanted. Heshw is consistent every visit — I always walk out looking fresh and confident.",
    avatar: "https://i.pravatar.cc/80?img=24",
  },
  {
    id: 5,
    name: "Rachel M.",
    rating: 5,
    text:
      "I booked for a trim and style, and it turned out amazing. The stylist took her time and made sure everything was perfect. My hair feels lighter and healthier!",
    avatar: "https://i.pravatar.cc/80?img=45",
  },
];

export default function Reviews() {
  const [i, setI] = useState(0);
  const next = () => setI((i + 1) % testimonials.length);
  const prev = () => setI((i - 1 + testimonials.length) % testimonials.length);

  const t = testimonials[i];

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-semibold text-center mb-10">Testimonials</h2>

      <div className="relative">
        {/* Left button */}
        <button
          onClick={prev}
          className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full w-9 h-9 border border-black/10 bg-white hover:bg-black hover:text-white"
          aria-label="Previous review"
        >
          ‹
        </button>

        {/* Review card */}
        <div className="bg-neutral-100 rounded-2xl p-8 md:p-12 text-center">
          <img
            src={t.avatar}
            alt={t.name}
            className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
            loading="lazy"
          />
          <div className="font-semibold text-lg mb-1">{t.name}</div>

          <div className="mb-4" aria-label={`${t.rating} stars`}>
            {"★".repeat(t.rating)}{" "}
            <span className="text-neutral-400">
              {"★".repeat(5 - t.rating)}
            </span>
          </div>

          <p className="text-neutral-700 max-w-3xl mx-auto text-base leading-relaxed">
            {t.text}
          </p>
        </div>

        {/* Right button */}
        <button
          onClick={next}
          className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full w-9 h-9 border border-black/10 bg-white hover:bg-black hover:text-white"
          aria-label="Next review"
        >
          ›
        </button>
      </div>
    </section>
  );
}
