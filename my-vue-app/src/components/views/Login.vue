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
                    <span class="toggle-icon" @click="togglePasswordVisibility('password')">
                        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </span>
                </div>
                <div v-if="formErrors.password" class="error-message">{{ formErrors.password }}</div>
            </div>
            <div class="forgot-password">
                <router-link to="/forgot-password" class="forgot-password-link">
                    Forgot password?
                </router-link>
            </div>
            <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading || hasErrors">
                Login
                <span v-if="isLoading">
                    <i class="fa fa-spinner fa-spin"></i>
                </span>
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
    width: 480px;
    margin: auto;
    padding: 20px;
    box-sizing: border-box;
    margin-top: 100px;
    background: #ffffff;
    box-shadow: 0 6px 10px rgba(0, 0, 0, 1.1);
    border-radius: 10px;
}

form {
    width: 100%;
    margin: auto;
}

h3 {
    text-align: center;
    font-size: 28px;
    margin-bottom: 30px;
    color: #444;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    font-weight: 500;
    color: #555;
    margin-bottom: 8px;
}

.form-control {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #6e8dab;
    border-radius: 8px;
    font-size: 16px;
    background-color: #d4dde7;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
    outline: none;
    border-color: #167bff;
    box-shadow: 0 0 0 3px rgba(22, 123, 255, 0.1);
    background-color: #ffffff;
}

.forgot-password {
    text-align: right;
    margin-top: 10px;
}

.forgot-password-link {
    color: #167bff;
}

.forgot-password-link:hover {
    text-decoration: underline;
}

.btn-block {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #167bff 0%, #0056b3 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-block:hover {
    background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(22, 123, 255, 0.3);
}

.btn-block:active {
    transform: translateY(0);
}

@media (max-width: 768px) {
    h3 {
        font-size: 24px;
    }

    .form-control {
        padding: 10px 14px;
        font-size: 14px;
    }
}
</style>