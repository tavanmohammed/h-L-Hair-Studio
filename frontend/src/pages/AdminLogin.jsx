import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  // If already logged in, go to admin
  useEffect(() => {
    if (localStorage.getItem("admintoken")) navigate("/admin", { replace: true });
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("Invalid password");
      const data = await res.json(); // { token: "..." }
      localStorage.setItem("admintoken", data.token);

      // go back to where they wanted, else /admin
      const to = location.state?.from?.pathname || "/admin";
      navigate(to, { replace: true });
    } catch (err) {
      setMsg(err.message || "Login failed");
    }
  }

  return (
    <div className="max-w-md mx-auto py-16">
      <h1 className="text-2xl font-semibold mb-6">Admin Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Admin password"
          className="w-full border rounded p-3"
          autoComplete="current-password"
          required
        />
        <button className="w-full rounded bg-black text-white py-3">Sign in</button>
      </form>
      {msg && <p className="text-red-600 mt-3">{msg}</p>}
    </div>
  );
}
