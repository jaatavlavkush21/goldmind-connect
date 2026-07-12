import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { sheetsApi } from "../../utils/sheetsApi.js";
import { exportToExcel } from "../../utils/exportExcel.js";
import Navbar from "../../components/Navbar.jsx";
import { GlassCard, Modal, Alert, EmptyState } from "../../components/Common.jsx";
import { formatDisplayDate } from "../../utils/dateHelpers.js";

const PACKAGES = ["Intermediate", "Expert", "Master", "Brahmastra", "Premium Pro"];

export default function AllReports() {
  const { firebaseUser } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", date: "", package: "" });
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const d = await sheetsApi.allReports(filters, firebaseUser);
      setRows(d.reports);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function saveEdit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await sheetsApi.updateReport(editing.ReportID, {
        Calls: Number(editing.Calls), Interested: Number(editing.Interested),
        Deals: Number(editing.Deals), Package: editing.Package,
        Sales: Number(editing.Sales), Remarks: editing.Remarks,
      }, firebaseUser);
      setEditing(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Navbar title="All Reports" />
      <div className="page">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
          <input className="input" style={{ maxWidth: 220 }} placeholder="Search employee/email…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <input className="input" style={{ maxWidth: 170 }} type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
          <select className="input" style={{ maxWidth: 190 }} value={filters.package} onChange={(e) => setFilters({ ...filters, package: e.target.value })}>
            <option value="">All packages</option>
            {PACKAGES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="btn btn-ghost" onClick={load}>Apply Filters</button>
          <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => exportToExcel(rows, "GoldMind-Reports.xlsx")} disabled={!rows.length}>
            ⬇ Download Excel
          </button>
        </div>

        {error && <div style={{ marginBottom: 16 }}><Alert type="error">{error}</Alert></div>}

        <GlassCard style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 24, color: "var(--text-mid)" }}>Loading reports…</div>
          ) : rows.length === 0 ? (
            <EmptyState title="No reports found" hint="Try adjusting your filters." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Employee</th><th>ID</th><th>Calls</th><th>Deals</th><th>Package</th><th>Sales</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.ReportID}>
                      <td className="mono">{formatDisplayDate(r.Date)}</td>
                      <td>{r.EmployeeName}</td>
                      <td className="mono">{r.EmployeeID}</td>
                      <td>{r.Calls}</td>
                      <td>{r.Deals}</td>
                      <td>{r.Package || "—"}</td>
                      <td className="mono" style={{ color: "var(--gold-300)" }}>₹{Number(r.Sales).toLocaleString("en-IN")}</td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => setEditing({ ...r })}>Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Report" width={460}>
        {editing && (
          <form onSubmit={saveEdit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div className="field"><label>Calls</label><input className="input" type="number" value={editing.Calls} onChange={(e) => setEditing({ ...editing, Calls: e.target.value })} /></div>
              <div className="field"><label>Interested</label><input className="input" type="number" value={editing.Interested} onChange={(e) => setEditing({ ...editing, Interested: e.target.value })} /></div>
              <div className="field"><label>Deals</label><input className="input" type="number" value={editing.Deals} onChange={(e) => setEditing({ ...editing, Deals: e.target.value })} /></div>
            </div>
            <div className="field">
              <label>Package</label>
              <select className="input" value={editing.Package} onChange={(e) => setEditing({ ...editing, Package: e.target.value })}>
                <option value="">—</option>
                {PACKAGES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="field"><label>Sales (₹)</label><input className="input" type="number" value={editing.Sales} onChange={(e) => setEditing({ ...editing, Sales: e.target.value })} /></div>
            <div className="field"><label>Remarks</label><textarea className="input" rows={3} value={editing.Remarks} onChange={(e) => setEditing({ ...editing, Remarks: e.target.value })} /></div>
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
          </form>
        )}
      </Modal>
    </div>
  );
}
