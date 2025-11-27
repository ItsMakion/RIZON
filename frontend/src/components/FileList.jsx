import React, { useState, useEffect } from 'react';
import filesService from '../api/files';
import './FileList.css';

export default function FileList({ entityType, entityId }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFiles();
    }, [entityType, entityId]);

    const loadFiles = async () => {
        try {
            const data = await filesService.listFiles(entityType, entityId);
            setFiles(data);
        } catch (error) {
            console.error('Error loading files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fileId) => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        try {
            await filesService.deleteFile(fileId);
            setFiles(files.filter(f => f.id !== fileId));
        } catch {
            alert('Failed to delete file');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (loading) {
        return <div className="file-list-loading">Loading files...</div>;
    }

    if (files.length === 0) {
        return <div className="file-list-empty">No files attached</div>;
    }

    return (
        <div className="file-list">
            <h4>Attached Files ({files.length})</h4>
            <div className="files-grid">
                {files.map((file) => (
                    <div key={file.id} className="file-item">
                        <div className="file-icon">📄</div>
                        <div className="file-info">
                            <div className="file-name" title={file.original_filename}>
                                {file.original_filename}
                            </div>
                            <div className="file-meta">
                                {formatFileSize(file.file_size)} • {new Date(file.uploaded_at).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="file-actions">
                            <a
                                href={filesService.getDownloadUrl(file.id)}
                                download
                                className="file-action-btn"
                                title="Download"
                            >
                                ⬇️
                            </a>
                            <button
                                onClick={() => handleDelete(file.id)}
                                className="file-action-btn delete"
                                title="Delete"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
