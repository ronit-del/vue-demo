<template>
    <div class="my-orders-container">
        <div class="orders-header">
            <h1 class="page-title">My Orders</h1>
            <p class="page-subtitle">View your order history and leave reviews</p>
        </div>

        <!-- View Controls -->
        <div v-if="!loading && !error && orders.length > 0" class="view-controls">
            <div class="view-controls-left">
                <p class="orders-count">
                    Showing {{ paginatedOrders.length }} of {{ totalOrders }} order{{ totalOrders !== 1 ? 's' : '' }}
                </p>
            </div>
            <div class="view-controls-right">
                <select v-model="itemsPerPage" @change="currentPage = 1" class="items-per-page-select">
                    <option :value="5">5 per page</option>
                    <option :value="10">10 per page</option>
                    <option :value="20">20 per page</option>
                    <option :value="50">50 per page</option>
                </select>
            </div>
        </div>

        <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading your orders...</p>
        </div>

        <div v-else-if="error" class="error-state">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 16V24M24 32H24.02M42 24C42 33.9411 33.9411 42 24 42C14.0589 42 6 33.9411 6 24C6 14.0589 14.0589 6 24 6C33.9411 6 42 14.0589 42 24Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>{{ error }}</p>
            <button class="btn btn-primary" @click="fetchOrders">Retry</button>
        </div>

        <div v-else-if="orders.length === 0" class="empty-state">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12H52L50 28H14L12 12ZM12 12L10 4M18 36H22M46 36H42" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20 44C20.5523 44 21 43.5523 21 43C21 42.4477 20.5523 42 20 42C19.4477 42 19 42.4477 19 43C19 43.5523 19.4477 44 20 44Z" stroke="currentColor" stroke-width="2"/>
                <path d="M42 44C42.5523 44 43 43.5523 43 43C43 42.4477 42.5523 42 42 42C41.4477 42 41 42.4477 41 43C41 43.5523 41.4477 44 42 44Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <h3>No Orders Yet</h3>
            <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <router-link to="/products" class="btn btn-primary">Browse Products</router-link>
        </div>

        <!-- Table View -->
        <div v-else-if="viewMode === 'table'" class="orders-table-container">
            <table class="orders-table">
                <thead>
                    <tr>
                        <th>Order Number</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Status</th>
                        <th>Subtotal<br>(Tax 10%)</th>
                        <th>Total</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="order in paginatedOrders" :key="order.id" class="order-row">
                        <td class="order-number-cell">
                            <strong>#{{ order.order_number }}</strong>
                        </td>
                        <td class="order-date-cell">
                            {{ formatDateShort(order.date) }}
                        </td>
                        <td class="order-items-cell">
                            <div class="table-items-list">
                                <div v-for="item in order.order_items" :key="item.id" class="table-item">
                                    <span class="table-item-name" :title="item.product_name">{{ item.product_name || 'Product' }}</span>
                                    <img :src="item.product_image" alt="Preview" class="product-image" loading="lazy"/>
                                    <span class="table-item-qty">x{{ item.quantity }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="order-status-cell">
                            <span class="status-badge" :class="getStatusClass(order.status)">
                                {{ order.status }}
                            </span>
                        </td>
                        <td class="order-subtotal-cell">
                            ${{ formatCurrency(getOrderSubtotal(order)) }}
                            (${{ formatCurrency(getOrderTax(order)) }})
                        </td>
                        <td class="order-total-cell">
                            <strong>
                                ${{ 
                                    (
                                        Number(formatCurrency(order.total)) 
                                        + 
                                        Number(formatCurrency(getOrderTax(order)))
                                    ).toFixed(2) 
                                }}
                            </strong>
                        </td>
                        <td class="order-actions-cell">
                            <router-link :to="`/track-order/${order.order_number}`" class="btn-table" @click="openInNewTab(order)">
                                Track
                            </router-link>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Card View -->
        <div v-else class="orders-list" :class="`view-${viewMode}`">
            <div v-for="order in paginatedOrders" :key="order.id" class="order-card" :class="`order-card-${viewMode}`">
                <div class="order-header">
                    <div class="order-info">
                        <h3 class="order-number">Order #{{ order.order_number }}</h3>
                        <span class="order-date">{{ formatDate(order.date) }}</span>
                    </div>
                    <div class="order-status">
                        <span class="status-badge" :class="getStatusClass(order.status)">
                            {{ order.status }}
                        </span>
                    </div>
                </div>

                <div class="order-items">
                    <div v-for="item in order.order_items" :key="item.id" class="order-item">
                        <div class="item-image">
                            <img :src="item.product_image || '/placeholder-image.jpg'" :alt="item.product_name || 'Product'" @error="handleImageError">
                        </div>
                        <div class="item-details">
                            <h4 class="item-name">{{ item.product_name || 'Product' }}</h4>
                            <p class="item-code">Code: {{ item.product_code || 'N/A' }}</p>
                            <div class="item-meta">
                                <span class="item-price">${{ formatCurrency(item.base_price) }}</span>
                                <span class="item-quantity">Qty: {{ item.quantity }}</span>
                                <span class="item-total">Total: ${{ formatCurrency(item.total_amount) }}</span>
                            </div>
                        </div>
                        <div class="item-actions" v-if="order.status === 'Delivered'">
                            <button 
                                v-if="!item.hasReview" 
                                class="btn-review" 
                                @click="openReviewModal(item, order)"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 2L12.09 7.26L18 8.27L14 12.14L14.91 18.02L10 15.77L5.09 18.02L6 12.14L2 8.27L7.91 7.26L10 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Review & Rate
                            </button>
                            <div v-else class="reviewed-badge">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 10L9 12L13 8M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Reviewed
                            </div>
                        </div>
                    </div>
                </div>

                <div class="order-footer">
                    <div class="order-summary">
                        <div class="summary-row">
                            <span class="summary-label">Subtotal(Tax (10%)):</span>
                            <span class="summary-value">${{ formatCurrency(getOrderSubtotal(order)) }}</span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Tax (10%):</span>
                            <span class="summary-value">${{ formatCurrency(getOrderTax(order)) }}</span>
                        </div>
                        <div class="summary-divider"></div>
                        <div class="summary-row summary-total">
                            <span class="summary-label">Total Amount:</span>
                            <span class="summary-value">${{ formatCurrency(order.total + getOrderTax(order)) }}</span>
                        </div>
                    </div>
                    <div class="order-actions">
                        <router-link :to="`/track-order/${order.order_number}`" class="btn btn-secondary">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 9C1 9 4 4 9 4C14 4 17 9 17 9C17 9 14 14 9 14C4 14 1 9 1 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M9 11C10.1046 11 11 10.1046 11 9C11 7.89543 10.1046 7 9 7C7.89543 7 7 7.89543 7 9C7 10.1046 7.89543 11 9 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Track Order
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && !error && orders.length > 0 && totalPages > 1" class="pagination">
            <button 
                class="pagination-btn" 
                :disabled="currentPage === 1"
                @click="currentPage = 1"
                title="First Page"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 5L6 10L11 15M15 5L10 10L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <button 
                class="pagination-btn" 
                :disabled="currentPage === 1"
                @click="currentPage--"
                title="Previous Page"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5L7 10L12 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            
            <div class="pagination-pages">
                <button
                    v-for="page in visiblePages"
                    :key="page"
                    class="pagination-page"
                    :class="{ active: page === currentPage }"
                    @click="currentPage = page"
                >
                    {{ page }}
                </button>
            </div>
            
            <button 
                class="pagination-btn" 
                :disabled="currentPage === totalPages"
                @click="currentPage++"
                title="Next Page"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <button 
                class="pagination-btn" 
                :disabled="currentPage === totalPages"
                @click="currentPage = totalPages"
                title="Last Page"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5L14 10L9 15M5 5L10 10L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>

        <div v-if="showReviewModal" class="modal-overlay" @click="closeReviewModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Review & Rate Product</h3>
                    <button class="modal-close" @click="closeReviewModal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="product-review-info">
                        <img :src="currentReviewItem.product_image || '/placeholder-image.jpg'" :alt="currentReviewItem.product_name" @error="handleImageError">
                        <div>
                            <h4>{{ currentReviewItem.product_name || 'Product' }}</h4>
                            <p>Code: {{ currentReviewItem.product_code || 'N/A' }}</p>
                        </div>
                    </div>
                    <div class="rating-section">
                        <label class="rating-label">Your Rating</label>
                        <div class="star-rating">
                            <button
                                v-for="star in 5"
                                :key="star"
                                class="star-btn"
                                :class="{ 'active': star <= (hoveredRating || selectedRating), 'hovered': star <= hoveredRating }"
                                @click="selectedRating = star"
                                @mouseenter="hoveredRating = star"
                                @mouseleave="hoveredRating = 0"
                            >
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 2L19.09 10.26L28 11.27L21 18.14L22.82 27.02L16 23.77L9.18 27.02L11 18.14L4 11.27L12.91 10.26L16 2Z" :fill="star <= (hoveredRating || selectedRating) ? '#FBBF24' : 'none'" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="review-section">
                        <label class="review-label">Your Review</label>
                        <textarea
                            v-model="reviewText"
                            class="review-textarea"
                            placeholder="Share your experience with this product..."
                            rows="5"
                        ></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="closeReviewModal">Cancel</button>
                    <button 
                        class="btn btn-primary" 
                        @click="submitReview"
                        :disabled="!selectedRating || submittingReview"
                    >
                        <span v-if="submittingReview" class="btn-content">
                            <span class="spinner-small"></span>
                            Submitting...
                        </span>
                        <span v-else>Submit Review</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getUserOrders, getProductRatingData, productRatingData } from '../../services/api';

export default {
    name: 'MyOrders',
    data() {
        return {
            user: JSON.parse(localStorage.getItem('user')) || null,
            orders: [],
            loading: true,
            error: null,
            showReviewModal: false,
            currentReviewItem: {},
            selectedRating: 0,
            hoveredRating: 0,
            reviewText: '',
            submittingReview: false,
            productRatings: {},
            viewMode: 'table', // 'card' or 'table'
            currentPage: 1,
            itemsPerPage: 10
        };
    },

    computed: {
        totalOrders() {
            return this.orders.length;
        },

        totalPages() {
            return Math.ceil(this.totalOrders / this.itemsPerPage);
        },

        paginatedOrders() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.orders.slice(start, end);
        },

        visiblePages() {
            const pages = [];
            const maxVisible = 5;
            let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
            let end = Math.min(this.totalPages, start + maxVisible - 1);

            if (end - start < maxVisible - 1) {
                start = Math.max(1, end - maxVisible + 1);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            return pages;
        }
    },

    methods: {
        async fetchOrders() {
            if (!this.user || !this.user.id) {
                this.error = 'Please login to view your orders';
                this.loading = false;
                return;
            }

            this.loading = true;
            this.error = null;

            try {
                const response = await getUserOrders(this.user.id);
                if (response.success && response.data) {
                    this.orders = response.data.map(order => ({
                        ...order,
                        order_items: order.order_items || []
                    }));

                    await this.fetchExistingRatings();
                } else {
                    this.orders = [];
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
                this.error = 'Failed to load your orders. Please try again.';
                this.orders = [];
            } finally {
                this.loading = false;
            }
        },

        async fetchExistingRatings() {
            if (!this.user || !this.user.id) return;

            for (const order of this.orders) {
                for (const item of order.order_items) {
                    if (item.product_id) {
                        try {
                            const ratingResponse = await getProductRatingData({
                                user_id: this.user.id,
                                product_id: item.product_id
                            });

                            if (ratingResponse.success && ratingResponse.data && ratingResponse.data.length > 0) {
                                const rating = ratingResponse.data[0];
                                item.hasReview = true;
                                item.userRating = rating.rating;
                                item.userReview = rating.review;
                                this.productRatings[item.product_id] = rating;
                            } else {
                                item.hasReview = false;
                            }
                        } catch (error) {
                            console.error(`Error fetching rating for product ${item.product_id}:`, error);
                            item.hasReview = false;
                        }
                    }
                }
            }
        },

        openReviewModal(item, order) {
            this.currentReviewItem = {
                ...item,
                order_id: order.id,
                order_number: order.order_number
            };
            this.selectedRating = 0;
            this.hoveredRating = 0;
            this.reviewText = '';
            this.showReviewModal = true;
        },

        closeReviewModal() {
            this.showReviewModal = false;
            this.currentReviewItem = {};
            this.selectedRating = 0;
            this.hoveredRating = 0;
            this.reviewText = '';
        },

        async submitReview() {
            if (!this.selectedRating) {
                alert('Please select a rating');
                return;
            }

            if (!this.user || !this.user.id) {
                alert('Please login to submit a review');
                return;
            }

            this.submittingReview = true;

            try {
                const response = await productRatingData({
                    user_id: this.user.id,
                    product_id: this.currentReviewItem.product_id,
                    rating: this.selectedRating,
                    review: this.reviewText.trim() || ''
                });

                if (response.success) {
                    // Update the item to show it's been reviewed
                    const order = this.orders.find(o => o.id === this.currentReviewItem.order_id);
                    if (order) {
                        const item = order.order_items.find(i => i.id === this.currentReviewItem.id);
                        if (item) {
                            item.hasReview = true;
                            item.userRating = this.selectedRating;
                            item.userReview = this.reviewText.trim();
                        }
                    }

                    alert('Thank you for your review!');
                    this.closeReviewModal();
                } else {
                    alert(response.message || 'Failed to submit review. Please try again.');
                }
            } catch (error) {
                console.error('Error submitting review:', error);
                alert(error.response?.data?.message || 'Failed to submit review. Please try again.');
            } finally {
                this.submittingReview = false;
            }
        },

        getStatusClass(status) {
            const statusMap = {
                'Pending': 'status-pending',
                'Processing': 'status-processing',
                'Shipped': 'status-shipped',
                'Delivered': 'status-delivered',
                'Cancelled': 'status-cancelled',
                'Refunded': 'status-refunded'
            };
            return statusMap[status] || 'status-default';
        },

        formatCurrency(value) {
            return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
        },

        formatDate(date) {
            if (!date) return 'N/A';
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(date));
        },

        formatDateShort(date) {
            if (!date) return 'N/A';
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }).format(new Date(date));
        },

        getOrderSubtotal(order) {
            if (!order.order_items || order.order_items.length === 0) {
                return 0;
            }
            return order.order_items.reduce((sum, item) => {
                return sum + (parseFloat(item.total_amount) || 0);
            }, 0);
        },

        getOrderTax(order) {
            const subtotal = this.getOrderSubtotal(order);
            return subtotal * 0.1; // 10% tax
        },

        handleImageError(event) {
            event.target.src = '/placeholder-image.jpg';
        },

        openInNewTab(event) {
            const url = this.$router.resolve(`/track-order/${event.order_number}`).href;
            window.open(url, '_blank');
        }
    },

    watch: {
        currentPage() {
            // Scroll to top when page changes
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    async mounted() {
        if (!this.user) {
            this.$router.push('/login');
            return;
        }
        await this.fetchOrders();
    }
};
</script>

<style scoped>
.my-orders-container {
    max-width: 1200px;
    margin: 0px auto;
    padding: 2rem;
    min-height: calc(100vh - 200px);
}

.orders-header {
    text-align: center;
    margin-bottom: 2rem;
}

.page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.page-subtitle {
    font-size: 1rem;
    color: var(--text-secondary);
}

.loading-state,
.error-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 4rem 2rem;
    text-align: center;
    color: var(--text-secondary);
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.error-state svg {
    color: var(--danger-color);
    opacity: 0.7;
}

.empty-state svg {
    color: var(--text-tertiary);
    opacity: 0.5;
}

.empty-state h3 {
    font-size: 1.5rem;
    color: var(--text-primary);
    margin: 0.5rem 0;
}

.view-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #d0d0d1;
    border-radius: 8px;
    flex-wrap: wrap;
    gap: 1rem;
}

.view-controls-left {
    display: flex;
    align-items: center;
}

.orders-count {
    font-size: 0.875rem;
    color: #000000;
    margin: 0;
}

.view-controls-right {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.view-toggle {
    display: flex;
    gap: 0.5rem;
    background: var(--bg-primary);
    border-radius: 8px;
    padding: 0.25rem;
    border: 1px solid var(--border-color);
}

.view-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.view-btn:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.view-btn.active {
    background: var(--primary-color);
    color: white;
}

.items-per-page-select {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.items-per-page-select:hover {
    border-color: var(--primary-color);
}

.items-per-page-select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.orders-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.orders-list.view-compact {
    gap: 1rem;
}

/* Table View Styles */
.orders-table-container {
    overflow-x: auto;
    margin-bottom: 2rem;
}

.orders-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--bg-primary);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
}

.orders-table thead {
    background: var(--bg-secondary);
}

.orders-table th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid var(--border-color);
}

.orders-table tbody tr {
    border-bottom: 1px solid var(--border-color);
    transition: background-color 0.2s ease;
}

.orders-table tbody tr:hover {
    background: var(--bg-secondary);
}

.orders-table tbody tr:last-child {
    border-bottom: none;
}

.orders-table td {
    padding: 1rem;
    font-size: 0.875rem;
    color: var(--text-primary);
    vertical-align: top;
}

.order-number-cell {
    font-weight: 600;
    color: var(--primary-color);
}

.order-date-cell {
    color: var(--text-secondary);
    white-space: nowrap;
}

.order-items-cell {
    max-width: 200px;
}

.table-items-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.product-image{
    width: 50px;
    object-fit: cover;
}

.table-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
}

.table-item-name {
    flex: 1;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.table-item-qty {
    color: var(--text-secondary);
    font-weight: 600;
}

.order-status-cell {
    white-space: nowrap;
}

.order-subtotal-cell,
.order-tax-cell {
    color: var(--text-secondary);
    white-space: nowrap;
}

.order-total-cell {
    font-size: 1rem;
    color: var(--primary-color);
    white-space: nowrap;
}

.order-actions-cell {
    white-space: nowrap;
}

.btn-table {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-table:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
}

.order-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s ease;
}

.order-card:hover {
    box-shadow: var(--shadow-md);
}

.order-card-compact {
    padding: 1rem;
}

.order-card-compact .order-header {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
}

.order-card-compact .order-items {
    margin-bottom: 1rem;
    gap: 0.75rem;
}

.order-card-compact .order-item {
    padding: 0.75rem;
}

.order-card-compact .item-image {
    width: 60px;
    height: 60px;
}

.order-card-compact .order-footer {
    padding-top: 0.75rem;
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
    flex-wrap: wrap;
    gap: 1rem;
}

.order-info {
    flex: 1;
}

.order-number {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.order-date {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.status-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-pending {
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning-color);
}

.status-processing {
    background: rgba(99, 102, 241, 0.1);
    color: var(--primary-color);
}

.status-shipped {
    background: rgba(59, 130, 246, 0.1);
    color: var(--info-color);
}

.status-delivered {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
}

.status-cancelled {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
}

.status-refunded {
    background: rgba(139, 92, 246, 0.1);
    color: var(--secondary-color);
}

.status-default {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
}

.order-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.order-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    align-items: center;
}

.item-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    background: var(--bg-tertiary);
}

.item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.item-details {
    flex: 1;
    min-width: 0;
}

.item-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.item-code {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
}

.item-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    flex-wrap: wrap;
}

.item-price,
.item-total {
    font-weight: 600;
    color: var(--text-primary);
}

.item-actions {
    flex-shrink: 0;
}

.btn-review {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
}

.btn-review:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.reviewed-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
}

.order-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
    flex-wrap: wrap;
    gap: 1.5rem;
}

.order-summary {
    flex: 1;
    min-width: 200px;
}

.order-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    font-size: 0.875rem;
}

.summary-label {
    color: var(--text-secondary);
    font-weight: 500;
}

.summary-value {
    color: var(--text-primary);
    font-weight: 600;
}

.summary-divider {
    height: 1px;
    background: var(--border-color);
    margin: 0.5rem 0;
}

.summary-total {
    padding-top: 0.75rem;
    margin-top: 0.25rem;
    border-top: 1px solid var(--border-color);
}

.summary-total .summary-label {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.summary-total .summary-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary-color);
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    box-shadow: var(--shadow-sm);
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    white-space: nowrap;
}

.btn-secondary:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.modal-content {
    background: var(--bg-primary);
    border-radius: 12px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-xl);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.modal-close:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.modal-body {
    padding: 1.5rem;
}

.product-review-info {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.product-review-info img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
}

.product-review-info h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.product-review-info p {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.rating-section,
.review-section {
    margin-bottom: 1.5rem;
}

.rating-label,
.review-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.star-rating {
    display: flex;
    gap: 0.5rem;
}

.star-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: transform 0.2s ease;
}

.star-btn:hover {
    transform: scale(1.1);
}

.star-btn.active svg path {
    fill: #FBBF24;
}

.review-textarea {
    width: 100%;
    padding: 1rem;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.875rem;
    font-family: inherit;
    background: var(--bg-secondary);
    color: var(--text-primary);
    resize: vertical;
    transition: all 0.3s ease;
}

.review-textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid var(--border-color);
}

.btn-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@media (max-width: 768px) {
    .my-orders-container {
        padding: 1rem;
        margin-top: 1rem;
    }

    .page-title {
        font-size: 2rem;
    }

    .order-header {
        flex-direction: column;
    }

    .order-item {
        flex-direction: column;
        align-items: flex-start;
    }

    .item-actions {
        width: 100%;
    }

    .btn-review {
        width: 100%;
        justify-content: center;
    }

    .order-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .order-actions {
        width: 100%;
        margin-top: 0.5rem;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }

    .modal-content {
        margin: 1rem;
    }

    .view-controls {
        flex-direction: column;
        align-items: stretch;
    }

    .view-controls-right {
        width: 100%;
        justify-content: space-between;
    }

    .orders-table-container {
        overflow-x: scroll;
    }

    .orders-table {
        min-width: 800px;
    }

    .orders-table th,
    .orders-table td {
        padding: 0.75rem 0.5rem;
        font-size: 0.8125rem;
    }

    .order-items-cell {
        max-width: 150px;
    }
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 2rem;
    padding: 1rem;
    flex-wrap: wrap;
}

.pagination-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-primary);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: translateY(-1px);
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-pages {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.pagination-page {
    min-width: 40px;
    height: 40px;
    padding: 0 0.75rem;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-primary);
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.pagination-page:hover {
    background: var(--bg-secondary);
    border-color: var(--primary-color);
}

.pagination-page.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

@media (max-width: 768px) {
    .pagination {
        gap: 0.25rem;
    }

    .pagination-btn,
    .pagination-page {
        width: 36px;
        height: 36px;
        min-width: 36px;
        padding: 0 0.5rem;
        font-size: 0.875rem;
    }

    .pagination-pages {
        gap: 0.25rem;
    }
}
</style>

