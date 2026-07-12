import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const employeeLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "◆" },
  { to: "/reports", label: "My Reports", icon: "▤" },
  { to: "/packages", label: "Packages", icon: "◈" },
  { to: "/notifications", label: "Notices", icon: "✦" },
  { to: "/profile", label: "My Profile", icon: "●" },
];

const adminLinks = [
  { to: "/admin", label: "Overview", icon: "◆" },
  { to: "/admin/employees", label: "Employees", icon: "▥" },
  { to: "/admin/reports", label: "All Reports", icon: "▤" },
  { to: "/admin/sales", label: "Sales", icon: "◈" },
  { to: "/admin/notifications", label: "Send Notice", icon: "✦" },
  { to: "/packages", label: "Packages", icon: "❖" },
];

export default function Sidebar() {
  const { isAdmin, employee, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <>
      <button
        className="btn btn-ghost btn-sm mobile-toggle"
        onClick={() => setOpen(true)}
        style={{ position: "fixed", top: 14, left: 14, zIndex: 40, display: "none" }}
        aria-label="Open menu"
      >
        ☰
      </button>

      {open && <div className="drawer-backdrop" onClick={() => setOpen(false)} />}

      <aside className={`sidebar glass ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">GM</div>
          <div>
            <div className="display" style={{ fontSize: 20, lineHeight: 1 }}>GoldMind</div>
            <div className="eyebrow" style={{ fontSize: 9 }}>Connect</div>
          </div>
        </div>

        <nav className="nav-links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/dashboard" || l.to === "/admin"}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              <span className="nav-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: 12, color: "var(--text-mid)" }}>
            {isAdmin ? "Administrator" : employee?.name}
          </div>
          <button className="btn btn-ghost btn-sm btn-block" style={{ marginTop: 10 }} onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <style>{`
        .sidebar {
          width: 240px; min-height: 100vh; padding: 22px 16px;
          display: flex; flex-direction: column; gap: 26px;
          border-radius: 0; border-right: 1px solid var(--border-soft); position: sticky; top: 0;
        }
        .brand { display: flex; align-items: center; gap: 10px; padding: 0 6px; }
        .brand-mark {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, var(--gold-300), var(--gold-700));
          color: #14100a; display: grid; place-items: center; font-weight: 800; font-family: var(--font-mono);
        }
        .nav-links { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .nav-link {
          display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: var(--radius-sm);
          color: var(--text-mid); font-size: 14px; font-weight: 500; transition: all 0.2s var(--ease);
        }
        .nav-link:hover { background: rgba(212,175,55,0.06); color: var(--text-hi); }
        .nav-link-active {
          background: rgba(212,175,55,0.12); color: var(--gold-200, var(--gold-300));
          border: 1px solid var(--border-soft);
        }
        .nav-icon { width: 18px; text-align: center; color: var(--gold-500); }
        .sidebar-footer { border-top: 1px solid var(--border-soft); padding-top: 14px; }
        .drawer-backdrop { display: none; }

        @media (max-width: 860px) {
          .mobile-toggle { display: grid !important; place-items: center; width: 40px; height: 40px; padding: 0; }
          .sidebar {
            position: fixed; left: 0; top: 0; z-index: 50; transform: translateX(-100%);
            transition: transform 0.3s var(--ease); border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
          }
          .sidebar-open { transform: translateX(0); }
          .drawer-backdrop {
            display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 45;
            backdrop-filter: blur(2px);
          }
        }
      `}</style>
    </>
  );
}
