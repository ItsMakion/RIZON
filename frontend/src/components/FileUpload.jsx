import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import filesService from '../api/files';
import './FileUpload.css';

export default function FileUpload({ entityType, entityId, onUploadComplete }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setUploading(true);
        setError(null);
        setProgress(0);

        try {
            // Simulate progress (in real app, use XMLHttpRequest for actual progress)
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const result = await filesService.uploadFile(file, entityType, entityId);

            clearInterval(progressInterval);
            setProgress(100);

            setTimeout(() => {
                setUploading(false);
                setProgress(0);
                if (onUploadComplete) {
                    onUploadComplete(result);
                }
            }, 500);
        } catch (err) {
            setError(err.message || 'Upload failed');
            setUploading(false);
            setProgress(0);
        }
    }, [entityType, entityId, onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        disabled: uploading,
    });

    return (
        <div className="file-upload">
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <div className="upload-progress">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p>Uploading... {progress}%</p>
                    </div>
                ) : (
                    <div className="upload-prompt">
                        <span className="upload-icon">📎</span>
                        <p>
                            {isDragActive
                                ? 'Drop file here...'
                                : 'Drag & drop a file here, or click to select'}
                        </p>
                        <small>PDF, DOC, XLS, Images (Max 10MB)</small>
                    </div>
                )}
            </div>
            {error && <div className="upload-error">{error}</div>}
        </div>
    );
}
