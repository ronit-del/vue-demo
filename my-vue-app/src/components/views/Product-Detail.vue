<template>
    <div class="product-detail-container">
        <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading product details...</p>
        </div>
        <div v-else-if="error" class="error-state">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 16V32M32 48H32.04M56 32C56 45.2548 45.2548 56 32 56C18.7452 56 8 45.2548 8 32C8 18.7452 18.7452 8 32 8C45.2548 8 56 18.7452 56 32Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>{{ error }}</p>
            <button class="btn-retry" @click="fetchProduct">Try Again</button>
        </div>
        <div v-else-if="product && product.id" class="product-wrapper">
            <section class="product-detail">
                <div class="product-image-wrapper">
                    <div class="product-image" @click="openImageModal">
                        <img :src="`${product.image}`" :alt="product.name" @load="imageLoaded = true" />
                        <div v-if="!imageLoaded" class="image-skeleton">
                            <div class="skeleton-loader"></div>
                        </div>
                        <!-- <div class="zoom-indicator" v-if="imageLoaded">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>Click to zoom</span>
                        </div> -->
                    </div>
                    <div class="image-thumbnails" v-if="imageLoaded">
                        <div class="thumbnail-indicator">Scroll for more</div>
                    </div>
                </div>

                <div class="product-info">
                    <div class="product-header">
                        <h1 class="product-title">{{ product.name }}</h1>
                        <div class="product-badges">
                            <span class="badge badge-primary" v-if="ratings && ratings.length > 0">
                                ⭐ {{ averageRating.toFixed(1) }} ({{ ratings.length }})
                            </span>
                        </div>
                    </div>
                    
                    <p class="description">{{ product.description }}</p>

                    <div class="price-section">
                        <div class="price-card">
                            <label class="price-label">Base Price</label>
                            <p class="price price-animated" :key="product.price">${{ product.price }}</p>
                        </div>
                        <div class="price-card" v-if="Object.keys(this.user).length !== 0 && hasOrderItem">
                            <label class="price-label">Total Price</label>
                            <p class="price price-total price-animated" :key="product.price * quantity">
                                ${{ (product.price * quantity).toFixed(2) }}
                            </p>
                        </div>
                    </div>

                    <div class="action-section">
                        <div v-if="Object.keys(this.user).length === 0 || !hasOrderItem">
                            <button 
                                class="add-to-cart-btn" 
                                @click="addToCart(product)" 
                                :disabled="loadingItems[product.id]"
                                :class="{ 'btn-loading': loadingItems[product.id], 'btn-success': addToCartSuccess }"
                            >
                                <span v-if="loadingItems[product.id]" class="btn-content">
                                    <span class="spinner"></span>
                                    <span>Adding to Cart...</span>
                                </span>
                                <span v-else-if="addToCartSuccess" class="btn-content">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 10L9 12L13 8M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>Added to Cart!</span>
                                </span>
                                <span v-else class="btn-content">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 3H17L16 11H4L3 3ZM3 3L2 1M5 15H7M17 15H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M9 19C9.55228 19 10 18.5523 10 18C10 17.4477 9.55228 17 9 17C8.44772 17 8 17.4477 8 18C8 18.5523 8.44772 19 9 19Z" stroke="currentColor" stroke-width="2"/>
                                        <path d="M15 19C15.5523 19 16 18.5523 16 18C16 17.4477 15.5523 17 15 17C14.4477 17 14 17.4477 14 18C14 18.5523 14.4477 19 15 19Z" stroke="currentColor" stroke-width="2"/>
                                    </svg>
                                    <span>Add to Cart</span>
                                </span>
                            </button>
                        </div>
                        <div v-if="Object.keys(this.user).length !== 0 && hasOrderItem" class="quantity-control-wrapper">
                            <label class="quantity-label">Quantity</label>
                            <div class="quantity-selector interactive">
                                <button 
                                    @click="decreaseQuantity" 
                                    :disabled="quantity <= 1 || updatingQuantity"
                                    class="qty-btn qty-btn-decrease"
                                    :class="{ 'btn-disabled': quantity <= 1 }"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                                <div class="quantity-display">
                                    <span class="quantity-value" :key="quantity">{{ quantity }}</span>
                                    <span class="quantity-max">Max: 10</span>
                                </div>
                                <button 
                                    @click="increaseQuantity" 
                                    :disabled="quantity >= 10 || updatingQuantity"
                                    class="qty-btn qty-btn-increase"
                                    :class="{ 'btn-disabled': quantity >= 10 }"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 5V15M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                            <div class="quantity-feedback" v-if="updatingQuantity">
                                <span class="feedback-text">Updating...</span>
                            </div>
                        </div>
                    </div>

                    <!-- ⭐ Product Rating Section -->
                    <div class="product-rating">
                        <div class="rating-header">
                            <h2>Product Ratings</h2>
                            <div class="rating-summary" v-if="ratings && ratings.length > 0">
                                <div class="rating-circle">
                                    <span class="rating-number">{{ averageRating.toFixed(1) }}</span>
                                    <span class="rating-max">/5</span>
                                </div>
                                <div class="rating-stats">
                                    <div class="stat-item">
                                        <span class="stat-value">{{ ratings.length }}</span>
                                        <span class="stat-label">Reviews</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="ratings && ratings.length > 0" class="reviews-section">
                            <div class="reviews-header">
                                <h3>Customer Reviews</h3>
                                <button class="filter-reviews-btn" @click="showAllReviews = !showAllReviews">
                                    {{ showAllReviews ? 'Show Less' : 'Show All' }}
                                </button>
                            </div>
                            <div class="reviews">
                                <transition-group name="review-fade" tag="div">
                                    <div 
                                        v-for="(rating, index) in displayedReviews" 
                                        :key="rating.id" 
                                        class="review"
                                        :style="{ animationDelay: `${index * 0.1}s` }"
                                    >
                                        <div class="review-header">
                                            <div class="stars-interactive">
                                                <span 
                                                    v-for="i in 5" 
                                                    :key="i" 
                                                    class="star" 
                                                    :class="{ filled: i <= rating.rating }"
                                                >
                                                    ★
                                                </span>
                                            </div>
                                            <span class="review-date">{{ formatDate(rating.created_at) }}</span>
                                        </div>
                                        <p class="review-text" v-if="rating.review">{{ rating.review }}</p>
                                    </div>
                                </transition-group>
                            </div>
                        </div>
                        <div v-else class="no-reviews">
                            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M32 8L38.5 24.5L56 28L44 39.5L46.5 57L32 48.5L17.5 57L20 39.5L8 28L25.5 24.5L32 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <p>No ratings yet. Be the first to rate this product!</p>
                        </div>

                        <!-- Submit rating -->
                        <div class="submit-rating-card">
                            <h3>Write a Review</h3>
                            <div class="rating-input-section">
                                <label class="rating-input-label">Your Rating</label>
                                <div class="stars-input interactive">
                                    <span 
                                        v-for="i in 5" 
                                        :key="i" 
                                        class="star star-input" 
                                        :class="{ filled: i <= userRating, hovered: i <= hoveredRating }"
                                        @click="userRating = i"
                                        @mouseenter="hoveredRating = i"
                                        @mouseleave="hoveredRating = 0"
                                    >
                                        ★
                                    </span>
                                    <span class="rating-hint" v-if="userRating > 0">
                                        {{ getRatingText(userRating) }}
                                    </span>
                                </div>
                            </div>
                            <div class="review-text-section">
                                <label class="review-text-label">Your Review</label>
                                <textarea 
                                    v-model="userReview" 
                                    placeholder="Share your experience with this product..."
                                    class="review-textarea"
                                    :class="{ 'has-focus': reviewTextareaFocused }"
                                    @focus="reviewTextareaFocused = true"
                                    @blur="reviewTextareaFocused = false"
                                ></textarea>
                                <div class="char-counter">
                                    <span :class="{ 'char-warning': userReview.length > 500 }">
                                        {{ userReview.length }}/1000
                                    </span>
                                </div>
                            </div>
                            <button 
                                class="submit-btn" 
                                @click="submitRating" 
                                :disabled="!(userRating > 0 && userReview.trim() !== '') || submittingRating"
                                :class="{ 'btn-loading': submittingRating }"
                            >
                                <span v-if="submittingRating" class="btn-content">
                                    <span class="spinner"></span>
                                    <span>Submitting...</span>
                                </span>
                                <span v-else class="btn-content">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 2V18M10 2L6 6M10 2L14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>Submit Rating</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>


<script>
    import { getProductOrderData, orderData, updateOrderRecord, getProductRatingData, productRatingData, getProductById, getProductByCode } from '../../services/api';

    export default {
        name: 'ProductDetail',
        data() {
            return {
                id: this.$route.params.id,
                user: JSON.parse(localStorage.getItem('user')) || {},
                order: [],
                product: {},
                quantity: 1,
                userRating: 0,
                hoveredRating: 0,
                userReview: '',
                loadingItems: {},
                updatingQuantity: false,
                addToCartSuccess: false,
                submittingRating: false,
                averageRating: '',
                ratings: '',
                imageLoaded: false,
                imageZoomed: false,
                showAllReviews: false,
                reviewTextareaFocused: false,
                loading: true,
                error: null,
                orderNumber: null // Store the current order number for the cart
            };
        },

        computed: {
            displayedReviews() {
                if (!this.ratings || this.ratings.length === 0) return [];
                return this.showAllReviews ? this.ratings : this.ratings.slice(0, 3);
            },

            hasOrderItem() {
                if (!this.order || !Array.isArray(this.order) || this.order.length === 0 || !this.product || !this.product.id) {
                    return false;
                }
                // Check if any order item matches this product by product_id or product_code
                return this.order.some(orderItem => 
                    orderItem.product_id === this.product.id || 
                    (orderItem.product_code && orderItem.product_code === this.product.product_code)
                );
            }
        },

        methods: {
            formatDate(date) {
                if (!date) return '';
                return new Date(date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
            },

            getRatingText(rating) {
                const texts = {
                    1: 'Poor',
                    2: 'Fair',
                    3: 'Good',
                    4: 'Very Good',
                    5: 'Excellent'
                };
                return texts[rating] || '';
            },

            openImageModal() {
                this.imageZoomed = !this.imageZoomed;
            },

            async fetchProduct() {
                this.loading = true;
                this.error = null;
                this.imageLoaded = false;
                
                try {
                    const productParam = this.$route.params.id;
                    let response;
                    
                    // Check if it looks like a UUID (has dashes) or product_code
                    // UUIDs typically have format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productParam);
                    
                    if (isUUID) {
                        // Try fetching by ID first
                        response = await getProductById(productParam);
                    } else {
                        // Try fetching by product_code
                        response = await getProductByCode(productParam);
                    }
                    
                    // If first attempt fails, try the other method
                    if (!response.success || !response.data) {
                        if (isUUID) {
                            // Already tried ID, skip
                            response = { success: false, message: 'Product not found' };
                        } else {
                            // Try as ID
                            response = await getProductById(productParam);
                        }
                    }
                    
                    if (response.success && response.data) {
                        this.product = response.data;
                        this.id = response.data.id;
                        // Fetch cart data after product is loaded
                        await this.fetchCart();
                    } else {
                        this.error = response.message || 'Product not found';
                        this.product = {};
                    }
                } catch (error) {
                    console.error('Error fetching product:', error);
                    this.error = 'Failed to load product. Please try again.';
                    this.product = {};
                } finally {
                    this.loading = false;
                }
            },

            async fetchCart() {
                if (!this.product || !this.product.id) {
                    this.order = [];
                    this.quantity = 1;
                    return;
                }
                
                if (!this.user || !this.user.id) {
                    this.order = [];
                    this.quantity = 1;
                    return;
                }

                try {
                    // Use product_code if available, otherwise use product id
                    const productIdentifier = this.product.product_code || this.product.id;
                    const response = await getProductOrderData({ 
                        user_id: this.user.id, 
                        product_code: productIdentifier
                    });
                    
                    this.order = Array.isArray(response.data) ? response.data : [];

                    if(this.order.length > 0) {
                        this.orderNumber = this.order.find((f) => f.order_status === 'Pending').order_number;
                    }

                    const orderItem = this.order.find(item => 
                        item.product_id === this.product.id || 
                        (item.product_code && item.product_code === this.product.product_code)
                    );
                    
                    if (orderItem && orderItem.quantity) {
                        this.quantity = parseInt(orderItem.quantity) || 1;
                    } else {
                        this.quantity = 1;
                    }
                } catch (error) {
                    console.error('Error fetching cart:', error);
                    this.order = [];
                    this.quantity = 1;
                }
            },

            async getProductRatingData() {
                if (!this.product || !this.product.id || !this.user || !this.user.id) {
                    return;
                }
                
                let data = { user_id: this.user.id, product_id: this.product.id };
                getProductRatingData(data)
                .then((response) => {
                    this.ratings = response.data;
                    if (this.ratings && this.ratings.length > 0) {
                        this.averageRating = this.ratings.reduce((sum, review) => sum + review.rating, 0) / this.ratings.length;
                    } else {
                        this.averageRating = 0;
                    }
                }).catch((error) => {
                    console.log(error);
                    this.ratings = [];
                    this.averageRating = 0;
                });
            },

            addToCart(product) {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user) {
                    alert('Please log in first');
                    return;
                }

                if (!product || !product.id) {
                    alert('Product information is missing');
                    return;
                }

                this.loadingItems[product.id] = true;
                this.addToCartSuccess = false;

                const data = {
                    user_id: user.id,
                    product_id: product.id,
                    price: product.price,
                    quantity: 1,
                    orderNumber: this.orderNumber
                };

                orderData(data)
                    .then((response) => {
                        if (response.success) {
                            this.addToCartSuccess = true;
                            // Store the orderNumber from response for future requests
                            if (response.orderNumber || response.data?.order_number) {
                                this.orderNumber = response.orderNumber || response.data.order_number;
                            }
                            // Refresh cart data after adding to cart
                            this.fetchCart();
                            setTimeout(() => {
                                this.addToCartSuccess = false;
                            }, 2000);
                        } else {
                            alert(response.message || response.error || 'Failed to add to cart');
                        }
                    })
                    .catch((error) => {
                        console.error('Error adding to cart:', error);
                        alert(error.response?.data?.error || error.response?.data?.message || 'Something went wrong');
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

                if (!this.product || !this.product.id) {
                    alert("Product information is missing");
                    return;
                }

                if (this.quantity >= 10) {
                    this.quantity = 10;
                    return;
                }

                this.updatingQuantity = true;
                const newQuantity = this.quantity + 1;
                const newTotalAmount = parseFloat((this.product.price * newQuantity).toFixed(2));

                const productData = {
                    user_id: this.user.id,
                    product_id: this.product.id,
                    quantity: newQuantity,
                    total_amount: newTotalAmount,
                    type: 'increase'
                }

                updateOrderRecord(productData)
                    .then((response) => {
                        if (response.success) {
                            this.quantity = newQuantity;
                            // Refresh cart to get updated data
                            this.fetchCart();
                        } else {
                            alert(response.message || response.error || 'Failed to update quantity');
                        }
                    })
                    .catch((error) => {
                        console.error('Error updating quantity:', error);
                        alert(error.response?.data?.error || error.response?.data?.message || 'Something went wrong');
                    })
                    .finally(() => {
                        this.updatingQuantity = false;
                    });
            },

            decreaseQuantity() {
                if(Object.keys(this.user).length === 0) {
                    alert("Please Login first");
                    return;
                }

                if (!this.product || !this.product.id) {
                    alert("Product information is missing");
                    return;
                }

                if (this.quantity <= 1) {
                    return;
                }

                this.updatingQuantity = true;
                const newQuantity = this.quantity - 1;
                const newTotalAmount = parseFloat((this.product.price * newQuantity).toFixed(2));

                const productData = {
                    user_id: this.user.id,
                    product_id: this.product.id,
                    quantity: newQuantity,
                    total_amount: newTotalAmount,
                    type: 'decrease'
                }

                updateOrderRecord(productData)
                    .then((response) => {
                        if (response.success) {
                            this.quantity = newQuantity;
                            // Refresh cart to get updated data
                            this.fetchCart();
                        } else {
                            alert(response.message || response.error || 'Failed to update quantity');
                        }
                    })
                    .catch((error) => {
                        console.error('Error updating quantity:', error);
                        alert(error.response?.data?.error || error.response?.data?.message || 'Something went wrong');
                    })
                    .finally(() => {
                        this.updatingQuantity = false;
                    }
                );
            },

            submitRating() {
                if(Object.keys(this.user).length === 0) {
                    alert("Please Login first");
                    return;
                }

                if (!this.product || !this.product.id) {
                    alert("Product information is missing");
                    return;
                }

                if (this.userRating === 0) {
                    alert('Please select a rating!');
                    return;
                }

                this.submittingRating = true;

                const productData = {
                    user_id: this.user.id,
                    product_id: this.product.id,
                    rating: this.userRating,
                    review: this.userReview.trim()
                }

                productRatingData(productData)
                    .then((response) => {
                        if (response.success) {
                            // Reset form
                            this.userRating = 0;
                            this.userReview = '';
                            this.hoveredRating = 0;
                            // Refresh ratings
                            this.getProductRatingData();
                            // Show success message
                            alert(response.message || 'Rating submitted successfully!');
                        } else {
                            alert(response.message || response.error || 'Failed to submit rating');
                        }
                    })
                    .catch((error) => {
                        console.error('Error submitting rating:', error);
                        alert(error.response?.data?.error || error.response?.data?.message || 'Something went wrong');
                    })
                    .finally(() => {
                        this.submittingRating = false;
                    }
                );
            },
        },

        async mounted() {
            await this.fetchProduct();
            if (this.product && this.product.id) {
                // Fetch ratings after product is loaded
                this.getProductRatingData();
            }
        },

        watch: {
            '$route.params.id'() {
                this.id = this.$route.params.id;
                // Reset product and reload when route changes
                this.product = {};
                this.quantity = 1;
                this.order = [];
                this.ratings = [];
                this.averageRating = 0;
                this.fetchProduct();
            }
        },
    };
</script>

<style scoped>
    .product-detail-container {
        width: 100%;
        max-width: 1200px;
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

    .product-wrapper {
        animation: slideInUp 0.5s ease;
    }

    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .product-detail {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        margin-bottom: 3rem;
    }

    .product-image-wrapper {
        position: sticky;
        top: 100px;
        height: fit-content;
    }

    .product-image {
        position: relative;
        width: 100%;
        max-width: 500px;
        /* cursor: zoom-in; */
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
    }

    .product-image.image-zoom {
        cursor: zoom-out;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        max-width: 90vw;
        max-height: 90vh;
        box-shadow: var(--shadow-2xl);
    }

    .product-image.image-zoom::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: -1;
    }

    .product-image img {
        width: 100%;
        height: auto;
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        transition: transform 0.3s ease;
        display: block;
    }

    .product-image:hover img {
        transform: scale(1.05);
    }

    .product-image.image-zoom img {
        transform: scale(1);
        border-radius: 8px;
    }

    .image-skeleton {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--bg-secondary);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .skeleton-loader {
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 12px;
    }

    @keyframes skeleton-loading {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }

    .zoom-indicator {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    }

    .product-image:hover .zoom-indicator {
        opacity: 1;
    }

    .zoom-indicator svg {
        width: 16px;
        height: 16px;
    }

    .image-thumbnails {
        margin-top: 1rem;
        text-align: center;
    }

    .thumbnail-indicator {
        font-size: 0.75rem;
        color: var(--text-tertiary);
        font-style: italic;
    }

    .product-info {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .product-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .product-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.2;
        flex: 1;
        margin: 0;
    }

    .product-badges {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .product-info .description {
        font-size: 1.125rem;
        margin-bottom: 1.5rem;
        color: var(--text-secondary);
        line-height: 1.6;
    }

    .price-section {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .price-card {
        background: var(--bg-secondary);
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
    }

    .price-card:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
    }

    .price-label {
        display: block;
        font-weight: 600;
        color: var(--text-secondary);
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.5rem;
    }

    .price {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary-color);
        margin: 0;
        transition: all 0.3s ease;
    }

    .price-total {
        font-size: 2.5rem;
        color: var(--success-color);
    }

    .price-animated {
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

    .action-section {
        margin-top: 2rem;
    }

    .quantity-control-wrapper {
        margin-top: 1.5rem;
    }

    .quantity-label {
        display: block;
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.75rem;
    }

    .quantity-selector.interactive {
        display: flex;
        align-items: center;
        gap: 1rem;
        background: var(--bg-secondary);
        padding: 1rem;
        border-radius: 12px;
        border: 2px solid var(--border-color);
        transition: all 0.3s ease;
    }

    .quantity-selector.interactive:hover {
        border-color: var(--primary-color);
        box-shadow: var(--shadow-md);
    }

    .quantity-display {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
    }

    .quantity-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary-color);
        transition: all 0.3s ease;
        animation: quantityChange 0.3s ease;
    }

    @keyframes quantityChange {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
    }

    .quantity-max {
        font-size: 0.75rem;
        color: var(--text-tertiary);
        font-weight: 500;
    }

    .qty-btn {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: var(--shadow-sm);
        position: relative;
        overflow: hidden;
    }

    .qty-btn::before {
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

    .qty-btn:active::before {
        width: 300px;
        height: 300px;
    }

    .qty-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, var(--primary-dark), #4338ca);
        transform: translateY(-2px) scale(1.05);
        box-shadow: var(--shadow-md);
    }

    .qty-btn:active:not(:disabled) {
        transform: translateY(0) scale(0.95);
    }

    .qty-btn:disabled,
    .qty-btn.btn-disabled {
        background: var(--bg-tertiary);
        color: var(--text-tertiary);
        cursor: not-allowed;
        opacity: 0.5;
        transform: none;
    }

    .quantity-feedback {
        margin-top: 0.75rem;
        text-align: center;
        animation: fadeIn 0.3s ease;
    }

    .feedback-text {
        font-size: 0.875rem;
        color: var(--text-secondary);
        font-style: italic;
    }

    .add-to-cart-btn {
        width: 100%;
        max-width: 300px;
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
        margin-top: 1rem;
        position: relative;
        overflow: hidden;
    }

    .add-to-cart-btn::before {
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

    .add-to-cart-btn:active::before {
        width: 400px;
        height: 400px;
    }

    .add-to-cart-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, var(--primary-dark), #4338ca);
        transform: translateY(-3px) scale(1.02);
        box-shadow: var(--shadow-xl);
    }

    .add-to-cart-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .add-to-cart-btn.btn-loading {
        background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
        cursor: wait;
    }

    .add-to-cart-btn.btn-success {
        background: linear-gradient(135deg, var(--success-color), var(--success-dark));
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

    .product-rating {
        padding: 2rem 0;
        margin-top: 3rem;
        border-top: 2px solid var(--border-color);
    }

    .rating-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        gap: 2rem;
    }

    .rating-header h2 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
    }

    .rating-summary {
        display: flex;
        align-items: center;
        gap: 2rem;
    }

    .rating-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--warning-color), var(--warning-dark));
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-lg);
        animation: ratingPulse 2s ease infinite;
    }

    @keyframes ratingPulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }

    .rating-number {
        font-size: 2rem;
        font-weight: 700;
        line-height: 1;
    }

    .rating-max {
        font-size: 0.875rem;
        opacity: 0.9;
    }

    .rating-stats {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .stat-item {
        display: flex;
        flex-direction: column;
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    .stat-label {
        font-size: 0.875rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .reviews-section {
        margin-top: 2rem;
    }

    .reviews-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
    }

    .reviews-header h3 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
    }

    .filter-reviews-btn {
        padding: 0.5rem 1rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-primary);
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .filter-reviews-btn:hover {
        background: var(--bg-tertiary);
        border-color: var(--primary-color);
        color: var(--primary-color);
    }

    .reviews {
        margin: 2rem 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .review {
        background: var(--bg-secondary);
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
        animation: reviewSlideIn 0.5s ease;
    }

    @keyframes reviewSlideIn {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .review:hover {
        box-shadow: var(--shadow-md);
        transform: translateX(4px);
        border-color: var(--primary-color);
    }

    .review-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .stars-interactive {
        display: flex;
        gap: 0.25rem;
    }

    .stars-interactive .star {
        font-size: 1.25rem;
        color: var(--text-tertiary);
        transition: all 0.2s ease;
    }

    .stars-interactive .star.filled {
        color: var(--warning-color);
        transform: scale(1.1);
    }

    .review-date {
        font-size: 0.875rem;
        color: var(--text-tertiary);
    }

    .review-text {
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
    }

    .no-reviews {
        text-align: center;
        padding: 3rem 2rem;
        color: var(--text-secondary);
    }

    .no-reviews svg {
        color: var(--text-tertiary);
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    .no-reviews p {
        font-size: 1.125rem;
        margin: 0;
    }

    .submit-rating-card {
        margin-top: 2rem;
        padding: 2rem;
        background: var(--bg-secondary);
        border-radius: 12px;
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
    }

    .submit-rating-card:hover {
        box-shadow: var(--shadow-md);
    }

    .submit-rating-card h3 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 1.5rem;
    }

    .rating-input-section {
        margin-bottom: 1.5rem;
    }

    .rating-input-label {
        display: block;
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.75rem;
    }

    .stars-input.interactive {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        direction: ltr;
    }

    .stars-input.interactive .star {
        font-size: 2.5rem;
        color: var(--text-tertiary);
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
    }

    .stars-input.interactive .star.filled {
        color: var(--warning-color);
        transform: scale(1.1);
    }

    .stars-input.interactive .star.hovered {
        color: var(--warning-light);
        transform: scale(1.15);
    }

    .stars-input.interactive .star:hover {
        transform: scale(1.2);
        color: var(--warning-light);
    }

    .rating-hint {
        margin-left: 1rem;
        font-size: 1rem;
        font-weight: 600;
        color: var(--warning-color);
        animation: fadeIn 0.3s ease;
    }

    .review-text-section {
        margin-bottom: 1.5rem;
    }

    .review-text-label {
        display: block;
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.75rem;
    }

    .review-textarea {
        width: 100%;
        min-height: 120px;
        resize: vertical;
        padding: 1rem;
        font-size: 1rem;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-primary);
        color: var(--text-primary);
        font-family: 'Montserrat', sans-serif;
        transition: all 0.3s ease;
    }

    .review-textarea.has-focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .review-textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .review-textarea::placeholder {
        color: var(--text-tertiary);
    }

    .char-counter {
        margin-top: 0.5rem;
        text-align: right;
        font-size: 0.875rem;
        color: var(--text-tertiary);
    }

    .char-counter .char-warning {
        color: var(--warning-color);
        font-weight: 600;
    }

    .submit-btn {
        width: 100%;
        max-width: 300px;
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
        position: relative;
        overflow: hidden;
    }

    .submit-btn::before {
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

    .submit-btn:active::before {
        width: 400px;
        height: 400px;
    }

    .submit-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, var(--primary-dark), #4338ca);
        transform: translateY(-3px) scale(1.02);
        box-shadow: var(--shadow-xl);
    }

    .submit-btn:disabled {
        background: var(--bg-tertiary);
        color: var(--text-tertiary);
        cursor: not-allowed;
        opacity: 0.6;
        transform: none;
    }

    .submit-btn.btn-loading {
        cursor: wait;
    }

    /* Transition animations */
    .review-fade-enter-active,
    .review-fade-leave-active {
        transition: all 0.3s ease;
    }

    .review-fade-enter-from {
        opacity: 0;
        transform: translateY(-20px);
    }

    .review-fade-leave-to {
        opacity: 0;
        transform: translateY(20px);
    }

    @media (max-width: 968px) {
        .product-detail {
            grid-template-columns: 1fr;
            gap: 2rem;
        }

        .product-image {
            max-width: 100%;
        }

        .product-info h1 {
            font-size: 2rem;
        }

        .product-info .row {
            grid-template-columns: 1fr;
        }
    }

    .loading-state,
    .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        text-align: center;
        color: var(--text-secondary);
    }

    .loading-state .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid var(--border-color);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .error-state svg {
        color: var(--danger-color);
        opacity: 0.7;
        margin-bottom: 1rem;
    }

    .error-state p {
        font-size: 1.125rem;
        font-weight: 500;
        margin-bottom: 1rem;
        color: var(--text-primary);
    }

    .btn-retry {
        padding: 0.75rem 1.5rem;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-retry:hover {
        background: var(--primary-dark);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
    }

    @media (max-width: 768px) {
        .product-detail-container {
            margin: 1rem auto;
            padding: 1.5rem;
        }

        .product-info h1 {
            font-size: 1.75rem;
        }

        .product-info .price {
            font-size: 1.5rem;
        }

        .quantity-selector {
            flex-wrap: wrap;
        }

        .quantity-selector input {
            width: 100%;
            max-width: 120px;
        }

        .add-to-cart-btn,
        .submit-btn {
            width: 100%;
            max-width: 100%;
        }

        .product-rating h2 {
            font-size: 1.5rem;
        }

        .stars-input .star {
            font-size: 1.5rem;
        }
    }
</style>