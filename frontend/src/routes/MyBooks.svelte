<script>
    import { onMount } from 'svelte';
    import BookModal from '../components/BookModal.svelte';
    import BookCard from '../components/BookCard.svelte';

    const API_BASE = 'http://localhost:3001';
    let books = [];
    let showModal = false;
    let editingBook = null;
    let loading = true;
    let error = null;

    // Unified API request handler
    const makeRequest = async (endpoint, method = 'GET', body = null) => {
        const options = {
            method,
            credentials: 'include',
            headers: {},
        };

        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        const res = await fetch(`${API_BASE}${endpoint}`, options);

        if (res.status === 401) {
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(
                errorData.error || `Request failed with status ${res.status}`
            );
        }

        return res.json();
    };

    // Fetch books
    const fetchBooks = async () => {
        loading = true;
        try {
            const data = await makeRequest('/api/books');
            books = data.books || [];
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    };

    // Delete book
    const removeBook = async (bookId) => {
        try {
            await makeRequest(`/api/books/${bookId}`, 'DELETE');
            books = books.filter((b) => b.id !== bookId);
        } catch (err) {
            error = err.message;
        }
    };

    // Handle book updates from modal
    const handleBookSaved = (e) => {
        const updatedBook = e.detail;

        const exists = books.some((b) => b.id === updatedBook.id);

        if (exists) {
            // Book already exists — it's an edit
            books = books.map((b) =>
                b.id === updatedBook.id ? updatedBook : b
            );
        } else {
            // Book is new — it's an add
            books = [updatedBook, ...books];
        }

        showModal = false;
    };

    const openAddBookModal = () => {
        editingBook = null;
        showModal = true;
    };

    const openEditBookModal = (book) => {
        editingBook = book;
        showModal = true;
    };

    onMount(fetchBooks);
</script>

<h1>📚 My Books</h1>
<button class="add-button" on:click={openAddBookModal}>+ Add Book</button>

{#if showModal}
    <BookModal
        book={editingBook}
        on:close={() => (showModal = false)}
        on:saved={handleBookSaved}
    />
{/if}

{#if loading}
    <p class="centered">Loading your books...</p>
{:else if error}
    <p class="centered" style="color: red;">{error}</p>
{:else if books.length === 0}
    <p class="centered">No books added yet. Click "Add Book" to get started!</p>
{:else}
    <div class="book-grid">
        {#each books as book (book.id)}
            <BookCard
                {book}
                on:edit={() => openEditBookModal(book)}
                on:delete={(e) => removeBook(e.detail)}
            />
        {/each}
    </div>
{/if}

<style>
    h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
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
        margin-bottom: 1.5rem;
    }

    .add-button:hover {
        background-color: #0f74d1;
    }

    .book-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1.5rem;
    }

    .centered {
        text-align: center;
        color: gray;
    }
</style>
