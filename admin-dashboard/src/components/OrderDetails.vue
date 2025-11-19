<template>
  <div class="order-details-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <button class="btn-back" @click="$router.push('/orders')">
            <div class="dflex">
              <div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16L6 10L12 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div>
                <span>
                  Back to Order(s) List
                </span>
              </div>
            </div>
          </button>
          <!-- <div>
            <h1 class="page-title">Order Details</h1>
            <p class="page-subtitle">Order: {{ order.order_number || 'Loading...' }}</p>
          </div> -->
        </div>
        <div class="header-actions" v-if="order.status !== 'Cancelled'">
          <button class="btn btn-primary" @click="$router.push(`/orders/${order.id}/edit`)">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 3L15 7L5 17H1V13L11 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M9 5L13 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            Edit Order
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading order details...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M24 16V24M24 32H24.02M42 24C42 33.9411 33.9411 42 24 42C14.0589 42 6 33.9411 6 24C6 14.0589 14.0589 6 24 6C33.9411 6 42 14.0589 42 24Z"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
        />
      </svg>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="fetchOrder">Retry</button>
    </div>

    <div v-else class="details-content">
      <!-- Order Status Card -->
      <div class="status-card">
        <div class="status-header">
          <span class="status-label">Order Status</span>
          <span class="status-badge" :class="getStatusClass(order.status)">
            {{ order.status }}
          </span>
        </div>
        <div class="status-info">
          <div class="info-item">
            <span class="info-label">Order Date</span>
            <span class="info-value">{{ formatDate(order.date) }}</span>
          </div>
          <div class="info-item" v-if="order.updated_at">
            <span class="info-label">Last Updated</span>
            <span class="info-value">{{ formatDate(order.updated_at) }}</span>
          </div>
        </div>
        <div v-if="order.status === 'Cancelled' && order.cancellation_reason" class="cancellation-reason">
          <div class="cancellation-header">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 6V10M10 14H10.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="cancellation-label">Cancellation Reason</span>
          </div>
          <div class="cancellation-text">{{ order.cancellation_reason }}</div>
        </div>
      </div>

      <div class="details-grid">
        <div class="detail-card">
          <div class="card-header">
            <h3 class="card-title">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17 19V17C17 15.9391 16.5786 14.9217 15.8284 14.1716C15.0783 13.4214 14.0609 13 13 13H7C5.93913 13 4.92172 13.4214 4.17157 14.1716C3.42143 14.9217 3 15.9391 3 17V19"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M10 9C12.2091 9 14 7.20914 14 5C14 2.79086 12.2091 1 10 1C7.79086 1 6 2.79086 6 5C6 7.20914 7.79086 9 10 9Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Customer Information
            </h3>
          </div>
          <div class="card-body">
            <div class="detail-row">
              <span class="detail-label">Name</span>
              <span class="detail-value">{{ order.customer || 'N/A' }}</span>
            </div>
            <div class="detail-row" v-if="order.customer_email">
              <span class="detail-label">Email</span>
              <span class="detail-value">
                <a :href="`mailto:${order.customer_email}`">{{ order.customer_email }}</a>
              </span>
            </div>
            <div class="detail-row" v-if="order.customer_phone">
              <span class="detail-label">Phone</span>
              <span class="detail-value">
                <a :href="`tel:${order.customer_phone}`">{{ order.customer_phone }}</a>
              </span>
            </div>
            <div class="detail-row" v-if="order.customer_address">
              <span class="detail-label">Address</span>
              <span class="detail-value">{{ order.customer_address }}</span>
            </div>
            <div class="detail-row" v-if="order.customer_country || order.customer_postal_code">
              <span class="detail-label">Location</span>
              <span class="detail-value">
                {{ [formatCountry(order.customer_country), order.customer_postal_code].filter(Boolean).join(', ') || 'N/A' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Order Information -->
        <div class="detail-card">
          <div class="card-header">
            <h3 class="card-title">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H17L16 11H4L3 3ZM3 3L2 1M5 15H7M17 15H13" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M9 19C9.55228 19 10 18.5523 10 18C10 17.4477 9.55228 17 9 17C8.44772 17 8 17.4477 8 18C8 18.5523 8.44772 19 9 19Z"
                  stroke="currentColor" stroke-width="2" />
                <path
                  d="M15 19C15.5523 19 16 18.5523 16 18C16 17.4477 15.5523 17 15 17C14.4477 17 14 17.4477 14 18C14 18.5523 14.4477 19 15 19Z"
                  stroke="currentColor" stroke-width="2" />
              </svg>
              Order Information
            </h3>
          </div>
          <div class="card-body">
            <div class="detail-row">
              <span class="detail-label">Order Number</span>
              <span class="detail-value">{{ order.order_number }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Type</span>
              <span class="detail-value">{{ order.payment_type || 'N/A' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Amount</span>
              <span class="detail-value detail-value-primary">${{ formatCurrency(order.total) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Items</span>
              <span class="detail-value">{{ order.order_items?.length || 0 }} item(s)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="detail-card items-card">
        <div class="card-header">
          <h3 class="card-title">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H17L16 11H4L3 3ZM3 3L2 1M5 15H7M17 15H13" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Order Items
          </h3>
        </div>
        <div class="card-body">
          <div v-if="!order.order_items || order.order_items.length === 0" class="empty-items">
            <p>No items found for this order</p>
          </div>
          <div v-else class="items-list">
            <div v-for="(item, index) in order.order_items" :key="item.id || index" class="item-row">
              <div class="item-info">
                <div class="item-number">{{ index + 1 }}</div>
                <div class="item-details">
                  <div class="item-name">Product Code: {{ item.product_code }}</div>
                  <div class="item-meta">
                    <span>Price: ${{ formatCurrency(item.base_price) }}</span>
                    <span>Quantity: {{ item.quantity }}</span>
                  </div>
                </div>
              </div>
              <div class="item-image">
                <img :src="item.product_image" alt="Product Image">
              </div>
              <div class="item-total">
                ${{ formatCurrency(item.total_amount) }}
              </div>
            </div>
          </div>
          <div class="items-footer">
            <div class="total-row">
              <span class="total-label">Grand Total</span>
              <span class="total-value">${{ formatCurrency(order.total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getOrderById, COUNTRIES } from '../services/api';

export default {
  name: 'OrderDetails',
  data() {
    return {
      order: {
        id: null,
        order_number: '',
        customer: '',
        status: '',
        total: 0,
        cancellation_reason: null,
        order_items: []
      },
      loading: true,
      error: null
    }
  },

  methods: {
    async fetchOrder() {
      this.loading = true;
      this.error = null;
      const orderId = this.$route.params.id;
      try {
        const response = await getOrderById(orderId);
        if (response.success && response.data) {
          this.order = response.data;
        } else {
          this.error = response.message || 'Failed to load order details';
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        this.error = 'Failed to load order details. Please try again.';
        // Use sample data for demo
        this.order = {
          id: orderId,
          order_number: `ORD-${orderId}`,
          customer: 'John Doe',
          customer_email: 'john.doe@example.com',
          customer_phone: '+1 (555) 123-4567',
          customer_address: '123 Main Street, Apt 4B',
          customer_country: 'United States',
          customer_postal_code: '12345',
          status: 'Pending',
          payment_type: 'Stripe',
          total: 299.99,
          date: new Date(),
          updated_at: new Date(),
          order_items: [
            { id: 1, product_id: 'P001', base_price: 149.99, quantity: 2, total_amount: 299.98 }
          ]
        };
      } finally {
        this.loading = false;
      }
    },

    getStatusClass(status) {
      const statusMap = {
        // 'Pending': 'status-pending',
        'Processing': 'status-processing',
        'Shipped': 'status-shipped',
        'Delivered': 'status-delivered',
        'Cancelled': 'status-cancelled',
        'Refunded': 'status-refunded'
      };
      return statusMap[status] || 'status-default';
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
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

    formatCountry(country) {
      return COUNTRIES[country];
    }
  },

  created() {
    this.fetchOrder();
  },

  watch: {
    '$route.params.id'() {
      this.fetchOrder();
    }
  }
};
</script>

<style scoped>
.order-details-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--primary-color);
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
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
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.loading-state,
.error-state {
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
  to {
    transform: rotate(360deg);
  }
}

.error-state svg {
  color: var(--danger-color);
  opacity: 0.7;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.status-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.status-label {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 12px;
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

.status-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.cancellation-reason {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.cancellation-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.cancellation-header svg {
  color: var(--danger-color);
  flex-shrink: 0;
}

.cancellation-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cancellation-text {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.05);
  border-left: 3px solid var(--danger-color);
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.detail-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-title svg {
  color: var(--primary-color);
}

.card-body {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 600;
  text-align: right;
}

.detail-value a {
  color: var(--primary-color);
  text-decoration: none;
}

.detail-value a:hover {
  text-decoration: underline;
}

.detail-value-primary {
  color: var(--primary-color);
  font-size: 1rem;
}

.items-card {
  grid-column: 1 / -1;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.item-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.item-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
}

.item-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.item-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.item-image {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.item-image img {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.item-total {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.empty-items {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.items-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--border-color);
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.total-label {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
}

.total-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-info {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-back {
    align-self: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .status-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .status-info {
    grid-template-columns: 1fr;
  }

  .item-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .item-total {
    align-self: flex-end;
  }

  .item-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .card-body {
    padding: 1rem;
  }

  .detail-row {
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-value {
    text-align: left;
  }
}
</style>
