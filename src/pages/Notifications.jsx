import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase.js";
import Navbar from "../components/Navbar.jsx";
import { GlassCard, EmptyState } from "../components/Common.jsx";

const TYPE_LABEL = { notice: "Notice", meeting: "Meeting", training: "Training" };

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div>
      <Navbar title="Notices" />
      <div className="page" style={{ maxWidth: 720 }}>
        {loading ? (
          <p style={{ color: "var(--text-mid)" }}>Loading notices…</p>
        ) : items.length === 0 ? (
          <GlassCard><EmptyState title="No notices yet" hint="Announcements from admin will appear here." /></GlassCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((n) => (
              <GlassCard key={n.id} className="card-hover">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <span className="badge badge-gold">{TYPE_LABEL[n.type] || "Notice"}</span>
                    <h3 style={{ fontSize: 17, marginTop: 10 }}>{n.title}</h3>
                    <p style={{ color: "var(--text-mid)", fontSize: 13.5, marginTop: 6, lineHeight: 1.6 }}>{n.message}</p>
                    {n.meetingTime && (
                      <div className="mono" style={{ fontSize: 12, color: "var(--gold-300)", marginTop: 8 }}>
                        🕒 {n.meetingTime}
                      </div>
                    )}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--text-low)", whiteSpace: "nowrap" }}>
                    {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString("en-IN") : ""}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
