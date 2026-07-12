import React from "react";

export default function StatCard({ label, value, icon, accent = false, sub }) {
  return (
    <div className="glass card-hover foil-sweep" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <span className="eyebrow">{label}</span>
        {icon && <span style={{ fontSize: 18, opacity: 0.8 }}>{icon}</span>}
      </div>
      <div
        className="mono"
        style={{
          fontSize: 30, fontWeight: 600, marginTop: 10,
          color: accent ? "var(--gold-300)" : "var(--text-hi)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-low)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
