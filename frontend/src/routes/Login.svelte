<script>
    import { authStore } from '../stores/auth.js';
    
    export let onSuccess;

    // Variables to hold input and state
    let username = '';
    let password = '';
    let isLoading = false;

    // Subscribe to auth store for error handling
    $: authError = $authStore.error;
    $: authLoading = $authStore.isLoading;

    // Handle login form submission
    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            return;
        }

        const result = await authStore.login({ username, password });
        
        if (result.success) {
            // Clear form
            username = '';
            password = '';
            
            // Notify parent component
            if (onSuccess) {
                onSuccess({ username });
            }
        }
        // Error handling is done automatically by the store
    };
</script>

<!-- Login Form -->
<form on:submit|preventDefault={handleLogin} class="placeholder-form">
    <h3>Login</h3>

    {#if authError}
        <p class="error-message">{authError}</p>
    {/if}

    <div>
        <label for="username">Username:</label>
        <input 
            id="username" 
            type="text" 
            bind:value={username} 
            disabled={authLoading}
            required 
        />
    </div>

    <div>
        <label for="password">Password:</label>
        <input 
            id="password" 
            type="password" 
            bind:value={password} 
            disabled={authLoading}
            required 
        />
    </div>

    <button type="submit" disabled={authLoading || !username.trim() || !password.trim()}>
        {#if authLoading}
            Logging in...
        {:else}
            Login
        {/if}
    </button>
</form>
