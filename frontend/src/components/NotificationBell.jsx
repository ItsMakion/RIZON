import React, { useState, useEffect } from 'react';
import notificationsService from '../api/notifications';
import { useWebSocket } from '../hooks/useWebSocket';
import './NotificationPanel.css';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { lastMessage } = useWebSocket();

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        if (lastMessage) {
            // Add new notification to list
            setNotifications(prev => [lastMessage, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Optional: Play sound or show toast
        }
    }, [lastMessage]);

    const loadNotifications = async () => {
        try {
            const data = await notificationsService.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationsService.markRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsService.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all read:', error);
        }
    };

    return (
        <div className="notification-container">
            <button className="notification-bell" onClick={handleToggle}>
                🔔
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <>
                    <div className="notification-overlay" onClick={() => setIsOpen(false)}></div>
                    <div className="notification-panel">
                        <div className="panel-header">
                            <h3>Notifications</h3>
                            {unreadCount > 0 && (
                                <button className="mark-all-btn" onClick={handleMarkAllRead}>
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="empty-notifications">No notifications</div>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                                        onClick={() => handleMarkRead(notification.id)}
                                    >
                                        <div className="notification-icon">
                                            {notification.type === 'success' ? '✅' :
                                                notification.type === 'warning' ? '⚠️' :
                                                    notification.type === 'error' ? '❌' : 'ℹ️'}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-title">{notification.title}</div>
                                            <div className="notification-msg">{notification.message}</div>
                                            <div className="notification-time">
                                                {new Date(notification.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
