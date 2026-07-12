import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { greeting } from "../utils/dateHelpers.js";

export default function Navbar({ title }) {
  const { employee, isAdmin } = useAuth();
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <header className="glass" style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 22px", margin: "16px 16px 0", borderRadius: "var(--radius-md)",
    }}>
      <div>
        <div className="eyebrow">{greeting()}{!isAdmin && employee ? `, ${employee.name.split(" ")[0]}` : ""}</div>
        <h1 style={{ fontSize: 24 }}>{title}</h1>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="mono" style={{ fontSize: 12, color: "var(--text-mid)" }}>{today}</div>
        {!isAdmin && employee?.status && (
          <span className={`badge ${employee.status === "active" ? "badge-active" : "badge-inactive"}`} style={{ marginTop: 6 }}>
            {employee.status}
          </span>
        )}
      </div>
    </header>
  );
}
