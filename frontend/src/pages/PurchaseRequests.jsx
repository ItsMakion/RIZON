import React, { useState } from 'react';

export default function PurchaseRequests(){
  const sample = [
    ["PR-2023-089","Office Supplies Restock","Administration","Sarah Johnson","May 15, 2023","Approved","$2,450"],
    ["PR-2023-088","Software Licenses Renewal","IT","Mark Wilson","May 14, 2023","Pending Approval","$15,800"],
    ["PR-2023-087","Training Program Materials","Human Resources","Lisa Brown","May 12, 2023","Approved","$4,750"],
    ["PR-2023-086","Vehicle Maintenance Service","Operations","John Davis","May 10, 2023","Completed","$8,200"],
    ["PR-2023-085","Office Renovation Materials","Administration","Sarah Johnson","May 8, 2023","Rejected","$32,450"],
    ["PR-2023-084","Catering Services","Events","Paul Green","May 6, 2023","Approved","$1,200"],
    ["PR-2023-083","Conference Equipment","IT","Maya Singh","May 4, 2023","Pending Approval","$6,900"],
    ["PR-2023-082","Cleaning Supplies","Facilities","Rose Lee","May 2, 2023","Completed","$720"],
    ["PR-2023-081","Projector Replacement","IT","Ken Adams","Apr 28, 2023","Approved","$3,400"],
    ["PR-2023-080","Safety Gear","Operations","Ann Cole","Apr 25, 2023","Approved","$1,150"],
  ];

  const [rows, setRows] = useState(sample);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  function viewRow(id){
    const r = rows.find(rr=>rr[0]===id);
    alert(`View ${id}\n${r ? r[1] : ''}`);
  }
  function editRow(id){
    const r = rows.find(rr=>rr[0]===id);
    alert(`Edit ${id}\n${r ? r[1] : ''}`);
  }
  function downloadPdf(id){
    alert(`Download PDF for ${id}`);
  }

  return (
    <main className="dashboard">
      <div className="container">
        <h1 className="page-title">Purchase Requests</h1>

        {/* Screenshot header */}
        <div className="purchase-screenshot-wrap">
          <img src="/assets/purchase-requests.png" alt="Purchase Requests screenshot" className="purchase-screenshot" />
        </div>

        <div className="filters-row card">
          <div className="filters-grid">
            <input className="search" placeholder="Search purchase requests..." />
            <select className="select"><option>All Statuses</option></select>
            <select className="select"><option>All Departments</option></select>
            <input className="select" placeholder="Select date range" />
          </div>
          <div className="filters-actions">
            <button className="btn primary">+ New Purchase Request</button>
            <button className="btn ghost">Filter</button>
          </div>
        </div>

        <section className="card purchase-table">
          <div className="table-wrap">
            <table className="tenders-table">
              <thead>
                <tr>
                  <th>REQUEST ID</th>
                  <th>TITLE</th>
                  <th>DEPARTMENT</th>
                  <th>REQUESTER</th>
                  <th>DATE CREATED</th>
                  <th>STATUS</th>
                  <th>TOTAL VALUE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r,i)=>(
                  <tr key={r[0]} className={i%2===1? 'alt':''}>
                    <td className="mono">{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td>{r[3]}</td>
                    <td>{r[4]}</td>
                    <td>
                      <span className={`badge ${r[5]==='Approved'? 'status-approved' : r[5]==='Pending Approval'? 'status-pending' : r[5]==='Completed'? 'status-completed' : r[5]==='Rejected'? 'status-rejected' : ''}`}>{r[5]}</span>
                    </td>
                    <td>{r[6]}</td>
                    <td className="actions">
                      <button className="action-btn action-view" aria-label={`View ${r[0]}`} onClick={()=>viewRow(r[0])}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" fill="#fff"/></svg>
                      </button>
                      <button className="action-btn action-edit" aria-label={`Edit ${r[0]}`} onClick={()=>editRow(r[0])}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="#fff"/></svg>
                      </button>
                      <button className="action-btn action-pdf" aria-label={`PDF ${r[0]}`} onClick={()=>downloadPdf(r[0])}>
                        <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#fff"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.5L18.5 9H13V3.5zM8 13h2v6H8v-6zm4 0h2v6h-2v-6z"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <div className="results-count">Showing {start+1} to {Math.min(start+pageSize, rows.length)} of {rows.length} results</div>
            <div className="pagination">
              <button className="page-btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Previous</button>
              {Array.from({length:pageCount}).map((_,p)=>(
                <button key={p} className={`page-num ${page===p+1? 'active':''}`} onClick={()=>setPage(p+1)}>{p+1}</button>
              ))}
              <button className="page-btn" onClick={()=>setPage(p=>Math.min(pageCount,p+1))} disabled={page===pageCount}>Next</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
