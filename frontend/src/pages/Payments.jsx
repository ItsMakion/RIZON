import React, { useState, useEffect } from 'react';
import paymentService from '../api/payments';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [statusFilter, methodFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsData, statsData] = await Promise.all([
        paymentService.getPayments({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          method: methodFilter !== 'all' ? methodFilter : undefined,
          limit: 50,
        }),
        paymentService.getPaymentStats(),
      ]);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (id) => {
    try {
      await paymentService.processPayment(id);
      fetchData(); // Refresh
      alert('Payment processing initiated');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading payments..." />;
  }

  return (
    <main className="payments">
      <div className="container">
        <h1 className="page-title">Payments</h1>

        {/* Payment Stats */}
        {stats && (
          <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
            <div className="metric-card">
              <div className="metric-label">Pending Approval</div>
              <div className="metric-value">{stats.pending?.count || 0}</div>
              <div className="metric-meta">${(stats.pending?.amount || 0).toLocaleString()}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Scheduled</div>
              <div className="metric-value">{stats.scheduled?.count || 0}</div>
              <div className="metric-meta">${(stats.scheduled?.amount || 0).toLocaleString()}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Completed (Month)</div>
              <div className="metric-value">{stats.completed_this_month?.count || 0}</div>
              <div className="metric-meta success">${(stats.completed_this_month?.amount || 0).toLocaleString()}</div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3>All Payments</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select
                className="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="scheduled">Scheduled</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              <select
                className="select"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="all">All Methods</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="airtel_money">Airtel Money</option>
                <option value="tnm_mobile">TNM Mobile</option>
                <option value="check">Check</option>
              </select>
              <button className="btn primary">+ New Payment</button>
            </div>
          </div>

          {payments.length === 0 ? (
            <EmptyState icon="💳" title="No payments found" message="No payments available." />
          ) : (
            <div className="table-wrap">
              <table className="tenders-table">
                <thead>
                  <tr>
                    <th>PAYMENT ID</th>
                    <th>PAYEE</th>
                    <th>REFERENCE</th>
                    <th>METHOD</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>PAYMENT DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="mono">{payment.payment_id}</td>
                      <td>{payment.payee}</td>
                      <td>{payment.reference}</td>
                      <td>{payment.method.replace('_', ' ')}</td>
                      <td>${Number(payment.amount).toLocaleString()}</td>
                      <td>
                        <span className={`badge status-${payment.status.replace('_', '-')}`}>
                          {payment.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        {payment.payment_date
                          ? new Date(payment.payment_date).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="actions">
                        {payment.status === 'scheduled' && (
                          <button
                            className="btn small primary"
                            onClick={() => handleProcessPayment(payment.id)}
                          >
                            Process
                          </button>
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
