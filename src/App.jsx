import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { RequireAuth, RequireAdmin } from "./components/ProtectedRoute.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Loader from "./components/Loader.jsx";

import Login from "./pages/Login.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import MyReports from "./pages/MyReports.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import Packages from "./pages/Packages.jsx";
import Notifications from "./pages/Notifications.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import Employees from "./pages/admin/Employees.jsx";
import AllReports from "./pages/admin/AllReports.jsx";
import SalesReport from "./pages/admin/SalesReport.jsx";
import SendNotification from "./pages/admin/SendNotification.jsx";

function Shell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">{children}</div>
    </div>
  );
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <Loader />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<RequireAuth><Shell><EmployeeDashboard /></Shell></RequireAuth>} />
      <Route path="/reports" element={<RequireAuth><Shell><MyReports /></Shell></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Shell><MyProfile /></Shell></RequireAuth>} />
      <Route path="/packages" element={<RequireAuth><Shell><Packages /></Shell></RequireAuth>} />
      <Route path="/notifications" element={<RequireAuth><Shell><Notifications /></Shell></RequireAuth>} />

      <Route path="/admin" element={<RequireAuth><RequireAdmin><Shell><AdminDashboard /></Shell></RequireAdmin></RequireAuth>} />
      <Route path="/admin/employees" element={<RequireAuth><RequireAdmin><Shell><Employees /></Shell></RequireAdmin></RequireAuth>} />
      <Route path="/admin/reports" element={<RequireAuth><RequireAdmin><Shell><AllReports /></Shell></RequireAdmin></RequireAuth>} />
      <Route path="/admin/sales" element={<RequireAuth><RequireAdmin><Shell><SalesReport /></Shell></RequireAdmin></RequireAuth>} />
      <Route path="/admin/notifications" element={<RequireAuth><RequireAdmin><Shell><SendNotification /></Shell></RequireAdmin></RequireAuth>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
