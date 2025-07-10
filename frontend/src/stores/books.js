/**
 * Books Store
 *  Svelte store for managing user's book collection.
 * This handles fetching, adding, updating, and deleting books.
 */

import { writable } from 'svelte/store';

// store state

// books state
// contains user's books and loading/error states

const initialState = {
    books: [],           // Array of user's books
    isLoading: false,    // Loading state for operations
    error: null,         // Error message if any
    lastUpdated: null    // When books were last fetched
};

// Create the main books store
const { subscribe, set, update } = writable(initialState);

// API functions

// fetch all books for the current user
// called when user logs in or app loads

async function fetchBooks() {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
        const response = await fetch('/api/books', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            const books = data.books || data; // handle both {books: []} and [] formats
            
            update(state => ({
                ...state,
                books: books,
                isLoading: false,
                error: null,
                lastUpdated: new Date()
            }));
            
            return { success: true, books };
        } else {
            const errorData = await response.json();
            update(state => ({ 
                ...state, 
                isLoading: false, 
                error: errorData.error || 'Failed to fetch books' 
            }));
            
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.error('Fetch books error:', error);
        update(state => ({ 
            ...state, 
            isLoading: false, 
            error: 'Network error loading books' 
        }));
        
        return { success: false, error: 'Network error' };
    }
}

// add a new book to the user's collection
async function addBook(bookData) {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(bookData)
        });
        
        if (response.ok) {
            const newBook = await response.json();
            
            // Add new book to the store
            update(state => ({
                ...state,
                books: [...state.books, newBook],
                isLoading: false,
                error: null,
                lastUpdated: new Date()
            }));
            
            return { success: true, book: newBook };
        } else {
            const errorData = await response.json();
            update(state => ({ 
                ...state, 
                isLoading: false, 
                error: errorData.error || 'Failed to add book' 
            }));
            
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.error('Add book error:', error);
        update(state => ({ 
            ...state, 
            isLoading: false, 
            error: 'Network error adding book' 
        }));
        
        return { success: false, error: 'Network error' };
    }
}

// update an existing book
async function updateBook(bookId, bookData) {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
        const response = await fetch(`/api/books/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(bookData)
        });
        
        if (response.ok) {
            const updatedBook = await response.json();
            
            // Update book in the store
            update(state => ({
                ...state,
                books: state.books.map(book => 
                    book.id === bookId ? updatedBook : book
                ),
                isLoading: false,
                error: null,
                lastUpdated: new Date()
            }));
            
            return { success: true, book: updatedBook };
        } else {
            const errorData = await response.json();
            update(state => ({ 
                ...state, 
                isLoading: false, 
                error: errorData.error || 'Failed to update book' 
            }));
            
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.error('Update book error:', error);
        update(state => ({ 
            ...state, 
            isLoading: false, 
            error: 'Network error updating book' 
        }));
        
        return { success: false, error: 'Network error' };
    }
}

// delete a book from the user's collection
async function deleteBook(bookId) {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
        const response = await fetch(`/api/books/${bookId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Remove book from the store
            update(state => ({
                ...state,
                books: state.books.filter(book => book.id !== bookId),
                isLoading: false,
                error: null,
                lastUpdated: new Date()
            }));
            
            return { success: true };
        } else {
            const errorData = await response.json();
            update(state => ({ 
                ...state, 
                isLoading: false, 
                error: errorData.error || 'Failed to delete book' 
            }));
            
            return { success: false, error: errorData.error };
        }
    } catch (error) {
        console.error('Delete book error:', error);
        update(state => ({ 
            ...state, 
            isLoading: false, 
            error: 'Network error deleting book' 
        }));
        
        return { success: false, error: 'Network error' };
    }
}

// get a specific book by ID from the store
function getBookById(bookId) {
    let book = null;
    
    // Subscribe temporarily to get current state
    const unsubscribe = subscribe(state => {
        book = state.books.find(b => b.id === parseInt(bookId));
    });
    
    unsubscribe(); // Clean up subscription
    return book;
}

// clear books from store (e.g., when user logs out)
function clearBooks() {
    set({
        books: [],
        isLoading: false,
        error: null,
        lastUpdated: null
    });
}

// clear any error messages
function clearError() {
    update(state => ({ ...state, error: null }));
}

// refresh books (re-fetch from server)
async function refreshBooks() {
    return await fetchBooks();
}

// util functions

// get books filtered by reading status
function getBooksByStatus(status) {
    let filteredBooks = [];
    
    const unsubscribe = subscribe(state => {
        filteredBooks = state.books.filter(book => book.status === status);
    });
    
    unsubscribe();
    return filteredBooks;
}

// get books filtered by genre
function getBooksByGenre(genre) {
    let filteredBooks = [];
    
    const unsubscribe = subscribe(state => {
        filteredBooks = state.books.filter(book => 
            book.genre && book.genre.toLowerCase() === genre.toLowerCase()
        );
    });
    
    unsubscribe();
    return filteredBooks;
}

// search books by title or author
function searchBooks(query) {
    let searchResults = [];
    
    const unsubscribe = subscribe(state => {
        const searchTerm = query.toLowerCase();
        searchResults = state.books.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm)
        );
    });
    
    unsubscribe();
    return searchResults;
}

// export books store

// custom books store with methods
// components can subscribe to this store and call its methods

export const booksStore = {
    subscribe,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    getBookById,
    clearBooks,
    clearError,
    refreshBooks,
    // Utility functions
    getBooksByStatus,
    getBooksByGenre,
    searchBooks
};

// Export individual functions for convenience
export {
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    getBookById,
    clearBooks,
    clearError,
    refreshBooks,
    getBooksByStatus,
    getBooksByGenre,
    searchBooks
}; 