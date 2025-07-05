<script>
    export let onSuccess;
    // Variables to track state
    let username = '';
    let password = '';
    let confirm_password = '';
    let error = '';
    let success = false;
    let passwordRequirements = null;

    // Reactive block to update password rule checks as user types
    $: if (password) {
        passwordRequirements = {
            length: password.length >= 6,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
    } else {
        passwordRequirements = null;
    }

    $: passwordValid = passwordRequirements
        ? Object.values(passwordRequirements).every(Boolean)
        : false;

    $: usernameRequirements = {
        minLength: username.length >= 3,
        noSpaces: !/\s/.test(username),
    };

    $: usernameValid = usernameRequirements
        ? Object.values(usernameRequirements).every(Boolean)
        : false;

    $: confirmPasswordValid =
        confirm_password === password && password.length > 0;

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
                body: JSON.stringify({
                    username,
                    password,
                    confirmPassword: confirm_password,
                }),
            });
            // Check if registration was successful
            if (!res.ok) {
                const errorData = await res.json();
                error = errorData.message || 'Registration Failed';

                // Show username/password validation details
                if (errorData.details && Array.isArray(errorData.details)) {
                    error = errorData.details
                        .map((detail) => detail.msg)
                        .join(', ');
                }

                // Handle password strength failure
                if (errorData.requirements) {
                    passwordRequirements = errorData.requirements;
                } else {
                    passwordRequirements = null;
                }

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
        <input
            id="username"
            type="text"
            bind:value={username}
            class:valid-input={usernameValid}
            class:invalid-input={!usernameValid && username.length > 0}
            required
        />
    </div>

    <div>
        <label for="password">Password:</label>
        <input
            id="password"
            type="password"
            bind:value={password}
            class:valid-input={passwordValid}
            class:invalid-input={!passwordValid && password.length > 0}
            required
        />
    </div>

    <div>
        <label for="confirm_password">Confirm Password:</label>
        <input
            id="confirm_password"
            type="password"
            bind:value={confirm_password}
            class:valid-input={confirmPasswordValid}
            class:invalid-input={!confirmPasswordValid &&
                confirm_password.length > 0}
            required
        />
    </div>
    <!-- Username rules -->
    {#if username.length > 0 && !usernameValid}
        <ul class="username-rules">
            {#if !usernameRequirements.minLength}
                <li class="invalid">Username must be at least 3 characters</li>
            {/if}
            {#if !usernameRequirements.noSpaces}
                <li class="invalid">Username cannot contain spaces</li>
            {/if}
        </ul>
    {/if}

    <!-- Password rules -->
    {#if passwordRequirements && !passwordValid}
        <ul class="password-rules">
            {#if !passwordRequirements.length}
                <li class="invalid">Minimum 6 characters</li>
            {/if}
            {#if !passwordRequirements.hasUppercase}
                <li class="invalid">At least one uppercase letter</li>
            {/if}
            {#if !passwordRequirements.hasLowercase}
                <li class="invalid">At least one lowercase letter</li>
            {/if}
            {#if !passwordRequirements.hasNumber}
                <li class="invalid">At least one number</li>
            {/if}
            {#if !passwordRequirements.hasSymbol}
                <li class="invalid">At least one special character</li>
            {/if}
        </ul>
    {/if}

    <!-- Confirm password rules -->
    {#if confirm_password.length > 0 && !confirmPasswordValid}
        <p class="invalid">Passwords do not match</p>
    {/if}

    <button type="submit">Register</button>
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

    /* Rule list (for username and password) */
    .username-rules,
    .password-rules {
        list-style-type: none;
        padding-left: 0;
        margin-top: 0.5rem;
        margin-bottom: 1rem;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }

    /* Valid rule item */
    .valid {
        color: green;
        transition: color 0.3s ease;
    }

    /* Invalid rule item */
    .invalid {
        color: red;
        transition: color 0.3s ease;
    }
</style>
