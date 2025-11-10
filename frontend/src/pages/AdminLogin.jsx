// src/pages/AdminLogin.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AdminLogin() {
  const nav = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  // If already authed, go to /admin immediately
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("admintoken");
      if (!token) return;
      try {
        const r = await fetch(`${API}/api/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.ok) nav("/admin", { replace: true });
      } catch {}
    })();
  }, [nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    try {
      // if you're using the password-only flow
      const r = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      // OR if you're using email+password:
      // const r = await fetch(`${API}/api/admin/login`, { ... })

      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("admintoken", data.token);

      const target = location.state?.from?.pathname || "/admin";
      nav(target, { replace: true });
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Admin Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="password"
          className="border rounded p-3 w-full"
          placeholder="Admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="bg-black text-white px-4 py-2 rounded w-full">
          Sign in
        </button>
      </form>
      {msg && <div className="text-red-600 text-sm">{msg}</div>}
    </div>
  );
}
