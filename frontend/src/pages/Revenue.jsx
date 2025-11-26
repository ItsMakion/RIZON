import React, { useState, useEffect } from 'react';
import revenueService from '../api/revenue';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function Revenue() {
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRevenues();
  }, [statusFilter]);

  const fetchRevenues = async () => {
    setLoading(true);
    try {
      const filters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 50,
      };
      const data = await revenueService.getRevenues(filters);
      setRevenues(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching revenues:', error);
      setRevenues([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading revenue records..." />;
  }

  return (
    <main className="revenue">
      <div className="container">
        <h1 className="page-title">Revenue & Recoveries</h1>

        <div className="card">
          <div className="card-header">
            <h3>All Revenue Records</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select
                className="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="collected">Collected</option>
                <option value="overdue">Overdue</option>
              </select>
              <button className="btn primary">+ New Revenue</button>
            </div>
          </div>

          {revenues.length === 0 ? (
            <EmptyState icon="📈" title="No revenue records found" message="No revenue records available." />
          ) : (
            <div className="table-wrap">
              <table className="tenders-table">
                <thead>
                  <tr>
                    <th>REVENUE ID</th>
                    <th>SOURCE</th>
                    <th>CATEGORY</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>DUE DATE</th>
                    <th>COLLECTED DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {revenues.map((rev) => (
                    <tr key={rev.id}>
                      <td className="mono">{rev.revenue_id}</td>
                      <td>{rev.source}</td>
                      <td>{rev.category}</td>
                      <td>${Number(rev.amount).toLocaleString()}</td>
                      <td>
                        <span className={`badge status-${rev.status}`}>
                          {rev.status}
                        </span>
                      </td>
                      <td>
                        {rev.due_date
                          ? new Date(rev.due_date).toLocaleDateString()
                          : '-'}
                      </td>
                      <td>
                        {rev.collected_date
                          ? new Date(rev.collected_date).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="actions">
                        <button className="icon-btn">👁️</button>
                        <button className="icon-btn">✏️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
