/**
 * Database Utility Functions
 *
 * This file handles all database operations for the Reading List Manager.
 * It includes connection management, CRUD operations for users and books,
 * and database initialisation.
 *
 * Learning Notes:
 * - SQLite is a lightweight, file-based database
 * - Always use parameterised queries to prevent SQL injection
 * - Handle errors gracefully and provide meaningful error messages
 * - Use transactions for operations that modify multiple tables
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, '../../db/reading_list.db');

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

/**
 * Get database connection
 * Creates a new connection to the SQLite database
 */
function getConnection() {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            throw err;
        }
    });
}

/**
 * Execute a query with parameters
 * Helper function to run SQL queries safely
 */
function executeQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getConnection();

        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Database query error:', err.message);
                console.error('SQL:', sql);
                console.error('Params:', params);
                reject(err);
            } else {
                resolve(rows);
            }
        });

        db.close();
    });
}

/**
 * Execute a query that returns a single row
 */
function executeQuerySingle(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getConnection();

        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('Database query error:', err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });

        db.close();
    });
}

/**
 * Execute a query that modifies data (INSERT, UPDATE, DELETE)
 */
function executeModifyQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getConnection();

        db.run(sql, params, function(err) {
            if (err) {
                console.error('Database modify error:', err.message);
                reject(err);
            } else {
                resolve({
                    id: this.lastID,
                    changes: this.changes
                });
            }
        });

        db.close();
    });
}

// =============================================================================
// DATABASE INITIALISATION
// =============================================================================

/**
 * Initialise the database
 * Creates tables if they don't exist
 */
async function initializeDatabase() {
    try {
        console.log('Initialising database...');

        // TODO: Implement database initialisation
        // 1. Create users table
        await executeModifyQuery(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('User Table ensured')
        // 2. Create books table with foreign key to users
        await executeModifyQuery(`
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT,
                genre TEXT,
                status TEXT CHECK(status IN ('read', 'reading', 'to-read')) DEFAULT 'to-read',
                notes TEXT,
                user_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('Books table ensured');
        // 3. Create any indexes for performance
        await executeModifyQuery(`
            CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id)
        `);

        await executeModifyQuery(`
            CREATE INDEX IF NOT EXISTS idx_books_status ON books(status)
        `);
        console.log('Indexes created');

        console.log('✅ Database initialisation complete');
    } catch (error) {
        console.error('Error initialising database:', error);
        throw error;
    }
}

// =============================================================================
// USER OPERATIONS
// =============================================================================

/**
 * Create a new user
 * @param {string} username - User's username
 * @param {string} passwordHash - Hashed password
 * @returns {number} - New user ID
 */
async function createUser(username, passwordHash) {
    try {
        // TODO: Implement user creation
        // 1. Insert user into database
        const sql = `
            INSERT INTO users (username, password_hash)
            VALUES (?,?)
        `;
        // 2. Return the new user ID
        const results = await executeModifyQuery(sql, [username, passwordHash]);
        return results.id
        // 3. Handle unique constraint violation
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

/**
 * Find user by username
 * @param {string} username - Username to search for
 * @returns {Object|null} - User object or null if not found
 */
async function findUserByUsername(username) {
    try {
        // TODO: Implement user lookup by username
        // 1. Query database for user with given username
        const sql = `
            SELECT id, username, password_hash, created_at
            FROM users
            WHERE username = ?
        `;
        // 2. Return user object or null if not found
        return await executeQuerySingle(sql, [username]);
    } catch (error) {
        console.error('Error finding user by username:', error);
        throw error;
    }
}

/**
 * Find user by ID
 * @param {number} userId - User ID to search for
 * @returns {Object|null} - User object or null if not found
 */
async function findUserById(userId) {
    try {
        // TODO: Implement user lookup by ID
        // 1. Query database for user with given ID
        const sql = `
            SELECT id, username, created_at
            FROM users
            WHERE id = ?
        `;
        // 2. Return user object or null if not found
        return await executeQuerySingle(sql, [userId]);
    } catch (error) {
        console.error('Error finding user by ID:', error);
        throw error;
    }
}

// =============================================================================
// BOOK OPERATIONS
// =============================================================================

/**
 * Create a new book
 * @param {Object} bookData - Book data object
 * @returns {number} - New book ID
 */
async function createBook(bookData) {
    try {
        if (!bookData.title || !bookData.user_id) {
            throw new Error('Missing required fields: title, user_id');
        }

        const insertSql = `
            INSERT INTO books (title, author, genre, status, notes, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const params = [
            bookData.title,
            bookData.author || null,
            bookData.genre || null,
            bookData.status || 'to-read',
            bookData.notes || null,
            bookData.user_id
        ];

        // Insert the book
        const result = await executeModifyQuery(insertSql, params);

        if (!result.id) {
            throw new Error('Insert failed: No ID returned');
        }

        console.log('✅ Inserted book ID:', result.id);

        // Try to fetch the inserted book
        let book = await executeQuerySingle(`SELECT * FROM books WHERE id = ?`, [result.id]);

        // Retry once if not found
        if (!book) {
            console.warn('⚠️ Book not found immediately after insert. Retrying...');
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
            book = await executeQuerySingle(`SELECT * FROM books WHERE id = ?`, [result.id]);
        }

        if (!book) {
            throw new Error('Inserted book could not be retrieved');
        }

        console.log('📘 Retrieved book:', book);

        return book;

    } catch (error) {
        console.error('❌ Error creating book:', error);
        throw error;
    }
}


/**
 * Get books by user ID with optional filtering
 * @param {number} userId - User ID
 * @param {Object} filters - Optional filters (status, genre, search)
 * @returns {Array} - Array of book objects
 */
async function getBooksByUserId(userId, filters = {}) {
    try {
        // TODO: Implement book retrieval with filtering
        // 1. Build SQL query with WHERE clauses for filters
            let sql = `
            SELECT id, title, author, genre, status, notes, created_at, updated_at
            FROM books
            WHERE user_id = ?
        `;
         const params = [userId];
        // 2. Handle search functionality (title and author)
        if (filters.status) {
            sql += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.genre) {
            sql += ' AND genre = ?';
            params.push(filters.genre);
        }

        if (filters.search) {
            sql += ' AND (title LIKE ? OR author LIKE ?)';
            const searchPattern = `%${filters.search}%`;
            params.push(searchPattern, searchPattern);
        }

        sql += ' ORDER BY created_at DESC';
        // 3. Return array of books for the user
        return await executeQuery(sql, params);

    } catch (error) {
        console.error('Error getting books by user ID:', error);
        throw error;
    }
}

/**
 * Get a single book by ID
 * @param {number} bookId - Book ID
 * @returns {Object|null} - Book object or null if not found
 */
async function getBookById(bookId) {
    try {
        // TODO: Implement single book retrieval
        // 1. Query database for book with given ID
        const sql = `
            SELECT id, title, author, genre, status, notes, user_id, created_at, updated_at
            FROM books
            WHERE id = ?
        `;
        // 2. Return book object with all fields
        return await executeQuerySingle(sql, [bookId]);
    } catch (error) {
        console.error('Error getting book by ID:', error);
        throw error;
    }
}

/**
 * Update a book
 * @param {number} bookId - Book ID to update
 * @param {Object} updateData - Data to update
 * @returns {boolean} - Success status
 */
async function updateBook(bookId, updateData) {
    try {
        // TODO: Implement book update
        // 1. Build UPDATE query with provided fields
        const sql = `
            UPDATE books
            SET title = ?, author = ?, genre = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        // 2. Update the updated_at timestamp
        const params = [
            updateData.title,
            updateData.author,
            updateData.genre,
            updateData.status,
            updateData.notes,
            bookId
        ];

        const result = await executeModifyQuery(sql, params);
        // 3. Return success status
        return result.changes > 0;
    } catch (error) {
        console.error('Error updating book:', error);
        throw error;
    }
}

/**
 * Delete a book
 * @param {number} bookId - Book ID to delete
 * @returns {boolean} - Success status
 */
async function deleteBook(bookId) {
    try {
        // TODO: Implement book deletion
        // 1. Delete book from database
        const sql = 'DELETE FROM books WHERE id = ?';
        const result = await executeModifyQuery(sql, [bookId]);
        // 2. Return success status
        return result.changes > 0;
    } catch (error) {
        console.error('Error deleting book:', error);
        throw error;
    }
}

// =============================================================================
// PUBLIC STATISTICS
// =============================================================================

/**
 * Get public book statistics (anonymised)
 * @returns {Object} - Statistics object
 */
async function getPublicBookStats() {
    try {
        // 1. Get most popular books (by count)
        const popularBooks = await executeQuery(`
            SELECT title, author, COUNT(*) as times_added
            FROM books
            GROUP BY title, author
            HAVING COUNT(*) >= 1
            ORDER BY times_added DESC, title ASC
            LIMIT 10
        `);

        // 2. Get most popular genres
        const popularGenres = await executeQuery(`
            SELECT genre, COUNT(*) as count
            FROM books
            WHERE genre IS NOT NULL AND genre != ''
            GROUP BY genre
            ORDER BY count DESC
            LIMIT 10
        `);

        // 3. Get reading status distribution
        const statusDistribution = await executeQuery(`
            SELECT status, COUNT(*) as count
            FROM books
            GROUP BY status
            ORDER BY count DESC
        `);

        // 4. Get top authors
        const topAuthors = await executeQuery(`
            SELECT author, COUNT(*) as book_count
            FROM books
            WHERE author IS NOT NULL AND author != ''
            GROUP BY author
            ORDER BY book_count DESC
            LIMIT 10
        `);

        // 5. Get total counts
        const totalBooksResult = await executeQuerySingle('SELECT COUNT(*) as total FROM books');
        const totalUsersResult = await executeQuerySingle('SELECT COUNT(*) as total FROM users');

        return {
            popular_books: popularBooks,
            popular_genres: popularGenres,
            popular_authors: topAuthors,
            status_distribution: statusDistribution,
            total_books: totalBooksResult.total,
            total_users: totalUsersResult.total
        };

    } catch (error) {
        console.error('Error getting public book statistics:', error);
        throw error;
    }
}

/**
 * Search books publicly (anonymised)
 * @param {string} query - Search query
 * @param {Object} filters - Search filters
 * @returns {Array} - Array of search results
 */
async function searchPublicBooks(query, filters = {}) {
    try {
        // 1. Search books by title and author
        let sql = `
            SELECT title, author, genre, COUNT(*) as popularity
            FROM books
            WHERE (title LIKE ? OR author LIKE ?)
        `;

        const params = [`%${query}%`, `%${query}%`];

        // 2. Apply genre filter if provided
        if (filters.genre) {
            sql += ' AND genre = ?';
            params.push(filters.genre);
        }

        // 3. Return results with popularity metrics
        sql += `
            GROUP BY title, author, genre
            ORDER BY popularity DESC, title ASC
            LIMIT 20
        `;

        return await executeQuery(sql, params);

    } catch (error) {
        console.error('Error searching public books:', error);
        throw error;
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Close database connection (for cleanup)
 */
function closeDatabase() {
    // TODO: Implement database cleanup if needed
    console.log('Database cleanup completed');
}

/**
 * Test database connection
 */
async function testConnection() {
    try {
        await executeQuerySingle('SELECT 1 as test');
        console.log('Database connection test successful');
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error);
        return false;
    }
}

// Export all functions
module.exports = {
    // Database management
    initializeDatabase,
    testConnection,
    closeDatabase,

    // User operations
    createUser,
    findUserByUsername,
    findUserById,

    // Book operations
    createBook,
    getBooksByUserId,
    getBookById,
    updateBook,
    deleteBook,

    // Public operations
    getPublicBookStats,
    searchPublicBooks,

    // Utility functions
    executeQuery,
    executeQuerySingle,
    executeModifyQuery
};
