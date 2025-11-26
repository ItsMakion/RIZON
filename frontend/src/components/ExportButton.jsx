import React, { useState } from 'react';
import apiClient from '../api/client';
import './ExportButton.css';

export default function ExportButton({ module }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleExport = async (format) => {
        setLoading(true);
        setIsOpen(false);
        try {
            const response = await apiClient.get(`/api/v1/export/${module}?format=${format}`, {
                responseType: 'blob',
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const ext = format === 'csv' ? 'csv' : 'xlsx';
            link.setAttribute('download', `${module}_export.${ext}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="export-container">
            <button
                className="btn-secondary export-btn"
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
            >
                {loading ? 'Exporting...' : '📥 Export'}
            </button>

            {isOpen && (
                <>
                    <div className="export-overlay" onClick={() => setIsOpen(false)}></div>
                    <div className="export-menu">
                        <button onClick={() => handleExport('csv')}>
                            📄 CSV
                        </button>
                        <button onClick={() => handleExport('excel')}>
                            📊 Excel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
