import React, { useState } from 'react';
import RoleManagement from './RoleManagement';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('roles');

  return (
    <main className="dashboard">
      <div className="container">
        <h1 className="page-title">System Settings</h1>

        <div className="tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb' }}>
          <button
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'general' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'general' ? '#3b82f6' : '#6b7280',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            General
          </button>
          <button
            className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'roles' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'roles' ? '#3b82f6' : '#6b7280',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Roles & Permissions
          </button>
        </div>

        {activeTab === 'general' && (
          <div className="general-settings">
            <div className="card">
              <h3>General Configuration</h3>
              <p className="text-gray-500">System-wide settings will appear here.</p>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <RoleManagement />
        )}
      </div>
    </main>
  );
}
