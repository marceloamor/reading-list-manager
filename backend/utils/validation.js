/**
 * Input Validation Utilities
 * 
 * This file contains utility functions for validating user input data.
 * It includes validation for user registration, book data, and general input sanitisation.
 * 
 * Learning Notes:
 * - Always validate and sanitise user input to prevent security vulnerabilities
 * - Use regular expressions for pattern matching
 * - Provide clear, helpful error messages
 * - Consider both client-side and server-side validation
 */

/**
 * Validation result object structure
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the validation passed
 * @property {Array<string>} errors - Array of error messages
 * @property {Object} sanitised - Sanitised version of the input data
 */

// =============================================================================
// USER VALIDATION
// =============================================================================

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {ValidationResult} - Validation result
 */
function validateUsername(username) {
    const errors = [];
    
    // TODO: Implement username validation
    // 1. Check length requirements
    // 2. Check allowed characters
    // 3. Check for reserved usernames
    // 4. Sanitise the input

    // PLACEHOLDER: Basic validation structure
    const result = {
        isValid: false,
        errors: ['Username validation not implemented yet'],
        sanitised: username || ''
    };

    // EXAMPLE IMPLEMENTATION STRUCTURE:
    /*
    // Check if username exists
    if (!username || typeof username !== 'string') {
        errors.push('Username is required');
        return { isValid: false, errors, sanitised: '' };
    }

    // Trim and sanitise
    const sanitised = username.trim();

    // Check length
    if (sanitised.length < 3) {
        errors.push('Username must be at least 3 characters long');
    }
    if (sanitised.length > 30) {
        errors.push('Username must not exceed 30 characters');
    }

    // Check allowed characters (letters, numbers, underscores, hyphens)
    const usernamePattern = /^[a-zA-Z0-9_-]+$/;
    if (!usernamePattern.test(sanitised)) {
        errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }

    // Check for reserved usernames
    const reservedUsernames = ['admin', 'administrator', 'root', 'api', 'www', 'mail'];
    if (reservedUsernames.includes(sanitised.toLowerCase())) {
        errors.push('This username is reserved and cannot be used');
    }

    const result = {
        isValid: errors.length === 0,
        errors,
        sanitised
    };
    */

    return result;
}

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {ValidationResult} - Validation result
 */
function validatePassword(password) {
    const errors = [];

    // TODO: Implement password validation
    // 1. Check length requirements
    // 2. Check character requirements (uppercase, lowercase, numbers)
    // 3. Check for common weak passwords
    // 4. Optionally check against known compromised passwords

    // PLACEHOLDER: Basic validation structure
    const result = {
        isValid: false,
        errors: ['Password validation not implemented yet'],
        sanitised: password || ''
    };

    // EXAMPLE IMPLEMENTATION STRUCTURE:
    /*
    // Check if password exists
    if (!password || typeof password !== 'string') {
        errors.push('Password is required');
        return { isValid: false, errors, sanitised: '' };
    }

    // Check length
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    if (password.length > 128) {
        errors.push('Password must not exceed 128 characters');
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    // Check for common weak passwords
    const commonWeakPasswords = [
        'password', '123456', 'password123', 'admin', 'qwerty',
        'letmein', 'welcome', 'monkey', '1234567890'
    ];
    if (commonWeakPasswords.includes(password.toLowerCase())) {
        errors.push('Password is too common and easily guessable');
    }

    const result = {
        isValid: errors.length === 0,
        errors,
        sanitised: password // Don't modify password during validation
    };
    */

    return result;
}

/**
 * Validate user registration data
 * @param {Object} userData - User registration data
 * @returns {ValidationResult} - Validation result
 */
function validateUserRegistration(userData) {
    const errors = [];
    const sanitised = {};

    // TODO: Implement complete user registration validation
    // 1. Validate username
    // 2. Validate password
    // 3. Validate password confirmation
    // 4. Check for any additional fields

    // PLACEHOLDER: Basic validation structure
    const result = {
        isValid: false,
        errors: ['User registration validation not implemented yet'],
        sanitised: userData || {}
    };

    // EXAMPLE IMPLEMENTATION STRUCTURE:
    /*
    // Validate username
    const usernameResult = validateUsername(userData.username);
    if (!usernameResult.isValid) {
        errors.push(...usernameResult.errors);
    } else {
        sanitised.username = usernameResult.sanitised;
    }

    // Validate password
    const passwordResult = validatePassword(userData.password);
    if (!passwordResult.isValid) {
        errors.push(...passwordResult.errors);
    }

    // Validate password confirmation
    if (userData.password !== userData.confirmPassword) {
        errors.push('Password confirmation does not match password');
    }

    const result = {
        isValid: errors.length === 0,
        errors,
        sanitised
    };
    */

    return result;
}

// =============================================================================
// BOOK VALIDATION
// =============================================================================

/**
 * Validate book title
 * @param {string} title - Book title to validate
 * @returns {ValidationResult} - Validation result
 */
function validateBookTitle(title) {
    const errors = [];

    // TODO: Implement book title validation
    // 1. Check if title is provided
    // 2. Check length limits
    // 3. Sanitise HTML and special characters
    // 4. Trim whitespace

    // PLACEHOLDER: Basic validation structure
    const result = {
        isValid: false,
        errors: ['Book title validation not implemented yet'],
        sanitised: title || ''
    };

    // EXAMPLE IMPLEMENTATION STRUCTURE:
    /*
    // Check if title exists
    if (!title || typeof title !== 'string') {
        errors.push('Book title is required');
        return { isValid: false, errors, sanitised: '' };
    }

    // Trim and sanitise
    const sanitised = title.trim();

    // Check length
    if (sanitised.length === 0) {
        errors.push('Book title cannot be empty');
    }
    if (sanitised.length > 255) {
        errors.push('Book title must not exceed 255 characters');
    }

    const result = {
        isValid: errors.length === 0,
        errors,
        sanitised
    };
    */

    return result;
}

/**
 * Validate book author
 * @param {string} author - Book author to validate
 * @returns {ValidationResult} - Validation result
 */
function validateBookAuthor(author) {
    const errors = [];

    // TODO: Implement book author validation
    // 1. Author is optional, so handle null/undefined
    // 2. If provided, check length limits
    // 3. Sanitise input
    // 4. Validate format if needed

    // PLACEHOLDER: Basic validation structure
    const result = {
        isValid: true, // Author is optional
        errors: [],
        sanitised: author || null
    };

    // EXAMPLE IMPLEMENTATION STRUCTURE:
    /*
    // Author is optional
    if (!author || typeof author !== 'string') {
        return { isValid: true, errors: [], sanitised: null };
    }

    // Trim and sanitise
    const sanitised = author.trim();

    // If empty after trimming, treat as null
    if (sanitised.length === 0) {
        return { isValid: true, errors: [], sanitised: null };
    }

    // Check length
    if (sanitised.length > 255) {
        errors.push('Author name must not exceed 255 characters');
    }

    const result = {
        isValid: errors.length === 0,
        errors,
        sanitised
    };
    */

    return result;
}

/**
 * Validate book genre
 * @param {string} genre - Book genre to validate
 * @returns {ValidationResult} - Validation result
 */
function validateBookGenre(genre) {
    const errors = [];

    // TODO: Implement book genre validation
    // 1. Genre is optional
    // 2. If provided, check against allowed genres or free text
    // 3. Sanitise input
    // 4. Check length limits

    // PLACEHOLDER: Basic validation structure
    const result = {
        isValid: true, // Genre is optional
        errors: [],
        sanitised: genre || null
    };

    // EXAMPLE IMPLEMENTATION STRUCTURE:
    /*
    // Genre is optional
    if (!genre || typeof genre !== 'string') {
        return { isValid: true, errors: [], sanitised: null };
    }

    // Trim and sanitise
    const sanitised = genre.trim();

    // If empty after trimming, treat as null
    if (sanitised.length === 0) {
        return { isValid: true, errors: [], sanitised: null };
    }

    // Check length
    if (sanitised.length > 100) {
        errors.push('Genre must not exceed 100 characters');
    }

    // Optionally validate against predefined genres
    const allowedGenres = [
        'Fiction', 'Non-Fiction', 'Fantasy', 'Science Fiction', 'Mystery',
        'Romance', 'Thriller', 'Horror', 'Biography', 'History',
        'Self-Help', 'Business', 'Technology', 'Travel', 'Cooking'
    ];
    
    // This could be optional - allow free text or restrict to predefined list
    // if (!allowedGenres.includes(sanitised)) {
    //     errors.push('Invalid genre selected');
    // }

    const result = {
        isValid: errors.length === 0,
        errors,
        sanitised
    };
    */

    return result;
}

/**
 * Validate book reading status
 * @param {string} status - Reading status to validate
 * @returns {ValidationResult} - Validation result
 */
function validateBookStatus(status) {
    const errors = [];

    // TODO: Implement book status validation
    // 1. Check against allowed status values
    // 2. Provide default if not specified
    // 3. Sanitise input

    // PLACEHOLDER: Basic validation structure
    const result = {
        isValid: false,
        errors: ['Book status validation not implemented yet'],
        sanitised: status || 'to-read'
    };

    // EXAMPLE IMPLEMENTATION STRUCTURE:
    /*
    const allowedStatuses = ['to-read', 'reading', 'read'];
    const defaultStatus = 'to-read';

    // If no status provided, use default
    if (!status || typeof status !== 'string') {
        return { isValid: true, errors: [], sanitised: defaultStatus };
    }

    // Sanitise and check
    const sanitised = status.trim().toLowerCase();

    if (!allowedStatuses.includes(sanitised)) {
        errors.push(`Status must be one of: ${allowedStatuses.join(', ')}`);
        return { isValid: false, errors, sanitised: defaultStatus };
    }

    const result = {
        isValid: true,
        errors: [],
        sanitised
    };
    */

    return result;
}

/**
 * Validate book notes
 * @param {string} notes - Book notes to validate
 * @returns {ValidationResult} - Validation result
 */
function validateBookNotes(notes) {
    const errors = [];

    // TODO: Implement book notes validation
    // 1. Notes are optional
    // 2. Check length limits
    // 3. Sanitise HTML/special characters
    // 4. Handle line breaks appropriately

    // PLACEHOLDER: Basic validation structure
    const result = {
        isValid: true, // Notes are optional
        errors: [],
        sanitised: notes || null
    };

    // EXAMPLE IMPLEMENTATION STRUCTURE:
    /*
    // Notes are optional
    if (!notes || typeof notes !== 'string') {
        return { isValid: true, errors: [], sanitised: null };
    }

    // Trim and sanitise
    const sanitised = notes.trim();

    // If empty after trimming, treat as null
    if (sanitised.length === 0) {
        return { isValid: true, errors: [], sanitised: null };
    }

    // Check length
    if (sanitised.length > 1000) {
        errors.push('Notes must not exceed 1000 characters');
    }

    // Basic HTML sanitisation (remove script tags, etc.)
    const sanitisedHtml = sanitised
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

    const result = {
        isValid: errors.length === 0,
        errors,
        sanitised: sanitisedHtml
    };
    */

    return result;
}

/**
 * Validate complete book data
 * @param {Object} bookData - Book data to validate
 * @returns {ValidationResult} - Validation result
 */
function validateBookData(bookData) {
    const errors = [];
    const sanitised = {};

    // TODO: Implement complete book validation
    // 1. Validate all book fields
    // 2. Combine all validation results
    // 3. Return comprehensive result

    // PLACEHOLDER: Basic validation structure
    const result = {
        isValid: false,
        errors: ['Book data validation not implemented yet'],
        sanitised: bookData || {}
    };

    // EXAMPLE IMPLEMENTATION STRUCTURE:
    /*
    // Validate title (required)
    const titleResult = validateBookTitle(bookData.title);
    if (!titleResult.isValid) {
        errors.push(...titleResult.errors);
    } else {
        sanitised.title = titleResult.sanitised;
    }

    // Validate author (optional)
    const authorResult = validateBookAuthor(bookData.author);
    if (!authorResult.isValid) {
        errors.push(...authorResult.errors);
    } else {
        sanitised.author = authorResult.sanitised;
    }

    // Validate genre (optional)
    const genreResult = validateBookGenre(bookData.genre);
    if (!genreResult.isValid) {
        errors.push(...genreResult.errors);
    } else {
        sanitised.genre = genreResult.sanitised;
    }

    // Validate status (optional with default)
    const statusResult = validateBookStatus(bookData.status);
    if (!statusResult.isValid) {
        errors.push(...statusResult.errors);
    } else {
        sanitised.status = statusResult.sanitised;
    }

    // Validate notes (optional)
    const notesResult = validateBookNotes(bookData.notes);
    if (!notesResult.isValid) {
        errors.push(...notesResult.errors);
    } else {
        sanitised.notes = notesResult.sanitised;
    }

    const result = {
        isValid: errors.length === 0,
        errors,
        sanitised
    };
    */

    return result;
}

// =============================================================================
// GENERAL UTILITIES
// =============================================================================

/**
 * Sanitise HTML content to prevent XSS attacks
 * @param {string} input - Input string to sanitise
 * @returns {string} - Sanitised string
 */
function sanitiseHtml(input) {
    // TODO: Implement HTML sanitisation
    // 1. Remove dangerous HTML tags
    // 2. Escape special characters
    // 3. Allow safe formatting if needed

    if (!input || typeof input !== 'string') {
        return '';
    }

    // PLACEHOLDER: Basic sanitisation
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // EXAMPLE ENHANCED IMPLEMENTATION:
    /*
    // Remove dangerous tags
    let sanitised = input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
        .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');

    // Escape remaining HTML entities
    sanitised = sanitised
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

    return sanitised;
    */
}

/**
 * Validate email address format
 * @param {string} email - Email to validate
 * @returns {ValidationResult} - Validation result
 */
function validateEmail(email) {
    // TODO: Implement email validation
    // 1. Check email format with regex
    // 2. Check length limits
    // 3. Sanitise input

    const result = {
        isValid: false,
        errors: ['Email validation not implemented yet'],
        sanitised: email || ''
    };

    // EXAMPLE IMPLEMENTATION STRUCTURE:
    /*
    const errors = [];

    if (!email || typeof email !== 'string') {
        errors.push('Email is required');
        return { isValid: false, errors, sanitised: '' };
    }

    const sanitised = email.trim().toLowerCase();

    // Basic email regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(sanitised)) {
        errors.push('Please enter a valid email address');
    }

    // Check length
    if (sanitised.length > 254) {
        errors.push('Email address is too long');
    }

    const result = {
        isValid: errors.length === 0,
        errors,
        sanitised
    };
    */

    return result;
}

// Export all validation functions
module.exports = {
    // User validation
    validateUsername,
    validatePassword,
    validateUserRegistration,
    
    // Book validation
    validateBookTitle,
    validateBookAuthor,
    validateBookGenre,
    validateBookStatus,
    validateBookNotes,
    validateBookData,
    
    // General utilities
    sanitiseHtml,
    validateEmail
}; 