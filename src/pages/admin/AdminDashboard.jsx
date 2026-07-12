import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { sheetsApi } from "../../utils/sheetsApi.js";
import Navbar from "../../components/Navbar.jsx";
import StatCard from "../../components/StatCard.jsx";
import { Alert } from "../../components/Common.jsx";

export default function AdminDashboard() {
  const { firebaseUser } = useAuth();
  const [summary, setSummary] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [s, empSnap] = await Promise.all([
          sheetsApi.salesSummary(firebaseUser),
          getDocs(collection(db, "employees")),
        ]);
        setSummary(s);
        setEmployeeCount(empSnap.size);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [firebaseUser]);

  return (
    <div>
      <Navbar title="Admin Overview" />
      <div className="page">
        {error && <div style={{ marginBottom: 16 }}><Alert type="error">{error}. Configure VITE_APPS_SCRIPT_URL and ADMIN_EMAILS to connect live data.</Alert></div>}
        <div className="grid grid-cards">
          <StatCard label="Total Employees" value={employeeCount ?? "—"} icon="◕" />
          <StatCard label="Today's Calls" value={summary?.todayCalls ?? "—"} icon="☎" />
          <StatCard label="Today's Deals" value={summary?.todayDeals ?? "—"} icon="✓" accent />
          <StatCard label="Today's Sales" value={summary ? `₹${summary.todaySales.toLocaleString("en-IN")}` : "—"} icon="₹" accent />
          <StatCard label="Monthly Sales" value={summary ? `₹${summary.monthlySales.toLocaleString("en-IN")}` : "—"} icon="◈" />
          <StatCard label="Total Revenue" value={summary ? `₹${summary.totalRevenue.toLocaleString("en-IN")}` : "—"} icon="◆" accent />
        </div>
      </div>
    </div>
  );
}
