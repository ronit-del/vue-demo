<template>
    <div class="forgot-password-container">
        <form @submit.prevent="handleForgotPassword">
            <h3>Forgot Password</h3>
            <ErrorComponent :error="error" />
            <SuccessComponent :success="success" />
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" class="form-control" v-model="email" placeholder="Enter your email address" />
            </div>
            <button type="submit" class="btn btn-primary btn-block">Forgot Password</button>
        </form>
    </div>
</template>

<script>
    import { forgotPasswordData } from '../../services/api';
    import ErrorComponent from '../status/error.vue';
    import SuccessComponent from '../status/success.vue';

    export default {
        name: 'ForgotPasswordComponent',
        components: {
            ErrorComponent,
            SuccessComponent
        },
        data() {
            return {
                email: '',
                error: '',
                success: '',
            };
        },
        methods: {
            handleForgotPassword() {
                console.log(this.email);
                const data = {
                    email: this.email
                };
                forgotPasswordData(data)
                    .then(response => {
                        if (response.success) {
                            this.success = response.message;
                            setTimeout(() => {
                                this.success = '';
                            }, 3000);
                        } else {
                            this.error = response.error;
                            setTimeout(() => {
                                this.error = '';
                            }, 3000);
                        }
                    })
                    .catch(error => {
                        this.error = error;
                        setTimeout(() => {
                            this.error = '';
                        }, 3000);
                    }
                );
            }
        }
    };
</script>

<style scoped>
    .forgot-password-container {
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

    .form-control {
        width: 100%;
        padding: 0.875rem 1rem;
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
        .forgot-password-container {
            margin: 1rem auto;
            padding: 2rem 1.5rem;
        }

        h3 {
            font-size: 1.75rem;
            margin-bottom: 1.5rem;
        }
    }
</style>