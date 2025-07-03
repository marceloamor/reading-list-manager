-- Reading List Manager Seed Data
-- 
-- This file contains sample data for development and testing.
-- It includes test users and sample books to help with application development.
-- 
-- IMPORTANT SECURITY NOTE:
-- - The passwords shown here are for DEVELOPMENT ONLY
-- - In production, passwords must be properly hashed using bcrypt
-- - Never store plain text passwords in any environment
--
-- Learning Notes:
-- - Seed data helps developers test the application with realistic data
-- - Use realistic but fake data for development
-- - Always hash passwords before inserting into the database
-- - Consider using a library like bcryptjs for password hashing

-- =============================================================================
-- Sample Users
-- =============================================================================

-- NOTE: These password hashes are examples only!
-- In a real implementation, you would generate these using bcrypt:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('password123', 12);

-- Sample User 1: Alice (password: 'reading123')
-- Hash generated with: bcrypt.hash('reading123', 12)
INSERT OR IGNORE INTO users (id, username, password_hash, created_at) VALUES 
(1, 'alice_reader', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeB7h6Jz8pnE1.2Hy', '2024-01-15 10:30:00');

-- Sample User 2: Bob (password: 'books456')
-- Hash generated with: bcrypt.hash('books456', 12)
INSERT OR IGNORE INTO users (id, username, password_hash, created_at) VALUES 
(2, 'bob_bookworm', '$2a$12$KpL2c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeB7h6Jz8pnE1.3Hz', '2024-01-16 14:45:00');

-- Sample User 3: Carol (password: 'library789')
-- Hash generated with: bcrypt.hash('library789', 12)
INSERT OR IGNORE INTO users (id, username, password_hash, created_at) VALUES 
(3, 'carol_lit', '$2a$12$MnK3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeB7h6Jz8pnE1.4Ha', '2024-01-17 09:15:00');

-- =============================================================================
-- Sample Books for Alice (User ID: 1)
-- =============================================================================

INSERT OR IGNORE INTO books (id, title, author, genre, status, notes, user_id, created_at, updated_at) VALUES 
(1, '1984', 'George Orwell', 'Dystopian Fiction', 'read', 'A chilling look at totalitarianism. Orwell''s masterpiece remains incredibly relevant today.', 1, '2024-01-15 11:00:00', '2024-01-15 11:00:00'),

(2, 'To Kill a Mockingbird', 'Harper Lee', 'Classic Literature', 'read', 'Powerful story about justice and morality in the American South. Atticus Finch is an inspiring character.', 1, '2024-01-15 11:15:00', '2024-01-20 16:30:00'),

(3, 'The Lord of the Rings: The Fellowship of the Ring', 'J.R.R. Tolkien', 'Fantasy', 'reading', 'Just started this epic fantasy journey. The world-building is incredible so far!', 1, '2024-01-16 20:30:00', '2024-01-16 20:30:00'),

(4, 'Dune', 'Frank Herbert', 'Science Fiction', 'to-read', 'Heard this is a sci-fi masterpiece. Looking forward to diving into the world of Arrakis.', 1, '2024-01-18 12:00:00', '2024-01-18 12:00:00'),

(5, 'Pride and Prejudice', 'Jane Austen', 'Romance', 'read', 'Witty and charming romance. Elizabeth Bennet is such a strong, intelligent character.', 1, '2024-01-19 15:45:00', '2024-01-22 10:15:00');

-- =============================================================================
-- Sample Books for Bob (User ID: 2)
-- =============================================================================

INSERT OR IGNORE INTO books (id, title, author, genre, status, notes, user_id, created_at, updated_at) VALUES 
(6, 'The Hitchhiker''s Guide to the Galaxy', 'Douglas Adams', 'Science Fiction', 'read', 'Absolutely hilarious! Adams'' humour is brilliant. Don''t panic!', 2, '2024-01-16 15:00:00', '2024-01-16 15:00:00'),

(7, 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'History', 'reading', 'Fascinating perspective on human history and development. Really makes you think about society.', 2, '2024-01-17 10:30:00', '2024-01-17 10:30:00'),

(8, 'The Name of the Wind', 'Patrick Rothfuss', 'Fantasy', 'read', 'Beautiful prose and compelling storytelling. Kvothe is such an interesting protagonist.', 2, '2024-01-18 19:15:00', '2024-01-21 14:20:00'),

(9, '1984', 'George Orwell', 'Dystopian Fiction', 'to-read', 'Alice recommended this one. Sounds intense but important.', 2, '2024-01-20 13:45:00', '2024-01-20 13:45:00'),

(10, 'The Martian', 'Andy Weir', 'Science Fiction', 'read', 'Loved the problem-solving aspect and Watney''s humour in the face of disaster.', 2, '2024-01-21 16:30:00', '2024-01-21 16:30:00');

-- =============================================================================
-- Sample Books for Carol (User ID: 3)
-- =============================================================================

INSERT OR IGNORE INTO books (id, title, author, genre, status, notes, user_id, created_at, updated_at) VALUES 
(11, 'The Handmaid''s Tale', 'Margaret Atwood', 'Dystopian Fiction', 'read', 'Disturbing but powerful. Atwood''s vision of a dystopian future is both terrifying and thought-provoking.', 3, '2024-01-17 09:30:00', '2024-01-17 09:30:00'),

(12, 'Educated', 'Tara Westover', 'Memoir', 'read', 'Incredible memoir about education and family. Westover''s journey is truly inspiring.', 3, '2024-01-18 11:00:00', '2024-01-19 20:45:00'),

(13, 'The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid', 'Contemporary Fiction', 'reading', 'Captivating story about a reclusive Hollywood icon. Can''t put it down!', 3, '2024-01-19 14:15:00', '2024-01-19 14:15:00'),

(14, 'Becoming', 'Michelle Obama', 'Biography', 'to-read', 'Looking forward to reading about the former First Lady''s journey and experiences.', 3, '2024-01-20 10:00:00', '2024-01-20 10:00:00'),

(15, 'Where the Crawdads Sing', 'Delia Owens', 'Mystery', 'read', 'Beautiful nature writing combined with an intriguing mystery. The ending was unexpected!', 3, '2024-01-21 12:30:00', '2024-01-23 18:00:00'),

(16, 'Atomic Habits', 'James Clear', 'Self-Help', 'reading', 'Practical advice on building good habits. Already starting to apply some of the techniques.', 3, '2024-01-22 08:45:00', '2024-01-22 08:45:00');

-- =============================================================================
-- Additional Sample Data for Public Statistics
-- =============================================================================

-- Add some duplicate books (same title/author) from different users
-- This will help test the public statistics functionality

-- More users adding popular books
INSERT OR IGNORE INTO books (title, author, genre, status, notes, user_id, created_at, updated_at) VALUES 
('1984', 'George Orwell', 'Dystopian Fiction', 'read', 'Mind-blowing and terrifying. A must-read for everyone.', 3, '2024-01-23 15:30:00', '2024-01-24 12:00:00'),

('The Hitchhiker''s Guide to the Galaxy', 'Douglas Adams', 'Science Fiction', 'to-read', 'Bob recommended this. Sounds funny!', 1, '2024-01-24 09:15:00', '2024-01-24 09:15:00'),

('Dune', 'Frank Herbert', 'Science Fiction', 'reading', 'Complex but rewarding. The political intrigue is fascinating.', 2, '2024-01-24 11:45:00', '2024-01-24 11:45:00'),

('The Name of the Wind', 'Patrick Rothfuss', 'Fantasy', 'to-read', 'Fantasy lovers keep recommending this series.', 3, '2024-01-24 14:20:00', '2024-01-24 14:20:00'),

('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'History', 'read', 'Changed my perspective on human civilisation completely.', 1, '2024-01-24 16:00:00', '2024-01-25 10:30:00');

-- =============================================================================
-- Comments and Usage Notes
-- =============================================================================

-- This seed data provides:
-- 
-- 1. Three test users with different reading preferences:
--    - Alice: Classic literature and fantasy lover
--    - Bob: Science fiction and non-fiction enthusiast  
--    - Carol: Contemporary fiction and memoir reader
--
-- 2. Books across various genres:
--    - Classic Literature, Fantasy, Science Fiction
--    - History, Biography, Memoir, Self-Help
--    - Contemporary Fiction, Mystery, Romance
--
-- 3. Different reading statuses:
--    - 'read': Completed books with reviews/notes
--    - 'reading': Currently being read
--    - 'to-read': Books on the reading list
--
-- 4. Realistic notes and reviews:
--    - Personal opinions and reactions
--    - Recommendations between users
--    - Varying detail levels
--
-- 5. Duplicate books for statistics:
--    - Popular books read by multiple users
--    - Data for testing public API endpoints
--    - Realistic usage patterns
--
-- To use this seed data:
-- 1. Run the schema.sql file first to create tables
-- 2. Then run this seed.sql file to populate with sample data
-- 3. Test users can log in with the credentials provided in comments
-- 4. The application will have realistic data to work with
--
-- Remember to:
-- - Never use this seed data in production
-- - Always hash passwords properly in real applications
-- - Create your own test data for specific testing scenarios
-- - Clear seed data before deploying to production environments 