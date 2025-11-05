<template>
    <div class="profile-container">
        <div class="profile-header">
            <h1 class="profile-title">My Profile</h1>
            <p class="profile-subtitle">Manage your personal information and account settings</p>
        </div>

        <div class="profile-content">
            <div class="section-card">
                <!-- <div class="section-header">
                    <h4 class="section-title">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 19V17C17 15.9391 16.5786 14.9217 15.8284 14.1716C15.0783 13.4214 14.0609 13 13 13H7C5.93913 13 4.92172 13.4214 4.17157 14.1716C3.42143 14.9217 3 15.9391 3 17V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10 9C12.2091 9 14 7.20914 14 5C14 2.79086 12.2091 1 10 1C7.79086 1 6 2.79086 6 5C6 7.20914 7.79086 9 10 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Personal Information
                    </h4>
                    <span class="save-indicator" v-if="infoSaved" :class="{ 'saved': infoSaved }">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 10L6 9L4 11M7 10L4 13L2 11M7 10L12 5M14 1H2C1.44772 1 1 1.44772 1 2V14C1 14.5523 1.44772 15 2 15H14C14.5523 15 15 14.5523 15 14V2C15 1.44772 14.5523 1 14 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Saved
                    </span>
                </div> -->
                <div class="personal-info">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Full Name</label>
                            <input 
                                type="text" 
                                class="form-control" 
                                name="name" 
                                v-model="userDetail.name"
                                placeholder="Enter your full name"
                                @blur="validateField('name')"
                                :class="{ 'has-error': formErrors.name }"
                            />
                            <span v-if="formErrors.name" class="form-error">{{ formErrors.name }}</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <input 
                                type="email" 
                                class="form-control" 
                                name="email" 
                                v-model="userDetail.email"
                                placeholder="Enter your email"
                                @blur="validateField('email')"
                                :class="{ 'has-error': formErrors.email }"
                                disabled
                            />
                            <span class="form-hint">Email cannot be changed</span>
                            <span v-if="formErrors.email" class="form-error">{{ formErrors.email }}</span>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Phone Number</label>
                            <input 
                                type="text" 
                                class="form-control" 
                                name="phone" 
                                v-model="userDetail.phone"
                                placeholder="Enter your phone number"
                                @blur="validateField('phone')"
                                :class="{ 'has-error': formErrors.phone }"
                            />
                            <span v-if="formErrors.phone" class="form-error">{{ formErrors.phone }}</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Address</label>
                            <input 
                                type="text" 
                                class="form-control" 
                                name="address" 
                                v-model="userDetail.address"
                                placeholder="Enter your address"
                                @blur="validateField('address')"
                                :class="{ 'has-error': formErrors.address }"
                            />
                            <span v-if="formErrors.address" class="form-error">{{ formErrors.address }}</span>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Postal Code</label>
                            <input 
                                type="text" 
                                class="form-control" 
                                name="postal_code" 
                                v-model="userDetail.postal_code"
                                placeholder="Postal code"
                                @blur="validateField('postal_code')"
                                :class="{ 'has-error': formErrors.postal_code }"
                            />
                            <span v-if="formErrors.postal_code" class="form-error">{{ formErrors.postal_code }}</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Country</label>
                            <select 
                                name="country"
                                class="form-control" 
                                v-model="userDetail.country" 
                                @change="validateField('country')"
                                :class="{ 'has-error': formErrors.country }"
                                required
                            >
                                <option value="" disabled>Select a country</option>
                                <option v-for="(name, code) in countries" :key="code" :value="code">{{ name }}</option>
                            </select>
                            <span v-if="formErrors.country" class="form-error">{{ formErrors.country }}</span>
                        </div>
                    </div>
                </div>
                <div class="form-actions">
                    <router-link to="/" class="btn btn-secondary">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 2L2 10L10 18M2 10H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Back
                    </router-link>
                    <button 
                        type="button" 
                        class="update-info-btn" 
                        @click="updatePersonalInfo()"
                        :disabled="updatingInfo || !hasChanges"
                        :class="{ 'btn-loading': updatingInfo, 'btn-success': infoSaved }"
                    >
                        <span v-if="updatingInfo" class="btn-content">
                            <span class="spinner"></span>
                            <span>Saving...</span>
                        </span>
                        <span v-else-if="infoSaved" class="btn-content">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 10L9 12L13 8M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>Saved!</span>
                        </span>
                        <span v-else class="btn-content">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 3L15 7L5 17H1V13L11 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M9 5L13 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>Update Information</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { COUNTRIES, getProfileData, updateProfile } from '../../services/api';

export default {
    name: 'ProfileComponent',
    data() {
        return {
            user: null,
            countries: COUNTRIES,
            userDetail: {},
            originalUserDetail: {},
            updatingInfo: false,
            infoSaved: false,
            formErrors: {}
        };
    },

    computed: {
        hasChanges() {
            return JSON.stringify(this.userDetail) !== JSON.stringify(this.originalUserDetail);
        }
    },

    methods: {
        validateField(field) {
            delete this.formErrors[field];
            
            if (field === 'email') {
                if (!this.userDetail.email || this.userDetail.email.trim() === '') {
                    this.formErrors.email = 'Email is required';
                } else {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(this.userDetail.email.trim())) {
                        this.formErrors.email = 'Please enter a valid email address';
                    }
                }
            }
            
            if (field === 'phone') {
                if (!this.userDetail.phone || this.userDetail.phone.trim() === '') {
                    this.formErrors.phone = 'Phone number is required';
                } else {
                    const phoneDigits = this.userDetail.phone.replace(/\D/g, '');
                    if (phoneDigits.length < 10) {
                        this.formErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
                    }
                }
            }
            
            if (field === 'name') {
                if (!this.userDetail.name || this.userDetail.name.trim() === '') {
                    this.formErrors.name = 'Name is required';
                } else if (this.userDetail.name.trim().length < 2) {
                    this.formErrors.name = 'Name must be at least 2 characters';
                }
            }
            
            if (field === 'address') {
                if (!this.userDetail.address || this.userDetail.address.trim() === '') {
                    this.formErrors.address = 'Address is required';
                } else if (this.userDetail.address.trim().length < 5) {
                    this.formErrors.address = 'Please enter a complete address';
                }
            }
            
            if (field === 'postal_code') {
                if (!this.userDetail.postal_code || this.userDetail.postal_code.trim() === '') {
                    this.formErrors.postal_code = 'Postal code is required';
                } else if (this.userDetail.postal_code.trim().length < 4) {
                    this.formErrors.postal_code = 'Please enter a valid postal code';
                }
            }
            
            if (field === 'country') {
                if (!this.userDetail.country || this.userDetail.country.trim() === '') {
                    this.formErrors.country = 'Please select a country';
                }
            }
        },
        
        async fetchProfile() {
            try {
                this.user = JSON.parse(localStorage.getItem('user'));

                if (!this.user) {
                    alert('You need to log in first!');
                    this.$router.push('/login');
                    return;
                }

                const response = await getProfileData();

                if (response.success && response.data) {
                    let countryCode = response.data.country || '';
                    
                    // Normalize and validate country code
                    if (countryCode) {
                        countryCode = String(countryCode).trim();
                        if (!this.countries[countryCode]) {
                            const upperCode = countryCode.toUpperCase();
                            const matchingKey = Object.keys(this.countries).find(code => 
                                code.toUpperCase() === upperCode
                            );
                            if (matchingKey) {
                                countryCode = matchingKey;
                            } else {
                                const countryName = countryCode;
                                const matchingCode = Object.keys(this.countries).find(code => 
                                    this.countries[code].toLowerCase() === countryName.toLowerCase()
                                );
                                countryCode = matchingCode || '';
                            }
                        }
                    } else {
                        countryCode = '';
                    }
                    
                    this.userDetail = {
                        user_id: response.data.id || this.user.id,
                        name: response.data.name || '',
                        email: response.data.email || '',
                        phone: response.data.phone || '',
                        address: response.data.address || '',
                        postal_code: response.data.postal_code || '',
                        country: countryCode,
                    };
                    
                    this.originalUserDetail = { ...this.userDetail };
                    
                    this.$nextTick(() => {
                        const countrySelect = document.querySelector('select[name="country"]');
                        if (countrySelect && countryCode) {
                            countrySelect.value = countryCode;
                        }
                    });
                } else {
                    // Fallback to user data from localStorage
                    this.userDetail = {
                        user_id: this.user.id,
                        name: this.user.name || '',
                        email: this.user.email || '',
                        phone: '',
                        address: '',
                        postal_code: '',
                        country: '',
                    };
                    this.originalUserDetail = { ...this.userDetail };
                }
            } catch (error) {
                console.error('Fetch profile error:', error);
                // Fallback to user data from localStorage
                if (this.user) {
                    this.userDetail = {
                        user_id: this.user.id,
                        name: this.user.name || '',
                        email: this.user.email || '',
                        phone: '',
                        address: '',
                        postal_code: '',
                        country: '',
                    };
                    this.originalUserDetail = { ...this.userDetail };
                }
                alert(error.response?.data?.error || 'Something went wrong while loading your profile');
            }
        },

        updatePersonalInfo() {
            // Validate all fields
            Object.keys(this.userDetail).forEach(key => {
                if (key !== 'user_id') {
                    this.validateField(key);
                }
            });

            if (Object.keys(this.formErrors).length > 0) {
                return;
            }

            this.updatingInfo = true;
            this.infoSaved = false;

            const personal = {
                ...this.userDetail
            }

            updateProfile(personal)
                .then((response) => {
                    if (response.success) {
                        this.originalUserDetail = { ...this.userDetail };
                        this.infoSaved = true;
                        
                        // Update localStorage user data
                        if (this.user) {
                            this.user.name = this.userDetail.name;
                            localStorage.setItem('user', JSON.stringify(this.user));
                            window.dispatchEvent(new Event('storage'));
                        }
                        
                        setTimeout(() => {
                            this.infoSaved = false;
                        }, 3000);
                    } else {
                        alert(response.error || 'Failed to update profile');
                    }
                })
                .catch((error) => {
                    alert(error.response?.data?.message || error.response?.data?.error || 'Something went wrong');
                })
                .finally(() => {
                    this.updatingInfo = false;
                });
        }
    },

    async mounted() {
        await this.fetchProfile();
    }
};
</script>

<style scoped>
.profile-container {
    width: 100%;
    max-width: 900px;
    margin: 2rem auto 2rem;
    padding: 2rem;
    background: var(--bg-primary);
    box-shadow: var(--shadow-xl);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.profile-header {
    margin-bottom: 2rem;
    text-align: center;
}

.profile-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.profile-subtitle {
    font-size: 1rem;
    color: var(--text-secondary);
}

.section-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    padding: 1.5rem;
    transition: all 0.3s ease;
    animation: slideInUp 0.5s ease;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.section-card:hover {
    box-shadow: var(--shadow-md);
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--border-color);
}

.section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.section-title svg {
    color: var(--primary-color);
}

.save-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--success-color);
    animation: fadeIn 0.3s ease;
}

.save-indicator.saved {
    color: var(--success-color);
}

.personal-info {
    margin-top: 1.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    display: block;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-control {
    width: 100%;
    height: 50px;
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

.form-control:disabled {
    background-color: var(--bg-tertiary);
    cursor: not-allowed;
    opacity: 0.7;
}

.form-control.has-error {
    border-color: var(--danger-color);
}

.form-control.has-error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-control::placeholder {
    color: var(--text-tertiary);
}

.form-hint {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-tertiary);
    font-style: italic;
}

.form-error {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--danger-color);
    font-weight: 500;
    animation: fadeIn 0.3s ease;
}

.form-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.75rem;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    box-shadow: var(--shadow-md);
}

.btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 2px solid var(--border-color);
}

.btn-secondary:hover {
    background: var(--bg-tertiary);
}

.update-info-btn {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    padding: 0.875rem 1.75rem;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-md);
    position: relative;
    overflow: hidden;
}

.update-info-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.update-info-btn:active::before {
    width: 400px;
    height: 400px;
}

.update-info-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--primary-dark), #4338ca);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.update-info-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.update-info-btn.btn-loading {
    cursor: wait;
}

.update-info-btn.btn-success {
    background: linear-gradient(135deg, var(--success-color), #16a34a);
    animation: successPulse 0.5s ease;
}

@keyframes successPulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

.btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
    z-index: 1;
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
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 768px) {
    .profile-container {
        margin: 5rem auto 2rem;
        padding: 1.5rem;
    }

    .profile-title {
        font-size: 2rem;
    }

    .section-title {
        font-size: 1.25rem;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>

