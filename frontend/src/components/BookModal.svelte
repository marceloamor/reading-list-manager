<!-- BookModal.svelte -->
<!-- This component displays a modal for adding or editing a book. -->
<!-- It includes a form for title, author, genre, status, and notes. -->
<!-- It also includes a search bar for auto-completing book titles. -->

<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import { booksStore } from '../stores/books.js';
    import { debouncedBookSearch } from '../utils/bookApi.js';

    export let book = null;
    const dispatch = createEventDispatcher();

    // form fields
    let title = '';
    let author = '';
    let genre = '';
    let status = 'to-read';
    let notes = '';
    
    // Local state
    let error = null;
    let isSaving = false;
    
    // Auto-completion state
    let bookSuggestions = [];
    let showSuggestions = false;
    let isSearching = false;
    let titleInputElement;

    // populate form if editing existing book
    onMount(() => {
        if (book) {
            title = book.title || '';
            author = book.author || '';
            genre = book.genre || '';
            status = book.status || 'to-read';
            notes = book.notes || '';
        }
    });

    // Handle title input changes and trigger book search
    const handleTitleInput = async (event) => {
        const query = event.target.value;
        title = query;
        
        // Clear suggestions if query is too short
        if (query.length < 2) {
            bookSuggestions = [];
            showSuggestions = false;
            return;
        }
        
        // don't search if we're editing an existing book and title hasn't changed much
        if (book && book.title && query.toLowerCase().includes(book.title.toLowerCase().substring(0, 10))) {
            showSuggestions = false;
            return;
        }
        
        try {
            isSearching = true;
            const suggestions = await debouncedBookSearch(query, 8);
            
            // Only show suggestions if the input still matches (user might have kept typing)
            if (titleInputElement && titleInputElement.value === query) {
                bookSuggestions = suggestions;
                showSuggestions = suggestions.length > 0;
            }
        } catch (error) {
            console.error('Error searching books:', error);
            bookSuggestions = [];
            showSuggestions = false;
        } finally {
            isSearching = false;
        }
    };
    
    // handle selecting a book suggestion
    const selectBookSuggestion = (selectedBook) => {
        // Auto-fill form fields (excluding description to allow user-generated notes)
        title = selectedBook.title;
        author = selectedBook.author;
        genre = selectedBook.genre;
        
        // Hide suggestions
        bookSuggestions = [];
        showSuggestions = false;
        
        // focus on the next field (author or status)
        setTimeout(() => {
            const nextField = document.getElementById('author') || document.getElementById('status');
            if (nextField) nextField.focus();
        }, 100);
    };
    
    // Hide suggestions when clicking outside or pressing escape
    const hideSuggestions = () => {
        showSuggestions = false;
    };
    
    // Handle keyboard navigation in suggestions
    const handleSuggestionKeydown = (event, suggestion) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectBookSuggestion(suggestion);
        } else if (event.key === 'Escape') {
            hideSuggestions();
            titleInputElement?.focus();
        }
    };
    
    // Handle keyboard navigation in title input
    const handleTitleKeydown = (event) => {
        if (event.key === 'Escape') {
            hideSuggestions();
        } else if (event.key === 'ArrowDown' && showSuggestions && bookSuggestions.length > 0) {
            event.preventDefault();
            const firstSuggestion = document.querySelector('.suggestion-item');
            if (firstSuggestion) firstSuggestion.focus();
        }
    };

    // Save book (add new or update existing)
    const saveBook = async () => {
        // Validate required fields
        if (!title.trim()) {
            error = 'Title is required';
            return;
        }

        if (!author.trim()) {
            error = 'Author is required';
            return;
        }

        // Clear previous errors
        error = null;
        isSaving = true;

        // Prepare book data
        const bookData = {
            title: title.trim(),
            author: author.trim(),
            genre: genre.trim() || null,
            status,
            notes: notes.trim() || null,
        };

        try {
            let result;
            
            if (book) {
                // Update existing book
                result = await booksStore.updateBook(book.id, bookData);
            } else {
                // Add new book
                result = await booksStore.addBook(bookData);
            }

            if (result.success) {
                // Notify parent component
                dispatch('saved', result.book);
            } else {
                error = result.error || 'Failed to save book';
            }
        } catch (err) {
            console.error('Save book error:', err);
            error = err.message || 'An unexpected error occurred';
        } finally {
            isSaving = false;
        }
    };


     //Handle form submission
    const handleKeydown = (event) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            saveBook();
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            dispatch('close');
        }
    };

    // close modal
    const closeModal = () => {
        hideSuggestions();
        dispatch('close');
    };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal" on:click={() => { hideSuggestions(); closeModal(); }}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div 
        class="modal-content" 
        on:click|stopPropagation={(e) => {
            // hide suggestions if clicking outside the autocomplete area
            if (!e.target.closest('.autocomplete-container')) {
                hideSuggestions();
            }
        }}
        on:keydown={handleKeydown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabindex="-1"
    >
        <h3 id="modal-title">
            {book ? 'Edit Book' : 'Add New Book'}
        </h3>

        {#if error}
            <div class="error-message">
                <p>{error}</p>
                <button type="button" on:click={() => error = null}>×</button>
            </div>
        {/if}

        <form on:submit|preventDefault={saveBook}>
            <div class="form-group">
                <label for="title">Title *</label>
                <div class="autocomplete-container">
                    <input
                        id="title"
                        type="text"
                        bind:this={titleInputElement}
                        bind:value={title}
                        on:input={handleTitleInput}
                        on:keydown={handleTitleKeydown}
                        on:focus={() => showSuggestions = bookSuggestions.length > 0}
                        placeholder="Start typing a book title..."
                        disabled={isSaving}
                        required
                        autocomplete="off"
                    />
                    
                    {#if isSearching}
                        <div class="search-indicator">Searching...</div>
                    {/if}
                    
                    {#if showSuggestions && bookSuggestions.length > 0}
                        <div class="suggestions-dropdown">
                            <div class="suggestions-header">
                                <span>Suggestions from Google Books</span>
                                <button type="button" class="close-suggestions" on:click={hideSuggestions}>×</button>
                            </div>
                            {#each bookSuggestions as suggestion}
                                <div 
                                    class="suggestion-item"
                                    tabindex="0"
                                    role="button"
                                    on:click={() => selectBookSuggestion(suggestion)}
                                    on:keydown={(e) => handleSuggestionKeydown(e, suggestion)}
                                >
                                    <div class="suggestion-content">
                                        <div class="suggestion-title">{suggestion.title}</div>
                                        {#if suggestion.author}
                                            <div class="suggestion-author">by {suggestion.author}</div>
                                        {/if}
                                        {#if suggestion.genre}
                                            <div class="suggestion-genre">{suggestion.genre}</div>
                                        {/if}
                                    </div>
                                    {#if suggestion.coverImage}
                                        <img 
                                            src={suggestion.coverImage} 
                                            alt="Book cover" 
                                            class="suggestion-cover"
                                            loading="lazy"
                                        />
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>

            <div class="form-group">
                <label for="author">Author *</label>
                <input
                    id="author"
                    type="text"
                    bind:value={author}
                    placeholder="Enter author name"
                    disabled={isSaving}
                    required
                />
            </div>

            <div class="form-group">
                <label for="genre">Genre</label>
                <input
                    id="genre"
                    type="text"
                    bind:value={genre}
                    placeholder="Enter genre (optional)"
                    disabled={isSaving}
                />
            </div>

            <div class="form-group">
                <label for="status">Reading Status</label>
                <select id="status" bind:value={status} disabled={isSaving}>
                    <option value="to-read">To Read</option>
                    <option value="reading">Currently Reading</option>
                    <option value="read">Finished</option>
                </select>
            </div>

            <div class="form-group">
                <label for="notes">Notes</label>
                <textarea
                    id="notes"
                    bind:value={notes}
                    rows="4"
                    placeholder="Any thoughts, quotes, or notes about this book..."
                    disabled={isSaving}
                ></textarea>
            </div>

            <div class="actions">
                <button type="button" class="cancel" on:click={closeModal} disabled={isSaving}>
                    Cancel
                </button>
                <button type="submit" class="save" disabled={isSaving || !title.trim() || !author.trim()}>
                    {#if isSaving}
                        Saving...
                    {:else if book}
                        Update Book
                    {:else}
                        Add Book
                    {/if}
                </button>
            </div>
        </form>

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
        z-index: 1000;
        backdrop-filter: blur(2px);
    }

    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: modalEnter 0.2s ease-out;
    }

    @keyframes modalEnter {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    h3 {
        margin: 0 0 1.5rem 0;
        color: #333;
        font-size: 1.5rem;
    }

    .error-message {
        background-color: #fee;
        border: 1px solid #fcc;
        color: #c33;
        padding: 0.8rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .error-message button {
        background: none;
        border: none;
        color: #c33;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #555;
        font-size: 0.9rem;
    }

    input,
    textarea,
    select {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e1e5e9;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s ease;
        box-sizing: border-box;
    }

    input:focus,
    textarea:focus,
    select:focus {
        outline: none;
        border-color: #1e90ff;
        box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.1);
    }

    input:disabled,
    textarea:disabled,
    select:disabled {
        background-color: #f8f9fa;
        opacity: 0.6;
        cursor: not-allowed;
    }

    textarea {
        resize: vertical;
        min-height: 80px;
        font-family: inherit;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
    }

    button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        transition: all 0.2s ease;
    }

    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
    }

    .cancel {
        background-color: #6c757d;
        color: white;
    }

    .cancel:hover:not(:disabled) {
        background-color: #545b62;
        transform: translateY(-1px);
    }

    .save {
        background-color: #1e90ff;
        color: white;
    }

    .save:hover:not(:disabled) {
        background-color: #0f74d1;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(30, 144, 255, 0.3);
    }

    .help-text {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
        font-size: 0.85rem;
        color: #666;
        text-align: center;
    }

    .help-text p {
        margin: 0;
    }

    /* Auto-completion styles */
    .autocomplete-container {
        position: relative;
    }

    .search-indicator {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.8rem;
        color: #666;
        pointer-events: none;
    }

    .suggestions-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 8px 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-height: 400px;
        overflow-y: auto;
        z-index: 1001;
    }

    .suggestions-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0.75rem;
        background: #f8f9fa;
        border-bottom: 1px solid #eee;
        font-size: 0.8rem;
        color: #666;
    }

    .close-suggestions {
        background: none;
        border: none;
        font-size: 1.2rem;
        color: #999;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-suggestions:hover {
        color: #666;
    }

    .suggestion-item {
        display: flex;
        align-items: center;
        padding: 0.75rem;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .suggestion-item:hover,
    .suggestion-item:focus {
        background-color: #f8f9fa;
        outline: none;
    }

    .suggestion-item:last-of-type {
        border-bottom: none;
    }

    .suggestion-content {
        flex: 1;
        min-width: 0;
    }

    .suggestion-title {
        font-weight: 600;
        color: #333;
        margin-bottom: 0.25rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .suggestion-author {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 0.25rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .suggestion-genre {
        font-size: 0.8rem;
        color: #888;
        background: #e8f4f8;
        padding: 0.1rem 0.4rem;
        border-radius: 12px;
        display: inline-block;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .suggestion-cover {
        width: 40px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
        margin-left: 0.75rem;
        flex-shrink: 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .suggestions-footer {
        padding: 0.5rem 0.75rem;
        background: #f8f9fa;
        border-top: 1px solid #eee;
        text-align: center;
    }

    .suggestions-footer small {
        color: #666;
        font-style: italic;
    }

    @media (max-width: 480px) {
        .suggestion-cover {
            width: 30px;
            height: 45px;
            margin-left: 0.5rem;
        }

        .suggestion-item {
            padding: 0.5rem;
        }

        .suggestions-dropdown {
            max-height: 300px;
        }
    }
</style>
