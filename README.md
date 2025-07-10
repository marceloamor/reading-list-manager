# Reading List Manager

A full-stack web application for managing personal reading lists, built with Svelte, Node.js, Express, and SQLite.

## Project Overview

The Reading List Manager allows users to create, manage, and browse personal reading lists. Users can register accounts, add books with metadata (title, author, genre, reading status, and notes), and view their collections in a responsive interface. The application also includes a public API endpoint that provides anonymised statistics about popular books across all users.

### Key Features

- **User Authentication**: Secure registration and login system
- **CRUD Operations**: Create, read, update, and delete books in your reading list
- **Book Management**: Add titles with author, genre, reading status, and personal notes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Public Statistics**: View popular books and genres across all users (anonymised)
- **Data Privacy**: Users can only see and modify their own books

## Technology Stack

- **Frontend**: Svelte with Vite for development and building
- **Backend**: Node.js with Express.js framework
- **Database**: SQLite for lightweight, file-based data storage
- **Authentication**: Express sessions with secure password hashing
- **Styling**: Vanilla CSS with responsive design principles

## Project Structure

```
reading-list-manager/
├── backend/                    # Server-side application
│   ├── routes/                # API route handlers
│   │   ├── auth.js           # Authentication routes (register/login/logout)
│   │   └── books.js          # Book CRUD operations and public API
│   ├── middleware/           # Express middleware functions
│   │   └── auth.js          # Authentication middleware
│   ├── utils/               # Utility functions
│   │   ├── db.js           # Database connection and queries
│   │   └── validation.js   # Input validation helpers
│   ├── server.js           # Main Express application entry point
│   └── package.json        # Backend dependencies
├── frontend/               # Client-side application
│   ├── src/               # Svelte source code
│   │   ├── routes/        # Page components
│   │   │   ├── Login.svelte      # User login page
│   │   │   ├── Register.svelte   # User registration page
│   │   │   ├── MyBooks.svelte    # Personal reading list
│   │   │   └── PublicBooks.svelte # Public statistics page
│   │   ├── components/    # Reusable UI components
│   │   │   ├── BookCard.svelte   # Individual book display
│   │   │   ├── BookForm.svelte   # Add/edit book form
│   │   │   ├── Nav.svelte        # Navigation component
│   │   │   └── LoadingSpinner.svelte # Loading indicator
│   │   ├── stores/        # Svelte stores for state management
│   │   │   ├── auth.js           # User authentication state
│   │   │   └── books.js          # Books data management
│   │   ├── utils/         # Frontend utility functions
│   │   │   ├── api.js            # API communication helpers
│   │   │   └── validation.js     # Form validation
│   │   ├── App.svelte     # Root application component
│   │   └── main.js        # Application entry point
│   ├── public/            # Static assets
│   │   └── index.html     # HTML template
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend dependencies
├── db/                    # Database files and setup
│   ├── schema.sql         # Database table definitions
│   └── init.js           # Database initialisation script
├── docs/                 # Documentation
│   ├── api.md           # API endpoint documentation
│   └── database.md      # Database schema documentation
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore rules
└── package.json        # Root package.json for scripts
```

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reading-list-manager
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Set up the backend**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

5. **Initialise the database**
   ```bash
   npm run db:init
   ```

6. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

### Running the Application

#### Development Mode (Recommended for Development)

1. **Start the backend server** (in one terminal):
   ```bash
   npm run backend:dev
   ```
   This starts the Express server on `http://localhost:3000` with automatic reloading.

2. **Start the frontend development server** (in another terminal):
   ```bash
   npm run frontend:dev
   ```
   This starts the Vite development server on `http://localhost:5173` with hot module replacement.

3. **Open your browser** and navigate to `http://localhost:5173`

#### Production Mode

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

## 🔧 Development Guide

### Backend Development

The backend is built with Express.js and follows RESTful API principles. Key areas to implement:

#### Authentication System (`backend/routes/auth.js`)
- User registration with password hashing
- Login with session management
- Logout functionality
- Password validation and security

#### Book Management (`backend/routes/books.js`)
- CRUD operations for books
- User-specific book filtering
- Input validation and sanitisation
- Public statistics endpoint

#### Database Operations (`backend/utils/db.js`)
- SQLite connection management
- SQL query functions
- Error handling
- Data validation

### Frontend Development

The frontend uses Svelte for reactive UI components. Key areas to implement:

#### User Interface Components
- Responsive book cards with edit/delete functionality
- Forms for adding and editing books
- Navigation with authentication state
- Loading states and error handling

#### State Management
- User authentication state (login/logout)
- Books data management (CRUD operations)
- Form state and validation
- API communication

#### Routing and Navigation
- Client-side routing between pages
- Protected routes for authenticated users
- Smooth transitions and user feedback

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Books Table
```sql
CREATE TABLE books (
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
);
```

## 🔌 API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Book Management Endpoints
- `GET /api/books` - Get user's books (requires authentication)
- `POST /api/books` - Add a new book (requires authentication)
- `PUT /api/books/:id` - Update a book (requires authentication)
- `DELETE /api/books/:id` - Delete a book (requires authentication)

### Public Endpoints
- `GET /api/books/public` - Get anonymised book statistics

## Testing

### Backend Testing
```bash
npm run test:backend
```

### Frontend Testing
```bash
npm run test:frontend
```

### Full Test Suite
```bash
npm test
```

## Security Considerations

- **Password Security**: Passwords are hashed using bcrypt with salt
- **Session Management**: Secure session cookies with appropriate flags
- **Input Validation**: All user inputs are validated and sanitised
- **SQL Injection Prevention**: Parameterised queries are used throughout
- **Authentication Middleware**: Protected routes require valid authentication

## Implementation Tasks

Focus focus on implementing the following areas (marked with `TODO` comments in the code, though go nuts with it and rework or add whatever):

### Backend Tasks
1. **User Registration** - Implement password hashing and user creation
2. **User Login** - Implement authentication logic and session management
3. **Book CRUD Operations** - Complete create, read, update, delete functionality
4. **Public Statistics** - Implement aggregated book data queries
5. **Input Validation** - Add comprehensive validation for all inputs
6. **Error Handling** - Implement proper error responses and logging

### Frontend Tasks
1. **User Interface** - Complete the book cards and forms
2. **Authentication Flow** - Implement login/register forms and state management
3. **Book Management** - Add functionality for creating, editing, and deleting books
4. **Responsive Design** - Ensure the application works on all device sizes
5. **User Feedback** - Add loading states, success messages, and error handling
6. **Client-side Validation** - Implement form validation before API calls

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit them: `git commit -m 'Add some feature'`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Create a pull request, then either ask me to merge it in or squash and commit yourself

## Support

If you encounter any issues or have questions:
1. Check the documentation in the `docs/` folder
2. Review the code comments and TODO items
3. Check the console for error messages
4. Hit marce up, not necessarily in this order


## 🎯 Learning Objectives

This project helps you learn:
- Full-stack web development principles
- RESTful API design and implementation
- Database design and SQL operations
- Modern JavaScript and Svelte framework
- User authentication and security best practices
- Responsive web design
- Version control with Git

Happy coding! 🚀 