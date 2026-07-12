import React from "react";

export default function TargetRing({ percent = 0, size = 96, label }) {
  const pct = Math.max(0, Math.min(100, percent));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div className="target-ring" style={{ "--pct": pct, "--size": `${size}px` }}>
        <span className="target-ring-label" style={{ fontSize: size * 0.18 }}>{Math.round(pct)}%</span>
      </div>
      {label && <span style={{ fontSize: 12, color: "var(--text-mid)" }}>{label}</span>}
    </div>
  );
}
