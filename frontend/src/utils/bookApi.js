// Google Books API integration for book search and auto-completion 
// (nice to have, implement if we have time)

const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1/volumes';

// search for books using Google Books API
export async function searchBooks(query, maxResults = 10) {
    if (!query || query.trim().length < 2) {
        return [];
    }

    try {
        const encodedQuery = encodeURIComponent(query.trim());
        const url = `${GOOGLE_BOOKS_API_BASE}?q=${encodedQuery}&maxResults=${maxResults}&orderBy=relevance`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Google Books API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.items) {
            return [];
        }
        
        return data.items.map(item => parseBookItem(item)).filter(book => book !== null);
        
    } catch (error) {
        console.error('Error searching books:', error);
        return [];
    }
}

// parse a google Books API item into our book format
function parseBookItem(item) {
    try {
        const volumeInfo = item.volumeInfo;
        
        if (!volumeInfo || !volumeInfo.title) {
            return null;
        }
        
        const title = volumeInfo.title;
        const subtitle = volumeInfo.subtitle;
        const fullTitle = subtitle ? `${title}: ${subtitle}` : title;
        
        const authors = volumeInfo.authors || [];
        const author = authors.length > 0 ? authors.join(', ') : '';
        
        const categories = volumeInfo.categories || [];
        const genre = categories.length > 0 ? categories[0] : '';
        
        const description = volumeInfo.description || '';
        const publishedDate = volumeInfo.publishedDate || '';
        const pageCount = volumeInfo.pageCount || 0;
        const language = volumeInfo.language || '';
        
        const imageLinks = volumeInfo.imageLinks || {};
        const coverImage = imageLinks.thumbnail || imageLinks.smallThumbnail || '';
        
        const industryIdentifiers = volumeInfo.industryIdentifiers || [];
        const isbn = industryIdentifiers.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10')?.identifier || '';
        
        return {
            // core fields for the app
            title: fullTitle,
            author: author,
            genre: genre,
            
            // additional metadata (could be used for notes or future features)
            description: description,
            publishedDate: publishedDate,
            pageCount: pageCount,
            language: language,
            isbn: isbn,
            coverImage: coverImage,
            
            // Google Books specific
            googleBooksId: item.id,
            previewLink: volumeInfo.previewLink || '',
            infoLink: volumeInfo.infoLink || ''
        };
        
    } catch (error) {
        console.error('Error parsing book item:', error);
        return null;
    }
}

// get detailed book information by google Books ID
export async function getBookDetails(bookId) {
    try {
        const url = `${GOOGLE_BOOKS_API_BASE}/${bookId}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Google Books API error: ${response.status}`);
        }
        
        const data = await response.json();
        return parseBookItem(data);
        
    } catch (error) {
        console.error('Error getting book details:', error);
        return null;
    }
}

// search for books by ISBN
export async function searchByISBN(isbn) {
    if (!isbn || isbn.trim().length < 10) {
        return [];
    }
    
    const cleanISBN = isbn.trim().replace(/[-\s]/g, '');
    return searchBooks(`isbn:${cleanISBN}`, 5);
}

// create a debounced search function
export function createDebouncedSearch(searchFunction, delay = 300) {
    let timeoutId;
    
    return function(...args) {
        clearTimeout(timeoutId);
        
        return new Promise((resolve) => {
            timeoutId = setTimeout(async () => {
                try {
                    const results = await searchFunction(...args);
                    resolve(results);
                } catch (error) {
                    console.error('Debounced search error:', error);
                    resolve([]);
                }
            }, delay);
        });
    };
}

// Create debounced search instance ready to use
export const debouncedBookSearch = createDebouncedSearch(searchBooks, 300); 