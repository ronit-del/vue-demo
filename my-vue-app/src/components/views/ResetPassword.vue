<template>
    <div class="reset-password-container">
        <form @submit.prevent="handleResetPassword">
            <h3>Reset Password</h3>
            <ErrorComponent :error="error" />
            <SuccessComponent :success="success" />

            <div class="form-group password-group">
                <label for="password">Password</label>
                <div class="input-wrapper">
                    <input
                        :type="showPassword ? 'text' : 'password'"
                        class="form-control"
                        v-model="password"
                        placeholder="Enter your password"
                        @input="validatePassword"
                        @blur="validatePassword"
                    />

                    <span class="toggle-icon" @click="togglePasswordVisibility('password')">
                        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </span>
                </div>
                <div v-if="formErrors.password" class="error-message">{{ formErrors.password }}</div>
            </div>

            <div class="form-group password-group">
                <label for="confirmPassword">Confirm Password</label>
                <div class="input-wrapper">
                    <input
                        :type="showConfirmPassword ? 'text' : 'password'"
                        class="form-control"
                        v-model="confirmPassword"
                        placeholder="Confirm your password"
                        @input="validateConfirmPassword"
                        @blur="validateConfirmPassword"
                    />
                    <span class="toggle-icon" @click="togglePasswordVisibility('confirmPassword')">
                        <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </span>
                </div>
                <div v-if="formErrors.confirmPassword" class="error-message">{{ formErrors.confirmPassword }}</div>
            </div>

            <button type="submit" class="btn btn-primary btn-block">Reset Password</button>
        </form>
    </div>
</template>

<script>
    import ErrorComponent from '../status/error.vue';
    import SuccessComponent from '../status/success.vue';
    import { resetPasswordData } from '../../services/api';

    export default {
        name: 'ResetPasswordComponent',
        components: {
            ErrorComponent,
            SuccessComponent
        },
        data() {
            return {
                password: '',
                confirmPassword: '',
                error: '',
                success: '',
                token: this.$route.params.token,
                formErrors: {},
                isLoading: false,
                showPassword: false,
                showConfirmPassword: false
            };
        },
        methods: {
            togglePasswordVisibility(field) {
                if (field === 'password') {
                    this.showPassword = !this.showPassword;
                } else if (field === 'confirmPassword') {
                    this.showConfirmPassword = !this.showConfirmPassword;
                }
            },

            validatePassword() {
                if (!this.password) {
                    this.formErrors.password = 'Password is required.';
                } else if (this.password.length < 8) {
                    this.formErrors.password = 'Password must be at least 8 characters.';
                } else {
                    delete this.formErrors.password;
                }

                if (this.confirmPassword) {
                    this.validateConfirmPassword();
                }
            },

            validateConfirmPassword() {
                if (!this.confirmPassword) {
                    this.formErrors.confirmPassword = 'Please confirm your password.';
                } else if (this.password !== this.confirmPassword) {
                    this.formErrors.confirmPassword = 'Passwords do not match.';
                } else {
                    delete this.formErrors.confirmPassword;
                }
            },

            handleResetPassword() {
                // Call validations before submitting
                this.validatePassword();
                this.validateConfirmPassword();

                if (Object.keys(this.formErrors).length > 0) {
                    return;
                }

                // If validation passes, proceed with the login request
                this.isLoading = true;
                const data = {
                    password: this.password,
                    token: this.token
                };

                resetPasswordData(data)
                    .then(response => {
                        if (response.success) {
                            this.success = response.message;
                            setTimeout(() => {
                                this.isLoading = false;
                                this.success = '';
                                this.$router.push('/login');
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
                        this.error = error.response?.data?.error || error;
                        setTimeout(() => {
                            this.isLoading = false;
                            this.error = '';
                        }, 3000);
                    }
                );
                this.password = '';
                this.confirmPassword = '';
            }
        }
    };
</script>

<style scoped>
    .reset-password-container {
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
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .form-group {
        margin-bottom: 1.5rem;
        position: relative;
    }

    .password-group label {
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

    .toggle-icon i {
        font-size: 1.125rem;
    }

    .error-message {
        color: var(--danger-color);
        font-size: 0.875rem;
        font-weight: 500;
        margin-top: 0.5rem;
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

    @media (max-width: 768px) {
        .reset-password-container {
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