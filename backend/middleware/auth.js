/**
 * Authentication Middleware
 *
 * This file contains middleware functions for handling user authentication.
 * We include functions to protect routes, check user sessions, and handle
 * authentication related functionality.
 */


function requireAuth(req, res, next) {
    try {
        // check if user session exists
            if (!req.session || !req.session.userId) {
                return res.status(401).json({
                error: 'Authentication required',
                message: 'Please log in to access this resource'
            });
        }
        // User is authenticated, go on!
        next();
    } catch (error) {
        console.error('Authentication middleware error:', error);
        res.status(500).json({
            error: 'Internal server error during authentication check'
        });
    }
}


function optionalAuth(req, res, next) {
    try {
        // check if user session exists
        if (req.session && req.session.userId) {
            // set req.user if authenticated
            req.user = {
                id: req.session.userId,
                username: req.session.username // assuming stored at login
            };
        }
        next();
    } catch (error) {
        console.error('Optional authentication middleware error:', error);
        // continue even if there's an error, just without user info
        next();
    }
}


function requireGuest(req, res, next) {
    try {
        // check if user is already logged in
        if (req.session && req.session.userId) {
        // return error if authenticated (they shouldn't access login/register)
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

// check user permissions/roles
function requireRole(requiredRoles) {
    return (req, res, next) => {
        try {
            // check if user session exists
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

// add user info to request
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

// log authentication events
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

    } catch (error) {
        console.error('Auth logging error:', error);
        // Continue even if logging fails
        next();
    }
}

// rate limiting middleware for authentication endpoints
function authRateLimit(options = {}) {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        max = 5, // 5 attempts per window
        message = 'Too many authentication attempts, please try again later'
    } = options;

    // return a placeholder middleware
    return (req, res, next) => {
        // basic implementation would store attempts in memory or database
        console.log(`Auth rate limit check for IP: ${req.ip}`);
        next();

        // This could use a more sophisticated rate limiting library
        // or implement custom logic with Redis/database storage in a prod env,
        // but for now, we'll just log the request
        const rateLimit = require('express-rate-limit');

        return rateLimit({
            windowMs,
            max,
            message: { error: message },
            standardHeaders: true,
            legacyHeaders: false,
        });
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
