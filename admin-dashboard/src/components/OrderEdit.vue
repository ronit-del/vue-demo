<template>
  <div class="order-edit-page">
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
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" @click="$router.push(`/orders/${order.id}`)">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 9C1 9 4 4 9 4C14 4 17 9 17 9C17 9 14 14 9 14C4 14 1 9 1 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 11C10.1046 11 11 10.1046 11 9C11 7.89543 10.1046 7 9 7C7.89543 7 7 7.89543 7 9C7 10.1046 7.89543 11 9 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            View Details
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
        <path d="M24 16V24M24 32H24.02M42 24C42 33.9411 33.9411 42 24 42C14.0589 42 6 33.9411 6 24C6 14.0589 14.0589 6 24 6C33.9411 6 42 14.0589 42 24Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="fetchOrder">Retry</button>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="edit-form">
      <div class="form-grid">
        <!-- Order Information -->
        <div class="form-card">
          <div class="card-header">
            <h3 class="card-title">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H17L16 11H4L3 3ZM3 3L2 1M5 15H7M17 15H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Order Information
            </h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Order Number</label>
              <input 
                type="text" 
                v-model="formData.order_number" 
                class="form-input"
                readonly
                disabled
              />
            </div>

            <div class="form-group">
              <label class="form-label">Status <span class="required">*</span></label>
              <select 
                v-model="formData.status" 
                class="form-select"
                required
                @change="handleStatusChange"
              >
                <!-- <option value="Pending">Pending</option> -->
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <!-- Cancellation Reason (shown only when status is Cancelled) -->
            <div class="form-group" v-if="formData.status === 'Cancelled'">
              <label class="form-label">Cancellation Reason <span class="required">*</span></label>
              <textarea 
                v-model="formData.cancellation_reason" 
                class="form-textarea"
                rows="4"
                placeholder="Please provide a reason for cancelling this order..."
                required
              ></textarea>
              <p class="form-hint">This reason will be sent to the customer via email and displayed on the tracking page.</p>
            </div>

            <div class="form-group">
              <label class="form-label">Payment Type</label>
              <select 
                v-model="formData.payment_type" 
                class="form-select"
                disabled
              >
                <option value="">Select Payment Type</option>
                <option value="COD">COD</option>
                <option value="Stripe">Stripe</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Total Amount</label>
              <input 
                type="number" 
                v-model="formData.total" 
                class="form-input"
                step="0.01"
                min="0"
                required
                disabled
              />
            </div>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="form-card">
          <div class="card-header">
            <h3 class="card-title">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 19V17C17 15.9391 16.5786 14.9217 15.8284 14.1716C15.0783 13.4214 14.0609 13 13 13H7C5.93913 13 4.92172 13.4214 4.17157 14.1716C3.42143 14.9217 3 15.9391 3 17V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 9C12.2091 9 14 7.20914 14 5C14 2.79086 12.2091 1 10 1C7.79086 1 6 2.79086 6 5C6 7.20914 7.79086 9 10 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Customer Information
            </h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Customer Name</label>
              <input 
                type="text" 
                v-model="formData.customer" 
                class="form-input"
                readonly
                disabled
              />
            </div>

            <div class="form-group">
              <label class="form-label">Email</label>
              <input 
                type="email" 
                v-model="formData.customer_email" 
                class="form-input"
                readonly
                disabled
              />
            </div>

            <div class="form-group">
              <label class="form-label">Phone</label>
              <input 
                type="tel" 
                v-model="formData.customer_phone" 
                class="form-input"
                readonly
                disabled
              />
            </div>

            <div class="form-group">
              <label class="form-label">Address</label>
              <textarea 
                v-model="formData.customer_address" 
                class="form-textarea"
                rows="2"
                readonly
                disabled
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Country</label>
                <input 
                  type="text" 
                  v-model="formData.customer_country" 
                  class="form-input"
                  readonly
                  disabled
                />
              </div>
              <div class="form-group">
                <label class="form-label">Postal Code</label>
                <input 
                  type="text" 
                  v-model="formData.customer_postal_code" 
                  class="form-input"
                  readonly
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="form-card items-card">
        <div class="card-header">
          <h3 class="card-title">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H17L16 11H4L3 3ZM3 3L2 1M5 15H7M17 15H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Order Items
          </h3>
        </div>
        <div class="card-body">
          <div v-if="!formData.order_items || formData.order_items.length === 0" class="empty-items">
            <p>No items found for this order</p>
          </div>
          <div v-else class="items-list">
            <div v-for="(item, index) in formData.order_items" :key="item.id || index" class="item-row">
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
              <span class="total-value">${{ formatCurrency(formData.total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="$router.push('/orders')">
          Cancel
        </button>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <svg v-if="saving" class="spinner-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="50.265" stroke-dashoffset="12.566"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 4.5L6.75 12.75L3 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { getOrderById, updateOrder } from '../services/api';

export default {
  name: 'OrderEdit',
  data() {
    return {
      order: {
        id: null,
        order_number: '',
        customer: '',
        status: '',
        total: 0,
        order_items: []
      },
      formData: {
        order_number: '',
        status: 'Processing',
        payment_type: '',
        total: 0,
        cancellation_reason: '',
        customer: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        customer_country: '',
        customer_postal_code: '',
        order_items: []
      },
      loading: true,
      saving: false,
      error: null
    }
  },

  methods: {
    async fetchOrder() {
      this.loading = true;
      this.error = null;
      try {
        const orderId = this.$route.params.id;
        const response = await getOrderById(orderId);
        if (response.success && response.data) {
          this.order = response.data;
          this.formData = {
            order_number: response.data.order_number || '',
            status: response.data.status || 'Processing',
            payment_type: response.data.payment_type || '',
            total: response.data.total || 0,
            cancellation_reason: response.data.cancellation_reason || '',
            customer: response.data.customer || '',
            customer_email: response.data.customer_email || '',
            customer_phone: response.data.customer_phone || '',
            customer_address: response.data.customer_address || '',
            customer_country: response.data.customer_country || '',
            customer_postal_code: response.data.customer_postal_code || '',
            order_items: response.data.order_items || []
          };
        } else {
          this.error = response.message || 'Failed to load order details';
          // Use sample data for demo
          this.setSampleData();
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        this.error = 'Failed to load order details. Please try again.';
        this.setSampleData();
      } finally {
        this.loading = false;
      }
    },

    setSampleData() {
      const orderId = this.$route.params.id;
      this.order = {
        id: orderId,
        order_number: `ORD-${orderId}`,
        customer: 'John Doe',
        customer_email: 'john.doe@example.com',
        customer_phone: '+1 (555) 123-4567',
        customer_address: '123 Main Street, Apt 4B',
        customer_country: 'United States',
        customer_postal_code: '12345',
        status: 'Processing',
        payment_type: 'Credit Card',
        total: 299.99,
        order_items: [
          { id: 1, product_id: 'P001', base_price: 149.99, quantity: 2, total_amount: 299.98 }
        ]
      };
      this.formData = { ...this.order };
    },

    handleStatusChange() {
      // Clear cancellation reason if status is not Cancelled
      if (this.formData.status !== 'Cancelled') {
        this.formData.cancellation_reason = '';
      }
    },

    async handleSubmit() {
      // Validate cancellation reason if status is Cancelled
      if (this.formData.status === 'Cancelled' && !this.formData.cancellation_reason?.trim()) {
        this.error = 'Please provide a cancellation reason';
        return;
      }

      this.saving = true;
      this.error = null;
      
      try {
        const orderId = this.$route.params.id;
        const updateData = {
          status: this.formData.status,
          payment_type: this.formData.payment_type,
          total: this.formData.total
        };

        // Include cancellation reason if status is Cancelled
        if (this.formData.status === 'Cancelled') {
          updateData.cancellation_reason = this.formData.cancellation_reason;
        }

        const response = await updateOrder(orderId, updateData);
        
        if (response.success) {
          // Show success message and redirect
          this.$router.push(`/orders/${orderId}`);
        } else {
          this.error = response.message || 'Failed to update order';
        }
      } catch (error) {
        console.error('Error updating order:', error);
        this.error = 'Failed to update order. Please try again.';
        // For demo purposes, still redirect
        setTimeout(() => {
          this.$router.push(`/orders/${this.$route.params.id}`);
        }, 1000);
      } finally {
        this.saving = false;
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
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
.order-edit-page {
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

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
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
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
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
  to { transform: rotate(360deg); }
}

.error-state svg {
  color: var(--danger-color);
  opacity: 0.7;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-card {
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

.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.required {
  color: var(--danger-color);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--bg-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input:disabled,
.form-select:disabled,
.form-textarea:disabled {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  font-style: italic;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.items-card {
  grid-column: 1 / -1;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.spinner-icon {
  animation: spin 1s linear infinite;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .form-grid {
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
  
  .form-row {
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
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-actions .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .card-body {
    padding: 1rem;
  }
}
</style>

