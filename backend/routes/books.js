// Book management routes and public statistics

const express = require('express');
const { body, validationResult, param } = require('express-validator');

// Import database functions
const {
    createBook,
    getBooksByUserId,
    getBookById,
    updateBook,
    deleteBook,
    getPublicBookStats,
    searchPublicBooks
} = require('../utils/db');

// Import authentication middleware
const { requireAuth } = require('../middleware/auth');

// Create router instance
const router = express.Router();

// validation rules for creating/updating books
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

// validation for book ID parameter
const bookIdValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Book ID must be a positive integer')
];

// public routes (no authentication required)

// GET /api/books/public
// get anonymised book statistics across all users
// returns data like:
// - most popular books (by times added)
// - most popular genres
// - reading status distribution
// - top authors
router.get('/public', async (req, res) => {
    try {
        // get aggregated, anonymised statistics
        const stats = await getPublicBookStats();

        res.json({
            popular_books: stats.popular_books,
            popular_genres: stats.popular_genres,
            popular_authors: stats.popular_authors,
            reading_status_distribution: stats.status_distribution,
            total_books: stats.total_books,
            total_users: stats.total_users
        });

    } catch (error) {
        console.error('Error fetching public book statistics:', error);
        res.status(500).json({
            error: 'Internal server error fetching book statistics'
        });
    }
});

// GET /api/books/public/search
// search for books across all users (anonymised results)
// query parameters:
// - q: search query
// - genre: filter by genre
router.get('/public/search', async (req, res) => {
    try {
        const { q: query, genre } = req.query;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                error: 'Search query must be at least 2 characters long'
            });
        }

        // Search books with optional genre filter
        const searchResults = await searchPublicBooks(query.trim(), { genre });

        res.json({
            query: query,
            filters: { genre: genre || null },
            results: searchResults,
            count: searchResults.length
        });

    } catch (error) {
        console.error('Error searching public books:', error);
        res.status(500).json({
            error: 'Internal server error searching books'
        });
    }
});

// authenticated routes (require login)

// GET /api/books/:id
// get a specific book by ID (only if it belongs to the authenticated user)
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

        // get book from database by ID
        const book = await getBookById(bookId);
        // check if book belongs to authenticated user
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        if (book.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied: This book belongs to another user' });
        }
        // 3. Return book data or 404 if not found/not owned
        res.json({ book });
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({
            error: 'Internal server error fetching book'
        });
    }
});

// GET /api/books - Fetch all books for authenticated user
router.get('/', requireAuth, async (req, res) => {
  try {
    // get books from database using the user's ID from session
    const books = await getBooksByUserId(req.session.userId);

    // always return an array (empty if no books) to prevent undefined errors
    res.json({ books: books || [] });

  } catch (error) {
    // proper error handling instead of 501 placeholder
    console.error('GET /books error:', error);
    res.status(500).json({
      error: "Failed to fetch books",
      // Only include stack trace in development
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// POST /api/books - Create a new book

router.post('/',
  requireAuth,
  bookValidation,
  async (req, res) => {
    try {
      // create book 
      const book = await createBook({
        title: req.body.title,        // Required
        author: req.body.author || null,  // Explicit default
        genre: req.body.genre || null,
        status: req.body.status || 'to-read',
        notes: req.body.notes || null,
        user_id: req.session.userId    // Critical
      });

      // return ALL fields with consistent structure
      console.log('📘 Book created:', book);
      res.status(201).json({
        id: book.id,                  // MUST include
        title: book.title,
        author: book.author,
        genre: book.genre,
        status: book.status,
        notes: book.notes,
        user_id: book.user_id,
        created_at: book.created_at
      });

    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          error: error.message
        });
      }

      console.error('Database error:', error);
      res.status(500).json({
        error: "Failed to create book",
        // Only show details in dev env
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message
        })
      });
    }
});

// PUT /api/books/:id
// update a specific book (only if it belongs to the authenticated user)
// expected body: same as POST /api/books
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

        // check if book exists and belongs to user
        const existingBook = await getBookById(bookId);
        if (!existingBook) {
            return res.status(404).json({ error: 'Book not found' });
        }
        if (existingBook.user_id !== userId) {
            return res.status(403).json({ error: 'Access denied: This book belongs to another user' });
        }
        // update book data in database
        const updateData = {
            title: title.trim(),
            author: author ? author.trim() : null,
            genre: genre ? genre.trim() : null,
            status,
            notes: notes ? notes.trim() : null
        };
        // return updated book data
        await updateBook(bookId, updateData);
        const updatedBook = await getBookById(bookId);

        res.json({
            message: 'Book updated successfully',
            book: updatedBook
        });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({
            error: 'Internal server error updating book'
        });
    }
});

// DELETE /api/books/:id
// delete a specific book (only if it belongs to the authenticated user)
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

        // check if book exists and belongs to user
        const book = await getBookById(bookId);

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        if (book.user_id !== userId) {
            return res.status(403).json({ error: 'Access denied: This book belongs to another user' });
        }
        // delete book from database
        await deleteBook(bookId);
        // return success message
        res.json({
            message: 'Book deleted successfully',
            deletedBookId: bookId
        });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({
            error: 'Internal server error deleting book'
        });
    }
});

// HELPER FUNCTIONS

// sanitise book data
function sanitiseBookData(bookData) {
    // - trim whitespace
    // - validate data types
    // - handle null/undefined values

    return {
        title: bookData.title ? bookData.title.trim() : '',
        author: bookData.author ? bookData.author.trim() : null,
        genre: bookData.genre ? bookData.genre.trim() : null,
        status: bookData.status || 'to-read',
        notes: bookData.notes ? bookData.notes.trim() : null
    };
}

// helper function to validate book ownership
async function validateBookOwnership(bookId, userId) {
    // check if book exists
    // verify it belongs to the user
    // return appropriate error if not

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
 