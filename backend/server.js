/**
 * Main Express Server Configuration
 *
 * This file sets up the Express.js server for the Reading List Manager application.
 * It includes middleware configuration, route setup, and server initialisation.
 *
 * Learning Notes:
 * - Express.js is a web framework for Node.js
 * - Middleware functions run between the request and response
 * - Routes define how the application responds to client requests
 */

// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

// Import route handlers
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');

// Import database utilities
const { initializeDatabase } = require('./utils/db');

// Create Express application instance
const app = express();

// Set the port from environment variable or default to 3001
const PORT = process.env.PORT || 3001;

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

/**
 * Security Middleware
 * helmet() sets various HTTP headers to help protect the app from vulnerabilities
 */
app.use(helmet());

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * This allows the frontend (running on a different port) to make requests to the backend
 *
 * TODO: Configure CORS properly for your frontend URL
 * Currently allows all origins - restrict this in production!
 */
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
    credentials: true, // Allow cookies to be sent with requests
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * Rate Limiting
 * Prevents too many requests from the same IP address
 * Helps protect against brute force attacks
 */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use(limiter);

/**
 * Request Logging
 * morgan logs HTTP requests to the console for debugging
 */
app.use(morgan('combined'));

/**
 * Body Parsing Middleware
 * express.json() parses incoming JSON requests
 * express.urlencoded() parses form data
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Session Configuration
 * Sessions allow us to store user data between requests
 *
 * TODO: Implement session configuration
 * - Set up a secure session secret
 * - Configure session store (for production, consider using a database)
 * - Set appropriate cookie options
 */
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-this-in-production',
    resave: true, // changed from false
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true, // Prevent XSS attacks
        sameSite: 'lax', // Crucial for session persistence
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

/**
 * Serve static files from frontend build
 * In production, this serves the built Svelte application
 */
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
}

// =============================================================================
// ROUTE CONFIGURATION
// =============================================================================

/**
 * API Routes
 * All API routes are prefixed with /api
 */
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

/**
 * Health Check Endpoint
 * Simple endpoint to check if the server is running
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Reading List Manager API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * Root endpoint with API information
 */
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the Reading List Manager API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            books: '/api/books',
            public: '/api/books/public',
            health: '/api/health'
        },
        documentation: '/api/docs' // TODO: Add API documentation
    });
});

/**
 * Catch-all handler for frontend routes (SPA support)
 * In production, serves the frontend app for any non-API routes
 */
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
}

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================

/**
 * 404 Handler
 * Handles requests to non-existent routes
 */
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.path}`,
        availableRoutes: ['/api/auth', '/api/books', '/api/health']
    });
});

/**
 * Global Error Handler
 * Catches and handles any errors that occur in the application
 *
 * TODO: Implement comprehensive error handling
 * - Log errors appropriately
 * - Send appropriate error responses
 * - Handle different error types (validation, database, etc.)
 */
app.use((error, req, res, next) => {
    console.error('Error occurred:', error);

    // Default error response
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// =============================================================================
// SERVER INITIALISATION
// =============================================================================

/**
 * Start the server
 * First initialise the database, then start listening for requests
 */
async function startServer() {
    try {
        // TODO: Implement database initialisation
        console.log('Initialising database...');
        await initializeDatabase();
        console.log('Database initialised successfully');

        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔧 API available at http://localhost:${PORT}/api`);
            console.log('📚 Reading List Manager Backend is ready!');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

// Export the app for testing purposes
module.exports = app;
