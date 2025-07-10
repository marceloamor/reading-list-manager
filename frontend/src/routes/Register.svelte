<script>
    import { authStore } from '../stores/auth.js';
    
    export let onSuccess;

    // Form data
    let username = '';
    let password = '';
    let confirmPassword = '';

    // Subscribe to auth store
    $: authError = $authStore.error;
    $: authLoading = $authStore.isLoading;

    // Validation state
    let errors = {};
    let showValidation = false;

    // Reactive validation
    $: {
        errors = {};
        if (showValidation) {
            validateForm();
    }
    }

    function validateForm() {
        // Username validation
        if (!username.trim()) {
            errors.username = 'Username is required';
        } else if (username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }

        // Password validation
        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (!confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
    }

    async function handleRegister() {
        showValidation = true;
        validateForm();

        // Check if form is valid
        if (Object.keys(errors).length > 0) {
            return;
        }

        // Clear previous auth errors
        authStore.clearError();

        const result = await authStore.register({
                    username,
                    password,
            confirmPassword
        });

        if (result.success) {
            // Clear form
            username = '';
            password = '';
            confirmPassword = '';
            showValidation = false;
            
            // Notify parent component
            if (onSuccess) {
                onSuccess({ username });
            }
        }
        // Error handling is done automatically by the store
    }
</script>

<!-- Registration form -->
<form on:submit|preventDefault={handleRegister} class="placeholder-form">
    <h3>Register</h3>

    {#if authError}
        <p class="error-message">{authError}</p>
    {/if}

    <div>
        <label for="username">Username:</label>
        <input
            id="username"
            type="text"
            bind:value={username}
            class:valid-input={!errors.username}
            class:invalid-input={errors.username}
            required
        />
    </div>

    <div>
        <label for="password">Password:</label>
        <input
            id="password"
            type="password"
            bind:value={password}
            class:valid-input={!errors.password}
            class:invalid-input={errors.password}
            required
        />
    </div>

    <div>
        <label for="confirm_password">Confirm Password:</label>
        <input
            id="confirm_password"
            type="password"
            bind:value={confirmPassword}
            class:valid-input={!errors.confirmPassword}
            class:invalid-input={errors.confirmPassword}
            required
        />
    </div>
    <!-- Username rules -->
    {#if errors.username}
        <p class="invalid">{errors.username}</p>
    {/if}

    <!-- Password rules -->
    {#if errors.password}
        <p class="invalid">{errors.password}</p>
    {/if}

    <!-- Confirm password rules -->
    {#if errors.confirmPassword}
        <p class="invalid">{errors.confirmPassword}</p>
    {/if}

    <button type="submit" disabled={authLoading}>
        {authLoading ? 'Registering...' : 'Register'}
    </button>
</form>

<style>
    /* Input transitions for border and background */
    input {
        transition:
            border-color 0.3s ease-in-out,
            background-color 0.3s ease-in-out;
    }

    /* Valid input field */
    .valid-input {
        border: 2px solid green;
        background-color: #f0fff0; /* subtle light green */
        outline: none;
    }

    /* Invalid input field */
    .invalid-input {
        border: 2px solid red;
        background-color: #fff0f0; /* subtle light red */
        outline: none;
    }

    /* Error message */
    .error-message {
        color: red;
        margin-bottom: 1rem;
    }

    /* Invalid message */
    .invalid {
        color: red;
        font-size: 0.8rem;
        margin-top: 0.25rem;
    }
</style>
