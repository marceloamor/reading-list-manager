<script>
    export let onSuccess;

    // Variables to hold input and state
    let username = '';
    let password = '';
    let error = '';

    // Handle login form submission
    const handleLogin = async () => {
        // reset error messages before submitting
        if (error) {
            error = '';
        }
        try {
            // Send login data to the backend
            const res = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Convert object into a string
                body: JSON.stringify({ username, password }),
            });
            // Check if login was successful
            if (!res.ok) {
                const errorData = await res.json();
                error = errorData.message || 'Login Failed';
                return;
            }
            if (onSuccess) {
                onSuccess({ username });
            } else {
                window.location.hash = 'my-books';
            }
        } catch (error) {
            console.error(error);
        }
    };
</script>

<!-- Login Form -->
<form on:submit|preventDefault={handleLogin} class="placeholder-form">
    <h3>Login</h3>

    {#if error}
        <p class="error-message">{error}</p>
    {/if}

    <div>
        <label for="username">Username:</label>
        <input id="username" type="text" bind:value={username} required />
    </div>

    <div>
        <label for="password">Password:</label>
        <input id="password" type="password" bind:value={password} required />
    </div>

    <button type="submit">Login</button>
</form>
