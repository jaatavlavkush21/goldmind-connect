import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { sheetsApi } from "../utils/sheetsApi.js";
import { todayISO } from "../utils/dateHelpers.js";
import { Alert } from "./Common.jsx";

const PACKAGES = ["Intermediate", "Expert", "Master", "Brahmastra", "Premium Pro"];

const empty = { calls: "", interested: "", deals: "", packageName: "", sales: "", remarks: "" };

export default function DailyReportForm({ onSubmitted }) {
  const { employee, firebaseUser } = useAuth();
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  function update(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await sheetsApi.addReport({
        date: todayISO(),
        employeeName: employee.name,
        employeeId: employee.employeeId,
        mobile: employee.mobile,
        calls: form.calls,
        interested: form.interested,
        deals: form.deals,
        packageName: form.packageName,
        sales: form.sales,
        remarks: form.remarks,
      }, firebaseUser);
      setMsg({ type: "success", text: "Report saved to Google Sheets." });
      setForm(empty);
      onSubmitted && onSubmitted();
    } catch (e) {
      setMsg({ type: "error", text: e.message || "Could not save report." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>Date</label>
          <input className="input" value={todayISO()} disabled />
        </div>
        <div className="field">
          <label>Employee</label>
          <input className="input" value={employee?.name || ""} disabled />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>Total Calls</label>
          <input className="input" type="number" min="0" required value={form.calls} onChange={(e) => update("calls", e.target.value)} />
        </div>
        <div className="field">
          <label>Interested</label>
          <input className="input" type="number" min="0" required value={form.interested} onChange={(e) => update("interested", e.target.value)} />
        </div>
        <div className="field">
          <label>Deals Closed</label>
          <input className="input" type="number" min="0" required value={form.deals} onChange={(e) => update("deals", e.target.value)} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label>Package Name</label>
          <select className="input" value={form.packageName} onChange={(e) => update("packageName", e.target.value)}>
            <option value="">Select package</option>
            {PACKAGES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Sales Amount (₹)</label>
          <input className="input" type="number" min="0" required value={form.sales} onChange={(e) => update("sales", e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Remarks</label>
        <textarea className="input" rows={3} value={form.remarks} onChange={(e) => update("remarks", e.target.value)} placeholder="Any notes about today's calls…" />
      </div>

      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Saving…" : "Submit Report"}</button>
    </form>
  );
}
