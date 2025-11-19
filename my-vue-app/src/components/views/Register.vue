<template>
    <div class="register-container">
        <form @submit.prevent="handleRegister" class="register-form">
            <h3 class="form-title">Create Your Account</h3>

            <ErrorComponent :error="error" />
            <SuccessComponent :success="success" />

            <!-- Full Name Field -->
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" class="form-control" v-model="name" @blur="validateName"
                            placeholder="Enter your name" required />
                        <div v-if="formErrors.name" class="error-message">{{ formErrors.name }}</div>
                    </div>
                </div>

                <!-- Email Address Field -->
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" class="form-control" v-model="email" @blur="validateEmail"
                            placeholder="Enter your email" required />
                        <div v-if="formErrors.email" class="error-message">{{ formErrors.email }}</div>
                    </div>
                </div>
            </div>

            <!-- Phone Number Field -->
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="text" id="phone" class="form-control" v-model="phone" @blur="validatePhone"
                            placeholder="Enter your phone" required />
                        <div v-if="formErrors.phone" class="error-message">{{ formErrors.phone }}</div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="form-group">
                        <label for="address">Address</label>
                        <input type="text" id="address" class="form-control" v-model="address"
                            placeholder="Enter your address" required />
                        <div v-if="formErrors.address" class="error-message">{{ formErrors.address }}</div>
                    </div>
                </div>
            </div>

            <!-- Address Field -->
            <div class="row">
                <!-- Postal Code Field -->
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="postal_code">Postal Code</label>
                        <input type="text" id="postal_code" class="form-control" v-model="postal_code"
                            placeholder="Postal code" required />
                        <div v-if="formErrors.postal_code" class="error-message">{{ formErrors.postal_code }}</div>
                    </div>
                </div>

                <!-- Country Selection -->
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="country">Country</label>
                        <select id="country" class="form-control" v-model="country" @change="validateCountry" required>
                            <option value="">Select a country</option>
                            <option v-for="(name, code) in countries" :key="code" :value="code">
                                {{ name }}
                            </option>
                        </select>
                        <div v-if="formErrors.country" class="error-message">{{ formErrors.country }}</div>
                    </div>
                </div>
            </div>

            <!-- Password Field -->
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" class="form-control" v-model="password"
                            @blur="validatePassword" placeholder="Enter your password" required />
                        <div v-if="formErrors.password" class="error-message">{{ formErrors.password }}</div>
                    </div>
                </div>

                <!-- Confirm Password Field -->
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" class="form-control" v-model="confirmPassword"
                            @blur="validateConfirmPassword" placeholder="Confirm your password" required />
                        <div v-if="formErrors.confirmPassword" class="error-message">{{ formErrors.confirmPassword }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Register Button -->
            <button type="submit" :disabled="isSubmitDisabled" class="btn btn-primary register-btn">
                Register
            </button>
        </form>
    </div>
</template>

<script>
import { registerData, COUNTRIES } from '../../services/api';
import ErrorComponent from '../status/error.vue';
import SuccessComponent from '../status/success.vue';

export default {
    name: 'RegisterComponent',
    components: {
        ErrorComponent,
        SuccessComponent
    },

    data() {
        return {
            name: '',
            email: '',
            phone: '',
            postal_code: '',
            address: '',
            country: '',
            password: '',
            confirmPassword: '',
            error: '',
            success: '',
            isLoading: false,
            formErrors: {},
            countries: COUNTRIES,
            addressSuggestions: []
        };
    },

    computed: {
        isSubmitDisabled() {
            return Object.keys(this.formErrors).length > 0 || !this.name || !this.email || !this.phone || !this.password || !this.confirmPassword;
        }
    },

    methods: {
        // Populate country list (using a static list of countries for demo purposes)
        populateCountryList(countryCode) {
            if (countryCode) {
                this.country = countryCode; // pre-select the country based on API response
            }
        },

        // Validate Name (Minimum 3 characters)
        validateName() {
            if (!this.name || this.name.length < 3) {
                this.formErrors.name = 'Full name must be at least 3 characters.';
            } else {
                delete this.formErrors.name;
            }
        },

        // Validate Email with no disposable addresses
        validateEmail() {
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            const disposableEmails = ['mailinator.com', 'tempmail.com', 'guerrillamail.com']; // add other disposable email providers
            const emailDomain = this.email.split('@')[1];

            if (!this.email || !emailPattern.test(this.email)) {
                this.formErrors.email = 'Please enter a valid email address.';
            } else if (disposableEmails.includes(emailDomain)) {
                this.formErrors.email = 'Disposable email addresses are not allowed.';
            } else {
                delete this.formErrors.email;
            }
        },

        // Validate Phone
        validatePhone() {
            if (!this.phone || !/^\d{10}$/.test(this.phone)) {
                this.formErrors.phone = 'Phone number must be 10 digits.';
            } else {
                delete this.formErrors.phone;
            }
        },

        // Validate Postal Code based on address
        validatePostalCode() {
            if (!this.postal_code) {
                this.formErrors.postal_code = 'Postal code is required.';
            } else {
                delete this.formErrors.postal_code;
            }
        },

        // Validate Password
        validatePassword() {
            if (!this.password) {
                this.formErrors.password = 'Password is required.';
            } else if (this.password.length < 6) {
                this.formErrors.password = 'Password must be at least 6 characters.';
            } else {
                delete this.formErrors.password;
            }
        },

        // Confirm Password
        validateConfirmPassword() {
            if (this.password !== this.confirmPassword) {
                this.formErrors.confirmPassword = 'Passwords do not match.';
            } else {
                delete this.formErrors.confirmPassword;
            }
        },

        handleRegister() {
            this.isLoading = true;
            const data = {
                name: this.name,
                email: this.email,
                phone: this.phone,
                postal_code: this.postal_code,
                address: this.address,
                country: this.country,
                password: this.password,
                confirmPassword: this.confirmPassword
            };

            registerData(data)
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
};
</script>

<style scoped>
.register-container {
    width: 100%;
    max-width: 960px;
    margin: 2rem auto;
    padding: 2.5rem;
    background: var(--bg-primary);
    box-shadow: var(--shadow-xl);
    border-radius: 16px;
    border: 1px solid var(--border-color);
}

.register-form {
    width: 100%;
}

.form-title {
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 1.5rem;
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
    height: 60px;
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
    background-color: var(--bg-primary);
}

.form-control::placeholder {
    color: var(--text-tertiary);
}

.register-btn {
    width: 100%;
    padding: 1rem;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.register-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.address-suggestions {
    list-style-type: none;
    padding: 0;
    margin-top: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    max-height: 200px;
    overflow-y: auto;
    background: var(--bg-primary);
    box-shadow: var(--shadow-md);
}

.address-suggestions li {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background 0.2s ease;
    border-bottom: 1px solid var(--border-color);
}

.address-suggestions li:last-child {
    border-bottom: none;
}

.address-suggestions li:hover {
    background-color: var(--bg-secondary);
}

@media (max-width: 768px) {
    .register-container {
        margin: 1rem auto;
        padding: 2rem 1.5rem;
    }

    .row {
        grid-template-columns: 1fr;
        gap: 0;
    }

    .form-title {
        font-size: 1.75rem;
        margin-bottom: 1.5rem;
    }

    .form-control {
        padding: 0.75rem 0.875rem;
        font-size: 0.875rem;
    }
}
</style>