<!-- BookCard.svelte -->
<!-- This component displays a book card with title, author, genre, and status. -->
<!--  also includes actions for editing and deleting the book. -->


<script>
    import { createEventDispatcher } from 'svelte';
    export let book;
    const dispatch = createEventDispatcher();

    let showConfirm = false;

    const confirmDelete = () => {
        if (!showConfirm) {
            showConfirm = true;
            setTimeout(() => (showConfirm = false), 3000); // auto-hide after 3s
            return;
        }
        dispatch('delete', book.id);
    };

    const editBook = () => dispatch('edit');
</script>

<div class="card">
    <div class="title">{book.title}</div>
    <div class="author">by {book.author || 'Unknown'}</div>

    <div class="tags">
        {#if book.genre}
            <div class="tag">{book.genre}</div>
        {/if}
        <div class="tag status">{book.status}</div>
    </div>

    <div class="actions">
        <button on:click={editBook}>✏ Edit</button>
        <button on:click={confirmDelete}>
            {#if showConfirm}
                <span class="confirm-delete">Are you sure?</span>
            {:else}
                🗑 Delete
            {/if}
        </button>
    </div>
</div>

<style>
    .card {
        background: #f9f9f9;
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        position: relative;
    }

    .card:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }

    .title {
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 0.25rem;
    }

    .author {
        font-size: 0.95rem;
        color: #555;
        margin-bottom: 0.5rem;
    }

    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .tag {
        background-color: #ddd;
        border-radius: 8px;
        padding: 0.25rem 0.6rem;
        font-size: 0.8rem;
        font-weight: 500;
        color: #333;
    }

    .status {
        background-color: #1e90ff;
        color: white;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
    }

    .actions button {
        border: none;
        background: none;
        color: #1e90ff;
        font-weight: bold;
        cursor: pointer;
        transition: color 0.2s ease;
    }

    .actions button:hover {
        color: #0f74d1;
    }

    .confirm-delete {
        color: red;
        font-size: 0.85rem;
        font-weight: 500;
    }
</style>
