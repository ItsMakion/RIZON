import React, { useState, useEffect } from 'react';
import analyticsService from '../api/analytics';
import LoadingSpinner from '../components/LoadingSpinner';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [procurementTrends, setProcurementTrends] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [trends, summary] = await Promise.all([
        analyticsService.getProcurementTrends(),
        analyticsService.getPaymentSummary(),
      ]);
      setProcurementTrends(trends);
      setPaymentSummary(summary);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  const procurementChartData = procurementTrends
    ? {
      labels: Object.keys(procurementTrends.by_status || {}),
      datasets: [
        {
          label: 'Tenders by Status',
          data: Object.values(procurementTrends.by_status || {}),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        },
      ],
    }
    : null;

  const paymentChartData = paymentSummary
    ? {
      labels: Object.keys(paymentSummary.by_method || {}),
      datasets: [
        {
          label: 'Payments by Method',
          data: Object.values(paymentSummary.by_method || {}),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        },
      ],
    }
    : null;

  return (
    <main className="analytics">
      <div className="container">
        <h1 className="page-title">Analytics & Reports</h1>

        <div className="lower-grid">
          <section className="card">
            <h3>Procurement Trends</h3>
            <hr className="sidebar-divider" />
            {procurementChartData ? (
              <Bar
                data={procurementChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                  },
                }}
              />
            ) : (
              <p>No procurement data available</p>
            )}
          </section>

          <section className="card">
            <h3>Payment Summary</h3>
            <hr className="sidebar-divider" />
            {paymentChartData ? (
              <Pie
                data={paymentChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                  },
                }}
              />
            ) : (
              <p>No payment data available</p>
            )}
          </section>
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>Procurement by Category</h3>
          <hr className="sidebar-divider" />
          {procurementTrends?.by_category ? (
            <div className="table-wrap">
              <table className="tenders-table">
                <thead>
                  <tr>
                    <th>CATEGORY</th>
                    <th>COUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(procurementTrends.by_category).map(([category, count]) => (
                    <tr key={category}>
                      <td>{category}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No category data available</p>
          )}
        </div>
      </div>
    </main>
  );
}
