<script>
    import { onMount } from 'svelte';
    import { booksStore } from '../stores/books.js';
    import BookModal from '../components/BookModal.svelte';
    import BookCard from '../components/BookCard.svelte';

    // Modal state
    let showModal = false;
    let editingBook = null;

    // Subscribe to books store
    $: books = $booksStore.books;
    $: isLoading = $booksStore.isLoading;
    $: error = $booksStore.error;

    // =============================================================================
    // EVENT HANDLERS
    // =============================================================================

    /**
     * Delete a book from the collection
     */
    const handleDeleteBook = async (bookId) => {
        const result = await booksStore.deleteBook(bookId);
        
        if (!result.success) {
            console.error('Failed to delete book:', result.error);
            // Error is already handled by the store
        }
    };

    /**
     * Handle book saved from modal (add or edit)
     */
    const handleBookSaved = (event) => {
        const savedBook = event.detail;

        // Close modal
        showModal = false;
        editingBook = null;

        console.log('Book saved:', savedBook);
        
        // Store is automatically updated by addBook/updateBook calls
        // from within the BookModal component
    };

    /**
     * Open modal to add a new book
     */
    const openAddBookModal = () => {
        editingBook = null;
        showModal = true;
        booksStore.clearError(); // Clear any previous errors
    };

    /**
     * Open modal to edit an existing book
     */
    const openEditBookModal = (book) => {
        editingBook = book;
        showModal = true;
        booksStore.clearError(); // Clear any previous errors
    };

    /**
     * Close the modal
     */
    const closeModal = () => {
        showModal = false;
        editingBook = null;
        booksStore.clearError();
    };

    /**
     * Refresh books list
     */
    const refreshBooks = async () => {
        await booksStore.refreshBooks();
    };

    // =============================================================================
    // LIFECYCLE
    // =============================================================================

    onMount(() => {
        // Books are automatically loaded by App.svelte when user logs in
        // But we can force a refresh if needed
        if (books.length === 0 && !isLoading) {
            refreshBooks();
        }
    });
</script>

<h1>My Books</h1>

<div class="controls">
    <button class="add-button" on:click={openAddBookModal}>
        + Add Book
    </button>
    
    <button class="refresh-button" on:click={refreshBooks} disabled={isLoading}>
        {#if isLoading}
            Refreshing...
        {:else}
            Refresh
        {/if}
    </button>
</div>

{#if showModal}
    <BookModal
        book={editingBook}
        on:close={closeModal}
        on:saved={handleBookSaved}
    />
{/if}

{#if error}
    <div class="error-message">
        <p>{error}</p>
        <button on:click={() => booksStore.clearError()}>Dismiss</button>
    </div>
{/if}

{#if isLoading}
    <p class="centered">Loading your books...</p>
{:else if books.length === 0}
    <div class="empty-state">
        <p>No books in your collection yet!</p>
        <p>Click "Add Book" to start building your reading list.</p>
    </div>
{:else}
    <div class="book-stats">
        <p>You have <strong>{books.length}</strong> book{books.length === 1 ? '' : 's'} in your collection</p>
    </div>
    
    <div class="book-grid">
        {#each books as book (book.id)}
            <BookCard
                {book}
                on:edit={() => openEditBookModal(book)}
                on:delete={(e) => handleDeleteBook(e.detail)}
            />
        {/each}
    </div>
{/if}

<style>
    h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: #333;
    }

    .controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        align-items: center;
    }

    .add-button {
        background-color: #1e90ff;
        color: white;
        padding: 0.6em 1.4em;
        font-size: 1rem;
        font-weight: bold;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: background-color 0.25s ease;
    }

    .add-button:hover {
        background-color: #0f74d1;
    }

    .refresh-button {
        background-color: #6c757d;
        color: white;
        padding: 0.6em 1em;
        font-size: 0.9rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.25s ease;
    }

    .refresh-button:hover:not(:disabled) {
        background-color: #545b62;
    }

    .refresh-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .error-message {
        background-color: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border: 1px solid #f5c6cb;
        border-radius: 8px;
        margin-bottom: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .error-message button {
        background-color: #721c24;
        color: white;
        border: none;
        padding: 0.3em 0.8em;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
    }

    .book-stats {
        margin-bottom: 1rem;
        padding: 0.8rem;
        background-color: #f8f9fa;
        border-radius: 8px;
        text-align: center;
        color: #666;
    }

    .book-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1.5rem;
    }

    .centered {
        text-align: center;
        color: gray;
        font-size: 1.1rem;
        margin: 2rem 0;
    }

    .empty-state {
        text-align: center;
        color: #666;
        margin: 2rem 0;
        padding: 2rem;
        background-color: #f8f9fa;
        border-radius: 12px;
        border: 2px dashed #dee2e6;
    }

    .empty-state p:first-child {
        font-size: 1.3rem;
        margin-bottom: 0.5rem;
    }

    .empty-state p:last-child {
        font-size: 1rem;
        color: #888;
    }
</style>
