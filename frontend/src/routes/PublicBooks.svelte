<script>
    import { onMount } from 'svelte';

    // Loading and error states
    let isLoading = true;
    let isSearching = false;
    let error = null;
    let searchError = null;
    
    // Statistics data
    let stats = {
        popular_books: [],
        popular_genres: [],
        popular_authors: [],
        reading_status_distribution: [],
        total_books: 0,
        total_users: 0
    };
    
    // Search functionality
    let searchQuery = '';
    let searchResults = [];
    let searchGenreFilter = '';
    let hasSearched = false;
    let availableGenres = [];

    // Fetch public book statistics
    async function fetchPublicStats() {
        try {
            isLoading = true;
            error = null;

            const response = await fetch('/api/books/public', {
                credentials: 'include'
            });

            if (response.ok) {
                stats = await response.json();
                availableGenres = stats.popular_genres.map(g => g.genre);
                console.log('Public stats loaded:', stats);
            } else {
                const errorData = await response.json();
                error = errorData.error || 'Failed to load public statistics';
            }
        } catch (err) {
            console.error('Error fetching public stats:', err);
            error = 'Network error loading statistics';
        } finally {
            isLoading = false;
        }
    }

    // Search public books
    async function searchBooks() {
        if (!searchQuery.trim() || searchQuery.trim().length < 2) {
            searchError = 'Search query must be at least 2 characters long';
            return;
        }

        try {
            isSearching = true;
            searchError = null;

            const params = new URLSearchParams({ q: searchQuery.trim() });
            if (searchGenreFilter) {
                params.append('genre', searchGenreFilter);
            }

            const response = await fetch(`/api/books/public/search?${params}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                searchResults = data.results || [];
                hasSearched = true;
                console.log('Search results:', data);
            } else {
                const errorData = await response.json();
                searchError = errorData.error || 'Search failed';
            }
        } catch (err) {
            console.error('Error searching books:', err);
            searchError = 'Network error during search';
        } finally {
            isSearching = false;
        }
    }

    // Clear search results
    function clearSearch() {
        searchQuery = '';
        searchGenreFilter = '';
        searchResults = [];
        hasSearched = false;
        searchError = null;
    }

    // Handle search form submission
    function handleSearchSubmit(event) {
        event.preventDefault();
        searchBooks();
    }

    // Handle search input changes
    function handleSearchInput() {
        searchError = null;
        if (searchQuery.length === 0) {
            clearSearch();
        }
    }

    onMount(() => {
        fetchPublicStats();
    });
</script>

<h1>Popular Books</h1>
<p class="subtitle">Discover what other readers are enjoying</p>

{#if error}
    <div class="error-message">
        <p>{error}</p>
        <button on:click={fetchPublicStats}>Retry</button>
    </div>
{:else if isLoading}
    <div class="loading">
        <p>Loading statistics...</p>
    </div>
{:else}
    <!-- Search Section -->
    <section class="search-section">
        <h2>Search Books</h2>
        <form class="search-form" on:submit={handleSearchSubmit}>
            <div class="search-controls">
                <input
                    type="text"
                    bind:value={searchQuery}
                    on:input={handleSearchInput}
                    placeholder="Search by title or author..."
                    class="search-input"
                />
                
                <select bind:value={searchGenreFilter} class="genre-filter">
                    <option value="">All Genres</option>
                    {#each availableGenres as genre}
                        <option value={genre}>{genre}</option>
                    {/each}
                </select>
                
                <button type="submit" disabled={isSearching || searchQuery.length < 2}>
                    {#if isSearching}
                        Searching...
                    {:else}
                        Search
                    {/if}
                </button>
                
                {#if hasSearched}
                    <button type="button" on:click={clearSearch}>Clear</button>
                {/if}
            </div>
        </form>

        {#if searchError}
            <div class="search-error">
                <p>{searchError}</p>
            </div>
        {/if}

        {#if hasSearched}
            <div class="search-results">
                <h3>Search Results ({searchResults.length})</h3>
                {#if searchResults.length === 0}
                    <p class="no-results">No books found matching your search.</p>
                {:else}
                    <div class="results-grid">
                        {#each searchResults as result}
                            <div class="result-card">
                                <h4>{result.title}</h4>
                                {#if result.author}
                                    <p class="author">by {result.author}</p>
                                {/if}
                                {#if result.genre}
                                    <span class="genre-tag">{result.genre}</span>
                                {/if}
                                <p class="popularity">Added by {result.popularity} reader{result.popularity === 1 ? '' : 's'}</p>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    </section>

    <!-- Statistics Overview -->
    <section class="stats-overview">
        <h2>Community Statistics</h2>
        <div class="overview-cards">
            <div class="stat-card">
                <h3>{stats.total_books.toLocaleString()}</h3>
                <p>Total Books</p>
            </div>
            <div class="stat-card">
                <h3>{stats.total_users.toLocaleString()}</h3>
                <p>Active Readers</p>
            </div>
        </div>
    </section>

    <!-- Popular Books -->
    <section class="popular-books">
        <h2>Most Popular Books</h2>
        {#if stats.popular_books.length === 0}
            <p class="no-data">No popular books data available yet.</p>
        {:else}
            <div class="books-list">
                {#each stats.popular_books as book, index}
                    <div class="book-item">
                        <div class="rank">#{index + 1}</div>
                        <div class="book-info">
                            <h3>{book.title}</h3>
                            {#if book.author}
                                <p class="author">by {book.author}</p>
                            {/if}
                            <p class="times-added">Added by {book.times_added} reader{book.times_added === 1 ? '' : 's'}</p>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </section>

    <!-- Popular Genres -->
    <section class="popular-genres">
        <h2>Popular Genres</h2>
        {#if stats.popular_genres.length === 0}
            <p class="no-data">No genre data available yet.</p>
        {:else}
            <div class="genres-grid">
                {#each stats.popular_genres as genreData}
                    <div class="genre-card">
                        <h3>{genreData.genre}</h3>
                        <p>{genreData.count} book{genreData.count === 1 ? '' : 's'}</p>
                    </div>
                {/each}
            </div>
        {/if}
    </section>

    <!-- Popular Authors -->
    <section class="popular-authors">
        <h2>Top Authors</h2>
        {#if stats.popular_authors.length === 0}
            <p class="no-data">No author data available yet.</p>
        {:else}
            <div class="authors-list">
                {#each stats.popular_authors as author, index}
                    <div class="author-item">
                        <div class="rank">#{index + 1}</div>
                        <div class="author-info">
                            <h3>{author.author}</h3>
                            <p>{author.book_count} book{author.book_count === 1 ? '' : 's'} in collections</p>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </section>

    <!-- Reading Status Distribution -->
    <section class="status-distribution">
        <h2>Reading Status Distribution</h2>
        {#if stats.reading_status_distribution.length === 0}
            <p class="no-data">No reading status data available yet.</p>
        {:else}
            <div class="status-chart">
                {#each stats.reading_status_distribution as statusData}
                    <div class="status-bar">
                        <div class="status-label">
                            <span class="status-name">{statusData.status.replace('-', ' ')}</span>
                            <span class="status-count">{statusData.count}</span>
                        </div>
                        <div class="bar-container">
                            <div 
                                class="bar {statusData.status}" 
                                style="width: {(statusData.count / stats.total_books) * 100}%"
                            ></div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </section>
{/if}

<style>
    /* =============================================================================
     * LAYOUT AND STRUCTURE
     * ============================================================================= */
    
    h1 {
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }
    
    .subtitle {
        color: #7f8c8d;
        margin-bottom: 2rem;
    }
    
    section {
        margin-bottom: 3rem;
        padding: 1.5rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    h2 {
        color: #34495e;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #ecf0f1;
    }

    /* =============================================================================
     * SEARCH SECTION
     * ============================================================================= */
    
    .search-form {
        margin-bottom: 1rem;
    }
    
    .search-controls {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
    }
    
    .search-input {
        flex: 1;
        min-width: 200px;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
    }
    
    .genre-filter {
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
    }
    
    .search-controls button {
        padding: 0.75rem 1.5rem;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .search-controls button:hover:not(:disabled) {
        background: #2980b9;
    }
    
    .search-controls button:disabled {
        background: #bdc3c7;
        cursor: not-allowed;
    }
    
    .search-error {
        background: #ffe6e6;
        border: 1px solid #ff9999;
        border-radius: 4px;
        padding: 1rem;
        margin-top: 1rem;
    }
    
    .search-results {
        margin-top: 2rem;
    }
    
    .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .result-card {
        padding: 1rem;
        border: 1px solid #ecf0f1;
        border-radius: 4px;
        background: #f8f9fa;
    }
    
    .result-card h4 {
        margin: 0 0 0.5rem 0;
        color: #2c3e50;
    }
    
    .result-card .author {
        margin: 0 0 0.5rem 0;
        color: #7f8c8d;
        font-style: italic;
    }
    
    .genre-tag {
        display: inline-block;
        background: #e8f4f8;
        color: #2980b9;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        margin: 0.25rem 0;
    }
    
    .popularity {
        margin: 0.5rem 0 0 0;
        color: #27ae60;
        font-weight: 500;
        font-size: 0.9rem;
    }
    
    .no-results {
        color: #7f8c8d;
        font-style: italic;
        text-align: center;
        padding: 2rem;
    }

    /* =============================================================================
     * STATISTICS SECTIONS
     * ============================================================================= */
    
    .overview-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }
    
    .stat-card {
        text-align: center;
        padding: 2rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 8px;
    }
    
    .stat-card h3 {
        font-size: 2.5rem;
        margin: 0 0 0.5rem 0;
        font-weight: bold;
    }
    
    .stat-card p {
        margin: 0;
        opacity: 0.9;
    }
    
    .books-list, .authors-list {
        display: grid;
        gap: 1rem;
    }
    
    .book-item, .author-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 4px;
        border-left: 4px solid #3498db;
    }
    
    .rank {
        font-size: 1.5rem;
        font-weight: bold;
        color: #3498db;
        margin-right: 1rem;
        min-width: 3rem;
    }
    
    .book-info, .author-info {
        flex: 1;
    }
    
    .book-info h3, .author-info h3 {
        margin: 0 0 0.25rem 0;
        color: #2c3e50;
    }
    
    .book-info .author, .author-info p {
        margin: 0;
        color: #7f8c8d;
        font-size: 0.9rem;
    }
    
    .times-added {
        color: #27ae60 !important;
        font-weight: 500;
    }
    
    .genres-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 1rem;
    }
    
    .genre-card {
        text-align: center;
        padding: 1.5rem;
        background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
        border-radius: 8px;
        color: #2c3e50;
    }
    
    .genre-card h3 {
        margin: 0 0 0.5rem 0;
        text-transform: capitalize;
    }
    
    .genre-card p {
        margin: 0;
        opacity: 0.8;
    }
    
    .status-chart {
        display: grid;
        gap: 1rem;
    }
    
    .status-bar {
        display: grid;
        gap: 0.5rem;
    }
    
    .status-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .status-name {
        font-weight: 500;
        text-transform: capitalize;
        color: #2c3e50;
    }
    
    .status-count {
        color: #7f8c8d;
        font-weight: bold;
    }
    
    .bar-container {
        background: #ecf0f1;
        height: 1.5rem;
        border-radius: 8px;
        overflow: hidden;
    }
    
    .bar {
        height: 100%;
        transition: width 0.3s ease;
    }
    
    .bar.read {
        background: linear-gradient(90deg, #27ae60, #2ecc71);
    }
    
    .bar.reading {
        background: linear-gradient(90deg, #f39c12, #e67e22);
    }
    
    .bar.to-read {
        background: linear-gradient(90deg, #3498db, #2980b9);
    }

    /* =============================================================================
     * UTILITY STYLES
     * ============================================================================= */
    
    .loading, .error-message, .no-data {
        text-align: center;
        padding: 2rem;
        color: #7f8c8d;
    }
    
    .error-message {
        background: #ffe6e6;
        border: 1px solid #ff9999;
        border-radius: 8px;
        color: #c0392b;
    }
    
    .error-message button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .error-message button:hover {
        background: #c0392b;
    }

    /* =============================================================================
     * RESPONSIVE DESIGN
     * ============================================================================= */
    
    @media (max-width: 768px) {
        .search-controls {
            flex-direction: column;
            align-items: stretch;
        }
        
        .search-input {
            min-width: auto;
        }
        
        .overview-cards {
            grid-template-columns: 1fr;
        }
        
        .results-grid {
            grid-template-columns: 1fr;
        }
        
        .genres-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
    }
</style> 