<template>
    <div class="product-detail-container">
        <div v-if="product">
            <section class="product-detail">
                <div class="product-image">
                    <img :src="`/${product.image}`" :alt="product.name" />
                </div>

                <div class="product-info">
                    <h1>{{ product.name }}</h1>
                    <p class="description">{{ product.description }}</p>

                    <div class="row">
                        <div class="col-6">
                            <label>
                                Base Price:
                                <p class="price">${{ product.price }}</p>
                            </label>
                        </div>
                        <div class="col-6" v-if="Object.keys(this.user).length !== 0 && order.length !== 0">
                            <label>
                                Total Price:
                                <p class="price">${{ product.price * quantity }}</p>
                            </label>
                        </div>
                    </div>

                    <div v-if="Object.keys(this.user).length === 0 || order.length === 0">
                        <button class="add-to-cart-btn" @click="addToCart(product)" :disabled="loadingItems[product.id]">
                            <span v-if="loadingItems[product.id]">Adding...</span>
                            <span v-else>Add to Cart</span>
                        </button>
                    </div>
                    <div v-if="Object.keys(this.user).length !== 0 && order.length !== 0" class="quantity-selector">
                        <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
                        <input type="number" v-model="quantity" min="1" readonly />
                        <button @click="increaseQuantity">+</button>
                    </div>

                    <!-- ⭐ Product Rating Section -->
                    <div class="product-rating">
                        <h2>Product Ratings</h2>

                        <div v-if="ratings && ratings.length > 0">
                            <p>
                            Rating:
                            <span class="average-rating">{{ averageRating.toFixed(1) }} / 5</span>
                            ({{ ratings.length }} ratings)
                            </p>

                            <!-- Show existing ratings -->
                            <div class="reviews">
                                <div v-for="rating in ratings" :key="rating.id" class="review">
                                    <div class="stars">
                                        <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= rating.rating }">★</span>
                                    </div>
                                    <p class="review-text" v-if="rating.review">{{ rating.review }}</p>
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <p>No ratings yet. Be the first to rate this product!</p>
                        </div>

                        <!-- Submit rating -->
                        <div class="submit-rating">
                            <div class="stars-input">
                                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= userRating }" @click="userRating = i">
                                    ★
                                </span>
                            </div>
                            <div>
                                <textarea v-model="userReview" placeholder="Write a review *"></textarea>
                            </div>
                        </div>
                        <button class="submit-btn" @click="submitRating" 
                            :disabled="!(userRating > 0 && userReview.trim() !== '')">
                            Submit Rating
                        </button>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>


<script>
    import productData from '../../constant.json';
    import { getProductOrderData, orderData, updateOrderRecord, getProductRatingData, productRatingData } from '../../services/api';

    export default {
        name: 'ProductDetail',
        data() {
            return {
                id: this.$route.params.id,
                user: JSON.parse(localStorage.getItem('user')) || {},
                order: {},
                product: {},
                quantity: 1,
                userRating: 0,
                userReview: '',
                loadingItems: {}, // product_id → loading state
                averageRating: '',
                ratings: ''
            };
        },
        methods: {
            async fetchCart() {
                this.product = productData.find(p => p.id === this.$route.params.id);
                
                const response = await getProductOrderData({ user_id: this.user.id, product_id: this.$route.params.id });
                this.order = response.data;

                this.order.find(orderItem => {
                    if(orderItem.product_id === this.$route.params.id) {
                        this.quantity = orderItem.quantity;
                    }
                });
            },

            async getProductRatingData() {
                let data = { user_id: this.user.id, product_id: this.$route.params.id };
               getProductRatingData(data)
                .then((response) => {
                    this.ratings = response.data;
                    this.averageRating = this.ratings.reduce((sum, review) => sum + review.rating, 0) / this.ratings.length;
                }).catch((error) => {
                    console.log(error);
                    alert(error.response?.data?.error || 'Something went wrong');
                });
            },

            addToCart(product) {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user) {
                    alert('Please log in first');
                    return;
                }

                this.loadingItems[product.id] = true;

                const data = {
                    user_id: user.id,
                    product_id: product.id,
                    price: product.price,
                    quantity: 1
                };

                orderData(data)
                    .then((response) => {
                        if (response.success) {
                            this.fetchCart();
                            alert(response.message);
                        } else {
                            alert(response.error);
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        alert(error.response?.data?.error || 'Something went wrong');
                    })
                    .finally(() => {
                        this.loadingItems[product.id] = false;
                    }
                );
            },

            increaseQuantity() {
                if(Object.keys(this.user).length === 0) {
                    alert("Please Login first");
                    return;
                }

                if (this.quantity < 10) {
                    this.quantity++;
                } else {
                    this.quantity = 10;
                    alert('Maximum 10 quantity allowed per order.');
                }

                this.productData = {
                    ...this.productData,
                    quantity: this.quantity,
                    total_amount: this.product.price * this.quantity
                }

                updateOrderRecord(this.productData)
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

            decreaseQuantity() {
                if(Object.keys(this.user).length === 0) {
                    alert("Please Login first");
                    return;
                }

                if (this.quantity > 1) {
                    this.quantity--;
                }

                this.productData = {
                    ...this.productData,
                    quantity: this.quantity,
                    total_amount: this.product.price * this.quantity
                }

                updateOrderRecord(this.productData)
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

            submitRating() {
                if(Object.keys(this.user).length === 0) {
                    alert("Please Login first");
                    return;
                }

                if (this.userRating === 0) {
                    alert('Please select a rating!');
                    return;
                }

                this.productData = {
                    ...this.productData,
                    rating: this.userRating,
                    review: this.userReview
                }

                productRatingData(this.productData)
                    .then((response) => {
                        if (response.success) {
                            alert(response.message);
                            this.getProductRatingData();
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
        },
        mounted() {
            if (this.user && this.user.id) {
                this.productData = {
                    user_id: this.user.id,
                    product_id: this.id,
                };
            }
            this.fetchCart();
            this.getProductRatingData();
        },
    };
</script>

<style scoped>
    .product-detail-container {
        width: 1080px;
        margin: auto;
        padding: 20px;
        box-sizing: border-box;
        margin-top: 60px;
        background: #ffffff;
        box-shadow: 0 6px 10px rgba(0, 0, 0, 1.1);
        border-radius: 10px;
    }

    .product-detail {
        display: flex;
        justify-content: space-between;
        gap: 40px;
    }

    .product-image img {
        width: 300px;
        height: auto;
        box-shadow: 0 5px 20px rgb(101 100 100);
    }

    .product-info {
        max-width: 500px;
    }

    .product-info h1 {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 20px;
    }

    .product-info .description {
        font-size: 16px;
        margin-bottom: 20px;
    }

    .product-info .price {
        font-size: 24px;
        font-weight: 600;
        color: #167bff;
        margin-bottom: 20px;
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

    .add-to-cart-btn {
        background-color: #167bff;
        color: white;
        padding: 12px 24px;
        font-size: 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .add-to-cart-btn:hover {
        background-color: #0056b3;
    }

    .product-rating {
        padding: 30px 0px;
    }

    .product-rating h2 {
        font-size: 1.5rem;
    }

    .stars-input {
        display: inline-flex;
        direction: ltr; /* Ensure normal left-to-right order */
    }

    .star {
        font-size: 30px;
        color: #ccc;
        cursor: pointer;
        transition: color 0.2s;
    }

    /* Fill stars up to selected rating */
    .star.filled {
        color: gold;
    }

    /* Hover effect: temporarily highlight up to hovered star */
    .star:hover,
    .star:hover ~ .star {
        color: #ccc; /* Reset later stars */
    }

    /* To make hover fill up to the hovered star, we need reverse flex direction */
    .stars-input:hover .star {
        color: gold;
    }
    .stars-input:hover .star:hover ~ .star {
        color: #ccc;
    }

    .submit-rating textarea {
        width: 100%;
        min-height: 120px;
        resize: vertical; /* allows users to resize vertically */
        padding: 10px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 6px;
        box-sizing: border-box;
    }

    .submit-btn {
        background-color: #167bff;
        color: white;
        padding: 12px 24px;
        font-size: 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .submit-btn:hover {
        background-color: #0056b3;
    }

    .submit-btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
</style>