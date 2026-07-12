import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAuth } from "../../context/AuthContext.jsx";
import { sheetsApi } from "../../utils/sheetsApi.js";
import { exportToExcel } from "../../utils/exportExcel.js";
import Navbar from "../../components/Navbar.jsx";
import { GlassCard, Alert, EmptyState } from "../../components/Common.jsx";

export default function SalesReport() {
  const { firebaseUser } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    sheetsApi.allReports({}, firebaseUser)
      .then((d) => setRows(d.reports))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  const byEmployee = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      const key = r.EmployeeName || "Unknown";
      map[key] = (map[key] || 0) + (Number(r.Sales) || 0);
    });
    return Object.entries(map).map(([name, sales]) => ({ name, sales })).sort((a, b) => b.sales - a.sales);
  }, [rows]);

  return (
    <div>
      <Navbar title="Sales Report" />
      <div className="page">
        {error && <div style={{ marginBottom: 16 }}><Alert type="error">{error}</Alert></div>}

        <GlassCard style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3>Sales by employee</h3>
            <button className="btn btn-primary btn-sm" onClick={() => exportToExcel(rows, "GoldMind-Sales.xlsx")} disabled={!rows.length}>⬇ Download Excel</button>
          </div>
          {loading ? (
            <p style={{ color: "var(--text-mid)" }}>Loading…</p>
          ) : byEmployee.length === 0 ? (
            <EmptyState title="No sales data yet" />
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={byEmployee}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: "#c9c3b4", fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: "#c9c3b4", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#131319", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 10 }} labelStyle={{ color: "#f6e7b4" }} />
                  <Bar dataKey="sales" fill="#d4af37" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>

        <GlassCard style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Total Sales</th></tr></thead>
              <tbody>
                {byEmployee.map((e) => (
                  <tr key={e.name}>
                    <td>{e.name}</td>
                    <td className="mono" style={{ color: "var(--gold-300)" }}>₹{e.sales.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
