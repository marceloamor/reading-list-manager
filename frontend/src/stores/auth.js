/**
 * Authentication Store
 * 
 * Simple Svelte store for managing user authentication state.
 * This handles login, logout, and session persistence.
 * 
 * Learning Notes:
 * - Svelte stores are reactive - components update automatically when store values change
 * - writable() creates a store that can be updated
 * - Custom stores allow us to add methods like login(), logout()
 */

import { writable } from 'svelte/store';

// =============================================================================
// STORE STATE
// =============================================================================

/**
 * Authentication state
 * Contains user info and authentication status
 */
const initialState = {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null
};

// Create the main auth store
const { subscribe, set, update } = writable(initialState);

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Check current authentication status with backend
 * Called when app loads to restore session
 */
async function checkAuthStatus() {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
        const response = await fetch('/api/auth/status', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.authenticated) {
                set({
                    isAuthenticated: true,
                    user: data.user,
                    isLoading: false,
                    error: null
                });
            } else {
                set({
                    isAuthenticated: false,
                    user: null,
                    isLoading: false,
                    error: null
                });
            }
        } else {
            // Not authenticated
            set({
                isAuthenticated: false,
                user: null,
                isLoading: false,
                error: null
            });
        }
    } catch (error) {
        console.error('Auth status check failed:', error);
        set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: 'Failed to check authentication status'
        });
    }
}

/**
 * Login user
 * Updates store state on successful login
 */
async function login(credentials) {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(credentials)
        });
        
        if (response.ok) {
            const data = await response.json();
            
            set({
                isAuthenticated: true,
                user: data.user,
                isLoading: false,
                error: null
            });
            
            return { success: true };
        } else {
            const errorData = await response.json();
            update(state => ({ 
                ...state, 
                isLoading: false, 
                error: errorData.error || 'Login failed' 
            }));
            
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.error('Login error:', error);
        update(state => ({ 
            ...state, 
            isLoading: false, 
            error: 'Network error during login' 
        }));
        
        return { success: false, error: 'Network error' };
    }
}

/**
 * Register new user
 * Automatically logs in after successful registration
 */
async function register(userData) {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            const data = await response.json();
            
            set({
                isAuthenticated: true,
                user: data.user,
                isLoading: false,
                error: null
            });
            
            return { success: true };
        } else {
            const errorData = await response.json();
            update(state => ({ 
                ...state, 
                isLoading: false, 
                error: errorData.error || 'Registration failed' 
            }));
            
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.error('Registration error:', error);
        update(state => ({ 
            ...state, 
            isLoading: false, 
            error: 'Network error during registration' 
        }));
        
        return { success: false, error: 'Network error' };
    }
}

/**
 * Logout user
 * Calls backend logout endpoint and clears store state
 */
async function logout() {
    update(state => ({ ...state, isLoading: true }));
    
    try {
        // Call backend logout endpoint
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        // Clear auth state regardless of backend response
        set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null
        });
        
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        
        // Still clear local state even if backend call fails
        set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null
        });
        
        return { success: true }; // Always return success for logout
    }
}

/**
 * Clear any error messages
 */
function clearError() {
    update(state => ({ ...state, error: null }));
}

// =============================================================================
// EXPORT AUTH STORE
// =============================================================================

/**
 * Custom auth store with methods
 * Components can subscribe to this store and call its methods
 */
export const authStore = {
    subscribe,
    checkAuthStatus,
    login,
    register,
    logout,
    clearError
};

// Export individual functions for convenience
export {
    checkAuthStatus,
    login,
    register,
    logout,
    clearError
}; 