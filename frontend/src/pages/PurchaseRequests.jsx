import React, { useState, useEffect } from 'react';
import purchaseRequestService from '../api/purchaseRequests';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function PurchaseRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, searchTerm]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const filters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm,
        limit: 50,
      };
      const data = await purchaseRequestService.getRequests(filters);
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await purchaseRequestService.approveRequest(id);
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      await purchaseRequestService.rejectRequest(id);
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading purchase requests..." />;
  }

  return (
    <main className="purchase-requests">
      <div className="container">
        <h1 className="page-title">Purchase Requests</h1>

        <div className="card">
          <div className="card-header">
            <h3>All Purchase Requests</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select
                className="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
              <input
                className="search"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn primary">+ New Request</button>
            </div>
          </div>

          {requests.length === 0 ? (
            <EmptyState icon="📝" title="No requests found" message="No purchase requests available." />
          ) : (
            <div className="table-wrap">
              <table className="tenders-table">
                <thead>
                  <tr>
                    <th>REQUEST ID</th>
                    <th>TITLE</th>
                    <th>DEPARTMENT</th>
                    <th>TOTAL VALUE</th>
                    <th>STATUS</th>
                    <th>CREATED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id}>
                      <td className="mono">{req.request_id}</td>
                      <td>{req.title}</td>
                      <td>{req.department}</td>
                      <td>${Number(req.total_value).toLocaleString()}</td>
                      <td>
                        <span className={`badge status-${req.status.replace('_', '-')}`}>
                          {req.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{new Date(req.created_at).toLocaleDateString()}</td>
                      <td className="actions">
                        {req.status === 'pending_approval' && (
                          <>
                            <button
                              className="btn small success"
                              onClick={() => handleApprove(req.id)}
                            >
                              ✓ Approve
                            </button>
                            <button
                              className="btn small danger"
                              onClick={() => handleReject(req.id)}
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
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
