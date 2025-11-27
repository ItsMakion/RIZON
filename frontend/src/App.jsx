import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./App.css";
import Dashboard from './pages/Dashboard';
import Procurement from './pages/Procurement';
import PurchaseRequests from './pages/PurchaseRequests';
import Payments from './pages/Payments';
import Revenue from './pages/Revenue';
import Analytics from './pages/Analytics';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import AuditLogs from './pages/AuditLogs';
import SystemSettings from './pages/SystemSettings';
import Login from './pages/Login';
import Register from './pages/Register';
import LanguageSwitcher from './components/LanguageSwitcher';
import ProtectedRoute from './components/ProtectedRoute';

const navItems = [
  { name: "Dashboard", path: "/" },
  { name: "Procurement & Tenders", path: "/procurement" },
  { name: "Purchase Requests", path: "/purchase-requests" },
  { name: "Payments", path: "/payments" },
  { name: "Revenue & Recoveries", path: "/revenue" },
  { name: "Analytics", path: "/analytics" },
  { name: "Audit Logs", path: "/audit-logs" },
];

function Sidebar({ activePage, setActivePage }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavigation = (item) => {
    setActivePage(item.name);
    navigate(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

          .sidebar-divider {
            height: 1px;
            background: rgba(0,0,0,0.06);
            border: none;
            margin: 0;
            display: block;
            width: calc(100% + 32px);
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
        {navItems.map((item) => {
          const icons = {
            "Dashboard": "🏠",
            "Procurement & Tenders": "📦",
            "Purchase Requests": "📝",
            "Payments": "💳",
            "Revenue & Recoveries": "📈",
            "Analytics": "📊",
            "Audit Logs": "🧾"
          };
          const icon = icons[item.name] || "•";
          return (
            <li
              key={item.name}
              className={item.name === activePage ? "active" : ""}
              onClick={() => handleNavigation(item)}
              style={{ opacity: item.name === activePage ? 1 : 0.7, transition: 'opacity 0.2s', cursor: 'pointer' }}
            >
              <span className="icon" aria-hidden="true">{icon}</span>
              <span className="label">{item.name}</span>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-section"><h5>SETTINGS</h5></div>
      <ul className="sidebar-nav">
        <li
          className={activePage === "System Settings" ? "active" : ""}
          onClick={() => {
            setActivePage("System Settings");
            navigate('/settings');
          }}
          style={{ opacity: activePage === "System Settings" ? 1 : 0.7, transition: 'opacity 0.2s', cursor: 'pointer' }}
        >
          <span className="icon" aria-hidden="true">⚙️</span>
          <span className="label">System Settings</span>
        </li>
        <li
          onClick={handleLogout}
          style={{ opacity: 0.7, transition: 'opacity 0.2s', cursor: 'pointer' }}
        >
          <span className="icon" aria-hidden="true">🚪</span>
          <span className="label">Logout</span>
        </li>
      </ul>

      <div style={{ marginTop: 'auto', padding: '1rem 0' }}>
        <LanguageSwitcher />
      </div>
    </aside>
  );
}

import NotificationBell from './components/NotificationBell';

function Header() {
  const { user } = useAuth();

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
          font-size: 14px;
          font-family: inherit;
          font-palette: var(--bg-1);
          background: #f9fafb;
          transition: all 0.2s;
        }
        
        .search:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px;
          border-radius: 10px;
          background: #f9fafb;
          border: 1px solid rgba(0,0,0,0.04);
        }
        
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
        }
        
        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
        }
        
        .user-role {
          font-size: 11px;
          color: #6b7280;
        }
      `}</style>

      <div className="topbar-left">
        <input type="text" placeholder="Search anything..." className="search" />
      </div>

      <div className="topbar-right">
        <NotificationBell />
        <div className="user-profile">
          <div className="avatar">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.full_name || user?.email || 'User'}</span>
            <span className="user-role">{user?.role || 'User'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function MainLayout() {
  const [page, setPage] = useState('Dashboard');

  return (
    <div className="app-root">
      <Sidebar activePage={page} setActivePage={setPage} />
      <div className="main-area">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/procurement" element={<Procurement />} />
          <Route path="/purchase-requests" element={<PurchaseRequests />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/revenue" element={<ProtectedRoute><Revenue /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/analytics/advanced" element={<ProtectedRoute><AdvancedAnalytics /></ProtectedRoute>} />
          <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
          <Route path="/settings" element={<SystemSettings />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
