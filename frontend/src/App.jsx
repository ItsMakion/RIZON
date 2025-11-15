import React, { useState } from "react";
import "./App.css";
import Dashboard from './pages/Dashboard';
import Procurement from './pages/Procurement';
import PurchaseRequests from './pages/PurchaseRequests';
import Payments from './pages/Payments';
import Revenue from './pages/Revenue';
import Analytics from './pages/Analytics';
import AuditLogs from './pages/AuditLogs';
import SystemSettings from './pages/SystemSettings';

const navItems = [
  "Dashboard",
  "Procurement & Tenders",
  "Purchase Requests",
  "Payments",
  "Revenue & Recoveries",
  "Analytics",
  "Audit Logs",
];

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside
      className="sidebar"
      style={{
        fontFamily: "Inter, Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

          .sidebar {
            font-family: Inter, Roboto, 'Helvetica Neue', Arial, sans-serif;
          }

          .sidebar-brand h3 {
            font-weight: 700;
            letter-spacing: 0.4px;
          }

          .sidebar-section h5 {
            margin: 8px 0;
            font-weight: 600;
            color: rgba(0,0,0,0.65);
          }

          .sidebar-nav li {
            font-weight: 500;
          }

          .sidebar-nav li .label {
            margin-left: 8px;
          }

          /* barely visible divider that stretches edge-to-edge of the sidebar */
          .sidebar-divider {
            height: 1px;
            background: rgba(0,0,0,0.06); /* very faint */
            border: none;
            margin: 0;
            display: block;
            width: calc(100% + 32px); /* extend past typical horizontal padding */
            margin-left: -16px;
            margin-right: -16px;
          }
        `}</style>

        <div className="sidebar-brand" style={{ textAlign: 'center' }}>
          <h3 style={{ margin: 0 }}>RIZON</h3>
        </div>

        <hr className="sidebar-divider" />

        <div className="sidebar-section"><h5>MAIN NAVIGATION</h5></div>
        <ul className="sidebar-nav">
          {navItems.map((n) => {
          const icons = {
            "Dashboard": "🏠",
            "Procurement & Tenders": "📦",
            "Purchase Requests": "📝",
            "Payments": "💳",
            "Revenue & Recoveries": "📈",
            "Analytics": "📊",
            "Audit Logs": "🧾"
          };
          const icon = icons[n] || "•";
          return (
            <li
              key={n}
              className={n === activePage ? "active" : ""}
              onClick={() => setActivePage(n)}
              style={{ opacity: n === activePage ? 1 : 0.7, transition: 'opacity 0.2s', cursor: 'pointer' }}
            >
              <span className="icon" aria-hidden="true">{icon}</span>
              <span className="label">{n}</span>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-section"><h5>SETTINGS</h5></div>
      <ul className="sidebar-nav">
        <li
          className={activePage === "System Settings" ? "active" : ""}
          onClick={() => setActivePage("System Settings")}
          style={{ opacity: activePage === "System Settings" ? 1 : 0.7, transition: 'opacity 0.2s', cursor: 'pointer' }}
        >
          <span className="icon" aria-hidden="true">⚙️</span>
          <span className="label">System Settings</span>
        </li>
      </ul>
    </aside>
  );
}

function Header() {
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <header
      className="topbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "12px",
      }}
    >
      <style>{`
        /* soft curves and subtle elevation for the topbar and its controls */
        .topbar {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(16,24,40,0.06);
        }

        .topbar-left, .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .search {
          border: 1px solid rgba(0,0,0,0.08);
          padding: 8px 12px;
          border-radius: 10px;
          outline: none;
          min-width: 220px;
          background: #fafafa;
        }

        .btn.ghost.small {
          border-radius: 8px;
          padding: 6px 10px;
          border: 1px solid rgba(0,0,0,0.06);
          background: transparent;
        }

        .notif {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 10px;
          background: rgba(0,0,0,0.03);
        }

        .notif .badge {
          background: #e53935;
          color: #fff;
          border-radius: 999px;
          padding: 2px 6px;
          font-size: 12px;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #111827;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
      `}</style>

      <div className="topbar-left">
        <input className="search" placeholder="Search..." />
      </div>

      <div className="topbar-right">
        <button className="btn ghost small">English</button>
        <div className="notif">🔔<span className="badge">3</span></div>
        <div className="avatar">JD</div>
      </div>
    </header>
  );
}

// Metrics moved to components/Metrics.jsx

export default function App() {
  const [page, setPage] = useState('Dashboard');
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="app-root">
      <Sidebar activePage={page} setActivePage={setPage} />
      <div className="main-area">
        <Header />
        {page === 'Dashboard' ? <Dashboard /> : null}
        {page === 'Procurement & Tenders' ? <Procurement /> : null}
        {page === 'Purchase Requests' ? <PurchaseRequests /> : null}
        {page === 'Payments' ? <Payments /> : null}
        {page === 'Revenue & Recoveries' ? <Revenue /> : null}
        {page === 'Analytics' ? <Analytics /> : null}
        {page === 'Audit Logs' ? <AuditLogs /> : null}
        {page === 'System Settings' ? <SystemSettings /> : null}
      </div>
    </div>
  );
}
