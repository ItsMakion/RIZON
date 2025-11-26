import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const ws = useRef(null);
    const { user } = useAuth();
    const reconnectTimeout = useRef(null);

    useEffect(() => {
        if (!user) return;

        const connect = () => {
            // Get token from storage
            const token = localStorage.getItem('token');
            if (!token) return;

            const wsUrl = `ws://localhost:8000/ws/${user.id}?token=${token}`;
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
            };

            ws.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    setLastMessage(message);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            ws.current.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
                // Reconnect after 3 seconds
                reconnectTimeout.current = setTimeout(connect, 3000);
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                ws.current.close();
            };
        };

        connect();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
        };
    }, [user]);

    return { isConnected, lastMessage };
};
