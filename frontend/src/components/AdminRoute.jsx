import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("admintoken");
  if (!token) return <Navigate to="/admin-login" replace />;
  return children;
}

