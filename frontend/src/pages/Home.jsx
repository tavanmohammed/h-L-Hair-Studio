import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BookWithHeshu from "../components/BookWithHeshu";
import Reviews from "../components/Reviews";

import heroImg1 from "../assets/hero.jpg";
import heroImg2 from "../assets/background.jpg";
import heroImg3 from "../assets/about.jpeg";

import aboutImg from "../assets/about.jpeg";

import womenHaircut from "../assets/women-cut.jpeg";
import menHaircut from "../assets/men.jpg";
import waxingImg from "../assets/waxing.jpg";
import nailImg from "../assets/nail.jpg";
import coloringImg from "../assets/coloring.jpg";

import work1 from "../assets/work1.jpeg";
import work2 from "../assets/work7.png";
import work3 from "../assets/work1.png";
import work4 from "../assets/work8.jpeg";
import work5 from "../assets/work3.png";
import work6 from "../assets/work4.png";
import work7 from "../assets/work5.png";
import work8 from "../assets/work9.jpeg";
import work9 from "../assets/work10.jpeg";
import work10 from "../assets/work11.jpeg";
import work11 from "../assets/work12.jpeg";
import work12 from "../assets/work13.jpeg";


function SectionHeading({ tag, title, text, align = "center" }) {
  return (
    <div
      className={`${
        align === "center"
          ? "max-w-3xl mx-auto text-center"
          : "max-w-3xl text-left"
      }`}
    >
      <p className="text-[11px] sm:text-sm uppercase tracking-[0.28em] sm:tracking-[0.35em] text-gray-500 font-medium">
        {tag}
      </p>

      <h2
        className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl text-gray-900 leading-tight"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h2>

      {text && (
        <p className="mt-4 sm:mt-5 text-gray-600 leading-7 sm:leading-8 text-sm sm:text-base">
          {text}
        </p>
      )}
    </div>
  );
}

function ServiceCard({ image, title, text }) {
  return (
    <div className="group overflow-hidden rounded-[24px] sm:rounded-[30px] border border-gray-200 bg-white shadow-sm hover:shadow-2xl transition duration-300">
      <div className="relative h-64 sm:h-72 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          {title}
        </h3>
        <p className="mt-3 text-sm sm:text-base text-gray-600 leading-7">
          {text}
        </p>

        <Link
          to="/services"
          className="inline-flex items-center mt-5 text-sm font-semibold text-gray-900 hover:text-gray-600 transition"
        >
          Explore More
          <span className="ml-2">→</span>
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const slides = [
    {
      image: heroImg3,
      subtitle: "Modern Beauty Experience",
      title: "Refresh Your Look With Confidence",
      text: "Enjoy polished results, relaxing appointments, and a beauty experience that feels elevated from start to finish.",
      offer: "Tuesday Hair Cut from $15",
    },
    {
      image: heroImg1,
      subtitle: "Modern Beauty Experience",
      title: "Refresh Your Look With Confidence",
      text: "Enjoy polished results, relaxing appointments, and a beauty experience that feels elevated from start to finish.",
      offer: "Haircut + Highlight + Root Touch — 15% off",
    },
    {
      image: heroImg2,
      subtitle: "Personalized Care",
      title: "A Look Designed Around You",
      text: "From fresh cuts to premium beauty treatments, every detail is tailored to your style and comfort.",
      offer: "Wash & Blow Dry from $35",
    },
    
   
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="bg-[#f8f8f6] text-gray-900 overflow-hidden">
      <style>{`
        @keyframes fadeZoom {
          0% { opacity: 0; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes riseIn {
          0% { opacity: 0; transform: translateY(28px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .hero-image-animate {
          animation: fadeZoom 1s ease;
        }

        .hero-text-animate {
          animation: riseIn 0.8s ease;
        }
      `}</style>

      {/* HERO */}
      <section className="relative min-h-screen">
        <div className="relative min-h-screen w-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                activeSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover ${
                  activeSlide === index ? "hero-image-animate" : ""
                }`}
              />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
            </div>
          ))}

          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 min-h-screen flex items-center py-24 sm:py-28">
            <div className="max-w-3xl text-white hero-text-animate">
              <div className="inline-flex max-w-full items-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-3 sm:px-4 py-2 text-[10px] sm:text-sm uppercase tracking-[0.22em] sm:tracking-[0.3em]">
                {slides[activeSlide].subtitle}
              </div>

              <h1
                className="mt-5 text-4xl sm:text-5xl lg:text-7xl leading-[1.05]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {slides[activeSlide].title}
              </h1>

              <p className="mt-5 text-sm sm:text-lg leading-7 sm:leading-8 text-gray-100 max-w-2xl">
                {slides[activeSlide].text}
              </p>

          
            </div>
          </div>

          {/* OFFER CARD */}
          <div className="absolute z-30 left-4 right-4 bottom-20 sm:bottom-8 sm:left-auto sm:right-10 lg:right-14 sm:max-w-[320px]">
            <div className="bg-white border border-gray-200 rounded-[22px] sm:rounded-[28px] p-4 sm:p-6 shadow-2xl">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-gray-500 font-medium">
                Special Offer
              </p>

              <h3
                className="mt-2 sm:mt-3 text-xl sm:text-2xl text-gray-900 leading-snug"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {slides[activeSlide].offer}
              </h3>

              <p className="mt-2 sm:mt-3 text-sm text-gray-600 leading-6">
                Book your next visit and enjoy expert beauty services in a calm,
                stylish, and welcoming space.
              </p>

              <Link
                to="/booking"
                className="inline-flex mt-4 sm:mt-5 w-full sm:w-auto items-center justify-center rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition"
              >
                Book Now
              </Link>
            </div>
          </div>

          {/* DOTS */}
          <div className="absolute z-30 bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 sm:h-3 rounded-full transition-all duration-300 ${
                  activeSlide === index
                    ? "w-8 sm:w-10 bg-white"
                    : "w-2.5 sm:w-3 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

     {/* ABOUT US */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
  <div className="grid lg:grid-cols-2 gap-10 sm:gap-14 items-center">
    
    {/* IMAGE */}
    <div className="relative">
      <div className="w-full h-[300px] sm:h-[500px] flex items-center justify-center bg-white rounded-[28px] shadow-lg">
        <img
          src={aboutImg}
          alt="H&L Hair Studio"
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* EXPERIENCE BADGE */}
      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-xl shadow border text-sm font-medium text-gray-900">
        10+ Years Experience
      </div>
    </div>

    {/* TEXT */}
    <div>
      <SectionHeading
        tag="About Us"
        title="10+ Years of Beauty & Style"
        align="left"
      />

      <p className="mt-4 text-gray-600 text-sm sm:text-base leading-7">
        At H&amp;L Hair Studio, we offer professional hair, beauty, and grooming
        services in a welcoming and modern space.
      </p>

      <p className="mt-3 text-gray-600 text-sm sm:text-base leading-7">
        With over 10 years of experience, we focus on quality, detail, and helping
        you feel confident every time you visit.
      </p>
    </div>
  </div>
</section>

      {/* SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <SectionHeading
          tag="Services"
          title="Our Beauty Services"
          text="Explore our range of professional hair, beauty, and grooming services."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 sm:gap-8 mt-10 sm:mt-12">
          <ServiceCard
            image={womenHaircut}
            title="Women’s Hair"
            text="Haircuts, wash and blow dry, styling, and personalized beauty services."
          />
          <ServiceCard
            image={menHaircut}
            title="Men’s Grooming"
            text="Clean cuts, fades, beard trims, and polished grooming services."
          />
          <ServiceCard
            image={waxingImg}
            title="Waxing"
            text="Smooth, clean face and body waxing services in a comfortable setting."
          />
          <ServiceCard
            image={coloringImg}
            title="Coloring"
            text="Highlights, balayage, root touch-up, glaze color, and conditioning treatments."
          />
          <ServiceCard
            image={nailImg}
            title="Nail Services"
            text="Manicures, pedicures, gel services, and beautiful nail designs."
          />
        </div>

        <div className="text-center mt-10">
          <Link
            to="/services"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-gray-900 px-7 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 transition"
          >
            View Full Services Page
          </Link>
        </div>
      </section>

      {/* OUR WORK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <SectionHeading
          tag="Our Work"
          title="Work By Our Stylists"
          text="Real transformations and styles created by our talented team."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 mt-10 sm:mt-12">
          {[
            { img: work1, stylist: "Styled by Heshu" },
            { img: work2, stylist: "Styled by Heshu" },
            { img: work3, stylist: "Styled by Heshu" },
            { img: work4, stylist: "Styled by Heshu" },
            { img: work5, stylist: "Styled by Heshu" },
            { img: work6, stylist: "Styled by Heshu" },
            { img: work7, stylist: "Styled by Heshu" },
            { img: work8, stylist: "Styled by Heshu" },
            { img: work9, stylist: "Styled by Heshu" },
            { img: work10, stylist: "Styled by Heshu" },
            { img: work11, stylist: "Styled by Heshu" },
            { img: work12, stylist: "Styled by Heshu" },
            
          ].map((item, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl sm:rounded-[28px]"
            >
              <img
                src={item.img}
                alt="Stylist work"
                className="w-full h-44 sm:h-60 lg:h-72 object-cover transition duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition duration-300" />

              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 opacity-0 group-hover:opacity-100 transition duration-300">
                <p className="text-white text-sm font-semibold">
                  {item.stylist}
                </p>
                <p className="text-white/80 text-xs">
                  H&amp;L Hair Studio
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOOK WITH HESHU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <BookWithHeshu />
      </section>

      {/* REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <Reviews />
      </section>

      {/* FOOTER */}
      <footer className="mt-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            <div>
              <h3
                className="text-2xl text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                H&amp;L Hair Studio
              </h3>
              <p className="mt-4 text-sm sm:text-base text-gray-600 leading-7">
                Beauty, hair, nails, and self-care services designed to help you
                feel confident every time you visit.
              </p>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-500 font-medium">
                Quick Links
              </h4>
              <div className="mt-4 flex flex-col gap-3 text-sm sm:text-base text-gray-700">
                <Link to="/" className="hover:text-gray-900 transition">
                  Home
                </Link>
                <Link to="/about" className="hover:text-gray-900 transition">
                  About
                </Link>
                <Link to="/services" className="hover:text-gray-900 transition">
                  Services
                </Link>
                <Link to="/booking" className="hover:text-gray-900 transition">
                  Booking
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-500 font-medium">
                Services
              </h4>
              <div className="mt-4 flex flex-col gap-3 text-sm sm:text-base text-gray-700">
                <p>Hair Styling</p>
                <p>Hair Coloring</p>
                <p>Waxing</p>
                <p>Nails</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-500 font-medium">
                Contact
              </h4>
              <div className="mt-4 flex flex-col gap-3 text-sm sm:text-base text-gray-700">
                <p>Book your appointment today</p>
                <Link
                  to="/booking"
                  className="inline-flex w-full sm:w-fit items-center justify-center rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 sm:mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-gray-500">
              © {new Date().getFullYear()} H&amp;L Hair Studio. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Designed for a modern beauty experience.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
