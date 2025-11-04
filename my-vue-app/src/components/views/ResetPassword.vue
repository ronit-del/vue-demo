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

<style>
    .reset-password-container {
        width: 480px;
        margin: auto;
        padding: 20px;
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
        position: relative;
    }

    .input-wrapper {
        position: relative;
    }

    .toggle-icon {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        color: #555;
    }

    .toggle-icon:hover {
        color: #000;
    }

    .error-message {
        color: red;
        font-size: 14px;
        margin-top: 5px;
    }

    .btn-block {
        width: 100%;
    }
</style>