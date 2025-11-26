import React, { useState, useEffect } from 'react';
import procurementService from '../api/procurement';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ExportButton from '../components/ExportButton';
import './Procurement.css';

export default function Procurement() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const pageSize = 10;

  useEffect(() => {
    fetchTenders();
  }, [selectedTab, currentPage, searchTerm]);

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const filters = {
        status: selectedTab,
        search: searchTerm,
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
      };
      const data = await procurementService.getTenders(filters);
      setTenders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tenders:', error);
      setTenders([]);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return <LoadingSpinner message="Loading tenders..." />;
    }

    if (tenders.length === 0) {
      return <EmptyState icon="📦" title="No tenders found" message={`No ${selectedTab} tenders available.`} />;
    }

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
            {tenders.map((tender, i) => (
              <tr key={tender.id}>
                <td className="mono">{tender.tender_id}</td>
                <td>{tender.title}</td>
                <td>{tender.category}</td>
                <td>{new Date(tender.published_date).toLocaleDateString()}</td>
                <td>{new Date(tender.deadline).toLocaleDateString()}</td>
                <td>{tender.bids_count}</td>
                <td>${Number(tender.estimated_value).toLocaleString()}</td>
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
  };

  return (
    <main className="procurement">
      <div className="container">
        <h1 className="page-title">Procurement & Tenders</h1>

        <div className="card">
          <div className="card-header">
            <h3>All Tenders</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                className="search"
                placeholder="Search tenders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ minWidth: '250px' }}
              />
              <div className="flex gap-3">
                <ExportButton module="procurement" />
                <button className="btn primary">+ New Tender</button>
              </div>
            </div>
          </div>

          <div className="tabs">
            {['active', 'draft', 'evaluation', 'awarded', 'archived'].map((tab) => (
              <button
                key={tab}
                className={`tab ${selectedTab === tab ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTab(tab);
                  setCurrentPage(1);
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {renderTabContent()}

          {!loading && tenders.length > 0 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={tenders.length < pageSize}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
