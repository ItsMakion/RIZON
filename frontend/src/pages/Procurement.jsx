import React, { useState } from 'react';

export default function Procurement() {
  // Sample dataset of tenders
  const base = [
    ["TN-2023-067", "Medical Supplies Procurement", "Medical", "May 15, 2023", "Jun 15, 2023", 12, "$250,000"],
    ["TN-2023-065", "IT Infrastructure Upgrade", "IT & Technology", "May 10, 2023", "Jun 10, 2023", 8, "$450,000"],
    ["TN-2023-064", "Office Furniture Supply", "Supplies", "May 8, 2023", "Jun 8, 2023", 5, "$75,000"],
    ["TN-2023-062", "Vehicle Fleet Maintenance", "Services", "May 5, 2023", "Jun 5, 2023", 7, "$180,000"],
    ["TN-2023-061", "Solar Power Installation", "Construction", "May 3, 2023", "Jun 3, 2023", 9, "$650,000"],
  ];

  // Generate 24 rows by repeating and changing IDs
  const rows = Array.from({ length: 24 }).map((_, i) => {
    const r = base[i % base.length].slice();
    const idNum = 67 - i;
    r[0] = `TN-2023-${String(idNum).toString().padStart(3, '0')}`;
    return r;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState('active'); // Track selected tab (active, draft, etc.)

  const pageSize = 5;
  const pageCount = Math.ceil(rows.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  // Function to render different content based on selected tab
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'active':
        return (
          <div className="table-wrap">
            <table className="tenders-table">
              <thead>
                <tr>
                  <th>TENDER ID</th>
                  <th>TITLE</th>
                  <th>CATEGORY</th>
                  <th>PUBLISHED DATE</th>
                  <th>DEADLINE</th>
                  <th>BIDS</th>
                  <th>EST. VALUE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r, i) => (
                  <tr key={i} className={i === 0 ? 'selected' : ''}>
                    <td className="mono">{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td>{r[3]}</td>
                    <td>{r[4]}</td>
                    <td>{r[5]}</td>
                    <td>{r[6]}</td>
                    <td className="actions">
                      <button className="icon-btn">👁️</button>
                      <button className="icon-btn">✏️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'draft':
        return <div>No tenders are in Draft state.</div>;
      case 'evaluation':
        return <div>No tenders are Under Evaluation.</div>;
      case 'awarded':
        return <div>No tenders are Awarded yet.</div>;
      case 'archived':
        return <div>No tenders are Archived.</div>;
      default:
        return null;
    }
  };

  return (
    <main className="dashboard">
      <div className="container">
        <h1 className="page-title">Procurement & Tenders</h1>

        <div className="filters-row card">
          <div className="filters-grid">
            <input className="search" placeholder="Search tenders..." />
            <select className="select"> <option>All Statuses</option> </select>
            <select className="select"> <option>All Categories</option> </select>
            <input className="select" placeholder="Select date range" />
          </div>
          <div className="filters-actions">
            <button className="btn primary">+ New Tender</button>
            <button className="btn ghost">Filter</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs card">
          <div
            className={`tab ${selectedTab === 'active' ? 'active' : ''}`}
            onClick={() => setSelectedTab('active')}
          >
            Active Tenders <span className="pill">24</span>
          </div>
          <div
            className={`tab ${selectedTab === 'draft' ? 'active' : ''}`}
            onClick={() => setSelectedTab('draft')}
          >
            Draft <span className="pill">6</span>
          </div>
          <div
            className={`tab ${selectedTab === 'evaluation' ? 'active' : ''}`}
            onClick={() => setSelectedTab('evaluation')}
          >
            Under Evaluation <span className="pill">10</span>
          </div>
          <div
            className={`tab ${selectedTab === 'awarded' ? 'active' : ''}`}
            onClick={() => setSelectedTab('awarded')}
          >
            Awarded <span className="pill">32</span>
          </div>
          <div
            className={`tab ${selectedTab === 'archived' ? 'active' : ''}`}
            onClick={() => setSelectedTab('archived')}
          >
            Archived <span className="pill">78</span>
          </div>
        </div>

        {/* Content changes based on the selected tab */}
        <section className="card hot-tenders">
          {renderTabContent()} {/* This renders the appropriate content based on selected tab */}
          
          {/* Pagination (only shown for 'active' tab here) */}
          {selectedTab === 'active' && (
            <div className="table-footer">
              <div className="results-count">
                Showing {start + 1} to {Math.min(start + pageSize, rows.length)} of {rows.length} results
              </div>
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {Array.from({ length: pageCount }).map((_, p) => (
                  <button
                    key={p}
                    className={`page-num ${currentPage === p + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p + 1)}
                  >
                    {p + 1}
                  </button>
                ))}
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                  disabled={currentPage === pageCount}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
