/**
 * Authentication Middleware
 *
 * This file contains middleware functions for handling user authentication.
 * It includes functions to protect routes, check user sessions, and handle
 * authentication-related functionality.
 *
 * Learning Notes:
 * - Middleware functions run between the request and response
 * - They can modify the request/response or terminate the chain
 * - Authentication middleware checks if users are logged in
 * - Use next() to continue to the next middleware or route handler
 */

/**
 * Middleware to require authentication
 * This function checks if a user is logged in before allowing access to a route
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requireAuth(req, res, next) {
    try {
        // TODO: Implement authentication check
        // 1. Check if user session exists
            if (!req.session || !req.session.userId) {
                return res.status(401).json({
                error: 'Authentication required',
                message: 'Please log in to access this resource'
            });
        }
        // User is authenticated, proceed
        next();
    } catch (error) {
        console.error('Authentication middleware error:', error);
        res.status(500).json({
            error: 'Internal server error during authentication check'
        });
    }
}

/**
 * Middleware to optionally check authentication
 * This function checks authentication but doesn't block access
 * Useful for routes that have different behavior for logged-in vs anonymous users
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function optionalAuth(req, res, next) {
    try {
        // TODO: Implement optional authentication check
        // 1. Check if user session exists
        if (req.session && req.session.userId) {
            // 2. Set req.user if authenticated
            req.user = {
                id: req.session.userId,
                username: req.session.username // assuming stored at login
            };
        }
        next();
    } catch (error) {
        console.error('Optional authentication middleware error:', error);
        // Continue even if there's an error, just without user info
        next();
    }
}

/**
 * Middleware to check if user is already authenticated
 * Useful for login/register routes where authenticated users should be redirected
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requireGuest(req, res, next) {
    try {
        // TODO: Implement guest-only check
        // 1. Check if user is already logged in
        if (req.session && req.session.userId) {
        // 2. Return error if authenticated (they shouldn't access login/register)
        return res.status(403).json({
                error: 'Already authenticated',
                message: 'You are already logged in'
            });
        }
        next();
    } catch (error) {
        console.error('Guest middleware error:', error);
        res.status(500).json({
            error: 'Internal server error during guest check'
        });
    }
}

/**
 * Middleware to check user permissions/roles
 * For future expansion if role-based access control is needed
 *
 * @param {string|Array} requiredRoles - Required role(s) for access
 * @returns {Function} - Middleware function
 */
function requireRole(requiredRoles) {
    return (req, res, next) => {
        try {
            // TODO: Implement role-based access control
            if (!req.session || !req.session.userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const userRoles = req.session.roles || [];
            const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

            const hasAccess = allowedRoles.some(role => userRoles.includes(role));

            if (!hasAccess) {
                return res.status(403).json({
                    error: 'Insufficient permissions',
                    required: allowedRoles,
                    current: userRoles
                });
            }
            next();
        } catch (error) {
            console.error('Role middleware error:', error);
            res.status(500).json({
                error: 'Internal server error during role check'
            });
        }
    };
}

/**
 * Middleware to add user info to request
 * Fetches user details and adds them to req.user for use in route handlers
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function attachUser(req, res, next) {
    try {
        // TODO: Implement user attachment
        if (!req.session || !req.session.userId) return next();

        const { findUserById } = require('../utils/db');

        const user = await findUserById(req.session.userId);

        if (user) {
            req.user = {
                id: user.id,
                username: user.username,
                created_at: user.created_at
            };
        }
        next();
    } catch (error) {
        console.error('Attach user middleware error:', error);
        // Continue without user info rather than failing the request
        next();
    }
}

/**
 * Middleware to log authentication events
 * Useful for security monitoring and debugging
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function logAuthEvent(req, res, next) {
    try {
        // TODO: Implement authentication event logging
        // 1. Log authentication attempts, successes, failures
        // 2. Include IP address, user agent, timestamp
        // 3. Store in logs for security monitoring

        // PLACEHOLDER: Basic console logging
        const isAuthenticated = !!(req.session && req.session.userId);
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');

        console.log(`Auth Event: ${req.method} ${req.path} - Authenticated: ${isAuthenticated} - IP: ${ip}`);

        next();

        // EXAMPLE ENHANCED IMPLEMENTATION:
        /*
        const authEvent = {
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.path,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            userId: req.session?.userId || null,
            authenticated: !!(req.session && req.session.userId),
            sessionId: req.sessionID
        };

        // Log to file, database, or external service
        console.log('Auth Event:', JSON.stringify(authEvent));

        next();
        */

    } catch (error) {
        console.error('Auth logging error:', error);
        // Continue even if logging fails
        next();
    }
}

/**
 * Rate limiting middleware for authentication endpoints
 * Prevents brute force attacks on login endpoints
 *
 * @param {Object} options - Rate limiting options
 * @returns {Function} - Middleware function
 */
function authRateLimit(options = {}) {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        max = 5, // 5 attempts per window
        message = 'Too many authentication attempts, please try again later'
    } = options;

    // TODO: Implement proper rate limiting
    // For now, return a placeholder middleware
    return (req, res, next) => {
        // PLACEHOLDER: Basic implementation would store attempts in memory or database
        console.log(`Auth rate limit check for IP: ${req.ip}`);
        next();

        // EXAMPLE IMPLEMENTATION STRUCTURE:
        /*
        // This would typically use a more sophisticated rate limiting library
        // or implement custom logic with Redis/database storage

        const rateLimit = require('express-rate-limit');

        return rateLimit({
            windowMs,
            max,
            message: { error: message },
            standardHeaders: true,
            legacyHeaders: false,
        });
        */
    };
}

// Export all middleware functions
module.exports = {
    requireAuth,
    optionalAuth,
    requireGuest,
    requireRole,
    attachUser,
    logAuthEvent,
    authRateLimit
};
