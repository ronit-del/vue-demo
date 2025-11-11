<template>
  <div class="customer-edit-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <button class="btn-back" @click="$router.push('/customers')">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16L6 10L12 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 class="page-title">Edit Customer</h1>
            <p class="page-subtitle">Customer: {{ customer.name || 'Loading...' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading customer details...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 16V24M24 32H24.02M42 24C42 33.9411 33.9411 42 24 42C14.0589 42 6 33.9411 6 24C6 14.0589 14.0589 6 24 6C33.9411 6 42 14.0589 42 24Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="fetchCustomer">Retry</button>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="edit-form">
      <div class="form-grid">
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
              <label class="form-label">Name <span class="required">*</span></label>
              <input 
                type="text" 
                v-model="formData.name" 
                class="form-input"
                required
                placeholder="Enter customer name"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Email <span class="required">*</span></label>
              <input 
                type="email" 
                v-model="formData.email" 
                class="form-input"
                required
                placeholder="Enter email address"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Phone</label>
              <input 
                type="tel" 
                v-model="formData.phone" 
                class="form-input"
                placeholder="Enter phone number"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Address</label>
              <textarea 
                v-model="formData.address" 
                class="form-textarea"
                rows="3"
                placeholder="Enter address"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Country</label>
                <select 
                  v-model="formData.country" 
                  class="form-select"
                >
                  <option value="">Select a country</option>
                  <option v-for="(name, code) in countries" :key="code" :value="code">
                    {{ name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Postal Code</label>
                <input 
                  type="text" 
                  v-model="formData.postal_code" 
                  class="form-input"
                  placeholder="Enter postal code"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Status <span class="required">*</span></label>
              <select 
                v-model="formData.status" 
                class="form-select"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="$router.push('/customers')">
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
import { getCustomerById, updateCustomer, COUNTRIES } from '../services/api';

export default {
  name: 'CustomerEdit',
  data() {
    return {
      countries: COUNTRIES,
      customer: {
        id: null,
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        status: 'active'
      },
      formData: {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        status: 'active'
      },
      loading: true,
      saving: false,
      error: null
    }
  },
  methods: {
    getCountryCode(countryValue) {
      if (!countryValue) return '';
      
      // If it's already a country code (2 letters), return it
      if (countryValue.length === 2 && this.countries[countryValue]) {
        return countryValue;
      }
      
      // If it's a country name, find the corresponding code
      for (const [code, name] of Object.entries(this.countries)) {
        if (name.toLowerCase() === countryValue.toLowerCase()) {
          return code;
        }
      }
      
      // If no match found, return the original value (might be a custom value)
      return countryValue;
    },
    async fetchCustomer() {
      this.loading = true;
      this.error = null;
      try {
        const customerId = this.$route.params.id;
        const response = await getCustomerById(customerId);
        if (response.success && response.data) {
          this.customer = response.data;
          const countryValue = response.data.country || response.data.customer_country || '';
          this.formData = {
            name: response.data.name || '',
            email: response.data.email || '',
            phone: response.data.phone || response.data.customer_phone || '',
            address: response.data.address || response.data.customer_address || '',
            // city: response.data.city || '',
            // state: response.data.state || '',
            country: this.getCountryCode(countryValue),
            postal_code: response.data.postal_code || response.data.customer_postal_code || response.data.postalCode || '',
            status: response.data.status || (response.data.is_active !== undefined && response.data.is_active !== null ? (response.data.is_active ? 'active' : 'inactive') : 'active')
          };
        } else {
          this.error = response.message || 'Failed to load customer details';
          this.setSampleData();
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
        this.error = 'Failed to load customer details. Please try again.';
        this.setSampleData();
      } finally {
        this.loading = false;
      }
    },
    setSampleData() {
      const customerId = this.$route.params.id;
      this.customer = {
        id: customerId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street, Apt 4B',
        // city: 'New York',
        // state: 'NY',
        country: 'US',
        postal_code: '12345',
        status: 'active'
      };
      this.formData = { ...this.customer };
    },
    async handleSubmit() {
      this.saving = true;
      this.error = null;
      
      try {
        const customerId = this.$route.params.id;
        const response = await updateCustomer(customerId, {
          name: this.formData.name,
          email: this.formData.email,
          phone: this.formData.phone,
          address: this.formData.address,
          // city: this.formData.city,
          // state: this.formData.state,
          country: this.formData.country,
          postal_code: this.formData.postal_code,
          status: this.formData.status,
          is_active: this.formData.status === 'active'
        });
        
        if (response.success) {
          this.$router.push('/customers');
        } else {
          this.error = response.message || 'Failed to update customer';
        }
      } catch (error) {
        console.error('Error updating customer:', error);
        this.error = 'Failed to update customer. Please try again.';
        // For demo purposes, still redirect after a delay
        setTimeout(() => {
          this.$router.push('/customers');
        }, 1500);
      } finally {
        this.saving = false;
      }
    }
  },
  created() {
    this.fetchCustomer();
  },
  watch: {
    '$route.params.id'() {
      this.fetchCustomer();
    }
  }
};
</script>

<style scoped>
.customer-edit-page {
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
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-color);
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

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state svg {
  color: var(--danger-color);
}

.error-state p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.form-card {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
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
.form-textarea,
.form-select {
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
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--bg-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input:disabled,
.form-textarea:disabled,
.form-select:disabled {
  background: var(--bg-tertiary);
  cursor: not-allowed;
  opacity: 0.6;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
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

.spinner-icon {
  animation: spin 0.8s linear infinite;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

