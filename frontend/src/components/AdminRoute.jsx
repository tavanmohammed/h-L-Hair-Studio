// src/components/AdminRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState("checking"); // 'checking' | 'ok' | 'fail'
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("admintoken");
    if (!token) return setStatus("fail");

    (async () => {
      try {
        const r = await fetch(`${API}/api/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatus(r.ok ? "ok" : "fail");
        if (!r.ok) localStorage.removeItem("admintoken");
      } catch {
        localStorage.removeItem("admintoken");
        setStatus("fail");
      }
    })();
  }, []);

  if (status === "checking") return <div className="p-6">Checking access…</div>;
  if (status === "fail") {
    // send them to login and remember target (/admin)
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }
  return children;
}
