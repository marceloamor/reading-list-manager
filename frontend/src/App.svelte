<!-- Main application component handling routing and auth -->

<script>
    import { onMount } from 'svelte';
    import { authStore } from './stores/auth.js';
    import { booksStore } from './stores/books.js';
    import Login from './routes/Login.svelte';
    import Register from './routes/Register.svelte';
    import MyBooks from './routes/MyBooks.svelte';
    import PublicBooks from './routes/PublicBooks.svelte';

    export let version = '1.0.0';
    export const apiUrl = '/api';

    // application state
    let currentPage = 'login';
    let isLoading = true;
    let isInitialising = true;
    let appError = null;

    // Store subscriptions
    $: isAuthenticated = $authStore.isAuthenticated;
    $: currentUser = $authStore.user;
    $: authLoading = $authStore.isLoading;
    $: authError = $authStore.error;
    $: userBooks = $booksStore.books;
    $: booksLoading = $booksStore.isLoading;
    $: booksError = $booksStore.error;

    // watch for authentication changes to fetch/clear books
    let hasLoadedBooksOnce = false;
    $: if (isAuthenticated && currentUser && !hasLoadedBooksOnce) {
        handleUserLogin();
        hasLoadedBooksOnce = true;
    } else if (!isAuthenticated) {
        booksStore.clearBooks();
        hasLoadedBooksOnce = false;
    }

    // handle user login and fetch their books
    async function handleUserLogin() {
        try {
            console.log('Loading user books...');
            await booksStore.fetchBooks();
            console.log('Books loaded successfully');
        } catch (error) {
            console.error('Failed to load books:', error);
        }
    }

    // client-side routing
    function handleNavigation(page) {
        console.log('Navigating to:', page);
        currentPage = page;
        window.location.hash = page;
    }

    // parse current route from URL
    function parseRoute() {
        const hash = window.location.hash.slice(1) || 'login';

        if (['login', 'register', 'public'].includes(hash)) {
            return hash;
        }

        if (!isAuthenticated) {
            return 'login';
        }

        return hash === '' ? 'my-books' : hash;
    }

    // application initialisation
    onMount(async () => {
        try {
            console.log('Initializing Reading List Manager...');
            await authStore.checkAuthStatus();
            window.addEventListener('hashchange', () => {
                currentPage = parseRoute();
            });
            isInitialising = false;
            isLoading = false;
            console.log('App initialization complete');
        } catch (error) {
            console.error('App initialization failed:', error);
            appError = error.message;
            isInitialising = false;
            isLoading = false;
        }
    });

    $: if (!isInitialising) {
        currentPage = parseRoute();
    }

    // event handlers
    function handleLoginSuccess(user) {
        console.log('Login successful:', user);
        handleNavigation('my-books');
    }

    async function handleLogout() {
        console.log('Logging out...');
        booksStore.clearBooks();
        await authStore.logout();
        handleNavigation('login');
    }

    function handleRegisterSuccess(user) {
        console.log('Registration successful:', user);
        handleNavigation('my-books');
    }

    // REACTIVE STATEMENTS

    // Update page title based on current route
    $: {
        const pageTitles = {
            login: 'Login',
            register: 'Register',
            'my-books': 'My Books',
            public: 'Popular Books',
        };

        const title = pageTitles[currentPage] || 'Reading List Manager';
        document.title = `${title} - Reading List Manager`;
    }

    // Log route changes in development
    $: {
        if (import.meta.env.DEV) {
            console.log('📍 Route changed:', currentPage);
        }
    }
</script>

<!-- TEMPLATE / MARKUP -->

<main class="app" class:loading={isLoading}>
    <!-- Application Header -->
    <header class="app-header">
        <h1 class="app-title">Reading List Manager</h1>

        <!-- Placeholder navigation -->
        {#if isAuthenticated}
            <nav class="nav-placeholder">
                <button
                    class="nav-link"
                    class:active={currentPage === 'my-books'}
                    on:click={() => handleNavigation('my-books')}
                >
                    My Books
                </button>
                <button
                    class="nav-link"
                    class:active={currentPage === 'public'}
                    on:click={() => handleNavigation('public')}
                >
                    Popular Books
                </button>
                <button class="nav-link logout" on:click={handleLogout}>
                    Logout
                </button>
            </nav>
        {/if}
    </header>

    <!-- Main Content Area -->
    <div class="app-content" id="main-content">
        <!-- Application Error Display -->
        {#if appError}
            <div class="error-container">
                <h2>⚠️ Application Error</h2>
                <p>{appError}</p>
                <button on:click={() => window.location.reload()}>
                    🔄 Reload Application
                </button>
            </div>

            <!-- Loading State -->
        {:else if isInitialising}
            <div class="loading-container">
                <div
                    class="loading-spinner"
                    aria-label="Loading application..."
                ></div>
                <p>Initialising Reading List Manager...</p>
            </div>

            <!-- Main Application Content -->
        {:else}
            <!-- Route: Login Page -->
            {#if currentPage === 'login'}
                <div class="page-container">
                    <h2>Welcome Back</h2>
                    <p>Please log in to access your reading list.</p>

                    <Login onSuccess={handleLoginSuccess} />
                    <p>
                        Don't have an account?
                        <button
                            class="link-button"
                            on:click={() => handleNavigation('register')}
                        >
                            Register here
                        </button>
                    </p>
                </div>

                <!-- Route: Registration Page -->
            {:else if currentPage === 'register'}
                <div class="page-container">
                    <h2>Create Account</h2>
                    <p>Join Reading List Manager to track your books.</p>
                    <Register onSuccess={handleRegisterSuccess} />
                    <p>
                        Already have an account?
                        <button
                            class="link-button"
                            on:click={() => handleNavigation('login')}
                        >
                            Login here
                        </button>
                    </p>
                </div>

                <!-- Route: My Books Page -->
            {:else if currentPage === 'my-books'}
                <div class="page-container">
                    <h2>My Reading List</h2>
                    <p>Welcome back, {currentUser?.username || 'Reader'}!</p>

                    <MyBooks />
                </div>

                <!-- Route: Public Books Page -->
            {:else if currentPage === 'public'}
                <div class="page-container">
                    <PublicBooks />
                </div>

                <!-- Route: 404 Not Found -->
            {:else}
                <div class="page-container">
                    <h2>Page Not Found</h2>
                    <p>The page you're looking for doesn't exist.</p>
                    <button
                        on:click={() =>
                            handleNavigation(
                                isAuthenticated ? 'my-books' : 'login'
                            )}
                    >
                        Go Home
                    </button>
                </div>
            {/if}
        {/if}
    </div>

    <!-- Application Footer -->
    <footer class="app-footer">
        <p>Northeastern's Very OwnReading List Manager v{version}</p>
        {#if import.meta.env.DEV}
            <p class="dev-info">Development Mode</p>
        {/if}
    </footer>
</main>

<!-- STYLES -->

<style>
    /* GLOBAL APP LAYOUT */

    .app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    /* HEADER STYLES */

    .app-header {
        background: #2563eb;
        color: white;
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .app-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
    }

    /* Placeholder Navigation */
    .nav-placeholder {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .nav-link {
        background: none;
        border: none;
        color: white;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .nav-link:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-link.active {
        background-color: rgba(255, 255, 255, 0.2);
        font-weight: 600;
    }

    .nav-link.logout {
        background-color: #dc2626;
    }

    .nav-link.logout:hover {
        background-color: #b91c1c;
    }

    /* MAIN CONTENT STYLES */

    .app-content {
        flex: 1;
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
    }

    .page-container {
        max-width: 800px;
        margin: 0 auto;
    }

    .page-container h2 {
        color: #1f2937;
        margin-bottom: 0.5rem;
        font-size: 2rem;
    }

    .page-container > p {
        color: #6b7280;
        margin-bottom: 2rem;
        font-size: 1.125rem;
    }

    /* PLACEHOLDER STYLES */

    .placeholder-content {
        background: white;
        border: 2px dashed #d1d5db;
        border-radius: 0.5rem;
        padding: 2rem;
        text-align: center;
        margin: 2rem 0;
    }

    .placeholder-content h3 {
        color: #374151;
        margin-bottom: 1rem;
    }

    .placeholder-content p {
        color: #6b7280;
        margin-bottom: 1rem;
    }

    .placeholder-content ul {
        text-align: left;
        max-width: 400px;
        margin: 1rem auto;
        color: #6b7280;
    }

    .placeholder-content li {
        margin-bottom: 0.5rem;
    }

    /* LOADING AND ERROR STYLES */

    .loading-container,
    .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        text-align: center;
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e5e7eb;
        border-top: 4px solid #2563eb;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .error-container {
        color: #dc2626;
    }

    .error-container h2 {
        margin-bottom: 1rem;
    }

    .error-container button {
        background: #2563eb;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.375rem;
        cursor: pointer;
        margin-top: 1rem;
    }

    /* BUTTON STYLES */

    button {
        background: #2563eb;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.375rem;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.2s;
    }

    button:hover {
        background: #1d4ed8;
    }

    .link-button {
        background: none;
        color: #2563eb;
        text-decoration: underline;
        padding: 0;
        border: none;
        cursor: pointer;
    }

    .link-button:hover {
        color: #1d4ed8;
    }

    /* FOOTER STYLES */

    .app-footer {
        background: #f3f4f6;
        padding: 1rem 2rem;
        text-align: center;
        color: #6b7280;
        font-size: 0.875rem;
        border-top: 1px solid #e5e7eb;
    }

    .dev-info {
        color: #f59e0b;
        font-weight: 600;
        margin-top: 0.25rem;
    }

    /* RESPONSIVE DESIGN */

    @media (max-width: 768px) {
        .app-header {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
        }

        .app-title {
            font-size: 1.25rem;
        }

        .nav-placeholder {
            gap: 0.5rem;
        }

        .nav-link {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
        }

        .app-content {
            padding: 1rem;
        }

        .page-container h2 {
            font-size: 1.5rem;
        }
    }

    /* ACCESSIBILITY IMPROVEMENTS */

    @media (prefers-reduced-motion: reduce) {
        .loading-spinner {
            animation: none;
        }
    }

    @media (prefers-contrast: high) {
        .app-header {
            border-bottom: 2px solid white;
        }

        .nav-link {
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
    }
</style>
 