import React from 'react';
import './EmptyState.css';

const EmptyState = ({ icon = '📭', title = 'No data available', message = 'There are no items to display.' }) => {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">{icon}</div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-message">{message}</p>
        </div>
    );
};

export default EmptyState;
