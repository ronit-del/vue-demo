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
        width: 480px;
        margin: auto;
        padding: 20px;
        box-sizing: border-box;
    }

    form {
        width: 100%;
        margin: auto;
        text-align: center;
    }

    .form-group {
        margin-bottom: 10px;
    }

    .form-group label {
        font-size: 16px !important;
        font-weight: 600 !important;
        color: #555 !important;
        margin-bottom: 16px !important;
    }

    p {
        text-align: center;
        font-size: large;
        font-weight: bold;
    }
</style>