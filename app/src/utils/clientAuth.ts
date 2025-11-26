// Utility functions for managing client name authentication via localStorage

const STORAGE_KEY = 'biel_service_center_client_name';

/**
 * Save client name to localStorage
 */
export const setClientName = (name: string): void => {
    localStorage.setItem(STORAGE_KEY, name.trim());
};

/**
 * Get current client name
 */
export const getClientName = (): string | null => {
    return localStorage.getItem(STORAGE_KEY);
};

/**
 * Check if client is logged in (has name stored)
 */
export const isLoggedIn = (): boolean => {
    return getClientName() !== null;
};

/**
 * Logout - clear client name
 */
export const logout = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};
