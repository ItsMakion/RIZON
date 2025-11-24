import React from 'react';

export default function Metrics() {
  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-title">Open Tenders</div>
        <div className="metric-value">24</div>
        <div className="metric-meta success">▲ 12% vs. last month</div>
      </div>
      <div className="metric-card">
        <div className="metric-title">Pending Approvals</div>
        <div className="metric-value">8</div>
        <div className="metric-meta warn">▲ 33% requires attention</div>
      </div>
      <div className="metric-card">
        <div className="metric-title">Scheduled Payments</div>
        <div className="metric-value">$428,560</div>
        <div className="metric-meta ok">✔ On track for this month</div>
      </div>
      <div className="metric-card">
        <div className="metric-title">Overdue Receivables</div>
        <div className="metric-value">$156,290</div>
        <div className="metric-meta danger">▲ 8% vs. last month</div>
      </div>
    </div>
  );
}
