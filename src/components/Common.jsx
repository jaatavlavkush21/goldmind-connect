import React from "react";

export function GlassCard({ children, style, className = "" }) {
  return <div className={`glass ${className}`} style={{ padding: 20, ...style }}>{children}</div>;
}

export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="glass-strong"
        style={{ width: "100%", maxWidth: width, padding: 24, maxHeight: "88vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ fontSize: 20 }}>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Alert({ type = "info", children }) {
  const colors = {
    info: { bg: "rgba(212,175,55,0.08)", border: "var(--border-soft)", text: "var(--gold-100)" },
    error: { bg: "rgba(226,86,79,0.1)", border: "rgba(226,86,79,0.35)", text: "#ff9d97" },
    success: { bg: "rgba(79,191,122,0.1)", border: "rgba(79,191,122,0.35)", text: "#8fe3ac" },
  }[type];
  return (
    <div style={{
      background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text,
      borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13.5,
    }}>
      {children}
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--text-mid)" }}>
      <div style={{ fontSize: 32, marginBottom: 10, color: "var(--gold-500)" }}>◇</div>
      <div style={{ fontSize: 15, color: "var(--text-hi)", fontWeight: 600 }}>{title}</div>
      {hint && <div style={{ fontSize: 13, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}
