import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

export function RequireAuth({ children }) {
  const { firebaseUser, loading, employee, isAdmin, authError } = useAuth();
  if (loading) return <Loader />;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (!isAdmin && !employee) return <Navigate to="/login" replace state={{ error: authError }} />;
  return children;
}

export function RequireAdmin({ children }) {
  const { loading, isAdmin } = useAuth();
  if (loading) return <Loader />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}
