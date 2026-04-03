import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png"; // change file name if needed

function IconMenu(props) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/services", label: "Services" },
    { path: "/booking", label: "Booking" },
  ];

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                <img
                  src={logo}
                  alt="H&L Hair Studio Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1
                  className="text-lg sm:text-xl text-gray-900 tracking-[0.2em] uppercase"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  H&L Hair Studio
                </h1>
                <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase">
                  Beauty • Hair • Care
                </p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-sm font-medium transition ${
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden md:block">
              <Link
                to="/booking"
                className="px-6 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition"
              >
                Book Now
              </Link>
            </div>

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 text-gray-700"
            >
              {open ? <IconX /> : <IconMenu />}
            </button>
          </div>
        </div>

        <div className={`md:hidden transition-all ${open ? "max-h-96" : "max-h-0 overflow-hidden"}`}>
          <div className="px-4 pb-5 border-t border-gray-200 bg-white">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className="block text-center py-3 text-gray-700 hover:text-black"
              >
                {link.label}
              </NavLink>
            ))}

            <Link
              to="/booking"
              onClick={() => setOpen(false)}
              className="block mt-3 text-center py-3 bg-gray-900 text-white rounded-xl"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}