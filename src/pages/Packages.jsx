import React from "react";
import Navbar from "../components/Navbar.jsx";

const PACKAGES = [
  { name: "Intermediate", price: 512, tier: 1, blurb: "The entry point for teams building their first real pipeline." },
  { name: "Expert", price: 1050, tier: 2, blurb: "For closers who need sharper tools and faster turnaround." },
  { name: "Master", price: 2299, tier: 3, blurb: "Full command of the funnel — built for consistent, high-volume output." },
  { name: "Brahmastra", price: 4999, tier: 4, blurb: "The decisive package. Deployed when the deal has to close." },
  { name: "Premium Pro", price: 9998, tier: 5, blurb: "GoldMind's flagship tier — white-glove service, top priority." },
];

export default function Packages() {
  return (
    <div>
      <Navbar title="Packages" />
      <div className="page">
        <p style={{ color: "var(--text-mid)", marginBottom: 22, maxWidth: 560 }}>
          Reference these tiers when logging a Package Sold on your daily report.
        </p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
          {PACKAGES.map((p) => (
            <div key={p.name} className="glass card-hover foil-sweep" style={{ padding: 24, position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", top: 14, right: 16, fontFamily: "var(--font-mono)",
                fontSize: 11, color: "var(--text-low)",
              }}>
                TIER {String(p.tier).padStart(2, "0")}
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 12, marginBottom: 16,
                background: "linear-gradient(135deg, var(--gold-300), var(--gold-700))",
                display: "grid", placeItems: "center", color: "#14100a", fontWeight: 800,
                boxShadow: "0 6px 18px rgba(212,175,55,0.25)",
              }}>
                {p.name[0]}
              </div>
              <h3 className="display" style={{ fontSize: 22 }}>{p.name}</h3>
              <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: "var(--gold-300)", margin: "8px 0" }}>
                ₹{p.price.toLocaleString("en-IN")}
              </div>
              <p style={{ fontSize: 13, color: "var(--text-mid)", lineHeight: 1.5 }}>{p.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
