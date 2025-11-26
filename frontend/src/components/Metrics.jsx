import React from 'react';

export default function Metrics({ stats }) {
  // Use API stats if available, otherwise show loading or defaults
  const metrics = stats ? [
    { label: 'Active Tenders', value: stats.active_tenders || 0, icon: '📦', color: '#3b82f6' },
    { label: 'Pending Requests', value: stats.pending_purchase_requests || 0, icon: '📝', color: '#8b5cf6' },
    { label: 'Pending Payments', value: `$${(stats.pending_payments?.amount || 0).toLocaleString()}`, icon: '💳', color: '#f59e0b' },
    { label: 'Revenue (Month)', value: `$${(stats.revenue_this_month || 0).toLocaleString()}`, icon: '📈', color: '#10b981' },
  ] : [
    { label: 'Active Tenders', value: '...', icon: '📦', color: '#3b82f6' },
    { label: 'Pending Requests', value: '...', icon: '📝', color: '#8b5cf6' },
    { label: 'Pending Payments', value: '...', icon: '💳', color: '#f59e0b' },
    { label: 'Revenue (Month)', value: '...', icon: '📈', color: '#10b981' },
  ];

  return (
    <div className="metrics-grid">
      {metrics.map((m, i) => (
        <div key={i} className="metric-card" style={{ borderLeft: `4px solid ${m.color}` }}>
          <div className="metric-icon" style={{ background: `${m.color}15` }}>{m.icon}</div>
          <div className="metric-body">
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{m.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
