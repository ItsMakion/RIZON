import React, { useState, useEffect } from 'react';
import Metrics from '../components/Metrics';
import analyticsService from '../api/analytics';
import procurementService from '../api/procurement';
import auditLogsService from '../api/auditLogs';
import LoadingSpinner from '../components/LoadingSpinner';
import FraudAlertWidget from '../components/FraudAlertWidget';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import './Dashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [tenders, setTenders] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardStats, tendersData, auditLogs] = await Promise.all([
          analyticsService.getDashboardStats(),
          procurementService.getTenders({ limit: 4 }),
          auditLogsService.getAuditLogs({ limit: 5 })
        ]);
        setStats(dashboardStats);
        setTenders(tendersData);
        setRecentActivity(auditLogs);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  // Format activity from audit logs
  const formatActivity = (log) => {
    const icons = {
      'create': '📝',
      'update': '✏️',
      'delete': '🗑️',
      'approve': '✅',
      'reject': '❌',
      'process': '💳',
    };

    return {
      icon: icons[log.action] || '📋',
      title: `${log.action} ${log.entity_type}: ${log.entity_id}`,
      time: new Date(log.timestamp).toLocaleString()
    };
  };

  return (
    <main className="dashboard">
      <div className="container">
        <h1 className="page-title">Dashboard</h1>

        <div className="welcome-banner">
          <div className="welcome-left">
            <div className="welcome-title">Welcome, {user?.full_name || user?.email || 'User'}</div>
            <div className="welcome-sub">{user?.role || 'User'}</div>
          </div>
          <div className="welcome-right">
            <div className="today-label">Today's Date</div>
            <div className="today-value">{today}</div>
          </div>
        </div>

        <FraudAlertWidget />

        <Metrics stats={stats} />

        <div className="lower-grid">
          <section className="card activity">
            <h3>Recent Activity</h3>
            <hr className="sidebar-divider" />
            <ul>
              {recentActivity.length > 0 ? recentActivity.map((log, i) => {
                const activity = formatActivity(log);
                return (
                  <li key={i} className="activity-item">
                    <div className="activity-icon">{activity.icon}</div>
                    <div className="activity-body">
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </li>
                );
              }) : (
                <li className="activity-item">
                  <div className="activity-body">
                    <div className="activity-title">No recent activity</div>
                  </div>
                </li>
              )}
            </ul>
          </section>

          <section className="card cashflow">
            <div className="card-header">
              <h3>Monthly Cashflow</h3>
              <select className="select">
                <option>Last 6 Months</option>
                <option>Last 12 Months</option>
                <option>Year to Date</option>
              </select>
            </div>
            <hr className="sidebar-divider" />

            <Line
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: { enabled: true },
                },
                scales: {
                  y: { beginAtZero: true, ticks: { callback: (v) => '$' + v.toLocaleString() } },
                },
              }}
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  {
                    label: 'Income',
                    data: [450000, 380000, 410000, 470000, 520000, 650000],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.12)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                  },
                  {
                    label: 'Expenses',
                    data: [380000, 410000, 390000, 430000, 470000, 500000],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239,68,68,0.08)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                  },
                ],
              }}
            />
          </section>
        </div>

        {/* Hot tenders table */}
        <section className="card hot-tenders">
          <div className="card-header">
            <h3>Hot Tenders</h3>
            <a className="view-all" href="/procurement">View All Tenders </a>
          </div>

          <div className="table-wrap">
            <table className="tenders-table">
              <thead>
                <tr>
                  <th>TENDER ID</th>
                  <th>TITLE</th>
                  <th>STATUS</th>
                  <th>DEADLINE</th>
                  <th>BIDS</th>
                  <th>EST. VALUE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {tenders.length > 0 ? tenders.map((tender, i) => (
                  <tr key={i}>
                    <td className="mono">{tender.tender_id}</td>
                    <td>{tender.title}</td>
                    <td><span className={`badge status-${tender.status}`}>{tender.status}</span></td>
                    <td>{new Date(tender.deadline).toLocaleDateString()}</td>
                    <td>{tender.bids_count}</td>
                    <td>${Number(tender.estimated_value).toLocaleString()}</td>
                    <td className="actions"><button className="icon-btn">👁️</button><button className="icon-btn">✏️</button></td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No tenders available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
