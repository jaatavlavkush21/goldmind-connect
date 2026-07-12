import React, { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Navbar from "../../components/Navbar.jsx";
import { GlassCard, Alert, EmptyState } from "../../components/Common.jsx";

const TYPES = [
  { value: "notice", label: "Notice" },
  { value: "meeting", label: "Meeting Time" },
  { value: "training", label: "Training Update" },
];

export default function SendNotification() {
  const { firebaseUser } = useAuth();
  const [type, setType] = useState("notice");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, []);

  async function send(e) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await addDoc(collection(db, "notifications"), {
        type, title, message,
        meetingTime: type === "meeting" ? meetingTime : "",
        createdAt: serverTimestamp(),
        createdBy: firebaseUser?.email || "admin",
      });
      setTitle(""); setMessage(""); setMeetingTime("");
      setMsg({ type: "success", text: "Notice sent to all employees." });
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    await deleteDoc(doc(db, "notifications", id));
  }

  return (
    <div>
      <Navbar title="Send Notice" />
      <div className="page" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <GlassCard>
          <h3 style={{ marginBottom: 16 }}>New notice</h3>
          <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="field">
              <label>Type</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Title</label>
              <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            {type === "meeting" && (
              <div className="field">
                <label>Meeting time</label>
                <input className="input" type="datetime-local" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} />
              </div>
            )}
            <div className="field">
              <label>Message</label>
              <textarea className="input" rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            {msg && <Alert type={msg.type}>{msg.text}</Alert>}
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Sending…" : "Send to all employees"}</button>
          </form>
        </GlassCard>

        <GlassCard>
          <h3 style={{ marginBottom: 16 }}>Sent notices</h3>
          {items.length === 0 ? <EmptyState title="Nothing sent yet" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 480, overflowY: "auto" }}>
              {items.map((n) => (
                <div key={n.id} className="glass" style={{ padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span className="badge badge-gold">{n.type}</span>
                      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{n.title}</div>
                      <div style={{ fontSize: 12.5, color: "var(--text-mid)", marginTop: 4 }}>{n.message}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => remove(n.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
      <style>{`@media (max-width: 860px) { .page { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
