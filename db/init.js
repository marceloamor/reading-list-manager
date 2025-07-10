// database initialisation script

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// configuration

const DB_DIR = path.join(__dirname);
const DB_PATH = path.join(DB_DIR, 'reading_list.db');
const SCHEMA_PATH = path.join(DB_DIR, 'schema.sql');

// Command line options
const args = process.argv.slice(2);
const shouldReset = args.includes('--reset') || args.includes('-r');
const isVerbose = args.includes('--verbose') || args.includes('-v');

// utility functions

// log message with timestamp
function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level.toUpperCase().padEnd(5);
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

// read SQL file content
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

// execute SQL commands from a string
function executeSql(db, sql) {
    return new Promise((resolve, reject) => {
        // split SQL into individual statements (basic approach)
        // note: this is a simple implementation and will not handle complex cases
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

// create database directory if it doesn't exist
function ensureDbDirectory() {
    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
        log(`Created database directory: ${DB_DIR}`);
    }
}

// remove existing database file if reset is requested
function resetDatabase() {
    if (fs.existsSync(DB_PATH)) {
        fs.unlinkSync(DB_PATH);
        log(`Removed existing database: ${DB_PATH}`);
    }
}

// test database connection
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

// main initialisation function
async function initializeDatabase() {
    try {
        log('🚀 Starting database initialisation...');
        
        // step 1: setup
        ensureDbDirectory();
        
        if (shouldReset) {
            log('🔄 Resetting database...');
            resetDatabase();
        }

        // step 2: create database connection
        log(`📁 Opening database: ${DB_PATH}`);
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                throw new Error(`Failed to open database: ${err.message}`);
            }
        });

        // enable foreign key constraints
        await new Promise((resolve, reject) => {
            db.run('PRAGMA foreign_keys = ON', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // step 3: test connection
        log('🔍 Testing database connection...');
        await testConnection(db);
        log('✅ Database connection successful');

        // step 4: create schema
        log('📋 Creating database schema...');
        const schemaContent = readSqlFile(SCHEMA_PATH);
        await executeSql(db, schemaContent);
        log('✅ Database schema created successfully');

        // step 5: verify setup
        log('🔍 Verifying database setup...');
        
        // check if tables exist
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

        // step 6: close connection
        await new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        log('🎉 Database initialisation completed successfully!');
        
        // print usage information
        console.log('\n📝 Next steps:');
        console.log('1. Start the backend server: npm run backend:dev');
        console.log('2. Start the frontend server: npm run frontend:dev');
        console.log('3. Open your browser to http://localhost:5173');

    } catch (error) {
        log(`❌ Database initialisation failed: ${error.message}`, 'error');
        
        if (isVerbose) {
            console.error('Stack trace:', error.stack);
        }
        
        process.exit(1);
    }
}

// CLI handling

function showHelp() {
    console.log(`
Reading List Manager - Database Initialisation

Usage: node db/init.js [options]

Options:
  --reset, -r    Remove existing database before initialisation
  --verbose, -v  Show detailed logging information
  --help, -h     Show this help message

Examples:
  node db/init.js                    # Create empty database
  node db/init.js --reset            # Reset and recreate database
  node db/init.js --verbose          # Show detailed progress information

The script will:
1. Create the database directory if it doesn't exist
2. Create or reset the SQLite database file
3. Run the schema.sql file to create tables and indexes
4. Verify the setup was successful

Database location: ${DB_PATH}
Schema file: ${SCHEMA_PATH}
`);
}

// Handle command line arguments
if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

// Handle invalid options
const validOptions = ['--reset', '-r', '--verbose', '-v', '--help', '-h'];
const invalidOptions = args.filter(arg => !validOptions.includes(arg));

if (invalidOptions.length > 0) {
    console.error(`❌ Invalid options: ${invalidOptions.join(', ')}`);
    console.error('Use --help for usage information');
    process.exit(1);
}

// script execution

// only run if this file is executed directly (not required as a module)
if (require.main === module) {
    log('Reading List Manager - Database Initialisation');
    
    if (isVerbose) {
        log(`Database path: ${DB_PATH}`);
        log(`Reset database: ${shouldReset}`);
    }
    
    initializeDatabase();
}

// export for use as a module
module.exports = {
    initializeDatabase,
    DB_PATH,
    SCHEMA_PATH
}; 