// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Reviews from "../components/Reviews";
import Footer from "../components/Footer";

// Assets
import bg from "../assets/background.jpg";
import heshuBg from "../assets/background-heshu.png";
import womenHaircut from "../assets/work2.png";
import menHaircut from "../assets/men.jpg";
import waxingEyebrows from "../assets/waxing.png";
import kids from "../assets/kids2.jpg";
import work1 from "../assets/work1.png";
import work2 from "../assets/work2.png";
import work3 from "../assets/work3.png";
import work4 from "../assets/work4.png";
import work5 from "../assets/work5.png";
import work6 from "../assets/work6.png";

/* ---------------------- Fade in/out Offer Rotator ---------------------- */
function OfferRotator({ slides = [], visibleMs = 2200, hiddenMs = 500 }) {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    let t1 = setTimeout(() => setShow(false), visibleMs);
    let t2 = setTimeout(() => {
      setI((p) => (p + 1) % slides.length);
      setShow(true);
    }, visibleMs + hiddenMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [i, slides.length, visibleMs, hiddenMs]);

  return (
    <div className="relative w-full flex justify-center">
      <div
        aria-live="polite"
        className={`transition-opacity duration-300 ${
          show ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="inline-block rounded-full bg-black/70 text-white px-3 py-1 text-sm sm:text-base">
          {slides[i]}
        </span>
      </div>
    </div>
  );
}

/* -------------------------- Minimal swipe slider -------------------------- */
function useSwipe({ onSwipe }) {
  const startX = useRef(null);
  const startY = useRef(null);
  const isDown = useRef(false);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    startX.current = t.clientX;
    startY.current = t.clientY;
  };

  const onTouchMove = (e) => {
    if (startX.current == null) return;
    const t = e.touches[0];
    const dx = t.clientX - startX.current;
    const dy = t.clientY - startY.current;

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      onSwipe(dx > 0 ? "right" : "left");
      startX.current = null;
      startY.current = null;
    }
  };

  const onMouseDown = (e) => {
    isDown.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
  };

  const onMouseUp = (e) => {
    if (!isDown.current) return;
    isDown.current = false;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      onSwipe(dx > 0 ? "right" : "left");
    }

    startX.current = null;
    startY.current = null;
  };

  const onMouseLeave = () => {
    isDown.current = false;
    startX.current = null;
    startY.current = null;
  };

  return { onTouchStart, onTouchMove, onMouseDown, onMouseUp, onMouseLeave };
}

/* ------------------------------ Slider ------------------------------ */
function Slider({ items, aspect = "aspect-[4/3]" }) {
  const [idx, setIdx] = useState(0);
  const wrap = (i) => (i + items.length) % items.length;
  const go = (dir) => setIdx((i) => wrap(i + (dir === "left" ? 1 : -1)));
  const swipe = useSwipe({ onSwipe: go });
  const railRef = useRef(null);

  useEffect(() => {
    if (railRef.current) {
      railRef.current.style.transform = `translateX(-${idx * 100}%)`;
    }
  }, [idx]);

  // Rotate work1 and work2 → left (-90°)
  const rotateClass = (src) => {
    if (src === work1) return "rotate-[270deg]";
    if (src === work2) return "-rotate-180";
    return "";
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl bg-neutral-100"
      role="region"
      aria-roledescription="carousel"
      aria-label="Work gallery"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go("right");
        if (e.key === "ArrowRight") go("left");
      }}
      {...swipe}
    >
      <div
        ref={railRef}
        className="flex transition-transform duration-300 ease-out"
      >
        {items.map((src, i) => (
          <div key={i} className={`w-full shrink-0 ${aspect} bg-white`}>
            <img
              src={src}
              alt={`Style ${i + 1}`}
              className={`w-full h-full object-contain ${rotateClass(src)}`}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => go("right")}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-3 bg-white/85 shadow"
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        onClick={() => go("left")}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-3 bg-white/85 shadow"
        aria-label="Next"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full ${
              i === idx ? "bg-black" : "bg-black/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ----------------------- WORK IMAGES ----------------------- */
const workImages = [work1, work2, work3, work4, work5, work6];

/* ------------------------------ MAIN PAGE ------------------------------ */

export default function Home() {
  return (
    <main className="min-h-dvh w-full bg-white text-neutral-900">
      {/* HERO */}
      <section className="relative w-full">
        <div className="w-full aspect-[16/11] sm:aspect-[16/8] lg:aspect-[16/6] overflow-hidden">
          <img
            src={bg}
            alt="Salon background"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-4 pb-10 sm:pb-16">
          <h1 className="text-white text-3xl sm:text-5xl font-semibold leading-tight drop-shadow-lg">
            Refresh Your Look, <br /> Rediscover Your Confidence
          </h1>

          <div className="mt-4">
            <OfferRotator
              slides={[
                "5% first hair cut",
                "10% senior haircut every Wednesday",
              ]}
              visibleMs={2200}
              hiddenMs={500}
            />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-screen-xl px-4 sm:px-8 md:px-12 py-6 sm:py-8">
        <h2 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-4">
          Our Services
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { img: womenHaircut, label: "Women" },
            { img: menHaircut, label: "Men" },
            { img: kids, label: "Kids" },
            { img: waxingEyebrows, label: "Waxing" },
          ].map((c, idx) => (
            <Link
              key={idx}
              to="/services"
              className="group rounded-xl border border-neutral-200 overflow-hidden bg-white active:scale-[.99]"
            >
              <div className="w-full aspect-[4/3] bg-neutral-100">
                <img
                  src={c.img}
                  alt={c.label}
                  className={`w-full h-full object-cover ${
                    idx === 0 ? "-rotate-180" : ""
                  }`}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="p-2 text-center text-sm sm:text-base">
                <span className="font-medium">{c.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* OUR WORK */}
      <section className="mx-auto max-w-screen-xl px-4 sm:px-8 md:px-12 pb-6 sm:pb-10">
        <h2 className="text-lg sm:text-2xl font-semibold mb-3">Our Work</h2>
        <Slider items={workImages} aspect="aspect-[4/3]" />
      </section>

      {/* BOOK WITH HESHW */}
      <section className="relative w-full px-4 sm:px-8 md:px-12 mb-6 sm:mb-10">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="w-full aspect-[16/10] sm:aspect-[16/7] lg:aspect-[16/6]">
            <img
              src={heshuBg}
              alt="Book with Heshw"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-black/25 to-transparent" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-white text-2xl sm:text-3xl font-semibold drop-shadow">
              Book with Heshw
            </h2>
            <p className="mt-2 text-white/90 text-sm sm:text-base max-w-md drop-shadow">
              Precision cuts and styles. Limited slots available this week.
            </p>
            <Link
              to="/booking?stylist=heshw"
              className="pointer-events-auto mt-3 inline-block rounded-lg bg-white text-black px-4 py-2 text-sm shadow active:scale-[.99]"
            >
              Book with Heshw
            </Link>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-screen-xl px-4 sm:px-8 md:px-12 pb-8">
        <Reviews />
      </section>
    </main>
  );
}
