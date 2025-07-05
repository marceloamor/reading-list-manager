<script>
    export let onSuccess;
    // Variables to track state
    let username = '';
    let password = '';
    let confirm_password = '';
    let error = '';
    let success = false;

    // handle register
    const handleRegister = async () => {
        // Ensure error and success state variables correct
        if (error) {
            error = '';
        }
        if (success) {
            success = false;
        }

        // Check passwords match
        if (password !== confirm_password) {
            error = 'Passwords do not match';
            return;
        }

        try {
            const res = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, confirm_password }),
            });
            // Check if registration was successful
            if (!res.ok) {
                const errorData = await res.json();
                error = errorData.message || 'Registration Failed';
                return;
            }
            // If successful than auto login
            success = true;
            const loginReg = await fetch(
                'http://localhost:3001/api/auth/login',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                }
            );
            // Handle if the login fails
            if (!loginReg.ok) {
                error = 'Registration succeeded but login failed';
                return;
            }
            // After login redirect to my-books page
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

<!-- Registration form -->
<form on:submit|preventDefault={handleRegister} class="placeholder-form">
    <h3>Register</h3>

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

    <div>
        <label for="confirm_password">Confirm Password:</label>
        <input
            id="confirm_password"
            type="password"
            bind:value={confirm_password}
            required
        />
    </div>

    <button type="submit">Register</button>
</form>
