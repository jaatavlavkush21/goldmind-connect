import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import { GlassCard, Alert } from "../components/Common.jsx";
import { formatDisplayDate } from "../utils/dateHelpers.js";

export default function MyProfile() {
  const { employee, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [photoURL, setPhotoURL] = useState(employee?.photoURL || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function save() {
    setBusy(true); setMsg(null);
    try {
      await updateDoc(doc(db, "employees", employee.id), { photoURL });
      await refreshProfile();
      setMsg({ type: "success", text: "Profile updated." });
      setEditing(false);
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  if (!employee) return null;

  const rows = [
    ["Employee ID", employee.employeeId],
    ["Email", employee.email],
    ["Mobile Number", employee.mobile],
    ["Joining Date", employee.joiningDate ? formatDisplayDate(employee.joiningDate) : "—"],
    ["Status", employee.status],
  ];

  return (
    <div>
      <Navbar title="My Profile" />
      <div className="page" style={{ maxWidth: 640 }}>
        <GlassCard className="foil-sweep">
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
            <div style={{
              width: 76, height: 76, borderRadius: "50%", overflow: "hidden",
              border: "2px solid var(--border-strong)", background: "var(--bg-2)",
              display: "grid", placeItems: "center", flexShrink: 0,
            }}>
              {photoURL ? (
                <img src={photoURL} alt={employee.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span className="display" style={{ fontSize: 28, color: "var(--gold-300)" }}>
                  {employee.name?.[0]}
                </span>
              )}
            </div>
            <div>
              <h2 className="display" style={{ fontSize: 24 }}>{employee.name}</h2>
              <span className="badge badge-gold">{employee.employeeId}</span>
            </div>
          </div>

          {msg && <div style={{ marginBottom: 14 }}><Alert type={msg.type}>{msg.text}</Alert></div>}

          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="field">
                <label>Profile photo URL</label>
                <input className="input" value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} placeholder="https://…" />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
                <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {rows.map(([label, val]) => (
                  <div key={label}>
                    <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14.5 }}>{val || "—"}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 22 }} onClick={() => setEditing(true)}>
                Edit profile photo
              </button>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
