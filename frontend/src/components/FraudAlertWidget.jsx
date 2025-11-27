import React, { useState, useEffect } from 'react';
import fraudService from '../api/fraud';
import './FraudAlertWidget.css';

export default function FraudAlertWidget() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const data = await fraudService.getAlerts(false); // Get unresolved
            setAlerts(data);
        } catch (error) {
            console.error('Error fetching fraud alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            await fraudService.resolveAlert(id);
            setAlerts(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error('Error resolving alert:', error);
        }
    };

    if (loading) return <div className="fraud-widget loading">Loading alerts...</div>;
    if (alerts.length === 0) return null; // Don't show if no alerts

    return (
        <div className="fraud-widget">
            <div className="fraud-header">
                <h3>⚠️ Fraud Alerts Detected</h3>
                <span className="badge-count">{alerts.length}</span>
            </div>
            <div className="fraud-list">
                {alerts.map(alert => (
                    <div key={alert.id} className={`fraud-item severity-${alert.severity}`}>
                        <div className="fraud-content">
                            <div className="fraud-desc">{alert.description}</div>
                            <div className="fraud-meta">
                                Detected: {new Date(alert.detected_at).toLocaleString()}
                            </div>
                        </div>
                        <button className="btn-resolve" onClick={() => handleResolve(alert.id)}>
                            Resolve
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
