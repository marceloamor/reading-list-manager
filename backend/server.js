// Reading List Manager Backend Server
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const { initializeDatabase } = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 3001;

// security middleware
app.use(helmet());

// CORS config
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use(limiter);

// Request logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// session configuration
// sessions allow us to store user data between requests

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

// serve static files from frontend build
// in production, this serves the built Svelte application
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
}

// route configuration
// all API routes are prefixed with /api
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// health check endpoint
// simple endpoint to check if the server is running
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Reading List Manager API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// root endpoint with API information
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

// catch-all handler for frontend routes (SPA support)
// in production, serves the frontend app for any non-API routes
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
}

// error handling middleware
// handles requests to non-existent routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.path}`,
        availableRoutes: ['/api/auth', '/api/books', '/api/health']
    });
});

// global error handler
// catches and handles any errors that occur in the application
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

// server initialisation
// first initialise the database, then start listening for requests
async function startServer() {
    try {
        console.log('Initializing database...');
        await initializeDatabase();
        console.log('Database initialized successfully');

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`API available at http://localhost:${PORT}/api`);
            console.log('Reading List Manager Backend is ready!');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// start the server
startServer();

// export the app for testing purposes
module.exports = app;
 