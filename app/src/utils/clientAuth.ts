// Utility functions for managing client authentication via localStorage

/**
 * Save client name to localStorage (legacy - now uses user object)
 */
export const setClientName = (_name: string): void => {
    // This is now handled by storing the full user object
    console.warn('setClientName is deprecated - user object is stored automatically');
};

/**
 * Get current client name from stored user object
 */
export const getClientName = (): string | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
        const user = JSON.parse(userStr);
        return user.name || null;
    } catch {
        return null;
    }
};

/**
 * Check if client is logged in (has token and user stored)
 */
export const isLoggedIn = (): boolean => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
};

/**
 * Logout - clear client session
 */
export const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
