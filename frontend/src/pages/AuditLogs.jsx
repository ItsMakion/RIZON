import React, { useState, useEffect } from 'react';
import auditLogService from '../api/auditLogs';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [entityFilter, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filters = {
        entity_type: entityFilter !== 'all' ? entityFilter : undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        limit: 50,
      };
      const data = await auditLogService.getAuditLogs(filters);
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading audit logs..." />;
  }

  return (
    <main className="audit-logs">
      <div className="container">
        <h1 className="page-title">Audit Logs</h1>

        <div className="card">
          <div className="card-header">
            <h3>System Audit Trail</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select
                className="select"
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
              >
                <option value="all">All Entities</option>
                <option value="procurement">Procurement</option>
                <option value="payment">Payment</option>
                <option value="purchase_request">Purchase Request</option>
                <option value="revenue">Revenue</option>
              </select>
              <select
                className="select"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
              </select>
            </div>
          </div>

          {logs.length === 0 ? (
            <EmptyState icon="🧾" title="No audit logs found" message="No audit logs available." />
          ) : (
            <div className="table-wrap">
              <table className="tenders-table">
                <thead>
                  <tr>
                    <th>TIMESTAMP</th>
                    <th>ACTION</th>
                    <th>ENTITY TYPE</th>
                    <th>ENTITY ID</th>
                    <th>USER ID</th>
                    <th>IP ADDRESS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td>
                        <span className={`badge status-${log.action}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>{log.entity_type}</td>
                      <td className="mono">{log.entity_id}</td>
                      <td>{log.user_id}</td>
                      <td className="mono">{log.ip_address || '-'}</td>
                      <td className="actions">
                        <button className="icon-btn">👁️</button>
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
