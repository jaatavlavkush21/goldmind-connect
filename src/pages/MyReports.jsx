import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { sheetsApi } from "../utils/sheetsApi.js";
import Navbar from "../components/Navbar.jsx";
import { GlassCard, Alert, EmptyState } from "../components/Common.jsx";
import { formatDisplayDate } from "../utils/dateHelpers.js";

const RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

export default function MyReports() {
  const { firebaseUser } = useAuth();
  const [range, setRange] = useState("today");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    sheetsApi.myReports(range, firebaseUser)
      .then((d) => active && setRows(d.reports))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [range, firebaseUser]);

  const totals = rows.reduce((a, r) => ({
    calls: a.calls + (Number(r.Calls) || 0),
    deals: a.deals + (Number(r.Deals) || 0),
    sales: a.sales + (Number(r.Sales) || 0),
  }), { calls: 0, deals: 0, sales: 0 });

  return (
    <div>
      <Navbar title="My Reports" />
      <div className="page">
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {RANGES.map((r) => (
            <button key={r.key} className={`btn btn-sm ${range === r.key ? "btn-primary" : "btn-ghost"}`} onClick={() => setRange(r.key)}>
              {r.label}
            </button>
          ))}
        </div>

        {error && <div style={{ marginBottom: 16 }}><Alert type="error">{error}</Alert></div>}

        <div className="grid grid-cards" style={{ marginBottom: 18 }}>
          <GlassCard><div className="eyebrow">Calls</div><div className="mono" style={{ fontSize: 24, marginTop: 6 }}>{totals.calls}</div></GlassCard>
          <GlassCard><div className="eyebrow">Deals Closed</div><div className="mono" style={{ fontSize: 24, marginTop: 6, color: "var(--gold-300)" }}>{totals.deals}</div></GlassCard>
          <GlassCard><div className="eyebrow">Sales</div><div className="mono" style={{ fontSize: 24, marginTop: 6, color: "var(--gold-300)" }}>₹{totals.sales.toLocaleString("en-IN")}</div></GlassCard>
        </div>

        <GlassCard style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 24, color: "var(--text-mid)" }}>Loading your reports…</div>
          ) : rows.length === 0 ? (
            <EmptyState title="No reports in this range" hint="Submit today's report from your dashboard." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Calls</th><th>Interested</th><th>Deals</th><th>Package</th><th>Sales</th><th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.ReportID}>
                      <td className="mono">{formatDisplayDate(r.Date)}</td>
                      <td>{r.Calls}</td>
                      <td>{r.Interested}</td>
                      <td>{r.Deals}</td>
                      <td>{r.Package || "—"}</td>
                      <td className="mono" style={{ color: "var(--gold-300)" }}>₹{Number(r.Sales).toLocaleString("en-IN")}</td>
                      <td style={{ color: "var(--text-mid)" }}>{r.Remarks || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
