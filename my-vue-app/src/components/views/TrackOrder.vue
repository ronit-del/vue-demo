<template>
  <div class="track-order-page">
    <div class="container">
      <h1 class="page-title">Track Your Order</h1>
      
      <div class="search-section" v-if="!orderData">
        <div class="search-card">
          <p class="search-description">Enter your order number to track your order status</p>
          <form @submit.prevent="trackOrder" class="search-form">
            <input
              type="text"
              v-model="orderNumber"
              placeholder="Enter Order Number (e.g., ORD-1234567890-ABC123)"
              class="search-input"
              required
            />
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading">Tracking...</span>
              <span v-else>Track Order</span>
            </button>
          </form>
          <p v-if="error" class="error-message">{{ error }}</p>
        </div>
      </div>

      <!-- Order Details -->
      <div v-if="orderData && !loading" class="order-details">
        <div class="status-card">
          <div class="status-header">
            <h2>Order Status</h2>
            <span class="status-badge" :class="getStatusClass(orderData.status)">
              {{ orderData.status }}
            </span>
          </div>

          <div class="status-timeline">
            <div class="timeline-item" :class="{ active: isStatusActive('Pending'), completed: isStatusCompleted('Pending') }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h4>Order Placed</h4>
                <p>Your order has been received</p>
              </div>
            </div>
            <div class="timeline-item" :class="{ active: isStatusActive('Processing'), completed: isStatusCompleted('Processing') }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h4>Processing</h4>
                <p>We're preparing your order</p>
              </div>
            </div>
            <div class="timeline-item" :class="{ active: isStatusActive('Shipped'), completed: isStatusCompleted('Shipped') }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h4>Shipped</h4>
                <p>Your order is on the way</p>
              </div>
            </div>
            <div class="timeline-item" :class="{ active: isStatusActive('Delivered'), completed: isStatusCompleted('Delivered') }">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <h4>Delivered</h4>
                <p>Order delivered successfully</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Cancellation Reason (shown only if order is cancelled) -->
        <div v-if="orderData.status === 'Cancelled' && orderData.cancellation_reason" class="cancellation-card">
          <div class="cancellation-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Cancellation Reason</h3>
          </div>
          <div class="cancellation-content">
            <p>{{ orderData.cancellation_reason }}</p>
          </div>
        </div>

        <!-- Order Information -->
        <div class="info-grid">
          <div class="info-card">
            <h3>Order Information</h3>
            <div class="info-item">
              <span class="label">Order Number:</span>
              <span class="value">{{ orderData.order_number }}</span>
            </div>
            <div class="info-item">
              <span class="label">Order Date:</span>
              <span class="value">{{ formatDate(orderData.created_at) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Payment Method:</span>
              <span class="value">{{ orderData.payment_type || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Total Amount:</span>
              <span class="value amount">${{ formatCurrency(orderData.total_amount) }}</span>
            </div>
          </div>

          <div class="info-card">
            <h3>Shipping Address</h3>
            <div class="address-info">
              <p><strong>{{ orderData.customer.name }}</strong></p>
              <p>{{ orderData.customer.address }}</p>
              <p>{{ orderData.customer.country }} {{ orderData.customer.postal_code }}</p>
              <p v-if="orderData.customer.phone">Phone: {{ orderData.customer.phone }}</p>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="items-card">
          <h3>Order Items</h3>
          <div class="items-list">
            <div v-for="item in orderData.items" :key="item.id" class="item-row">
              <div class="item-image" v-if="item.product_image">
                <img :src="item.product_image" :alt="item.product_name" />
              </div>
              <div class="item-details">
                <h4>{{ item.product_name }}</h4>
                <p class="item-code" v-if="item.product_code">Code: {{ item.product_code }}</p>
              </div>
              <div class="item-quantity">
                <span>Qty: {{ item.quantity }}</span>
              </div>
              <div class="item-price">
                <span>${{ formatCurrency(item.total_amount) }}</span>
              </div>
            </div>
          </div>
          <div class="items-total">
            <strong>Total: ${{ formatCurrency(orderData.total_amount) }}</strong>
          </div>
        </div>

        <div class="actions">
          <button @click="resetTracking" class="btn btn-secondary">Track Another Order</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 10000,
});

export default {
  name: 'TrackOrder',
  data() {
    return {
      orderNumber: this.$route.params.orderNumber || '',
      orderData: null,
      loading: false,
      error: null
    };
  },

  mounted() {
    if (this.orderNumber) {
      this.trackOrder();
    }
  },

  methods: {
    async trackOrder() {
      if (!this.orderNumber) {
        this.error = 'Please enter an order number';
        return;
      }

      this.loading = true;
      this.error = null;
      this.orderData = null;

      try {
        const response = await api.get(`/api/tracking/order/${this.orderNumber}`);
        
        if (response.data.success && response.data.data) {
          this.orderData = response.data.data;
        } else {
          this.error = response.data.message || 'Order not found';
        }
      } catch (error) {
        console.error('Tracking error:', error);
        this.error = error.response?.data?.message || 'Failed to track order. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    resetTracking() {
      this.orderData = null;
      this.orderNumber = '';
      this.error = null;
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

    isStatusActive(status) {
      return this.orderData.status === status;
    },

    isStatusCompleted(status) {
      const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered'];
      const currentIndex = statusOrder.indexOf(this.orderData.status);
      const checkIndex = statusOrder.indexOf(status);
      return checkIndex >= 0 && checkIndex < currentIndex;
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatCurrency(value) {
      return parseFloat(value || 0).toFixed(2);
    }
  }
};
</script>

<style scoped>
.track-order-page {
  min-height: calc(100vh - 200px);
  padding: 2rem;
  background: #f5f5f5;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
}

/* Search Section */
.search-section {
  margin-bottom: 2rem;
}

.search-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.search-description {
  color: #666;
  margin-bottom: 1.5rem;
  text-align: center;
}

.search-form {
  display: flex;
  gap: 1rem;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
  text-align: center;
}

/* Order Details */
.order-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.status-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

.status-pending { background: #ffc107; color: #000; }
.status-processing { background: #667eea; color: #fff; }
.status-shipped { background: #17a2b8; color: #fff; }
.status-delivered { background: #28a745; color: #fff; }
.status-cancelled { background: #dc3545; color: #fff; }
.status-refunded { background: #ffc107; color: #000; }

/* Timeline */
.status-timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  opacity: 0.5;
}

.timeline-item.active,
.timeline-item.completed {
  opacity: 1;
}

.timeline-dot {
  position: absolute;
  left: -1.5rem;
  top: 0.25rem;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e0e0e0;
  border: 3px solid white;
  z-index: 1;
}

.timeline-item.active .timeline-dot {
  background: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
}

.timeline-item.completed .timeline-dot {
  background: #28a745;
}

.timeline-content h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
}

.timeline-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-card h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.25rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  color: #666;
}

.value {
  color: #333;
  font-weight: 600;
}

.value.amount {
  color: #667eea;
  font-size: 1.1rem;
}

.address-info p {
  margin: 0.5rem 0;
  color: #666;
}

/* Items Card */
.items-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.items-card h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.item-row:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-details h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
}

.item-code {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.item-quantity,
.item-price {
  color: #666;
  font-weight: 600;
}

.items-total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e0e0e0;
  text-align: right;
  font-size: 1.25rem;
  color: #333;
}

.actions {
  text-align: center;
  margin-top: 1rem;
}

/* Cancellation Card */
.cancellation-card {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-left: 4px solid #ffc107;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.cancellation-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.cancellation-header svg {
  color: #856404;
  flex-shrink: 0;
}

.cancellation-header h3 {
  margin: 0;
  color: #856404;
  font-size: 1.125rem;
  font-weight: 600;
}

.cancellation-content {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #ffc107;
}

.cancellation-content p {
  margin: 0;
  color: #856404;
  line-height: 1.6;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .track-order-page {
    padding: 1rem;
  }

  .search-form {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .item-row {
    flex-wrap: wrap;
  }
}
</style>