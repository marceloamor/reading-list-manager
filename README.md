# Reading List Manager

A modern, full-stack web application for managing personal reading lists. Built with Svelte, Node.js, Express, and SQLite, featuring Google Books API integration for easier book discovery and search.

## Features

### **User Authentication**
- Secure user registration and login system
- Session-based authentication with bcrypt password hashing
- Protected routes and user-specific data access

### **Personal Book Management**
- **CRUD Operations**: Create, read, update, and delete books in your personal library
- **Book Entry**: Google Books API integration with intelligent autocomplete
- **Metadata**: Title, author, genre, reading status (to-read, reading, read), and optional personal notes
- **Real-time Search**: Filter and search through your personal collection
- **Responsive Cards**: Beautiful book cards with edit/delete functionality

### **Public Statistics Dashboard**
- **Community Insights**: View popular books and trends across all users (anonymised)
- **Visual Analytics**: Charts showing reading status distribution
- **Popular Lists**: Top books, authors, and genres
- **Search & Filter**: Explore public data with filtering options

### **Modern User Experience**
- **Responsive Design**: Good experience on desktop, tablet, and mobile
- **Real-time Updates**: Instant UI updates with optimistic rendering
- **Professional Interface**: Clean, modern design with intuitive navigation
- **Fast Performance**: Lightweight architecture with efficient data loading

## Tech Stack

- **Frontend**: Svelte+Vite for development and building
- **Backend**: Node.js with Express.js framework
- **Database**: SQLite for lightweight, file-based data storage
- **Authentication**: Express sessions with secure password hashing
- **External API**: Google Books API for book discovery/search
- **Styling**: CSS with responsive design principles

## Project Structure

```
reading-list-manager/
├── backend/                    # Server-side application
│   ├── routes/
│   │   ├── auth.js           # Authentication (register/login/logout)
│   │   └── books.js          # Book CRUD + public statistics API
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware & rate limiting
│   ├── utils/
│   │   ├── db.js           # Database operations & queries
│   │   └── validation.js   # Input validation helpers
│   ├── server.js           # Main Express application
│   └── package.json        # Backend dependencies
├── frontend/                  # Client-side application
│   ├── src/
│   │   ├── routes/          # Page components
│   │   │   ├── Login.svelte      # User login
│   │   │   ├── Register.svelte   # User registration
│   │   │   ├── MyBooks.svelte    # Personal reading list
│   │   │   └── PublicBooks.svelte # Public statistics & discovery
│   │   ├── components/      # Reusable UI components
│   │   │   ├── BookCard.svelte   # Individual book display
│   │   │   └── BookModal.svelte  # Add/edit book form with Google Books
│   │   ├── stores/          # Svelte stores for state management
│   │   │   ├── auth.js           # Authentication state
│   │   │   └── books.js          # Books data management
│   │   ├── utils/
│   │   │   └── bookApi.js        # Google Books API integration
│   │   ├── App.svelte       # Root application component
│   │   └── main.js          # Application entry point
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite configuration
│   └── package.json         # Frontend dependencies
├── db/                       # Database setup
│   ├── schema.sql           # Database table definitions
│   └── init.js             # Database initialisation script
└── package.json            # Root scripts and development tools
```

## Quick Start

### Prerequisites

- **Node.js** 16+
- **npm**

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/marceloamor/reading-list-manager
   cd reading-list-manager
   npm run install:all
   ```

2. **Initialise the database**
   ```bash
   npm run db:init
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

### Development Commands

```bash
# Start both frontend and backend in development mode
npm run dev

# Start backend only (runs on http://localhost:3001)
npm run backend:dev

# Start frontend only (runs on http://localhost:5173)
npm run frontend:dev

# Build frontend for production
npm run build

# Start production server
npm start

# Clean all node_modules
npm run clean

# Reinitialise database, (deletes all data)
npm run db:init
```

## API Reference

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/status` - Check authentication status

### Book Management (Protected)
- `GET /api/books` - Get user's books
- `POST /api/books` - Add new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Public Statistics
- `GET /api/books/public` - Get community statistics and popular books

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Books Table
```sql
CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT,
    status TEXT CHECK(status IN ('read', 'reading', 'to-read')) DEFAULT 'to-read',
    notes TEXT,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Key Features Explained

### Google Books API Integration
- **Smart Autocomplete**: Type a book title and get suggestions from Google's vast database
- **Metadata Autofill**: Automatically populate title, author, and genre fields
- **User-Controlled Notes**: Description field remains empty for your personal thoughts
- **Cover Images**: Visual book suggestions with cover thumbnails

### Public Statistics Dashboard
- **Popular Books**: See what the community is reading most
- **Genre Trends**: Discover popular genres and reading patterns
- **Author Rankings**: Top authors based on community preferences
- **Reading Status Distribution**: Visual breakdown of reading progress across users
- **Privacy-First**: All data is anonymised - no personal information is exposed

### Authentication & Security
- **Secure Sessions**: Express session management with secure cookies
- **Password Protection**: bcrypt hashing with salt for password security
- **Rate Limiting**: API rate limiting to prevent API abuse
- **Input Validation**: Comprehensive validation on both frontend and backend
- **SQL Injection Prevention**: Parameterised queries throughout

## Usage Guide

1. **Getting Started**
   - Register for an account or login if you already have one
   - Start adding books to your personal library

2. **Adding Books**
   - Click 'Add Book' to open the book modal
   - Type a book title to see Google Books suggestions
   - Select a suggestion to auto-fill metadata, or add manually
   - Add your personal notes and set reading status
   - Save to add to your library

3. **Managing Your Library**
   - View all your books in the "My Books" section
   - Use the search bar to filter your collection
   - Click edit to modify book details
   - Change reading status as you progress
   - Delete books you no longer want to track

4. **Exploring Community Data**
   - Visit Public Books to see community statistics
   - Browse popular books and authors
   - Get inspiration for your next read

## Authors

Created by **Marcelo and Umar** as a modern reading list management solution.

## License

Uhmmm MIT or something. Northeastern Limited. 

**Happy CRUD Reading!**