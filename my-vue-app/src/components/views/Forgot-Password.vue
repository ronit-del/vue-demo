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

<style>
    .forgot-password-container {
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
</style>