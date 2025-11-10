// src/App.jsx
import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";
import Booking from "./pages/Booking.jsx";
import StylistHeshw from "./pages/StylistHeshw.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-6">Loading…</div>}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/stylist/heshw" element={<StylistHeshw />} />

            {/* Auth */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />

            {/* 404 → home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
