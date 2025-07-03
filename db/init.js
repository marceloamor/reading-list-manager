/**
 * Database Initialisation Script
 * 
 * This script initialises the SQLite database for the Reading List Manager.
 * It creates the database file, runs the schema, and optionally loads seed data.
 * 
 * Learning Notes:
 * - Database initialisation should be idempotent (safe to run multiple times)
 * - Always handle errors gracefully during setup
 * - Provide clear feedback about what's happening
 * - Separate schema creation from seed data loading
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// =============================================================================
// CONFIGURATION
// =============================================================================

const DB_DIR = path.join(__dirname);
const DB_PATH = path.join(DB_DIR, 'reading_list.db');
const SCHEMA_PATH = path.join(DB_DIR, 'schema.sql');
const SEED_PATH = path.join(DB_DIR, 'seed.sql');

// Command line options
const args = process.argv.slice(2);
const shouldLoadSeed = args.includes('--seed') || args.includes('-s');
const shouldReset = args.includes('--reset') || args.includes('-r');
const isVerbose = args.includes('--verbose') || args.includes('-v');

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Log message with timestamp
 * @param {string} message - Message to log
 * @param {string} level - Log level (info, warn, error)
 */
function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level.toUpperCase().padEnd(5);
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

/**
 * Read SQL file content
 * @param {string} filePath - Path to SQL file
 * @returns {string} - File content
 */
function readSqlFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`SQL file not found: ${filePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    if (isVerbose) {
        log(`Read SQL file: ${filePath} (${content.length} characters)`);
    }
    
    return content;
}

/**
 * Execute SQL commands from a string
 * @param {sqlite3.Database} db - Database connection
 * @param {string} sql - SQL commands to execute
 * @returns {Promise} - Promise that resolves when complete
 */
function executeSql(db, sql) {
    return new Promise((resolve, reject) => {
        // Split SQL into individual statements (basic approach)
        // Note: This is a simple implementation and may not handle complex cases
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        if (statements.length === 0) {
            return resolve();
        }

        let completed = 0;
        let hasError = false;

        function executeNext() {
            if (completed >= statements.length) {
                return resolve();
            }

            const statement = statements[completed];
            if (isVerbose) {
                log(`Executing SQL statement ${completed + 1}/${statements.length}`);
            }

            db.exec(statement, (err) => {
                if (err && !hasError) {
                    hasError = true;
                    log(`SQL execution error: ${err.message}`, 'error');
                    log(`Statement: ${statement.substring(0, 100)}...`, 'error');
                    return reject(err);
                }

                completed++;
                executeNext();
            });
        }

        executeNext();
    });
}

/**
 * Create database directory if it doesn't exist
 */
function ensureDbDirectory() {
    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
        log(`Created database directory: ${DB_DIR}`);
    }
}

/**
 * Remove existing database file if reset is requested
 */
function resetDatabase() {
    if (fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH);
        log(`Removed existing database: ${DB_PATH}`);
    }
}

/**
 * Test database connection
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise} - Promise that resolves if connection is working
 */
function testConnection(db) {
    return new Promise((resolve, reject) => {
        db.get('SELECT 1 as test', (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// =============================================================================
// MAIN INITIALISATION FUNCTION
// =============================================================================

/**
 * Initialise the database
 * Main function that orchestrates the database setup process
 */
async function initializeDatabase() {
    try {
        log('🚀 Starting database initialisation...');
        
        // Step 1: Setup
        ensureDbDirectory();
        
        if (shouldReset) {
            log('🔄 Resetting database...');
            resetDatabase();
        }

        // Step 2: Create database connection
        log(`📁 Opening database: ${DB_PATH}`);
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                throw new Error(`Failed to open database: ${err.message}`);
            }
        });

        // Enable foreign key constraints
        await new Promise((resolve, reject) => {
            db.run('PRAGMA foreign_keys = ON', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Step 3: Test connection
        log('🔍 Testing database connection...');
        await testConnection(db);
        log('✅ Database connection successful');

        // Step 4: Create schema
        log('📋 Creating database schema...');
        const schemaContent = readSqlFile(SCHEMA_PATH);
        await executeSql(db, schemaContent);
        log('✅ Database schema created successfully');

        // Step 5: Load seed data (optional)
        if (shouldLoadSeed) {
            log('🌱 Loading seed data...');
            const seedContent = readSqlFile(SEED_PATH);
            await executeSql(db, seedContent);
            log('✅ Seed data loaded successfully');
        } else {
            log('ℹ️  Skipping seed data (use --seed flag to load sample data)');
        }

        // Step 6: Verify setup
        log('🔍 Verifying database setup...');
        
        // Check if tables exist
        const tables = await new Promise((resolve, reject) => {
            db.all(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        log(`📊 Found ${tables.length} tables: ${tables.map(t => t.name).join(', ')}`);

        // Count records if seed data was loaded
        if (shouldLoadSeed) {
            const userCount = await new Promise((resolve) => {
                db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
                    resolve(err ? 0 : row.count);
                });
            });

            const bookCount = await new Promise((resolve) => {
                db.get('SELECT COUNT(*) as count FROM books', (err, row) => {
                    resolve(err ? 0 : row.count);
                });
            });

            log(`👥 Users in database: ${userCount}`);
            log(`📚 Books in database: ${bookCount}`);
        }

        // Step 7: Close connection
        await new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        log('🎉 Database initialisation completed successfully!');
        
        // Print usage information
        console.log('\n📝 Next steps:');
        console.log('1. Start the backend server: npm run backend:dev');
        console.log('2. Start the frontend server: npm run frontend:dev');
        console.log('3. Open your browser to http://localhost:5173');
        
        if (shouldLoadSeed) {
            console.log('\n🔑 Test user credentials:');
            console.log('- Username: alice_reader, Password: reading123');
            console.log('- Username: bob_bookworm, Password: books456');
            console.log('- Username: carol_lit, Password: library789');
        }

    } catch (error) {
        log(`❌ Database initialisation failed: ${error.message}`, 'error');
        
        if (isVerbose) {
            console.error('Stack trace:', error.stack);
        }
        
        process.exit(1);
    }
}

// =============================================================================
// CLI HANDLING
// =============================================================================

/**
 * Display help information
 */
function showHelp() {
    console.log(`
📘 Reading List Manager - Database Initialisation

Usage: node db/init.js [options]

Options:
  --seed, -s     Load sample data for development and testing
  --reset, -r    Remove existing database before initialisation
  --verbose, -v  Show detailed logging information
  --help, -h     Show this help message

Examples:
  node db/init.js                    # Create empty database
  node db/init.js --seed             # Create database with sample data
  node db/init.js --reset --seed     # Reset and recreate with sample data
  node db/init.js --verbose          # Show detailed progress information

The script will:
1. Create the database directory if it doesn't exist
2. Create or reset the SQLite database file
3. Run the schema.sql file to create tables and indexes
4. Optionally load seed.sql for sample data
5. Verify the setup was successful

Database location: ${DB_PATH}
Schema file: ${SCHEMA_PATH}
Seed file: ${SEED_PATH}
`);
}

// Handle command line arguments
if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

// Handle invalid options
const validOptions = ['--seed', '-s', '--reset', '-r', '--verbose', '-v', '--help', '-h'];
const invalidOptions = args.filter(arg => !validOptions.includes(arg));

if (invalidOptions.length > 0) {
    console.error(`❌ Invalid options: ${invalidOptions.join(', ')}`);
    console.error('Use --help for usage information');
    process.exit(1);
}

// =============================================================================
// SCRIPT EXECUTION
// =============================================================================

// Only run if this file is executed directly (not required as a module)
if (require.main === module) {
    log('📘 Reading List Manager - Database Initialisation');
    
    if (isVerbose) {
        log(`Database path: ${DB_PATH}`);
        log(`Reset database: ${shouldReset}`);
        log(`Load seed data: ${shouldLoadSeed}`);
    }
    
    initializeDatabase();
}

// Export for use as a module
module.exports = {
    initializeDatabase,
    DB_PATH,
    SCHEMA_PATH,
    SEED_PATH
}; 