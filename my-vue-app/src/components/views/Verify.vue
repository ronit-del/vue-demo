<template>
    <div class="verify-container">
        <form @submit.prevent="handleVerify" v-if="!isEmailVerified">
            <ErrorComponent :error="error" />
            <SuccessComponent :success="success" />

            <div class="form-group">
                <label for="token">Please verify your email by clicking the button below.</label>
                <button type="submit" class="btn btn-primary btn-block">
                    Verify
                    <span v-if="isLoading">
                        <i class="fa fa-spinner fa-spin"></i>
                    </span>
                </button>
            </div>
        </form>
        <div v-else>
            <p>Email is already verified!</p>
            <button type="button" class="btn btn-primary btn-block" @click="redirectLogin">
                Login
            </button>
        </div>
    </div>
</template>

<script>
    import { verifyData } from '../../services/api';  // Assuming you have a checkEmailVerified API
    import ErrorComponent from '../status/error.vue';
    import SuccessComponent from '../status/success.vue';

    export default {
        name: 'VerifyComponent',
        components: {
            ErrorComponent,
            SuccessComponent
        },

        data() {
            return {
                token: this.$route.params.token,
                error: '',
                success: '',
                isLoading: false,
                isEmailVerified: false // New data property to track verification status
            }
        },

        mounted() {
            // Check if the email is already verified on mount
            this.checkIfEmailVerified();
        },

        methods: {
            checkIfEmailVerified() {
                verifyData(this.token)
                    .then(response => {
                        if (response && response.success) {
                            this.success = response.message;
                            this.isEmailVerified = true;  // Mark as verified
                            setTimeout(() => {
                                this.isLoading = false;
                                this.success = '';
                            }, 2000);
                        }
                    })
                    .catch(error => {
                        this.error = error;
                        setTimeout(() => {
                            this.isLoading = false;
                            this.error = '';
                        }, 2000);
                    }
                );
            },

            redirectLogin() {
                this.$router.push('/login');
            },

            handleVerify() {
                if (this.isEmailVerified) return;  // Prevent verification if already verified

                this.isLoading = true;
                verifyData(this.token)
                    .then(response => {
                        if (response.success) {
                            this.success = response.message;
                            setTimeout(() => {
                                this.isLoading = false;
                                this.success = '';
                                this.$router.push('/login');
                            }, 2000);
                        } else {
                            this.error = response.error;
                            setTimeout(() => {
                                this.isLoading = false;
                                this.error = '';
                            }, 2000);
                        }
                    })
                    .catch(error => {
                        this.error = error;
                        setTimeout(() => {
                            this.isLoading = false;
                            this.error = '';
                        }, 2000);
                    }
                );
            }
        }
    }
</script>

<style scoped>
    .verify-container {
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
        text-align: center;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-group label {
        display: block;
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1.5rem;
        line-height: 1.6;
    }

    .btn-block {
        width: 100%;
        padding: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    p {
        text-align: center;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
        .verify-container {
            margin: 1rem auto;
            padding: 2rem 1.5rem;
        }

        .form-group label {
            font-size: 0.875rem;
        }
    }
</style>