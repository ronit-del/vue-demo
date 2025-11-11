<template>
    <div class="checkout-container">
        <div class="checkout-header">
            <h1 class="checkout-title">Checkout</h1>
        </div>

        <!-- Empty Cart Message -->
        <div v-if="cart.length === 0" class="empty-cart">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 30H90L86 50H34L30 30ZM30 30L25 15M40 60H50M70 60H80" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="45" cy="90" r="7" stroke="currentColor" stroke-width="3"/>
                <circle cx="75" cy="90" r="7" stroke="currentColor" stroke-width="3"/>
            </svg>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <router-link to="/" class="btn btn-primary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2L2 10L10 18M2 10H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Continue Shopping
            </router-link>
        </div>

        <div v-if="cart.length > 0" class="checkout-content">
            <div class="row">
                <!-- Left Column: Personal Information and Payment -->
                <div class="col-left">
                    <!-- Personal Information Section -->
                    <div class="section-card">
                        <div class="section-header">
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
                        </div>
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
                                    />
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

                    <!-- Stripe Payment Form Section -->
                    <div class="section-card payment-card">
                        <div class="section-header">
                            <h4 class="section-title">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 10H21M3 10L3 18C3 18.5523 3.44772 19 4 19H20C20.5523 19 21 18.5523 21 18V10M3 10L3 6C3 5.44772 3.44772 5 4 5H20C20.5523 5 21 5.44772 21 6V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M7 15H9M13 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Payment Information
                            </h4>
                        </div>
                        <div class="payment-summary">
                            <div class="summary-card">
                                <div class="summary-item">
                                    <span class="summary-label">Subtotal</span>
                                    <span class="summary-amount">${{ subtotal.toFixed(2) }}</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Tax (10%)</span>
                                    <span class="summary-amount">${{ tax.toFixed(2) }}</span>
                                </div>
                                <div class="summary-divider"></div>
                                <div class="summary-item summary-total-row">
                                    <span class="summary-label">Total Amount</span>
                                    <span class="summary-amount total-amount">${{ totalPrice }}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Payment Method Selection -->
                        <div class="payment-method-selection">
                            <label class="form-label">Select Payment Method</label>
                            <div class="payment-methods">
                                <label 
                                    class="payment-method-option"
                                    :class="{ 'active': selectedPaymentMethod === 'cod' }"
                                >
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="cod" 
                                        v-model="selectedPaymentMethod"
                                        @change="onPaymentMethodChange"
                                    />
                                    <div class="payment-method-content">
                                        <div class="payment-method-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 12H21M3 12L3 18C3 18.5523 3.44772 19 4 19H20C20.5523 19 21 18.5523 21 18V12M3 12L3 6C3 5.44772 3.44772 5 4 5H20C20.5523 5 21 5.44772 21 6V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                <path d="M7 15H9M15 15H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </div>
                                        <div class="payment-method-info">
                                            <span class="payment-method-name">Cash on Delivery</span>
                                            <span class="payment-method-description">Pay when you receive</span>
                                        </div>
                                    </div>
                                </label>
                                
                                <label 
                                    class="payment-method-option"
                                    :class="{ 'active': selectedPaymentMethod === 'stripe' }"
                                >
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="stripe" 
                                        v-model="selectedPaymentMethod"
                                        @change="onPaymentMethodChange"
                                    />
                                    <div class="payment-method-content">
                                        <div class="payment-method-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 10H21M3 10L3 18C3 18.5523 3.44772 19 4 19H20C20.5523 19 21 18.5523 21 18V10M3 10L3 6C3 5.44772 3.44772 5 4 5H20C20.5523 5 21 5.44772 21 6V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                <path d="M7 15H9M13 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </div>
                                        <div class="payment-method-info">
                                            <span class="payment-method-name">Credit/Debit Card</span>
                                            <span class="payment-method-description">Secure payment via Stripe</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <form @submit.prevent="handleSubmit" class="payment-form">
                            <!-- Stripe Card Details - Only show when Stripe is selected -->
                            <div v-if="selectedPaymentMethod === 'stripe'" class="form-group" :key="'stripe-form-' + selectedPaymentMethod">
                                <label for="card-element" class="form-label">Card Details</label>
                                <div v-if="!stripe" class="card-element-wrapper card-loading">
                                    <span class="spinner"></span>
                                    <span>Loading payment system...</span>
                                </div>
                                <div v-else-if="stripe && elements" ref="cardElementRef" :key="'card-element-' + selectedPaymentMethod" id="card-element" class="card-element-wrapper">
                                    <!-- Stripe Elements will mount here -->
                                </div>
                                <div v-else class="card-element-wrapper card-loading">
                                    <span class="spinner"></span>
                                    <span>Initializing payment system...</span>
                                </div>
                                <div class="card-hint">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M8 6V8M8 10H8.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>Secure payment powered by Stripe</span>
                                </div>
                            </div>
                            
                            <!-- COD Information -->
                            <div v-if="selectedPaymentMethod === 'cod'" class="cod-info">
                                <div class="cod-message">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <div>
                                        <p><strong>Cash on Delivery</strong></p>
                                        <p>You will pay the total amount of <strong>${{ totalPrice }}</strong> when you receive your order.</p>
                                        <p class="cod-note">Please have the exact amount ready for faster delivery.</p>
                                    </div>
                                </div>
                            </div>

                            <transition name="fade">
                                <div v-if="errorMessage" role="alert" class="error-message">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M10 6V10M10 14H10.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>{{ errorMessage }}</span>
                                </div>
                            </transition>

                            <button 
                                type="submit" 
                                :disabled="getSubmitButtonDisabled()" 
                                class="pay-button"
                                :class="{ 'btn-loading': loading || processingPayment, 'btn-success': paymentSuccess }"
                            >
                                <span v-if="loading || processingPayment" class="btn-content">
                                    <span class="spinner"></span>
                                    <span>{{ selectedPaymentMethod === 'cod' ? 'Placing Order...' : 'Processing Payment...' }}</span>
                                </span>
                                <span v-else-if="paymentSuccess" class="btn-content">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 10L9 12L13 8M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>{{ selectedPaymentMethod === 'cod' ? 'Order Placed!' : 'Payment Successful!' }}</span>
                                </span>
                                <span v-else class="btn-content">
                                    <svg v-if="selectedPaymentMethod === 'cod'" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 12H17M3 12L3 18C3 18.5523 3.44772 19 4 19H16C16.5523 19 17 18.5523 17 18V12M3 12L3 2C3 1.44772 3.44772 1 4 1H16C16.5523 1 17 1.44772 17 2V12M7 15H9M13 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 10H21M3 10L3 18C3 18.5523 3.44772 19 4 19H20C20.5523 19 21 18.5523 21 18V10M3 10L3 6C3 5.44772 3.44772 5 4 5H20C20.5523 5 21 5.44772 21 6V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>{{ selectedPaymentMethod === 'cod' ? 'Place Order' : `Pay $${totalPrice}` }}</span>
                                </span>
                            </button>
                            <div v-if="selectedPaymentMethod === 'stripe'" class="payment-security">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 2L4 4V7C4 10.3137 6.68629 13 10 13C11.6569 13 13.1569 12.3431 14.2426 11.2426M8 2L12 4V7C12 7.54076 11.9193 8.06255 11.7692 8.55493M8 2V5M10 13C10.3137 13 10.6186 12.9716 10.9121 12.9186" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M2 2L14 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>Your payment information is secure and encrypted</span>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Right Column: Order Details (Cart) -->
                <div class="col-right">
                    <div class="section-card">
                        <div class="section-header">
                            <h4 class="section-title">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 3H21L20 11H4L3 3ZM3 3L2 1M5 15H7M17 15H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M9 19C9.55228 19 10 18.5523 10 18C10 17.4477 9.55228 17 9 17C8.44772 17 8 17.4477 8 18C8 18.5523 8.44772 19 9 19Z" stroke="currentColor" stroke-width="2"/>
                                    <path d="M15 19C15.5523 19 16 18.5523 16 18C16 17.4477 15.5523 17 15 17C14.4477 17 14 17.4477 14 18C14 18.5523 14.4477 19 15 19Z" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                Order Details
                            </h4>
                            <span class="item-count">{{ cart.length }} {{ cart.length === 1 ? 'item' : 'items' }}</span>
                        </div>
                        <div class="cart-items">
                            <transition-group name="cart-item" tag="div">
                                <div 
                                    class="cart-item" 
                                    v-for="(item, index) in cart" 
                                    :key="item.id || index"
                                    :style="{ animationDelay: `${index * 0.1}s` }"
                                >
                                    <div class="cart-item-image-wrapper">
                                        <img :src="item.image" alt="Product Image" class="cart-item-image" />
                                        <div class="item-badge" v-if="item.quantity > 1">{{ item.quantity }}</div>
                                    </div>
                                    <div class="cart-item-details">
                                        <h3 class="cart-item-name">{{ item.name }}</h3>
                                        <div class="cart-item-pricing">
                                            <span class="unit-price">${{ item.price }} each</span>
                                            <span class="cart-item-total">${{ (item.price * item.quantity)?.toFixed(2) }}</span>
                                        </div>

                                        <div class="quantity-selector">
                                            <button 
                                                @click="decreaseQuantity(item)" 
                                                :disabled="item.quantity <= 1 || updatingItems[item.product_id]"
                                                class="quantity-btn qty-decrease"
                                                :class="{ 'btn-disabled': item.quantity <= 1 }"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                            </button>
                                            <div class="quantity-display">
                                                <span class="quantity-value" :key="item.quantity">{{ item.quantity }}</span>
                                            </div>
                                            <button 
                                                @click="increaseQuantity(item)" 
                                                :disabled="item.quantity >= 10 || updatingItems[item.product_id]"
                                                class="quantity-btn qty-increase"
                                                :class="{ 'btn-disabled': item.quantity >= 10 }"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10 5V15M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                            </button>
                                            <button 
                                                class="delete-btn" 
                                                @click="confirmDelete(item)" 
                                                :disabled="deletingItems[item.product_id]"
                                                title="Remove item"
                                            >
                                                <svg v-if="!deletingItems[item.product_id]" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M3 5H15M13 5V14C13 14.5523 12.5523 15 12 15H6C5.44772 15 5 14.5523 5 14V5M13 5V3C13 2.44772 12.5523 2 12 2H6C5.44772 2 5 2.44772 5 3V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M7 8V12M11 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                                <span v-else class="spinner spinner-sm"></span>
                                            </button>
                                        </div>
                                        <div class="item-update-feedback" v-if="updatingItems[item.product_id]">
                                            <span class="feedback-text">Updating...</span>
                                        </div>
                                    </div>
                                </div>
                            </transition-group>
                        </div>
                        <!-- <div class="cart-summary">
                            <div class="summary-row">
                                <span class="summary-label">Subtotal:</span>
                                <span class="summary-value">${{ subtotal.toFixed(2) }}</span>
                            </div>
                            <div class="summary-row">
                                <span class="summary-label">Tax (10%):</span>
                                <span class="summary-value">${{ tax.toFixed(2) }}</span>
                            </div>
                            <div class="summary-row summary-total">
                                <span class="summary-label">Total:</span>
                                <span class="summary-value total-price">${{ totalPrice }}</span>
                            </div>
                        </div> -->
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Delete Confirmation Modal -->
        <transition name="modal">
            <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
                <div class="modal-content" @click.stop>
                    <div class="modal-header">
                        <h3>Remove Item</h3>
                        <button class="modal-close" @click="closeDeleteModal">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to remove <strong>{{ itemToDelete?.name }}</strong> from your cart?</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
                        <button class="btn btn-danger" @click="confirmDeleteAction">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 5H17M13 5V14C13 14.5523 12.5523 15 12 15H8C7.44772 15 7 14.5523 7 14V5M9 8V12M11 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import { COUNTRIES, createStripe, deleteOrderRecord, getOrderData, updateOrderRecord, updateProfile } from '../../services/api';
// import productData from '../../constant.json';
import { loadStripe } from '@stripe/stripe-js';

export default {
    name: 'CheckoutComponent',
    data() {
        return {
            cart: [],
            user: '',
            countries: COUNTRIES,
            userDetail: {},
            originalUserDetail: {},
            stripe: null,
            elements: null,
            cardElement: null,
            isComponentMounted: false,
            isMountingCard: false,
            clientSecret: '',
            showStripeForm: false,
            errorMessage: '',
            isValidForm: false,
            loading: false,
            processingPayment: false,
            paymentSuccess: false,
            updatingInfo: false,
            infoSaved: false,
            updatingItems: {},
            deletingItems: {},
            showDeleteModal: false,
            itemToDelete: null,
            formErrors: {},
            selectedPaymentMethod: 'cod' // Default to COD
        };
    },

    computed: {
        subtotal() {
            return this.cart.reduce((total, item) => total + item.price * item.quantity, 0);
        },
        tax() {
            return this.subtotal * 0.1;
        },
        totalPrice() {
            return (this.subtotal + this.tax).toFixed(2);
        },
        hasChanges() {
            return JSON.stringify(this.userDetail) !== JSON.stringify(this.originalUserDetail);
        }
    },

    watch: {
        // Watch for when payment method changes to stripe - mount card element when stripe is selected
        selectedPaymentMethod: {
            handler(newVal) {
                if (newVal === 'stripe' && this.stripe && this.elements && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                    // Wait for Vue to render the card element div with multiple nextTick and delay
                    this.$nextTick(() => {
                        this.$nextTick(() => {
                            // Use requestAnimationFrame to ensure DOM is painted
                            requestAnimationFrame(() => {
                                // Add a delay to ensure DOM is fully ready and element is rendered
                                setTimeout(() => {
                                    if (this.$el && this.stripe && this.elements && !this.cardElement && !this.isMountingCard && this.isComponentMounted && this.selectedPaymentMethod === 'stripe') {
                                        // Verify the ref exists and is in the DOM before mounting
                                        const ref = this.$refs.cardElementRef;
                                        if (ref && ref.parentNode && ref.isConnected) {
                                            console.log('Mounting Stripe card element from watcher');
                                            this.mountCardElement();
                                        } else {
                                            // Retry after a short delay if ref not ready
                                            setTimeout(() => {
                                                const retryRef = this.$refs.cardElementRef;
                                                if (this.$el && this.stripe && this.elements && !this.cardElement && !this.isMountingCard && this.isComponentMounted && this.selectedPaymentMethod === 'stripe' && retryRef && retryRef.parentNode && retryRef.isConnected) {
                                                    console.log('Mounting Stripe card element from watcher (retry)');
                                                    this.mountCardElement();
                                                }
                                            }, 300);
                                        }
                                    }
                                }, 300);
                            });
                        });
                    });
                } else if (newVal !== 'stripe' && this.cardElement) {
                    // Unmount card element when switching away from stripe
                    try {
                        if (this.cardElement && typeof this.cardElement.unmount === 'function') {
                            this.cardElement.unmount();
                        }
                    } catch (error) {
                        // Ignore unmount errors
                    }
                    this.cardElement = null;
                }
            },
            immediate: false
        },
        // Watch for when stripe and elements are ready to mount card element
        elements: {
            handler(newVal) {
                if (newVal && this.stripe && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                    // Wait for Vue to render the card element div with multiple nextTick and delay
                    this.$nextTick(() => {
                        this.$nextTick(() => {
                            // Use requestAnimationFrame to ensure DOM is painted
                            requestAnimationFrame(() => {
                                // Add a delay to ensure DOM is fully ready and element is rendered
                                setTimeout(() => {
                                    if (this.$el && this.stripe && this.elements && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                                        // Verify the ref exists and is in the DOM before mounting
                                        const ref = this.$refs.cardElementRef;
                                        if (ref && ref.parentNode && ref.isConnected) {
                                            this.mountCardElement();
                                        } else {
                                            // Retry after a short delay if ref not ready
                                            setTimeout(() => {
                                                const retryRef = this.$refs.cardElementRef;
                                                if (this.$el && this.stripe && this.elements && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted && retryRef && retryRef.parentNode && retryRef.isConnected) {
                                                    this.mountCardElement();
                                                }
                                            }, 200);
                                        }
                                    }
                                }, 200);
                            });
                        });
                    });
                }
            },
            immediate: false
        },
        stripe: {
            handler(newVal) {
                if (newVal && this.elements && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                    // Wait for Vue to render the card element div with multiple nextTick and delay
                    this.$nextTick(() => {
                        this.$nextTick(() => {
                            // Use requestAnimationFrame to ensure DOM is painted
                            requestAnimationFrame(() => {
                                // Add a delay to ensure DOM is fully ready and element is rendered
                                setTimeout(() => {
                                    if (this.$el && this.stripe && this.elements && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                                        // Verify the ref exists and is in the DOM before mounting
                                        const ref = this.$refs.cardElementRef;
                                        if (ref && ref.parentNode && ref.isConnected) {
                                            this.mountCardElement();
                                        } else {
                                            // Retry after a short delay if ref not ready
                                            setTimeout(() => {
                                                const retryRef = this.$refs.cardElementRef;
                                                if (this.$el && this.stripe && this.elements && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted && retryRef && retryRef.parentNode && retryRef.isConnected) {
                                                    this.mountCardElement();
                                                }
                                            }, 200);
                                        }
                                    }
                                }, 200);
                            });
                        });
                    });
                }
            },
            immediate: false
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
        
        async fetchCart() {
            try {
                this.user = JSON.parse(localStorage.getItem('user'));

                if (!this.user) {
                    alert('You need to log in first!');
                    this.$router.push('/login');
                    return;
                }

                if (this.user && this.user.id) {
                    const response = await getOrderData({ user_id: this.user.id });

                    if (response.success && response.data && response.data.length > 0) {
                        // Set user details from first order item
                        let countryCode = response.data[0].country || '';
                        
                        // Normalize and validate country code
                        if (countryCode) {
                            countryCode = String(countryCode).trim();
                            // Try exact match first
                            if (!this.countries[countryCode]) {
                                // Try case-insensitive match
                                const upperCode = countryCode.toUpperCase();
                                const matchingKey = Object.keys(this.countries).find(code => 
                                    code.toUpperCase() === upperCode
                                );
                                if (matchingKey) {
                                    countryCode = matchingKey;
                                } else {
                                    // If still no match, try to find by name (reverse lookup)
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
                            user_id: response.data[0].user_id,
                            name: response.data[0].full_name || '',
                            email: response.data[0].email || '',
                            phone: response.data[0].phone || '',
                            address: response.data[0].address || '',
                            postal_code: response.data[0].postal_code || '',
                            country: countryCode,
                        };

                        // Store original for comparison
                        this.originalUserDetail = { ...this.userDetail };
                        
                        // Force Vue to update the select element
                        this.$nextTick(() => {
                            // Ensure the country select is properly bound
                            const countrySelect = document.querySelector('select[name="country"]');
                            if (countrySelect && countryCode) {
                                countrySelect.value = countryCode;
                            }
                        });

                        // Map order items to cart items with product details
                        this.cart = response.data/* .map(orderItem => {
                            
                            let product = productData.find(p => p.id === orderItem.product_id);
                            console.log('orderItem', orderItem);

                            return {
                                ...orderItem,
                                name: product?.name || 'Unknown Product',
                                price: parseFloat(product?.price || orderItem.price || 0),
                                image: product?.image ? require(`@/assets/${product.image}`) : require('@/assets/product-category/electronics/electronics-1.jpg'),
                            };
                        }) */;
                    } else {
                        // No orders found
                        this.cart = [];
                        // Try to get user details from profile if available
                        if (this.user.email) {
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
                    }
                }
            } catch (error) {
                console.error('Fetch cart error:', error);
                this.cart = [];
                alert(error.response?.data?.error || 'Something went wrong while loading your cart');
            }
        },

        increaseQuantity(item) {
            console.log('item', item);
            if (Object.keys(this.user).length === 0) {
                alert("Please Login first");
                return;
            }

            if (item.quantity >= 10) {
                item.quantity = 10;
                return;
            }

            this.updatingItems[item.product_id] = true;
            const oldQuantity = item.quantity;
            item.quantity++;

            const productData = {
                user_id: item.user_id,
                product_id: item.product_id,
                quantity: item.quantity,
                total_amount: item.price * item.quantity
            }
            console.log('productData', productData);
            
            updateOrderRecord(productData)
                .then((response) => {
                    if (response.success) {
                        // Success feedback via animation
                    } else {
                        item.quantity = oldQuantity;
                        alert(response.error);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    item.quantity = oldQuantity;
                    alert(error.response?.data?.error || 'Something went wrong');
                })
                .finally(() => {
                    this.updatingItems[item.product_id] = false;
                });
        },

        decreaseQuantity(item) {
            if (Object.keys(this.user).length === 0) {
                alert("Please Login first");
                return;
            }

            if (item.quantity <= 1) {
                return;
            }

            this.updatingItems[item.product_id] = true;
            const oldQuantity = item.quantity;
            item.quantity--;

            const productData = {
                user_id: item.user_id,
                product_id: item.product_id,
                quantity: item.quantity,
                total_amount: item.price * item.quantity
            }

            updateOrderRecord(productData)
                .then((response) => {
                    if (response.success) {
                        // Success feedback via animation
                    } else {
                        item.quantity = oldQuantity;
                        alert(response.error);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    item.quantity = oldQuantity;
                    alert(error.response?.data?.error || 'Something went wrong');
                })
                .finally(() => {
                    this.updatingItems[item.product_id] = false;
                });
        },

        confirmDelete(item) {
            this.itemToDelete = item;
            this.showDeleteModal = true;
        },

        closeDeleteModal() {
            this.showDeleteModal = false;
            this.itemToDelete = null;
        },

        confirmDeleteAction() {
            if (!this.itemToDelete) return;

            const item = this.itemToDelete;
            this.deletingItems[item.product_id] = true;

            const productData = {
                user_id: item.user_id,
                product_id: item.product_id
            }

            deleteOrderRecord(productData)
                .then((response) => {
                    if (response.success) {
                        this.closeDeleteModal();
                        this.fetchCart();
                    } else {
                        alert(response.error);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    alert(error.response?.data?.error || 'Something went wrong');
                })
                .finally(() => {
                    this.deletingItems[item.product_id] = false;
                });
        },

        updatePersonalInfo() {
            // Validate all fields
            Object.keys(this.userDetail).forEach(key => {
                this.validateField(key);
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
                        setTimeout(() => {
                            this.infoSaved = false;
                        }, 3000);
                    } else {
                        alert(response.error);
                    }
                })
                .catch((error) => {
                    alert(error.response?.data?.message || 'Something went wrong');
                })
                .finally(() => {
                    this.updatingInfo = false;
                });
        },

        onPaymentMethodChange() {
            // Reset payment states when changing payment method
            this.errorMessage = '';
            this.paymentSuccess = false;
            this.loading = false;
            this.processingPayment = false;
            
            // Mount Stripe card element when Stripe is selected
            if (this.selectedPaymentMethod === 'stripe' && this.stripe && this.elements && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                // Wait for Vue to render the card element div
                this.$nextTick(() => {
                    this.$nextTick(() => {
                        requestAnimationFrame(() => {
                            setTimeout(() => {
                                if (this.$el && this.stripe && this.elements && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                                    const ref = this.$refs.cardElementRef;
                                    if (ref && ref.parentNode && ref.isConnected) {
                                        this.mountCardElement();
                                    } else {
                                        // Retry after a delay if ref not ready
                                        setTimeout(() => {
                                            const retryRef = this.$refs.cardElementRef;
                                            if (this.$el && this.stripe && this.elements && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted && retryRef && retryRef.parentNode && retryRef.isConnected) {
                                                this.mountCardElement();
                                            }
                                        }, 300);
                                    }
                                }
                            }, 300);
                        });
                    });
                });
            }
        },
        
        getSubmitButtonDisabled() {
            // Validate personal information
            if (Object.keys(this.formErrors).length > 0) {
                return true;
            }
            
            // Validate cart
            if (!this.cart || this.cart.length === 0) {
                return true;
            }
            
            // Validate payment method specific requirements
            if (this.selectedPaymentMethod === 'stripe') {
                return this.loading || !this.isValidForm || this.processingPayment || !this.cardElement;
            }
            
            // For COD, only check loading states
            return this.loading || this.processingPayment;
        },
        
        async handleSubmit() {
            this.processingPayment = true;
            this.loading = true;
            this.errorMessage = '';
            this.paymentSuccess = false;

            // Validate personal information first
            Object.keys(this.userDetail).forEach(key => {
                this.validateField(key);
            });

            if (Object.keys(this.formErrors).length > 0) {
                this.errorMessage = 'Please fill in all required fields correctly';
                this.loading = false;
                this.processingPayment = false;
                return;
            }

            // Validate cart
            if (!this.cart || this.cart.length === 0) {
                this.errorMessage = 'Your cart is empty';
                this.loading = false;
                this.processingPayment = false;
                return;
            }

            // Handle different payment methods
            if (this.selectedPaymentMethod === 'cod') {
                await this.handleCOD();
                return;
            } else if (this.selectedPaymentMethod === 'stripe') {
                await this.handleStripePayment();
                return;
            }
        },
        
        async handleCOD() {
            try {
                // Create order with COD payment method
                // Update order status to 'Ordered' with COD payment method
                // For COD, we don't need payment processing, just update order status
                console.log('this.cart', this.cart);
                
                const response = await createStripe({ 
                    cart: this.cart.map(item => ({
                        id: item.id,
                        product_id: item.product_id,
                        price: item.price,
                        quantity: item.quantity
                    })), 
                    orderId: this.cart[0].order_id,
                    userDetail: {
                        ...this.userDetail,
                        user_id: this.user.id
                    },
                    payment_method: 'cod'
                });

                if (response && (response.success || response.status)) {
                    this.paymentSuccess = true;
                    setTimeout(() => {
                        this.$router.push('/order-success');
                        this.cart = [];
                    }, 1500);
                } else {
                    this.errorMessage = response.error || 'Failed to place order. Please try again.';
                    this.loading = false;
                    this.processingPayment = false;
                }
            } catch (error) {
                console.error('COD Order Error:', error);
                this.errorMessage = error.response?.data?.error || error.message || 'There was an error placing your order. Please try again.';
                this.loading = false;
                this.processingPayment = false;
            }
        },
        
        async handleStripePayment() {
            // Validate Stripe card element
            if (!this.cardElement || !this.isValidForm) {
                this.errorMessage = 'Please enter valid card details';
                this.loading = false;
                this.processingPayment = false;
                return;
            }

            try {
                // Get Stripe payment method
                const { error, paymentMethod } = await this.stripe.createPaymentMethod({
                    type: 'card',
                    card: this.cardElement,
                    billing_details: {
                        name: this.userDetail.name,
                        email: this.userDetail.email,
                        phone: this.userDetail.phone,
                        address: {
                            line1: this.userDetail.address,
                            postal_code: this.userDetail.postal_code,
                            country: this.userDetail.country,
                        },
                    },
                });

                if (error) {
                    this.errorMessage = error.message;
                    this.loading = false;
                    this.processingPayment = false;
                    return;
                }

                console.log('this.cart', this.cart);

                // Call backend API to create a Stripe session
                const response = await createStripe({ 
                    orderNumber: this.cart[0].order_number,
                    cart: this.cart.map(item => ({
                        id: item.id,
                        product_id: item.product_id,
                        price: item.price,
                        quantity: item.quantity
                    })), 
                    userDetail: {
                        ...this.userDetail,
                        user_id: this.user.id
                    } 
                });

                if (!response || !response.clientSecret) {
                    this.errorMessage = 'Failed to initialize payment. Please try again.';
                    this.loading = false;
                    this.processingPayment = false;
                    return;
                }

                const clientSecret = response.clientSecret;

                // Confirm the payment with Stripe
                const { error: stripeError, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
                    payment_method: paymentMethod.id,
                });

                if (stripeError) {
                    this.errorMessage = stripeError.message;
                    this.loading = false;
                    this.processingPayment = false;
                    return;
                }

                // Check payment status
                if (paymentIntent && paymentIntent.status === 'succeeded') {
                    // Success!
                    this.paymentSuccess = true;
                    setTimeout(() => {
                        this.$router.push('/order-success');
                        this.cart = [];
                    }, 1500);
                } else {
                    this.errorMessage = 'Payment was not completed. Please try again.';
                    this.loading = false;
                    this.processingPayment = false;
                }
            } catch (error) {
                console.error('Payment Error:', error);
                this.errorMessage = error.response?.data?.error || error.message || 'There was an error processing your payment. Please try again.';
                this.loading = false;
                this.processingPayment = false;
            }
        },

        // Validate form (e.g., is the card element filled correctly?)
        validateForm() {
            if (this.elements && this.cardElement) {
                this.isValidForm = true;
            } else {
                this.isValidForm = false;
            }
        },

        mountCardElement(retryCount = 0) {
            // Safety check: don't mount if component is being destroyed or stripe is not selected
            if (!this.$el || !this.elements || !this.stripe || !this.isComponentMounted || this.selectedPaymentMethod !== 'stripe') {
                return;
            }

            // Prevent multiple simultaneous mount attempts
            if (this.isMountingCard) {
                console.warn('Card element mount already in progress, skipping...');
                return;
            }

            // Check if card element already exists
            if (this.cardElement) {
                console.warn('Card element already exists, skipping mount...');
                return;
            }

            // Maximum retry attempts
            const MAX_RETRIES = 10;
            
            // Use Vue ref instead of getElementById for safer DOM access
            const cardElement = this.$refs.cardElementRef;
            
            // Verify element exists and is valid before proceeding
            if (!cardElement) {
                console.warn('Card element ref not found, retrying...');
                if (retryCount < MAX_RETRIES && this.selectedPaymentMethod === 'stripe') {
                    const delay = Math.min(100 * (retryCount + 1), 500);
                    setTimeout(() => {
                        if (this.$el && this.elements && this.stripe && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                            this.mountCardElement(retryCount + 1);
                        }
                    }, delay);
                }
                return;
            }
            
            // Verify element is actually connected to the document
            if (!cardElement.parentNode || !cardElement.isConnected || !this.$el.contains(cardElement)) {
                // Retry after a delay if element not found or not in DOM
                if (retryCount < MAX_RETRIES && this.elements && this.$el && this.stripe && this.selectedPaymentMethod === 'stripe') {
                    const delay = Math.min(100 * (retryCount + 1), 500); // Exponential backoff, max 500ms
                    setTimeout(() => {
                        // Check if component is still mounted and stripe is still selected before retrying
                        if (this.$el && this.elements && this.stripe && this.selectedPaymentMethod === 'stripe' && !this.cardElement) {
                            this.mountCardElement(retryCount + 1);
                        }
                    }, delay);
                } else if (retryCount >= MAX_RETRIES) {
                    console.warn('Failed to mount Stripe card element after', MAX_RETRIES, 'attempts');
                }
                return;
            }

            // Create card element if not already created
            if (!this.cardElement && !this.isMountingCard) {
                // Set flag to prevent multiple simultaneous creations
                this.isMountingCard = true;
                
                try {
                    // Triple-check element is still valid and connected before creating
                    if (!cardElement || !cardElement.parentNode || !cardElement.isConnected || !this.$el.contains(cardElement)) {
                        this.isMountingCard = false;
                        if (retryCount < MAX_RETRIES && this.selectedPaymentMethod === 'stripe') {
                            const delay = Math.min(100 * (retryCount + 1), 500);
                            setTimeout(() => {
                                if (this.$el && this.elements && this.stripe && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                                    this.mountCardElement(retryCount + 1);
                                }
                            }, delay);
                        }
                        return;
                    }

                    // Double-check card element doesn't exist before creating
                    if (this.cardElement) {
                        this.isMountingCard = false;
                        return;
                    }

                    // Verify cardElement is still valid and has a parent before creating Stripe element
                    if (!cardElement || !cardElement.parentNode || !cardElement.parentNode.appendChild) {
                        this.isMountingCard = false;
                        console.warn('Card element invalid or parent not ready before creating Stripe element');
                        if (retryCount < MAX_RETRIES && this.isComponentMounted && this.selectedPaymentMethod === 'stripe') {
                            const delay = Math.min(100 * (retryCount + 1), 500);
                            setTimeout(() => {
                                if (this.$el && this.elements && this.stripe && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                                    this.mountCardElement(retryCount + 1);
                                }
                            }, delay);
                        }
                        return;
                    }

                    // Final check before creating card element - ensure element is connected to document
                    if (!cardElement || !cardElement.parentNode || !cardElement.isConnected || !this.$el.contains(cardElement)) {
                        this.isMountingCard = false;
                        if (retryCount < MAX_RETRIES && this.selectedPaymentMethod === 'stripe') {
                            const delay = Math.min(100 * (retryCount + 1), 500);
                            setTimeout(() => {
                                if (this.$el && this.elements && this.stripe && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                                    this.mountCardElement(retryCount + 1);
                                }
                            }, delay);
                        }
                        return;
                    }

                    // Create the Stripe card element
                    const card = this.elements.create('card', {
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    });

                    // Use requestAnimationFrame to ensure DOM is fully ready before mounting
                    requestAnimationFrame(() => {
                        // Double-check element is still valid and connected before mounting
                        if (!cardElement || !cardElement.parentNode || !cardElement.isConnected || !this.$el.contains(cardElement)) {
                            this.isMountingCard = false;
                            console.warn('Card element disconnected before mount');
                            if (retryCount < MAX_RETRIES && this.selectedPaymentMethod === 'stripe') {
                                const delay = Math.min(200 * (retryCount + 1), 1000);
                                setTimeout(() => {
                                    if (this.$el && this.elements && this.stripe && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                                        this.mountCardElement(retryCount + 1);
                                    }
                                }, delay);
                            }
                            return;
                        }

                        // Final validation: ensure cardElement is still a valid DOM node
                        if (!cardElement || typeof cardElement.appendChild !== 'function') {
                            this.isMountingCard = false;
                            console.warn('Card element is not a valid DOM node');
                            return;
                        }

                        // Critical: Ensure the element has a parent node before mounting
                        // This is required for Stripe's insertBefore to work
                        if (!cardElement.parentNode || !cardElement.parentNode.appendChild) {
                            this.isMountingCard = false;
                            console.warn('Card element parent node is not ready');
                            if (retryCount < MAX_RETRIES && this.isComponentMounted && this.selectedPaymentMethod === 'stripe') {
                                const delay = Math.min(200 * (retryCount + 1), 1000);
                                setTimeout(() => {
                                    if (this.$el && this.elements && this.stripe && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                                        this.mountCardElement(retryCount + 1);
                                    }
                                }, delay);
                            }
                            return;
                        }

                        // Ensure container is empty before mounting (critical for Stripe)
                        // This prevents insertBefore errors - Stripe needs a completely empty container
                        while (cardElement.firstChild) {
                            cardElement.removeChild(cardElement.firstChild);
                        }

                        // Verify element is still connected before mounting
                        if (!cardElement.isConnected || !cardElement.parentNode) {
                            this.isMountingCard = false;
                            console.warn('Card element disconnected just before mount');
                            return;
                        }

                        // Mount the card element with error handling
                        try {
                            // Mount the Stripe card element
                            // The container must be empty to avoid insertBefore errors
                            console.log('Attempting to mount Stripe card element to:', cardElement);
                            card.mount(cardElement);
                            console.log('Stripe card element mounted successfully');

                            // Listen to form changes for validation
                            card.on('change', (event) => {
                                // Safety check: ensure component is still mounted
                                if (!this.isComponentMounted || !this.$el || !this.cardElement) return;
                                
                                try {
                                    // Check if event exists and has error property
                                    if (event && typeof event === 'object') {
                                        if (event.error && typeof event.error === 'object') {
                                            this.errorMessage = event.error.message || 'Invalid card details';
                                            this.isValidForm = false;
                                        } else {
                                            this.errorMessage = '';
                                            this.isValidForm = event.complete || false;
                                        }
                                    }
                                } catch (err) {
                                    // Silently handle errors during navigation/unmount
                                    // Only log if component is still mounted
                                    if (this.isComponentMounted && this.$el) {
                                        console.warn('Error handling card change event:', err);
                                    }
                                }
                            });

                            // Store card element reference
                            this.cardElement = card;
                            this.isMountingCard = false;
                        } catch (mountError) {
                            this.isMountingCard = false;
                            console.log('Stripe mount error 1063:', mountError);
                            
                            // Check if error is about duplicate card element
                            if (mountError.message && mountError.message.includes('Can only create one Element of type card')) {
                                console.warn('Card element already exists, attempting to reuse...');
                                // Try to find existing card element
                                this.cardElement = null;
                                this.isMountingCard = false;
                                return;
                            }
                            
                            // If mount fails due to insertBefore (DOM not ready), retry
                            if (mountError.message && (mountError.message.includes('insertBefore') || mountError.message.includes('null'))) {
                                console.warn('Stripe mount failed - DOM element not ready, retrying:', mountError);
                                if (retryCount < MAX_RETRIES && this.isComponentMounted && this.selectedPaymentMethod === 'stripe') {
                                    const delay = Math.min(200 * (retryCount + 1), 1000);
                                    setTimeout(() => {
                                        if (this.$el && this.elements && this.stripe && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                                            this.mountCardElement(retryCount + 1);
                                        }
                                    }, delay);
                                }
                            } else {
                                console.warn('Error mounting Stripe card element:', mountError);
                            }
                            // Clear reference on error
                            this.cardElement = null;
                        }
                    });
                } catch (error) {
                    this.isMountingCard = false;
                    console.log('Stripe mount error: 1094', error);
                    
                    // Check if error is about duplicate card element
                    if (error.message && error.message.includes('Can only create one Element of type card')) {
                        console.warn('Card element already exists, skipping creation...');
                        this.cardElement = null;
                        this.isMountingCard = false;
                        return;
                    }
                    
                    // Handle errors gracefully - might be due to DOM being removed or not ready
                    if (error.message && (error.message.includes('insertBefore') || error.message.includes('null'))) {
                        console.warn('Stripe card element mount failed - DOM may have been removed or not ready:', error);
                        // Retry if component is still mounted and stripe is still selected
                        if (retryCount < MAX_RETRIES && this.isComponentMounted && this.selectedPaymentMethod === 'stripe') {
                            const delay = Math.min(200 * (retryCount + 1), 1000);
                            setTimeout(() => {
                                if (this.$el && this.elements && this.stripe && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                                    this.mountCardElement(retryCount + 1);
                                }
                            }, delay);
                        }
                    } else {
                        console.warn('Error creating Stripe card element:', error);
                    }
                    // Clear reference on error
                    this.cardElement = null;
                    this.isMountingCard = false;
                }
            } else {
                // Card element already exists or mounting in progress
                if (this.cardElement) {
                    console.warn('Card element already exists, skipping mount');
                }
            }
        },
    },

    async mounted() {
        // Set mounted flag
        this.isComponentMounted = true;
        
        await this.fetchCart();
        
        // Safety check: ensure component is still mounted
        if (!this.$el || !this.isComponentMounted) {
            return;
        }

        // Load Stripe.js
        this.stripe = await loadStripe(process.env.VUE_APP_STRIPE_PUBLIC_KEY);

        // Safety check: ensure component is still mounted after async operation
        if (!this.$el) {
            return;
        }

        if (!this.stripe) {
            console.error('Stripe failed to load');
            this.errorMessage = 'Payment system failed to initialize. Please refresh the page.';
            return;
        }

        // Create an Elements instance
        this.elements = this.stripe.elements({
            appearance: {
                theme: 'stripe',
            },
        });

        // The watcher will automatically mount the card element when elements is set and stripe is selected
        // But we also try mounting here after DOM is ready as a fallback (only if stripe is selected)
        if (this.selectedPaymentMethod === 'stripe') {
            this.$nextTick(() => {
                this.$nextTick(() => {
                    // Use requestAnimationFrame to ensure DOM is painted
                    requestAnimationFrame(() => {
                        // Add a delay to ensure DOM is fully ready and element is rendered
                        setTimeout(() => {
                            // Safety check: ensure component is still mounted and ref exists
                            if (this.$el && this.stripe && this.elements && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted) {
                                // Verify the ref exists and is in the DOM before mounting
                                const ref = this.$refs.cardElementRef;
                                if (ref && ref.parentNode && ref.isConnected) {
                                    this.mountCardElement();
                                } else {
                                    // Retry after a short delay if ref not ready
                                    setTimeout(() => {
                                        const retryRef = this.$refs.cardElementRef;
                                        if (this.$el && this.stripe && this.elements && this.selectedPaymentMethod === 'stripe' && !this.cardElement && !this.isMountingCard && this.isComponentMounted && retryRef && retryRef.parentNode && retryRef.isConnected) {
                                            this.mountCardElement();
                                        }
                                    }, 300);
                                }
                            }
                        }, 300);
                    });
                });
            });
        }
    },

    beforeUnmount() {
        // Set flag to prevent event handlers from executing
        this.isComponentMounted = false;
        this.isMountingCard = false;
        
        // Clean up Stripe card element before component is destroyed
        if (this.cardElement) {
            try {
                // Check if element is still mounted using ref before unmounting
                const cardElement = this.$refs.cardElementRef;
                if (cardElement && cardElement.parentNode) {
                    this.cardElement.unmount();
                }
            } catch (error) {
                // Ignore errors if element is already removed
                // Errors during unmount are expected and can be safely ignored
            } finally {
                // Always clear the reference
                this.cardElement = null;
            }
        }
        
        // Clean up Stripe elements instance
        if (this.elements) {
            try {
                // Elements instance doesn't have an explicit cleanup method
                // but clearing the reference helps
                this.elements = null;
            } catch (error) {
                // Silently ignore cleanup errors during unmount
            }
        }
        
        // Clear Stripe instance reference
        this.stripe = null;
    },
};
</script>

<style scoped>
.checkout-container {
    width: 100%;
    max-width: 1400px;
    margin: 2rem auto;
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

.checkout-header {
    margin-bottom: 2rem;
}

.checkout-progress {
    margin-top: 1.5rem;
    padding: 1.5rem;
    background: var(--bg-secondary);
    border-radius: 12px;
}

.progress-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    position: relative;
}

.step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--bg-tertiary);
    color: var(--text-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1rem;
    transition: all 0.3s ease;
    border: 2px solid var(--border-color);
}

.step.active .step-number {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    border-color: var(--primary-color);
    box-shadow: var(--shadow-md);
    transform: scale(1.1);
}

.step.completed .step-number {
    background: linear-gradient(135deg, var(--success-color), #16a34a);
    color: white;
    border-color: var(--success-color);
}

.step-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    transition: all 0.3s ease;
}

.step.active .step-label {
    color: var(--primary-color);
}

.step-line {
    flex: 1;
    height: 2px;
    background: var(--border-color);
    transition: all 0.3s ease;
    max-width: 100px;
}

.step-line.active {
    background: linear-gradient(90deg, var(--primary-color), var(--primary-dark));
}

.empty-cart {
    margin-top: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    animation: fadeIn 0.5s ease;
}

.empty-cart svg {
    width: 120px;
    height: 120px;
    color: var(--text-tertiary);
    margin-bottom: 1.5rem;
    opacity: 0.5;
}

.empty-cart h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
}

.empty-cart p {
    font-size: 1.125rem;
    color: var(--text-secondary);
    margin-bottom: 2rem;
}

.empty-cart .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.75rem;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-md);
}

.empty-cart .btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.checkout-title {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 2rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 2rem;
}

.col-left {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.col-right {
    display: flex;
    flex-direction: column;
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

.item-count {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    background: var(--bg-tertiary);
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
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

.total-price {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.checkout-button {
    text-align: center;
}

.checkout-btn {
    background-color: #3498db;
    color: white;
    padding: 12px 24px;
    font-size: 18px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.checkout-btn:hover {
    background-color: #2980b9;
}

.checkout-container h1 {
    text-align: center;
}

.checkout-container h3 {
    text-align: left;
}

.checkout-container h4 {
    color: #878484;
}

.cart-items {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    max-height: 500px;
    overflow-y: auto;
    padding-right: 0.5rem;
}

.cart-items::-webkit-scrollbar {
    width: 6px;
}

.cart-items::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
}

.cart-items::-webkit-scrollbar-thumb {
    background: var(--text-tertiary);
    border-radius: 4px;
}

.cart-items::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
}

.cart-item {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    padding: 1.5rem;
    background: var(--bg-primary);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
    animation: cartItemSlideIn 0.5s ease;
}

@keyframes cartItemSlideIn {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.cart-item:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    border-color: var(--primary-color);
    margin-top: 5px;
}

.cart-item-image-wrapper {
    position: relative;
    flex-shrink: 0;
}

.cart-item-image {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: var(--shadow-md);
    transition: transform 0.3s ease;
}

.cart-item:hover .cart-item-image {
    transform: scale(1.05);
}

.item-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    box-shadow: var(--shadow-md);
    border: 2px solid white;
}

.cart-item-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.cart-item-details h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
}

.cart-item-pricing {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
}

.unit-price {
    font-size: 0.875rem;
    color: var(--text-tertiary);
    font-weight: 500;
}

.cart-item-total {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary-color);
}

.cart-summary {
    margin-top: 1.5rem;
    padding: 1.5rem;
    background: var(--bg-primary);
    border-radius: 12px;
    border: 1px solid var(--border-color);
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-color);
}

.summary-row:last-child {
    border-bottom: none;
}

.summary-row.summary-total {
    border-top: 2px solid var(--border-color);
    margin-top: 0.5rem;
    padding-top: 1rem;
}

.summary-label {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-secondary);
}

.summary-value {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
}

.summary-total .summary-value.total-price {
    font-size: 1.5rem;
    color: var(--primary-color);
    animation: priceUpdate 0.5s ease;
}

@keyframes priceUpdate {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
        color: var(--success-color);
    }
}

.checkout-btn {
    background-color: #167bff;
    color: white;
    padding: 12px 24px;
    font-size: 18px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.checkout-btn:hover {
    background-color: #0056b3;
}

.quantity-selector {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1rem;
    flex-wrap: wrap;
    background: var(--bg-secondary);
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.quantity-display {
    min-width: 60px;
    text-align: center;
}

.quantity-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    display: block;
    animation: quantityChange 0.3s ease;
}

@keyframes quantityChange {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.2);
        color: var(--success-color);
    }
}

.quantity-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
}

.quantity-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.quantity-btn:active::before {
    width: 200px;
    height: 200px;
}

.quantity-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--primary-dark), #4338ca);
    transform: translateY(-2px) scale(1.05);
    box-shadow: var(--shadow-md);
}

.quantity-btn:active:not(:disabled) {
    transform: translateY(0) scale(0.95);
}

.quantity-btn:disabled,
.quantity-btn.btn-disabled {
    background: var(--bg-tertiary);
    color: var(--text-tertiary);
    cursor: not-allowed;
    opacity: 0.5;
    transform: none;
}

.quantity-btn svg {
    width: 20px;
    height: 20px;
}

.delete-btn {
    background: linear-gradient(135deg, var(--danger-color), #dc2626);
    color: white;
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
}

.delete-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.delete-btn:disabled {
    opacity: 0.6;
    cursor: wait;
}

.item-update-feedback {
    margin-top: 0.5rem;
    text-align: center;
    animation: fadeIn 0.3s ease;
}

.feedback-text {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-style: italic;
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

.form-control.has-error {
    border-color: var(--danger-color);
}

.form-control.has-error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-control::placeholder {
    color: var(--text-tertiary);
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
    text-align: right;
}

.text-right {
    text-align: right;
    margin-top: 1.5rem;
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

.spinner-sm {
    width: 16px;
    height: 16px;
    border-width: 2px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.payment-card {
    margin-top: 0;
}

.payment-summary {
    margin-bottom: 1.5rem;
}

.summary-card {
    background: var(--bg-primary);
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid var(--border-color);
}

.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
}

.summary-divider {
    height: 1px;
    background: var(--border-color);
    margin: 0.75rem 0;
}

.summary-total-row {
    border-top: 2px solid var(--border-color);
    margin-top: 0.5rem;
    padding-top: 1rem;
}

.summary-amount {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
}

.summary-total-row .summary-amount.total-amount {
    font-size: 1.75rem;
    color: var(--primary-color);
}

.payment-form {
    margin-top: 1.5rem;
}

.card-element-wrapper {
    padding: 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    transition: all 0.3s ease;
    min-height: 48px;
    position: relative;
}

.card-element-wrapper:focus-within {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.card-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: var(--text-secondary);
    font-size: 0.875rem;
    padding: 1rem;
}

.card-loading .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(99, 102, 241, 0.2);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

#card-element {
    height: auto;
    min-height: 48px;
}

.card-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-tertiary);
}

.card-hint svg {
    color: var(--success-color);
}

.pay-button {
    width: 100%;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    padding: 1rem 2rem;
    font-size: 1.125rem;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-md);
    margin-top: 1.5rem;
    position: relative;
    overflow: hidden;
}

.pay-button::before {
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

.pay-button:active::before {
    width: 400px;
    height: 400px;
}

.pay-button:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--primary-dark), #4338ca);
    transform: translateY(-3px) scale(1.02);
    box-shadow: var(--shadow-xl);
}

.pay-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.pay-button.btn-loading {
    cursor: wait;
}

.pay-button.btn-success {
    background: linear-gradient(135deg, var(--success-color), #16a34a);
    animation: successPulse 0.5s ease;
}

.payment-security {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    font-size: 0.875rem;
    color: var(--text-tertiary);
    text-align: center;
    justify-content: center;
}

.payment-security svg {
    color: var(--success-color);
}

.pay-button:disabled {
    background: var(--bg-tertiary);
    color: var(--text-tertiary);
    cursor: not-allowed;
    opacity: 0.6;
}

/* Payment Method Selection */
.payment-method-selection {
    margin-bottom: 1.5rem;
}

.payment-methods {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
}

.payment-method-option {
    position: relative;
    display: block;
    cursor: pointer;
    transition: all 0.3s ease;
}

.payment-method-option input[type="radio"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
}

.payment-method-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    transition: all 0.3s ease;
}

.payment-method-option:hover .payment-method-content {
    border-color: var(--primary-color);
    background: var(--bg-secondary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.payment-method-option.active .payment-method-content {
    border-color: var(--primary-color);
    background: rgba(99, 102, 241, 0.1);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.payment-method-option input[type="radio"]:checked + .payment-method-content {
    border-color: var(--primary-color);
    background: rgba(99, 102, 241, 0.1);
}

.payment-method-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border-radius: 10px;
    color: var(--primary-color);
    flex-shrink: 0;
}

.payment-method-option.active .payment-method-icon {
    background: var(--primary-color);
    color: white;
}

.payment-method-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
}

.payment-method-name {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
}

.payment-method-description {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

/* COD Information */
.cod-info {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
}

.cod-message {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(34, 197, 94, 0.1);
    border: 2px solid rgba(34, 197, 94, 0.3);
    border-radius: 12px;
}

.cod-message svg {
    color: var(--success-color);
    flex-shrink: 0;
    margin-top: 0.25rem;
}

.cod-message p {
    margin: 0.5rem 0;
    color: var(--text-primary);
    line-height: 1.6;
}

.cod-message p:first-child {
    margin-top: 0;
}

.cod-note {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-style: italic;
}

/* Error Message */
.error-message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--danger-color);
    font-size: 0.875rem;
    font-weight: 500;
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    animation: fadeIn 0.3s ease;
}

.error-message svg {
    flex-shrink: 0;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    backdrop-filter: blur(4px);
}

.modal-content {
    background: var(--bg-primary);
    border-radius: 16px;
    box-shadow: var(--shadow-2xl);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.modal-close {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.3s ease;
}

.modal-close:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.modal-body {
    padding: 1.5rem;
}

.modal-body p {
    font-size: 1rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
}

.modal-footer {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding: 1.5rem;
    border-top: 1px solid var(--border-color);
}

.btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover {
    background: var(--bg-tertiary);
}

.btn-danger {
    background: linear-gradient(135deg, var(--danger-color), #dc2626);
    color: white;
    box-shadow: var(--shadow-md);
}

.btn-danger:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.cart-item-enter-active,
.cart-item-leave-active {
    transition: all 0.3s ease;
}

.cart-item-enter-from {
    opacity: 0;
    transform: translateX(-20px);
}

.cart-item-leave-to {
    opacity: 0;
    transform: translateX(20px);
}

.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
    transform: translateY(-20px) scale(0.95);
}

@media (max-width: 968px) {
    .row {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .col-left {
        gap: 1.5rem;
    }

    .checkout-container {
        margin: 1rem auto;
        padding: 1.5rem;
    }

    .checkout-title {
        font-size: 2rem;
    }

    .section-title {
        font-size: 1.25rem;
    }

    .cart-item {
        flex-direction: column;
        align-items: flex-start;
    }

    .cart-item-image {
        width: 100%;
        height: 200px;
    }

    .quantity-selector {
        width: 100%;
        justify-content: space-between;
    }
}

@media (max-width: 768px) {
    .checkout-title {
        font-size: 1.75rem;
    }

    .section-title {
        font-size: 1.125rem;
    }

    .total-price {
        font-size: 1.25rem;
    }

    .stripe-form {
        padding: 1.5rem;
    }

    .stripe-form h4 {
        font-size: 1.25rem;
    }

    .cart-items {
        max-height: 400px;
    }

    .quantity-selector {
        flex-direction: column;
        align-items: stretch;
    }

    .quantity-selector input {
        width: 100%;
    }

    .quantity-selector button {
        width: 100%;
    }

    .payment-methods {
        gap: 0.5rem;
    }

    .payment-method-content {
        padding: 0.875rem;
    }

    .payment-method-icon {
        width: 40px;
        height: 40px;
    }

    .cod-message {
        padding: 1rem;
        flex-direction: column;
        text-align: center;
    }

    .cod-message svg {
        align-self: center;
    }
}
</style>