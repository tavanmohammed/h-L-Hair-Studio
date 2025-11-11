import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-neutral-100 pt-14">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-4 gap-10">
        {/* Brand / Social */}
        <div>
          <div className="text-2xl font-semibold">H&L Hair Studio</div>
          <p className="text-sm text-neutral-600 mt-2">Scarborough • Toronto</p>

          <div className="flex items-center gap-4 mt-6">
            {/* Simple icon SVGs */}
            <a href="#" aria-label="Instagram" className="p-2 rounded-full border hover:bg-black hover:text-white">
              {/* Instagram icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a5.5 5.5 0 1 1 0 11.001A5.5 5.5 0 0 1 12 7.5zm0 2a3.5 3.5 0 1 0 .001 7.001A3.5 3.5 0 0 0 12 9.5zM18 6.2a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>
            </a>
            <a href="#" aria-label="TikTok" className="p-2 rounded-full border hover:bg-black hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c1 2 2 3 4 3v3c-2 0-3-.6-4-1.7V15a6 6 0 1 1-6-6h1v3h-1a3 3 0 1 0 3 3V3h3z"/></svg>
            </a>
            <a href="#" aria-label="YouTube" className="p-2 rounded-full border hover:bg-black hover:text-white">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.5v9a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3zM10 9v6l6-3-6-3z"/></svg>
            </a>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Explore</h4>
          <ul className="space-y-2">
            <li><Link to="/book" className="hover:underline">Book</Link></li>
            <li><Link to="/services" className="hover:underline">Services</Link></li>
            <li><Link to="/services" className="hover:underline">Pricing</Link></li>
            <li><Link to="/stylist/heshw" className="hover:underline">Stylists</Link></li>
          </ul>
        </div>

        {/* Location / Hours / Contact */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Location</h4>
          <p>Unit #9 4385 Sheppard Ave E<br/>Scarborough, ON M1S 1T8</p>

          <h4 className="text-xl font-semibold mt-6 mb-2">Hours</h4>
          <p>Mon – Fri 10 AM – 6 PM<br/>Sat & Sun 9 AM – 7 PM<br/></p>

          <h4 className="text-xl font-semibold mt-6 mb-2">Contact</h4>
          <p>
            <a href="tel:16478894197" className="underline">4372213737</a>
          </p>
        </div>

        {/* Map */}
        <div>
          <iframe
            title="H&L Hair Studio map"
            className="w-full h-56 border-0 rounded-xl"
            src="https://www.google.com/maps?q=4385%20Sheppard%20Ave%20E%2C%20Scarborough%2C%20ON%20M1S%201T8&output=embed"
            loading="lazy"
          />
        </div>
      </div>

      <div className="text-center text-sm text-neutral-600 py-6 border-t mt-10">
        Designed by You • Powered by React • © {new Date().getFullYear()} H&L Hair Studio – All rights reserved.
      </div>
    </footer>
  );
}
