import React from 'react';
import Metrics from '../components/Metrics';
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

export default function Dashboard(){
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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

        <Metrics />

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
            {/* "View All Activities" Button */}
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                <span 
                     style={{
                       fontSize: '18px',
                       color: '#007bff',       // Blue color to look like a link
                       cursor: 'pointer',      // Pointer cursor to indicate it's clickable
                       textDecoration: 'underline', // Makes it look like a link
                       fontWeight: 'bold' }} 
                     onClick={() => alert("View All Activities Clicked")}>
                  View All Activities
                </span>
            </div>
          </section>

          <section className="card cashflow">
            <div className="card-header">
              <h3>Monthly Cashflow</h3>
              <select className="select-small"><option>Last 6 Months</option></select>
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
            <a className="view-all" href="#">View All Tenders</a>
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
                {[
                  ["TN-2023-067","Medical Supplies Procurement","Open","Jun 15, 2023",12,"$250,000"],
                  ["TN-2023-065","IT Infrastructure Upgrade","Open","Jun 10, 2023",8,"$450,000"],
                  ["TN-2023-060","School Renovation Project","Evaluation","May 30, 2023",15,"$1,200,000"],
                  ["TN-2023-056","Road Maintenance Services","Award","May 22, 2023",9,"$850,000"],
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="mono">{r[0]}</td>
                    <td>{r[1]}</td>
                    <td><span className={`badge status-${r[2].toLowerCase().replace(/\s+/g,'-')}`}>{r[2]}</span></td>
                    <td>{r[3]}</td>
                    <td>{r[4]}</td>
                    <td>{r[5]}</td>
                    <td className="actions"><button className="icon-btn">👁️</button><button className="icon-btn">✏️</button></td>
                  </tr>
                ))}
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
              {title: 'Duplicate Payment', color: 'red', text: 'Vendor "TechSolutions Ltd" has received multiple payments for the same invoice.'},
              {title: 'Unusual Approver', color: 'yellow', text: 'Purchase request #PR-2023-078 approved by an uncommon approver.'},
              {title: 'Split Purchase', color: 'yellow', text: 'Multiple small purchases from "GlobalTech" detected.'},
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
