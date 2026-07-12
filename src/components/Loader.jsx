import React from "react";

export default function Loader({ label = "Loading GoldMind Connect…" }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 18,
    }}>
      <div className="spinner" />
      <p style={{ color: "var(--text-mid)", fontSize: 13, letterSpacing: "0.04em" }}>{label}</p>
    </div>
  );
}
