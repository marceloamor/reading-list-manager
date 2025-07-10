// Authentication routes for user registration, login, and logout

const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

// Import database functions
const {
    createUser,
    findUserByUsername,
    findUserById
} = require('../utils/db');

// Import authentication middleware
const { requireAuth } = require('../middleware/auth');

// Create router instance
const router = express.Router();

// validation rules for user registration
const registerValidation = [
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }
            return true;
        })
];

// validation rules for user login
const loginValidation = [
    body('username')
        .notEmpty()
        .withMessage('Username is required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// route handlers

/**
 * EXPECTED JSON PAYLOAD:
 * POST /api/auth/register 
 * register a new user account
 *
 * Expected body:
 * {
 *   "username": "string",
 *   "password": "string",
 *   "confirmPassword": "string"
 * }
 */
router.post('/register', registerValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        console.log('Incoming register payload:', req.body);

        const { username, password } = req.body;

        // Check the password strength
        const{ isStrong, requirements } = checkPasswordStrength(password);
        console.log('Password strength check:', { isStrong, requirements });
        if(!isStrong){
            return res.status(400).json({
                error: 'Password is too weak',
                requirements
            });
        }

        // 2. Check if username already exists
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({
                error: 'Username already exists'
            });
        }
        // 3. Hash the password using bcrypt functionality
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        // 4. Create the user in the database
        const userId = await createUser(username, passwordHash);
        // 5. Create a session for the new user
        req.session.userId = userId;
        req.session.username = username;
        // 6. Return success response
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: userId,
                username
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Internal server error during registration'
        });
    }
});

/**
 * POST /api/auth/login
 * Authenticate user and create session
 *
 * Expected JSON PAYLOAD`:
 * {
 *   "username": "string",
 *   "password": "string"
 * }
 */
router.post('/login', loginValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { username, password } = req.body;

        // TODO: Implement user login logic
        // 1. Find user by username
        const user = await findUserByUsername(username);
        if (!user) {
            return res.status(401).json({
                error: 'Invalid username or password'
            });
        }
        // 2. Compare provided password with stored hash
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Invalid username or password'
            });
        }
        // 3. Create session if authentication succeeds
        req.session.userId = user.id;
        req.session.username = user.username;
        // 4. Return user data
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Internal server error during login'
        });
    }
});

// POST /api/auth/logout
// destroy user session and log out
router.post('/logout', (req, res) => {
    try {
        // 1. Destroy the user session
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({
                    error: 'Failed to logout'
                });
            }
            
            // 2. Clear any relevant cookies connect.sid by default
            res.clearCookie('connect.sid');
            res.json({
                message: 'Logout successful'
            });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Internal server error during logout'
        });
    }
});

// GET /api/auth/me
// gets current user information
// requires authentication
router.get('/me', requireAuth, async (req, res) => {
    try {
        // TODO: Implement current user retrieval
        // 1. Get user ID from session
        const userId = req.session.userId;
        // 2. Fetch user data from database
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }
        // 3. Return user information (without password)
        res.json({
            user: {
                id: user.id,
                username: user.username,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('User info retrieval error:', error);
        res.status(500).json({
            error: 'Internal server error retrieving user info'
        });
    }
});

// GET /api/auth/status
// check if user is authenticated
router.get('/status', (req, res) => {
    // check if user session exists
    const isAuthenticated = !!req.session.userId;
    // return authentication status
    res.json({
        authenticated: isAuthenticated,
        ...(isAuthenticated && {
            user: {
                id: req.session.userId,
                username: req.session.username
            }
        })
    });
});

// helper functions

// password strength checker
function checkPasswordStrength(password) {
    // this includes checks for:
    // - length requirements
    // - character variety (uppercase, lowercase, numbers, symbols)

    const requirements = {
        length: password.length >= 6,
        hasLowercase: /[a-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    const isStrong = Object.values(requirements).every(Boolean);

    return {
        isStrong,
        requirements
    };
}

module.exports = router;
 