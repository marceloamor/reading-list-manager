// database utility functions

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, '../../db/reading_list.db');

// database connection

function getConnection() {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            throw err;
        }
    });
}

// execute a query with parameters
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

// execute a query that returns a single row
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

// execute a query that modifies data (INSERT, UPDATE, DELETE)
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

// database initialisation

async function initializeDatabase() {
    try {
        console.log('Initialising database...');

        // create users table
        await executeModifyQuery(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('User Table ensured')
        // create books table with foreign key to users
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
        // create any indexes for performance
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

// user operations

// create a new user
async function createUser(username, passwordHash) {
    try {
        // insert user into database
        const sql = `
            INSERT INTO users (username, password_hash)
            VALUES (?,?)
        `;
        // return the new user ID
        const results = await executeModifyQuery(sql, [username, passwordHash]);
        return results.id
        // handle unique constraint violation
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// find user by username
async function findUserByUsername(username) {
    try {
        // query database for user with given username
        const sql = `
            SELECT id, username, password_hash, created_at
            FROM users
            WHERE username = ?
        `;
        // return user object or null if not found
        return await executeQuerySingle(sql, [username]);
    } catch (error) {
        console.error('Error finding user by username:', error);
        throw error;
    }
}

// find user by ID
async function findUserById(userId) {
    try {
        // query database for user with given ID
        const sql = `
            SELECT id, username, created_at
            FROM users
            WHERE id = ?
        `;
        // return user object or null if not found
        return await executeQuerySingle(sql, [userId]);
    } catch (error) {
        console.error('Error finding user by ID:', error);
        throw error;
    }
}

// book operations

// create a new book
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


// get books by user ID with optional filtering
async function getBooksByUserId(userId, filters = {}) {
    try {
        // build SQL query with WHERE clauses for filters
            let sql = `
            SELECT id, title, author, genre, status, notes, created_at, updated_at
            FROM books
            WHERE user_id = ?
        `;
         const params = [userId];
        // handle search functionality (title and author)
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
        // return array of books for the user
        return await executeQuery(sql, params);

    } catch (error) {
        console.error('Error getting books by user ID:', error);
        throw error;
    }
}

// get a single book by ID
async function getBookById(bookId) {
    try {
        // query database for book with given ID
        const sql = `
            SELECT id, title, author, genre, status, notes, user_id, created_at, updated_at
            FROM books
            WHERE id = ?
        `;
        // return book object with all fields
        return await executeQuerySingle(sql, [bookId]);
    } catch (error) {
        console.error('Error getting book by ID:', error);
        throw error;
    }
}

// update a book
async function updateBook(bookId, updateData) {
    try {
        // build UPDATE query with provided fields
        const sql = `
            UPDATE books
            SET title = ?, author = ?, genre = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        // update the updated_at timestamp
        const params = [
            updateData.title,
            updateData.author,
            updateData.genre,
            updateData.status,
            updateData.notes,
            bookId
        ];

        const result = await executeModifyQuery(sql, params);
        // return success status
        return result.changes > 0;
    } catch (error) {
        console.error('Error updating book:', error);
        throw error;
    }
}

// delete a book
async function deleteBook(bookId) {
    try {
        // delete book from database
        const sql = 'DELETE FROM books WHERE id = ?';
        const result = await executeModifyQuery(sql, [bookId]);
        // return success status
        return result.changes > 0;
    } catch (error) {
        console.error('Error deleting book:', error);
        throw error;
    }
}

// public statistics

// get public book statistics (anonymised)
async function getPublicBookStats() {
    try {
        // get most popular books (by count)
        const popularBooks = await executeQuery(`
            SELECT title, author, COUNT(*) as times_added
            FROM books
            GROUP BY title, author
            HAVING COUNT(*) >= 1
            ORDER BY times_added DESC, title ASC
            LIMIT 10
        `);

        // get most popular genres
        const popularGenres = await executeQuery(`
            SELECT genre, COUNT(*) as count
            FROM books
            WHERE genre IS NOT NULL AND genre != ''
            GROUP BY genre
            ORDER BY count DESC
            LIMIT 10
        `);

        // get reading status distribution
        const statusDistribution = await executeQuery(`
            SELECT status, COUNT(*) as count
            FROM books
            GROUP BY status
            ORDER BY count DESC
        `);

        // get top authors
        const topAuthors = await executeQuery(`
            SELECT author, COUNT(*) as book_count
            FROM books
            WHERE author IS NOT NULL AND author != ''
            GROUP BY author
            ORDER BY book_count DESC
            LIMIT 10
        `);

        // get total counts
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

// search books publicly (anonymised)
async function searchPublicBooks(query, filters = {}) {
    try {
        // search books by title and author
        let sql = `
            SELECT title, author, genre, COUNT(*) as popularity
            FROM books
            WHERE (title LIKE ? OR author LIKE ?)
        `;

        const params = [`%${query}%`, `%${query}%`];

        // apply genre filter if provided
        if (filters.genre) {
            sql += ' AND genre = ?';
            params.push(filters.genre);
        }

        // return results with popularity metrics
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

// utility functions

// close database connection (for cleanup)
function closeDatabase() {
    // TODO later: Implement database cleanup if needed
    console.log('Database cleanup completed');
}

// test database connection
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
 