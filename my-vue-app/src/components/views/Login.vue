<template>
    <div class="login-container">
        <form @submit.prevent="handleLogin">
            <h3>Login</h3>
            <ErrorComponent :error="error" />
            <SuccessComponent :success="success" />
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" class="form-control" v-model="email" placeholder="Enter your email address" />
                <div v-if="formErrors.email" class="error-message">{{ formErrors.email }}</div>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <div class="input-wrapper">
                    <input :type="showPassword ? 'text' : 'password'" class="form-control" v-model="password"
                        placeholder="Enter your password" />
                    <button type="button" class="toggle-icon" @click="togglePasswordVisibility('password')">
                        <svg v-if="showPassword" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 3C14.4183 3 18 6.58172 18 11C18 13.2091 16.7909 15.2091 15 16.618M10 3C5.58172 3 2 6.58172 2 11C2 13.2091 3.20914 15.2091 5 16.618M10 3V1M18 11L20 13M2 11L0 13M15 16.618L13.5 18.5M5 16.618L6.5 18.5M10 13C11.6569 13 13 11.6569 13 10C13 8.34315 11.6569 7 10 7C8.34315 7 7 8.34315 7 10C7 11.6569 8.34315 13 10 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 10C1 10 4 5 10 5C16 5 19 10 19 10C19 10 16 15 10 15C4 15 1 10 1 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div v-if="formErrors.password" class="error-message">{{ formErrors.password }}</div>
            </div>
            <div class="forgot-password">
                <router-link to="/forgot-password" class="forgot-password-link">
                    Forgot password?
                </router-link>
            </div>
            <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading || hasErrors">
                <span v-if="isLoading" class="spinner"></span>
                <span v-else>Login</span>
            </button>
        </form>
    </div>
</template>

<script>
import { loginData } from '../../services/api';
import ErrorComponent from '../status/error.vue';
import SuccessComponent from '../status/success.vue';

export default {
    name: 'LoginComponent',
    components: {
        ErrorComponent,
        SuccessComponent
    },

    data() {
        return {
            email: '',
            password: '',
            error: '',
            success: '',
            formErrors: {},
            showPassword: false,
            isLoading: false
        }
    },

    computed: {
        // Check if there are any errors in the form fields
        hasErrors() {
            return Object.keys(this.formErrors).length > 0;
        }
    },

    methods: {
        togglePasswordVisibility(field) {
            if (field === 'password') {
                this.showPassword = !this.showPassword;
            }
        },

        handleLogin() {
            // Validate the form
            this.formErrors = {};  // Reset errors before validation
            if (!this.email || !this.isValidEmail(this.email)) {
                this.formErrors.email = 'Please enter a valid email address.';
            }

            if (!this.password || this.password.length < 6) {
                this.formErrors.password = 'Password must be at least 6 characters.';
            }

            // If there are validation errors, prevent the form from submitting
            if (Object.keys(this.formErrors).length > 0) {
                return;
            }

            // If validation passes, proceed with the login request
            this.isLoading = true;
            const data = {
                email: this.email,
                password: this.password
            };

            loginData(data)
                .then(response => {
                    if (response.success) {
                        this.success = response.message;
                        localStorage.setItem('user', JSON.stringify(response.userToken))
                        setTimeout(() => {
                            this.isLoading = false;
                            this.success = '';

                            // 👇 Force other components (like navbar) to refresh
                            window.dispatchEvent(new Event('storage'));

                            this.$router.push('/');
                        }, 3000);
                    } else {
                        this.error = response.error;
                        setTimeout(() => {
                            this.isLoading = false;
                            this.error = '';
                        }, 3000);
                    }
                })
                .catch(error => {
                    console.log('error -------> ', error);
                    if (error.response.data.error) {
                        this.error = error.response.data.error;
                    } else {
                        this.error = error;
                    }
                    setTimeout(() => {
                        this.isLoading = false;
                        this.error = '';
                    }, 3000);
                }
                );
        },

        // Helper method to validate email format
        isValidEmail(email) {
            const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            return regex.test(email);
        }
    },

    mounted() {
        window.addEventListener('storage', this.syncUser);
    },

    beforeUnmount() {
        window.removeEventListener('storage', this.syncUser);
    }
};
</script>


<style scoped>
.login-container {
    width: 100%;
    max-width: 480px;
    margin: 2rem auto;
    padding: 2.5rem;
    background: var(--bg-primary);
    box-shadow: var(--shadow-xl);
    border-radius: 16px;
    border: 1px solid var(--border-color);
}

form {
    width: 100%;
}

h3 {
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: var(--text-primary);
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.input-wrapper {
    position: relative;
}

.form-control {
    width: 100%;
    padding: 0.875rem 1rem;
    padding-right: 3rem;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: all 0.3s ease;
    font-family: 'Montserrat', sans-serif;
}

.form-control:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    background-color: var(--bg-primary);
}

.form-control::placeholder {
    color: var(--text-tertiary);
}

.toggle-icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-tertiary);
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.toggle-icon:hover {
    color: var(--text-primary);
    background: var(--bg-secondary);
}

.forgot-password {
    text-align: right;
    margin-top: 0.5rem;
    margin-bottom: 1.5rem;
}

.forgot-password-link {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.2s ease;
}

.forgot-password-link:hover {
    color: var(--primary-dark);
    text-decoration: underline;
}

.btn-block {
    width: 100%;
    padding: 1rem;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.spinner {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
    .login-container {
        margin: 1rem auto;
        padding: 2rem 1.5rem;
    }

    h3 {
        font-size: 1.75rem;
        margin-bottom: 1.5rem;
    }

    .form-control {
        padding: 0.75rem 0.875rem;
        padding-right: 2.5rem;
        font-size: 0.875rem;
    }
}
</style>