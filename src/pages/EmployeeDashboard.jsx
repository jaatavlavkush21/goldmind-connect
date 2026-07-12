import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { sheetsApi } from "../utils/sheetsApi.js";
import Navbar from "../components/Navbar.jsx";
import StatCard from "../components/StatCard.jsx";
import TargetRing from "../components/TargetRing.jsx";
import { GlassCard, Alert } from "../components/Common.jsx";
import DailyReportForm from "../components/DailyReportForm.jsx";
import { Link } from "react-router-dom";

export default function EmployeeDashboard() {
  const { employee, firebaseUser } = useAuth();
  const [today, setToday] = useState(null);
  const [month, setMonth] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true); setError("");
    try {
      const [t, m] = await Promise.all([
        sheetsApi.myReports("today", firebaseUser),
        sheetsApi.myReports("month", firebaseUser),
      ]);
      setToday(t.reports);
      setMonth(m.reports);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const sum = (rows, key) => (rows || []).reduce((a, r) => a + (Number(r[key]) || 0), 0);
  const todayCalls = sum(today, "Calls");
  const todayInterested = sum(today, "Interested");
  const todayDeals = sum(today, "Deals");
  const todaySales = sum(today, "Sales");
  const monthSales = sum(month, "Sales");
  const monthlyTarget = employee?.target?.sales || 0;
  const remaining = Math.max(monthlyTarget - monthSales, 0);
  const pct = monthlyTarget ? Math.min(100, (monthSales / monthlyTarget) * 100) : 0;

  return (
    <div>
      <Navbar title="Dashboard" />
      <div className="page">
        {error && <div style={{ marginBottom: 16 }}><Alert type="error">{error}. Configure VITE_APPS_SCRIPT_URL to connect live data.</Alert></div>}

        <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
          <GlassCard className="foil-sweep" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div className="eyebrow">Monthly target</div>
              <h2 className="display" style={{ fontSize: 26, marginTop: 6 }}>
                ₹{monthSales.toLocaleString("en-IN")} <span style={{ color: "var(--text-low)", fontSize: 16 }}>of ₹{monthlyTarget.toLocaleString("en-IN")}</span>
              </h2>
              <p style={{ color: "var(--text-mid)", fontSize: 13, marginTop: 4 }}>
                ₹{remaining.toLocaleString("en-IN")} remaining to hit this month's target
              </p>
            </div>
            <TargetRing percent={pct} size={110} label="Achieved" />
          </GlassCard>
        </div>

        <div className="grid grid-cards" style={{ marginBottom: 20 }}>
          <StatCard label="Total Calls Today" value={loading ? "—" : todayCalls} icon="☎" />
          <StatCard label="Interested Customers" value={loading ? "—" : todayInterested} icon="◐" />
          <StatCard label="Deals Closed" value={loading ? "—" : todayDeals} icon="✓" accent />
          <StatCard label="Total Sales Today" value={loading ? "—" : `₹${todaySales.toLocaleString("en-IN")}`} icon="₹" accent />
          <StatCard label="Remaining Target" value={loading ? "—" : `₹${remaining.toLocaleString("en-IN")}`} icon="◎" />
        </div>

        <div className="grid" style={{ gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)", gap: 20, alignItems: "start" }}>
          <GlassCard>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3>Submit Daily Report</h3>
            </div>
            <DailyReportForm onSubmitted={load} />
          </GlassCard>

          <GlassCard>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3>Recent entries</h3>
              <Link to="/reports" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            {(!today || today.length === 0) ? (
              <p style={{ color: "var(--text-mid)", fontSize: 13.5 }}>No reports submitted today yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {today.slice(0, 5).map((r) => (
                  <div key={r.ReportID} className="glass" style={{ padding: 12, display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.Package || "—"}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-low)" }}>{r.Deals} deal(s) · {r.Calls} calls</div>
                    </div>
                    <div className="mono" style={{ color: "var(--gold-300)", fontWeight: 600 }}>₹{Number(r.Sales).toLocaleString("en-IN")}</div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .page .grid[style*="1.3fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
