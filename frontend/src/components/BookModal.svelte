<script>
    import { createEventDispatcher, onMount } from 'svelte';

    export let book = null;
    const dispatch = createEventDispatcher();
    const API_BASE = 'http://localhost:3001';

    let title = '';
    let author = '';
    let genre = '';
    let status = 'to-read';
    let notes = '';
    let error = null;
    let isSaving = false;

    onMount(() => {
        if (book) {
            ({ title, author, genre, status, notes } = book);
        }
    });

    const saveBook = async () => {
        if (!title.trim()) {
            error = 'Title is required';
            return;
        }

        isSaving = true;
        error = null;

        const payload = {
            title: title.trim(),
            author: author.trim(),
            genre: genre.trim(),
            status,
            notes: notes.trim(),
        };

        const method = book ? 'PUT' : 'POST';
        const endpoint = book
            ? `${API_BASE}/api/books/${book.id}`
            : `${API_BASE}/api/books`;

        try {
            console.log('Sending payload:', JSON.stringify(payload, null, 2)); // Debug Log 1

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            if (res.status === 401) {
                error = 'Session expired - please log in again';
                window.location.href = '/login';
                return;
            }

            if (res.status === 400) {
                const errorData = await res.json();
                error = errorData.error || 'Invalid book data';
                return;
            }

            if (!res.ok) throw new Error(`Failed to save book (${res.status})`);

            const data = await res.json();
            console.log('Raw API response:', data); // Correct placement debug Log 2

            const bookResponse = data.book || data;

            if (!bookResponse.id || !bookResponse.title) {
                console.error(
                    'Backend response missing required fields. Full response:',
                    JSON.stringify(data, null, 2)
                );
                throw new Error('Server returned incomplete book data');
            }

            dispatch('saved', bookResponse);

            dispatch('saved', data.book || data);
        } catch (err) {
            console.error('Save book error:', err);
            error = err.message || 'Failed to save book';
        } finally {
            isSaving = false;
        }
    };
</script>

<div
    class="modal"
    on:click|stopPropagation
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
>
    <div class="modal-content" on:click|stopPropagation>
        <h3 id="modal-title">{book ? 'Edit Book' : 'Add New Book'}</h3>

        {#if error}
            <p class="error">{error}</p>
        {/if}

        <input
            type="text"
            bind:value={title}
            placeholder="Title"
            aria-label="Book title"
        />
        <input
            type="text"
            bind:value={author}
            placeholder="Author"
            aria-label="Author name"
        />
        <input
            type="text"
            bind:value={genre}
            placeholder="Genre"
            aria-label="Book genre"
        />

        <!-- SELECT ELEMENT -->
        <select bind:value={status} aria-label="Reading status">
            <option value="to-read">To Read</option>
            <option value="reading">Reading</option>
            <option value="read">Read</option>
        </select>

        <!-- TEXTAREA ELEMENT -->
        <textarea
            bind:value={notes}
            rows="4"
            placeholder="Notes (optional)"
            aria-label="Book notes"
        ></textarea>

        <div class="actions">
            <button class="cancel" on:click={() => dispatch('close')}>
                Cancel
            </button>
            <button class="save" on:click={saveBook} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
            </button>
        </div>
    </div>
</div>

<style>
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: auto;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        width: 90%;
        max-width: 500px;
        pointer-events: auto;
    }

    /* These are DEFINITELY used - ignore linter warnings */
    input,
    textarea,
    select {
        width: 100%;
        padding: 0.6rem;
        margin-bottom: 1rem;
        border: 1px solid #ccc;
        border-radius: 6px;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }

    button {
        padding: 0.6rem 1.2rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    }

    .cancel {
        background-color: #ccc;
    }

    .save {
        background-color: #1e90ff;
        color: white;
    }

    .save:hover {
        background-color: #0f74d1;
    }

    .error {
        color: red;
        margin-bottom: 1rem;
    }
</style>
