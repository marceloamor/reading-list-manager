/**
 * main application entry point
 * this file initialises the Svelte application and mounts it to the DOM.
 * it also sets up global error handling and development features.
 */

import App from './App.svelte'

// application initialisation

function initializeApp() {
    try {
        // Mount the main App component to the #app element
        const app = new App({
            target: document.getElementById('app'),
            
            // pass initial props if needed
            props: {
                version: __APP_VERSION__ || '1.0.0',
                apiUrl: __API_URL__ || '/api'
            }
        });

        // store app instance globally for debugging in development
        if (import.meta.env.DEV) {
            window.__SVELTE_APP__ = app;
            console.log('📱 Svelte app initialised in development mode');
            console.log('🔧 App instance available at window.__SVELTE_APP__');
        }

        return app;

    } catch (error) {
        console.error('❌ Failed to initialise Svelte application:', error);
        
        // Show fallback error UI
        showFallbackError(error);
        
        // Re-throw for global error handlers
        throw error;
    }
}

// show fallback error UI when the app fails to initialise

function showFallbackError(error) {
    const appContainer = document.getElementById('app');
    
    if (appContainer) {
        appContainer.innerHTML = `
            <div style="
                padding: 2rem;
                text-align: center;
                color: #dc2626;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                margin-top: 4rem;
            ">
                <h1 style="margin-bottom: 1rem; font-size: 2rem;">
                    ⚠️ Application Error
                </h1>
                <p style="margin-bottom: 1rem; color: #6b7280;">
                    Sorry, the Reading List Manager failed to load properly.
                </p>
                <details style="
                    margin-top: 2rem;
                    padding: 1rem;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 0.5rem;
                    text-align: left;
                ">
                    <summary style="cursor: pointer; font-weight: 600; margin-bottom: 0.5rem;">
                        Technical Details
                    </summary>
                    <pre style="
                        font-size: 0.875rem;
                        color: #991b1b;
                        white-space: pre-wrap;
                        word-break: break-word;
                    ">${error.message}${import.meta.env.DEV ? '\n\n' + error.stack : ''}</pre>
                </details>
                <div style="margin-top: 2rem;">
                    <button 
                        onclick="window.location.reload()" 
                        style="
                            background: #2563eb;
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 0.375rem;
                            cursor: pointer;
                            font-size: 1rem;
                        "
                    >
                        🔄 Reload Page
                    </button>
                </div>
            </div>
        `;
    }
}

// dev features

function setupDevelopmentFeatures() {
    if (!import.meta.env.DEV) return;

    // Enable more detailed error messages
    console.log('🔧 Development mode enabled');
    
    // Log environment information
    console.log('📊 Environment info:', {
        mode: import.meta.env.MODE,
        dev: import.meta.env.DEV,
        prod: import.meta.env.PROD,
        baseUrl: import.meta.env.BASE_URL
    });

    // Add development helpers to window
    window.__DEV_HELPERS__ = {
        // Helper to clear localStorage
        clearStorage: () => {
            localStorage.clear();
            sessionStorage.clear();
            console.log('🧹 Storage cleared');
        },
        
        // Helper to toggle debug mode
        toggleDebug: () => {
            const debug = localStorage.getItem('debug') === 'true';
            localStorage.setItem('debug', (!debug).toString());
            console.log(`🐛 Debug mode ${!debug ? 'enabled' : 'disabled'}`);
            window.location.reload();
        },
        
        // Helper to simulate offline mode
        goOffline: () => {
            console.log('📴 Simulating offline mode');
            // This would need additional implementation
        }
    };

    console.log('🛠️  Development helpers available at window.__DEV_HELPERS__');
}

// set up global error handling

function setupErrorHandling() {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
        console.error('💥 Global JavaScript error:', {
            message: event.message,
            filename: event.filename,
            line: event.lineno,
            column: event.colno,
            error: event.error
        });
        
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        
        // Prevent the default browser behaviour (logging to console)
        event.preventDefault();
    });
}

// check browser compatibility

function checkBrowserCompatibility() {
    const requiredFeatures = [
        'fetch',
        'Promise',
        'Map',
        'Set',
        'Array.from',
        'Object.assign'
    ];

    const missingFeatures = requiredFeatures.filter(feature => {
        try {
            return eval(feature) === undefined;
        } catch {
            return true;
        }
    });

    if (missingFeatures.length > 0) {
        console.warn('Browser compatibility warning:', {
            missing: missingFeatures,
            userAgent: navigator.userAgent
        });

        // Show compatibility warning
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: #f59e0b;">
                    <h1>Browser Compatibility Warning</h1>
                    <p>Your browser may not support all features of this application.</p>
                    <p>For the best experience, please use a modern browser.</p>
                    <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem;">
                        Continue Anyway
                    </button>
                </div>
            `;
        }
        
        return false;
    }

    return true;
}

// application startup

function startup() {
    console.log('Starting Reading List Manager...');

    // Set up error handling first
    setupErrorHandling();

    // Check browser compatibility
    if (!checkBrowserCompatibility()) {
        return; // Stop here if browser is incompatible
    }

    // Set up development features
    setupDevelopmentFeatures();

    // Initialise the main application
    const app = initializeApp();

    console.log('✅ Reading List Manager loaded successfully');
    
    return app;
}

// Start the application
const app = startup();

// Export the app instance (useful for testing)
export default app; 