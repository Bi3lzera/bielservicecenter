import React, { createContext, useContext, useEffect, useState } from 'react';
import { echo } from '../utils/echo';
import api from '../services/api';

export interface Notification {
    id: string;
    type: string;
    data: {
        ticket_id: string;
        title: string;
        message: string;
        sender?: string;
        type: string;
    };
    read_at: string | null;
    created_at: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    fetchNotifications: () => Promise<void>;
    addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!user || !user.id || !token) return;
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
            setUnreadCount(response.data.filter((n: Notification) => !n.read_at).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');

        console.log('[NotificationContext] Setup effect running', { user, token: !!token });

        // Only setup WebSocket notifications for authenticated users (admins)
        if (user && user.id && token) {
            console.log('[NotificationContext] Authenticated user detected, setting up WebSocket');
            fetchNotifications();

            // Listen to public notifications channel
            const channelName = 'notifications';
            console.log('[NotificationContext] Subscribing to PUBLIC channel:', channelName);

            echo.channel(channelName)  // PUBLIC channel - no auth needed!
                .listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (e: any) => {
                    console.log('🔔 [NotificationContext] Notification broadcast event received!', e);

                    // Check if notification is for current user using notifiable_id from broadcast
                    if (e.notifiable_id && e.notifiable_id === user.id) {
                        console.log('✅ Notification is for current user!');

                        const newNotification: Notification = {
                            id: e.id || Date.now().toString(),
                            type: e.type,
                            data: e,
                            read_at: null,
                            created_at: new Date().toISOString(),
                        };

                        console.log('[NotificationContext] Adding notification to state:', newNotification);
                        setNotifications(prev => [newNotification, ...prev]);
                        setUnreadCount(prev => prev + 1);
                    } else {
                        console.log('⏭️ Notification is for different user (notifiable_id:', e.notifiable_id, ', current user:', user.id, ')');
                    }
                });

            console.log('[NotificationContext] Channel subscribed successfully');

            return () => {
                console.log('[NotificationContext] Cleaning up, leaving channel:', channelName);
                echo.leave(channelName);
            };
        } else {
            console.log('[NotificationContext] Skipping WebSocket setup - no user or token', {
                hasUser: !!user,
                hasId: !!user?.id,
                hasToken: !!token
            });
        }
    }, [user?.id]);

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put(`/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const addNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications, addNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
