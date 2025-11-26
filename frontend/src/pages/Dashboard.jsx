import React, { useState, useEffect } from 'react';
import Metrics from '../components/Metrics';
import analyticsService from '../api/analytics';
import procurementService from '../api/procurement';
import LoadingSpinner from '../components/LoadingSpinner';
import { Line } from 'react-chartjs-2';
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
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardStats, tendersData] = await Promise.all([
          analyticsService.getDashboardStats(),
          procurementService.getTenders({ limit: 4 })
        ]);
        setStats(dashboardStats);
        setTenders(tendersData);
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

  return (
    <main className="dashboard">
      <div className="container">
        <h1 className="page-title">Dashboard</h1>

        <div className="welcome-banner">
          <div className="welcome-left">
            <div className="welcome-title">Welcome, John Doe</div>
            <div className="welcome-sub">Finance Officer</div>
          </div>
          <div className="welcome-right">
            <div className="today-label">Today's Date</div>
            <div className="today-value">{today}</div>
          </div>
        </div>

        <Metrics stats={stats} />

        <div className="lower-grid">
          <section className="card activity">
            <h3>Recent Activity</h3>
            <hr className="sidebar-divider" />
            <ul>
              {[
                { icon: '📝', title: 'New tender published: "Medical Supplies Procurement"', time: 'Today, 09:45 AM' },
                { icon: '✅', title: 'Purchase request #PR-2023-089 approved', time: 'Today, 08:30 AM' },
                { icon: '💳', title: 'Payment batch #PB-443 scheduled for processing', time: 'Yesterday, 4:12 PM' },
                { icon: '⚠️', title: 'Suspicious transaction detected: Duplicate vendor payment', time: 'Yesterday, 2:45 PM' },
                { icon: '💰', title: 'New loan recovery payment received: $12,450', time: 'May 15, 11:30 AM' },
              ].map((a, i) => (
                <li key={i} className="activity-item">
                  <div className="activity-icon">{a.icon}</div>
                  <div className="activity-body">
                    <div className="activity-title">{a.title}</div>
                    <div className="activity-time">{a.time}</div>
                  </div>
                </li>
              ))}
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

        {/* Fraud alerts */}
        <section className="card alerts-section">
          <div className="card-header">
            <h3>Potential Fraud Alerts</h3>
            <a className="view-all" href="#">View All Alerts</a>
          </div>
          <hr className="sidebar-divider" />

          <div className="alerts-grid">
            {[
              { title: 'Duplicate Payment', color: 'red', text: 'Vendor "TechSolutions Ltd" has received multiple payments for the same invoice.' },
              { title: 'Unusual Approver', color: 'yellow', text: 'Purchase request #PR-2023-078 approved by an uncommon approver.' },
              { title: 'Split Purchase', color: 'yellow', text: 'Multiple small purchases from "GlobalTech" detected.' },
            ].map((a, i) => (
              <div key={i} className={`alert-card alert-${a.color}`}>
                <div className="alert-icon">{a.color === 'red' ? '⚠️' : '💡'}</div>
                <div className="alert-body">
                  <div className="alert-title">{a.title}</div>
                  <div className="alert-text">{a.text}</div>
                </div>
                <div className="alert-action"><a href="#">View</a></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
