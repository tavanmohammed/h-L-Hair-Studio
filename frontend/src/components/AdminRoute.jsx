import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("admintoken"); // <-- must match your login

  if (!token) {
    // send them to login and remember where they were heading
    return <Navigate to="/admin-login" replace state={{ from: location }} />;
  }
  return children;
}
