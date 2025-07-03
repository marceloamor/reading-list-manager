/**
 * Book Management Routes
 * 
 * This file handles all book-related operations including:
 * - CRUD operations for user's personal books
 * - Public statistics endpoint for anonymised book data
 * - Input validation and user authorization
 * 
 * Learning Notes:
 * - CRUD stands for Create, Read, Update, Delete
 * - All personal book operations require authentication
 * - Public endpoints don't require authentication but return anonymised data
 */

const express = require('express');
const { body, validationResult, param } = require('express-validator');

// Import database functions
const {
    createBook,
    getBooksByUserId,
    getBookById,
    updateBook,
    deleteBook,
    getPublicBookStats
} = require('../utils/db');

// Import authentication middleware
const { requireAuth } = require('../middleware/auth');

// Create router instance
const router = express.Router();

// =============================================================================
// VALIDATION RULES
// =============================================================================

/**
 * Validation rules for creating/updating books
 */
const bookValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 1, max: 255 })
        .withMessage('Title must be between 1 and 255 characters'),
    
    body('author')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Author name must not exceed 255 characters'),
    
    body('genre')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Genre must not exceed 100 characters'),
    
    body('status')
        .optional()
        .isIn(['to-read', 'reading', 'read'])
        .withMessage('Status must be one of: to-read, reading, read'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters')
];

/**
 * Validation for book ID parameter
 */
const bookIdValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Book ID must be a positive integer')
];

// =============================================================================
// AUTHENTICATED ROUTES (require login)
// =============================================================================

/**
 * GET /api/books
 * Get all books for the authenticated user
 * 
 * Query parameters:
 * - status: filter by reading status (optional)
 * - genre: filter by genre (optional)
 * - search: search in title and author (optional)
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { status, genre, search } = req.query;

        // TODO: Implement user's books retrieval with filtering
        // 1. Get user ID from session
        // 2. Fetch books from database with optional filters
        // 3. Apply search if provided
        // 4. Return books array

        // PLACEHOLDER: Remove this and implement actual logic
        res.status(501).json({
            error: 'Book retrieval not implemented yet',
            todo: [
                'Get userId from session',
                'Apply filters (status, genre, search)',
                'Fetch books from database',
                'Return books array'
            ],
            filters: { status, genre, search }
        });

        // EXAMPLE IMPLEMENTATION STRUCTURE:
        /*
        // Build filter object
        const filters = {};
        if (status) filters.status = status;
        if (genre) filters.genre = genre;
        if (search) filters.search = search;

        // Get books for user
        const books = await getBooksByUserId(userId, filters);

        res.json({
            books: books,
            count: books.length,
            filters: filters
        });
        */

    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({
            error: 'Internal server error fetching books'
        });
    }
});

/**
 * POST /api/books
 * Create a new book for the authenticated user
 * 
 * Expected body:
 * {
 *   "title": "string (required)",
 *   "author": "string (optional)",
 *   "genre": "string (optional)",
 *   "status": "to-read|reading|read (optional, default: to-read)",
 *   "notes": "string (optional)"
 * }
 */
router.post('/', requireAuth, bookValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const userId = req.session.userId;
        const { title, author, genre, status = 'to-read', notes } = req.body;

        // TODO: Implement book creation
        // 1. Get user ID from session
        // 2. Validate and sanitise input data
        // 3. Create book in database
        // 4. Return created book data

        // PLACEHOLDER: Remove this and implement actual logic
        res.status(501).json({
            error: 'Book creation not implemented yet',
            todo: [
                'Validate input data',
                'Create book with user ID',
                'Return created book data'
            ],
            received: { title, author, genre, status, notes }
        });

        // EXAMPLE IMPLEMENTATION STRUCTURE:
        /*
        // Create book object
        const bookData = {
            title: title.trim(),
            author: author ? author.trim() : null,
            genre: genre ? genre.trim() : null,
            status: status,
            notes: notes ? notes.trim() : null,
            user_id: userId
        };

        // Save to database
        const bookId = await createBook(bookData);

        // Fetch the created book to return full data
        const createdBook = await getBookById(bookId);

        res.status(201).json({
            message: 'Book created successfully',
            book: createdBook
        });
        */

    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({
            error: 'Internal server error creating book'
        });
    }
});

/**
 * GET /api/books/:id
 * Get a specific book by ID (only if it belongs to the authenticated user)
 */
router.get('/:id', requireAuth, bookIdValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const userId = req.session.userId;
        const bookId = parseInt(req.params.id);

        // TODO: Implement single book retrieval
        // 1. Get book from database by ID
        // 2. Check if book belongs to authenticated user
        // 3. Return book data or 404 if not found/not owned

        // PLACEHOLDER: Remove this and implement actual logic
        res.status(501).json({
            error: 'Single book retrieval not implemented yet',
            todo: [
                'Fetch book by ID',
                'Verify book belongs to user',
                'Return book data'
            ],
            bookId: bookId,
            userId: userId
        });

        // EXAMPLE IMPLEMENTATION STRUCTURE:
        /*
        const book = await getBookById(bookId);

        if (!book) {
            return res.status(404).json({
                error: 'Book not found'
            });
        }

        if (book.user_id !== userId) {
            return res.status(403).json({
                error: 'Access denied: This book belongs to another user'
            });
        }

        res.json({ book });
        */

    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({
            error: 'Internal server error fetching book'
        });
    }
});

/**
 * PUT /api/books/:id
 * Update a specific book (only if it belongs to the authenticated user)
 * 
 * Expected body: Same as POST /api/books
 */
router.put('/:id', requireAuth, bookIdValidation, bookValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const userId = req.session.userId;
        const bookId = parseInt(req.params.id);
        const { title, author, genre, status, notes } = req.body;

        // TODO: Implement book update
        // 1. Check if book exists and belongs to user
        // 2. Update book data in database
        // 3. Return updated book data

        // PLACEHOLDER: Remove this and implement actual logic
        res.status(501).json({
            error: 'Book update not implemented yet',
            todo: [
                'Verify book exists and belongs to user',
                'Update book data in database',
                'Return updated book'
            ],
            bookId: bookId,
            updates: { title, author, genre, status, notes }
        });

        // EXAMPLE IMPLEMENTATION STRUCTURE:
        /*
        // Check if book exists and belongs to user
        const existingBook = await getBookById(bookId);
        if (!existingBook) {
            return res.status(404).json({
                error: 'Book not found'
            });
        }

        if (existingBook.user_id !== userId) {
            return res.status(403).json({
                error: 'Access denied: This book belongs to another user'
            });
        }

        // Prepare update data
        const updateData = {
            title: title.trim(),
            author: author ? author.trim() : null,
            genre: genre ? genre.trim() : null,
            status: status,
            notes: notes ? notes.trim() : null
        };

        // Update in database
        await updateBook(bookId, updateData);

        // Fetch updated book
        const updatedBook = await getBookById(bookId);

        res.json({
            message: 'Book updated successfully',
            book: updatedBook
        });
        */

    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({
            error: 'Internal server error updating book'
        });
    }
});

/**
 * DELETE /api/books/:id
 * Delete a specific book (only if it belongs to the authenticated user)
 */
router.delete('/:id', requireAuth, bookIdValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const userId = req.session.userId;
        const bookId = parseInt(req.params.id);

        // TODO: Implement book deletion
        // 1. Check if book exists and belongs to user
        // 2. Delete book from database
        // 3. Return success message

        // PLACEHOLDER: Remove this and implement actual logic
        res.status(501).json({
            error: 'Book deletion not implemented yet',
            todo: [
                'Verify book exists and belongs to user',
                'Delete book from database',
                'Return success message'
            ],
            bookId: bookId
        });

        // EXAMPLE IMPLEMENTATION STRUCTURE:
        /*
        // Check if book exists and belongs to user
        const book = await getBookById(bookId);
        if (!book) {
            return res.status(404).json({
                error: 'Book not found'
            });
        }

        if (book.user_id !== userId) {
            return res.status(403).json({
                error: 'Access denied: This book belongs to another user'
            });
        }

        // Delete book
        await deleteBook(bookId);

        res.json({
            message: 'Book deleted successfully',
            deletedBookId: bookId
        });
        */

    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({
            error: 'Internal server error deleting book'
        });
    }
});

// =============================================================================
// PUBLIC ROUTES (no authentication required)
// =============================================================================

/**
 * GET /api/books/public
 * Get anonymised book statistics across all users
 * 
 * Returns data like:
 * - Most popular books (by times added)
 * - Most popular genres
 * - Reading status distribution
 * - Top authors
 */
router.get('/public', async (req, res) => {
    try {
        // TODO: Implement public book statistics
        // 1. Query database for aggregated, anonymised data
        // 2. Calculate popular books, genres, authors
        // 3. Return statistics without revealing user information

        // PLACEHOLDER: Remove this and implement actual logic
        res.status(501).json({
            error: 'Public book statistics not implemented yet',
            todo: [
                'Aggregate book data across all users',
                'Calculate popular books and genres',
                'Ensure no user data is revealed',
                'Return anonymised statistics'
            ]
        });

        // EXAMPLE IMPLEMENTATION STRUCTURE:
        /*
        const stats = await getPublicBookStats();

        res.json({
            popular_books: stats.popular_books, // Most added books
            popular_genres: stats.popular_genres, // Most popular genres
            popular_authors: stats.popular_authors, // Most popular authors
            reading_status_distribution: stats.status_distribution,
            total_books: stats.total_books,
            total_users: stats.total_users
        });
        */

    } catch (error) {
        console.error('Error fetching public book statistics:', error);
        res.status(500).json({
            error: 'Internal server error fetching book statistics'
        });
    }
});

/**
 * GET /api/books/public/search
 * Search for books across all users (anonymised results)
 * 
 * Query parameters:
 * - q: search query
 * - genre: filter by genre
 */
router.get('/public/search', async (req, res) => {
    try {
        const { q: query, genre } = req.query;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                error: 'Search query must be at least 2 characters long'
            });
        }

        // TODO: Implement public book search
        // 1. Search books by title and author
        // 2. Apply genre filter if provided
        // 3. Return anonymised results (no user information)
        // 4. Include popularity metrics

        // PLACEHOLDER: Remove this and implement actual logic
        res.status(501).json({
            error: 'Public book search not implemented yet',
            todo: [
                'Search books by title/author',
                'Apply genre filtering',
                'Return anonymised results',
                'Include popularity scores'
            ],
            query: query,
            genre: genre
        });

        // EXAMPLE IMPLEMENTATION STRUCTURE:
        /*
        const searchResults = await searchPublicBooks(query, { genre });

        res.json({
            query: query,
            filters: { genre },
            results: searchResults,
            count: searchResults.length
        });
        */

    } catch (error) {
        console.error('Error searching public books:', error);
        res.status(500).json({
            error: 'Internal server error searching books'
        });
    }
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Helper function to sanitise book data
 */
function sanitiseBookData(bookData) {
    // TODO: Implement data sanitisation
    // - Trim whitespace
    // - Validate data types
    // - Handle null/undefined values
    // - Prevent XSS attacks

    return {
        title: bookData.title ? bookData.title.trim() : '',
        author: bookData.author ? bookData.author.trim() : null,
        genre: bookData.genre ? bookData.genre.trim() : null,
        status: bookData.status || 'to-read',
        notes: bookData.notes ? bookData.notes.trim() : null
    };
}

/**
 * Helper function to validate book ownership
 */
async function validateBookOwnership(bookId, userId) {
    // TODO: Implement ownership validation
    // - Check if book exists
    // - Verify it belongs to the user
    // - Return appropriate error if not

    try {
        const book = await getBookById(bookId);
        
        if (!book) {
            return { valid: false, error: 'Book not found', status: 404 };
        }
        
        if (book.user_id !== userId) {
            return { valid: false, error: 'Access denied', status: 403 };
        }
        
        return { valid: true, book: book };
    } catch (error) {
        return { valid: false, error: 'Database error', status: 500 };
    }
}

module.exports = router; 