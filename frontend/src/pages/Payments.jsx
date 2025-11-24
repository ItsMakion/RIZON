import React, { useState } from 'react';
import 'font-awesome/css/font-awesome.min.css';

export default function Payments() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Sample payment data
  const payments = [
    { id: 'PAY-2023-156', payee: 'Global Tech Solutions', reference: 'INV-GT-45678', method: 'Bank Transfer', date: 'May 18, 2023', status: 'Pending Approval', amount: 24565 },
    { id: 'PAY-2023-155', payee: 'Office Supplies Ltd', reference: 'INV-OS-78342', method: 'Airtel Money', date: 'May 17, 2023', status: 'Pending Approval', amount: 3245 },
    { id: 'PAY-2023-154', payee: 'Maintenance Services Co.', reference: 'INV-MS-2023-45', method: 'TNM Mobile', date: 'May 16, 2023', status: 'Pending Approval', amount: 8750 },
    { id: 'PAY-2023-153', payee: 'Green Energy Solutions', reference: 'INV-GES-7890', method: 'Bank Transfer', date: 'May 15, 2023', status: 'Processing', amount: 32875 },
    { id: 'PAY-2023-152', payee: 'Medical Supplies Inc.', reference: 'INV-MS-2023-78', method: 'Check', date: 'May 14, 2023', status: 'Processing', amount: 15400 },
    // More payment data...
  ];

  const pageCount = Math.ceil(payments.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const pagePayments = payments.slice(start, start + pageSize);

  return (
    <main className="payments-page">
      <div className="container">
        <header className="header">
          <div className="page-title">
            <h1>Payments</h1>
          </div>
          <div className="header-actions">
            <button className="btn primary">
              <i className="fas fa-calendar-plus"></i> Schedule Payment</button>
            <button className="btn ghost">
              <i className="fas fa-layer-group"></i> Create Batch</button>
          </div>
        </header>

        {/* Payment Overview Section */}
        <section className="payment-overview">
          <div className="overview-item">
            <h3>Pending Payments</h3>
            <p>$245,650</p>
            <span>18 Items</span>
          </div>
          <div className="overview-item">
            <h3>Scheduled Payments</h3>
            <p>$428,560</p>
            <span>23 Items</span>
          </div>
          <div className="overview-item">
            <h3>Completed (This Month)</h3>
            <p>$1,245,890</p>
            <span>47 Items</span>
          </div>
        </section>

        {/* Tabs for Different Payment Types */}
        <section className="tabs card">
          <div className="header-actions">
            <div className="input-field">
              <label className= "input-label"> Search </label>
              <input className="search" type="text" placeholder="Search payments..." />
            </div>
            <div className="input-field">
              <label className= "input-label"> Status </label>
              <select className="select">
                <option value="">All status</option>
                <option value="custom">Pending</option>
                <option value="custom">Scheduled</option>
                <option value="custom">Processing</option>
                <option value="custom">Completed</option>
                <option value="custom">Failed</option>
              </select>
            </div>
            <div className="input-field">
              <label className= "input-label"> Filter By: </label>
              <select className="select">
                <option value="">Select a date range</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div className="input-field">
              <label className= "input-label"> Filter By: </label>
              <select className="select">
                <option value="">Select a date range</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <button className="btn ghost">
              <i className='fa-solid fa-filter'></i> Filter</button>   
          </div>
        </section>

        {/* Payments Table Section */}
        <section className="payments-table">
          <table>
            <thead>
              <tr>
                <th>PAYMENT ID</th>
                <th>PAYEE</th>
                <th>REFERENCE</th>
                <th>METHOD</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {pagePayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.payee}</td>
                  <td>{payment.reference}</td>
                  <td>{payment.method}</td>
                  <td>{payment.date}</td>
                  <td>{payment.status}</td>
                  <td>{`$${payment.amount.toLocaleString()}`}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
            <span>{currentPage}</span>
            <button disabled={currentPage === pageCount} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
          </div>
        </section>
      </div>
    </main>
  );
}



