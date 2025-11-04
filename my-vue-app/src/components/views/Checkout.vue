<template>
    <div class="checkout-container">
        <h1 class="checkout-title">Checkout</h1>

        <!-- Empty Cart Message -->
        <div v-if="cart.length === 0" class="empty-cart">
            <p>Your cart is empty.</p>
        </div>

        <div v-else class="row">
            <!-- Order Details Section -->
            <div class="col-md-6">
                <h4 class="section-title">Order Details</h4>
                <div class="cart-items">
                    <div class="cart-item" v-for="(item, index) in cart" :key="index">
                        <img :src="item.image" alt="Product Image" class="cart-item-image" />
                        <div class="cart-item-details">
                            <h3 class="cart-item-name">{{ item.name }}</h3>
                            <p class="cart-item-price">Price: ${{ item.price }} x {{ item.quantity }} (Quantity)</p>
                            <p class="cart-item-total">Total: ${{ item.price * item.quantity }}</p>

                            <div class="quantity-selector">
                                <button @click="decreaseQuantity(item)" :disabled="item.quantity <= 1"
                                    class="quantity-btn">
                                    -
                                </button>
                                <input type="number" v-model="item.quantity" min="1" readonly class="quantity-input" />
                                <button @click="increaseQuantity(item)" class="quantity-btn">+</button>
                                <button class="delete-btn" @click="deleteOrder(item)">
                                    <span class="fas fa-trash"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Personal Information Section -->
            <div class="col-md-6">
                <h4 class="section-title">Personal Information</h4>
                <div class="personal-info">
                    <div class="form-group">
                        <input type="text" class="form-control" name="name" v-model="userDetail.name"
                            placeholder="Your Name" />
                    </div>
                    <div class="form-group">
                        <input type="email" class="form-control" name="email" v-model="userDetail.email"
                            placeholder="Your Email" />
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control" name="phone" v-model="userDetail.phone"
                            placeholder="Your Phone" />
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control" name="address" v-model="userDetail.address"
                            placeholder="Your Address" />
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control" name="postal_code" v-model="userDetail.postal_code"
                            placeholder="Postal Code" />
                    </div>
                    <div class="form-group">
                        <select class="form-control" v-model="userDetail.country" @change="validateCountry" required>
                            <option value="">Select a country</option>
                            <option v-for="(name, code) in countries" :key="code" :value="code">{{ name }}</option>
                        </select>
                    </div>
                </div>
                <div class="text-right">
                    <button type="button" class="update-info-btn" @click="updatePersonalInfo()">Update
                        Information</button>
                </div>
            </div>

            <!-- Stripe Payment Form Section -->
            <div class="col-md-6 stripe-form">
                <h4 class="section-title">Payment Information</h4>
                <div class="total-price">
                    <p><strong>Total: ${{ totalPrice }}</strong></p>
                </div>
                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label for="card-element">Card Details</label>
                        <div id="card-element"></div>
                    </div>

                    <div v-if="errorMessage" role="alert" class="error-message">
                        {{ errorMessage }}
                    </div>

                    <button type="submit" :disabled="loading || !isValidForm" class="pay-button">
                        Pay with Stripe
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { COUNTRIES, createStripe, deleteOrderRecord, getOrderData, updateOrderRecord, updateProfile } from '../../services/api';
import productData from '../../constant.json';
import { loadStripe } from '@stripe/stripe-js';

export default {
    name: 'CheckoutComponent',
    data() {
        return {
            cart: [],
            user: '',
            countries: COUNTRIES,
            userDetail: {},
            stripe: null,
            elements: null,
            clientSecret: '',
            showStripeForm: false,
            errorMessage: '',
            isValidForm: false,
        };
    },

    computed: {
        totalPrice() {
            return this.cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
        },
    },

    methods: {
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

                    if (response.success) {

                        this.userDetail = {
                            user_id: response.data[0].user_id,
                            name: response.data[0].name,
                            email: response.data[0].email,
                            phone: response.data[0].phone,
                            address: response.data[0].address,
                            postal_code: response.data[0].postal_code,
                            country: response.data[0].country,
                        };

                        this.cart = response.data.map(orderItem => {
                            let product = productData.find(p => p.id === orderItem.product_id);

                            return {
                                ...orderItem,
                                name: product?.name,
                                price: product?.price,
                                image: require(`@/assets/${product?.image}`),
                            };
                        });
                    } else {
                        this.cart = [];
                    }
                }
            } catch (error) {
                console.log(error);
                alert(error.response?.data?.error || 'Something went wrong');
            }
        },

        increaseQuantity(item) {
            if (Object.keys(this.user).length === 0) {
                alert("Please Login first");
                return;
            }

            if (item.quantity < 10) {
                item.quantity++;
            } else {
                item.quantity = 10;
                alert('Maximum 10 quantity allowed per order.');
            }

            const productData = {
                user_id: item.user_id,
                product_id: item.product_id,
                quantity: item.quantity,
                total_amount: item.price * item.quantity
            }

            updateOrderRecord(productData)
                .then((response) => {
                    if (response.success) {
                        alert(response.message);
                    } else {
                        alert(response.error);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    alert(error.response?.data?.error || 'Something went wrong');
                }
                );
        },

        decreaseQuantity(item) {
            if (Object.keys(this.user).length === 0) {
                alert("Please Login first");
                return;
            }

            if (item.quantity > 1) {
                item.quantity--;
            }

            const productData = {
                user_id: item.user_id,
                product_id: item.product_id,
                quantity: item.quantity,
                total_amount: item.price * item.quantity
            }

            updateOrderRecord(productData)
                .then((response) => {
                    if (response.success) {
                        alert(response.message);
                    } else {
                        alert(response.error);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    alert(error.response?.data?.error || 'Something went wrong');
                }
                );
        },

        deleteOrder(item) {
            const productData = {
                user_id: item.user_id,
                product_id: item.product_id
            }

            deleteOrderRecord(productData)
                .then((response) => {
                    if (response.success) {
                        alert(response.message);
                    } else {
                        alert(response.error);
                    }
                    this.fetchCart();
                })
                .catch((error) => {
                    console.error(error);
                    alert(error.response?.data?.error || 'Something went wrong');
                }
                );
        },

        updatePersonalInfo() {
            const personal = {
                ...this.userDetail
            }

            updateProfile(personal)
                .then((response) => {
                    if (response.success) {
                        alert(response.message);
                    } else {
                        alert(response.error);
                    }
                })
                .catch((error) => {
                    alert(error.response?.data?.message || 'Something went wrong');
                }
                );
        },

        async handleSubmit() {
            this.loading = true;
            this.errorMessage = '';  // Reset error message

            // Get Stripe payment method
            const { error, paymentMethod } = await this.stripe.createPaymentMethod({
                type: 'card',
                card: this.elements.getElement('card'),
            });

            if (error) {
                this.errorMessage = error.message;  // Display error
                this.loading = false;
                return;
            }

            try {
                // Call backend API to create a Stripe session
                const response = await createStripe({ cart: this.cart, userDetail: this.userDetail });
                const clientSecret = response.clientSecret;

                // Use sessionId to confirm the payment
                const { error: stripeError } = await this.stripe.confirmCardPayment(clientSecret, {
                    payment_method: paymentMethod.id,
                });

                if (stripeError) {
                    this.errorMessage = stripeError.message;
                    this.loading = false;
                    return;
                }

                // Success! Navigate to order success page
                this.$router.push('/order-success');
                this.cart = [];
            } catch (error) {
                console.error('Error:', error);
                this.errorMessage = 'There was an error processing your payment.';
                this.loading = false;
            }
        },

        // Validate form (e.g., is the card element filled correctly?)
        validateForm() {
            // For now, we'll check if card element is populated
            const cardElement = this.elements.getElement('card');
            console.log('cardElement', cardElement);

            this.isValidForm = !!cardElement;
        },
    },

    async mounted() {
        this.fetchCart();

        // Load Stripe.js
        this.stripe = await loadStripe(process.env.VUE_APP_STRIPE_PUBLIC_KEY);

        // Create an Elements instance
        this.elements = this.stripe.elements();

        // Fallback: Delay mounting with setTimeout (for debugging purposes)
        setTimeout(() => {
            const cardElement = document.getElementById('card-element');
            if (cardElement) {
                const card = this.elements.create('card');
                card.mount(cardElement);

                // Optionally listen to form changes (for enabling/disabling submit button)
                card.on('change', () => {
                    this.validateForm();
                });
            } else {
                console.error('Card element not found!');
            }
        }, 500); // 500ms delay before mounting
    },
};
</script>

<style scoped>
.checkout-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px;
    background: #ffffff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    margin-top: 50px;
}

.empty-cart {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.checkout-title {
    text-align: center;
    font-size: 36px;
    font-weight: 600;
    color: #333;
}

.row {
    display: flex;
    justify-content: space-between;
}

.section-title {
    font-size: 22px;
    color: #2c3e50;
    margin-bottom: 15px;
}

.total-price {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
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
    margin-top: 25px;
    margin-bottom: 20px;
    height: 380px;
    overflow: auto;
}

.cart-item {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid #9d9696;
}

.cart-item img {
    width: 100px;
    height: auto;
    box-shadow: 0 6px 10px rgb(109 104 104);
}

.cart-item-details {
    margin-bottom: 10px;
}

.cart-item-details h3 {
    text-align: left;
    font-size: 20px;
    font-weight: 700;
}

.cart-summary {
    margin-top: 30px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #ddd;
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
    gap: 10px;
}

.quantity-selector input {
    width: 25%;
    text-align: center;
    font-size: 16px;
    border: 1px solid #afafaf;
    padding: 5px;
    border-radius: 10px;
    margin: 0px;
}

.quantity-selector button {
    padding: 5px 10px;
    background-color: #167bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.quantity-selector button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.quantity-selector .delete-btn {
    background-color: #b11c09;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin: 0px;
}

.quantity-selector .delete-btn:hover {
    background-color: #bb4030;
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
    padding: 0px 16px;
    border: 2px solid #ffffff;
    border-radius: 8px;
    font-size: 16px;
    background-color: #d4dde7;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
    outline: none;
    border-color: #a6a7a9;
    box-shadow: 0 0 0 3px rgba(22, 123, 255, 0.1);
    background-color: #ffffff;
}

.update-info-btn {
    background-color: #167bff;
    color: white;
    padding: 12px 24px;
    font-size: 18px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

/* General Styles for the Checkout Form */
.stripe-form {
    margin-top: 20px;
    padding: 20px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 10px;
    max-width: 400px;
    margin: 20px auto;
}

h4 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
}

.form-group {
    margin-bottom: 20px;
}

label {
    font-size: 16px;
    color: #555;
    display: block;
    margin-bottom: 8px;
}

#card-element {
    height: 40px;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
    font-size: 16px;
    width: 100%;
}

.pay-button {
    background-color: #167bff;
    color: white;
    padding: 12px 24px;
    font-size: 18px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.pay-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

/* Error Message */
#error-message {
    color: red;
    font-size: 14px;
    margin-top: 10px;
    text-align: center;
}
</style>