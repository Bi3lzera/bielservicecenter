import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: any;
        Echo: any;
    }
}

window.Pusher = Pusher;

const authUrl = import.meta.env.VITE_API_AUTH_URL || 'http://localhost:8000';

export const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${authUrl}/broadcasting/auth`,
    auth: {
        headers: {
            // Get token dynamically (not at module load time)
            get Authorization() {
                const token = localStorage.getItem('token');
                return `Bearer ${token || ''}`;
            },
            Accept: 'application/json',
        },
    },
});

// Add connection status logging (only in development)
if (echo.connector && echo.connector.pusher) {
    const pusher = echo.connector.pusher;

    if (import.meta.env.DEV) {
        pusher.connection.bind('connected', () => {
            console.log('✅ [Echo] WebSocket connected successfully!');
        });

        pusher.connection.bind('disconnected', () => {
            console.warn('⚠️ [Echo] WebSocket disconnected');
        });

        pusher.connection.bind('error', (err: any) => {
            console.error('❌ [Echo] WebSocket error:', err);
        });

        console.log('[Echo] Connection state:', pusher.connection.state);
    }
}
