<template>
  <div class="order-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">Orders</h1>
          <p class="page-subtitle">Manage and track all orders</p>
        </div>
        <button class="btn btn-primary" @click="showAddModal = true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4V16M10 4L6 8M10 4L14 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          New Order
        </button>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">Total Orders</span>
        <span class="stat-value">{{ orders.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Pending</span>
        <span class="stat-value stat-value-warning">{{ pendingCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Completed</span>
        <span class="stat-value stat-value-success">{{ completedCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Revenue</span>
        <span class="stat-value stat-value-primary">${{ formatCurrency(totalRevenue) }}</span>
      </div>
    </div>

    <div class="content-card">
      <div class="table-header">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 19L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search orders by order number, customer, status, or total..." 
            class="search-input"
          />
        </div>
        <div class="filter-group">
          <select v-model="statusFilter" class="filter-select">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button class="btn-icon" title="Export">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12V2M10 2L6 6M10 2L14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 12H17V18C17 18.5523 16.5523 19 16 19H4C3.44772 19 3 18.5523 3 18V12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>
                <div class="table-header-cell">
                  <span>Order ID</span>
                  <button class="sort-btn" @click="sortBy('order_number')">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 6L8 3L11 6M5 10L8 13L11 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </th>
              <th>Customer</th>
              <th>
                <div class="table-header-cell">
                  <span>Date</span>
                  <button class="sort-btn" @click="sortBy('date')">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 6L8 3L11 6M5 10L8 13L11 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </th>
              <th>Status</th>
              <th>
                <div class="table-header-cell">
                  <span>Total</span>
                  <button class="sort-btn" @click="sortBy('total')">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 6L8 3L11 6M5 10L8 13L11 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="6" class="empty-table">
                <div class="empty-state">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 9H39L38 17H10L9 9ZM9 9L8 7M11 21H13M31 21H27" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15 25C15.5523 25 16 24.5523 16 24C16 23.4477 15.5523 23 15 23C14.4477 23 14 23.4477 14 24C14 24.5523 14.4477 25 15 25Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M31 25C31.5523 25 32 24.5523 32 24C32 23.4477 31.5523 23 31 23C30.4477 23 30 23.4477 30 24C30 24.5523 30.4477 25 31 25Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <p>No orders found</p>
                </div>
              </td>
            </tr>
            <tr v-for="order in filteredOrders" :key="order.id" class="table-row">
              <td>
                <span class="cell-id">{{ order.order_number }}</span>
              </td>
              <td>
                <div class="cell-customer">
                  <div class="avatar-small">
                    {{ getInitials(order.customer) }}
                  </div>
                  <span>{{ order.customer }}</span>
                </div>
              </td>
              <td>
                <span class="cell-date">{{ formatDate(order.date || new Date()) }}</span>
              </td>
              <td>
                <span class="status-badge" :class="getStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </td>
              <td>
                <span class="cell-amount">${{ formatCurrency(order.total || 0) }}</span>
              </td>
              <td class="text-right">
                <div class="action-buttons">
                  <button class="btn-action" title="View Details">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 9C1 9 4 4 9 4C14 4 17 9 17 9C17 9 14 14 9 14C4 14 1 9 1 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 11C10.1046 11 11 10.1046 11 9C11 7.89543 10.1046 7 9 7C7.89543 7 7 7.89543 7 9C7 10.1046 7.89543 11 9 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button class="btn-action" title="Edit">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 3L15 7L5 17H1V13L11 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 5L13 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <!-- <button class="btn-action btn-action-danger" title="Cancel">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button> -->
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <div class="pagination-info">
          Showing {{ filteredOrders.length }} of {{ orders.length }} orders
        </div>
        <div class="pagination">
          <button class="btn-pagination" :disabled="currentPage === 1" @click="currentPage--">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn-pagination" :disabled="currentPage === totalPages" @click="currentPage++">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderComponent',
  data() {
    return {
      searchQuery: '',
      statusFilter: '',
      currentPage: 1,
      itemsPerPage: 10,
      sortField: 'id',
      sortOrder: 'asc',
      showAddModal: false
    }
  },
  computed: {
    orders() {
      const storeOrders = this.$store.state.orders;
      if (storeOrders.length > 0) {
        return storeOrders.map(order => ({
          ...order,
          date: order.date || new Date()
        }));
      }
      // Sample data
      return [
        { id: 1001, customer: 'John Doe', status: 'Pending', total: 299.99, date: new Date() },
        { id: 1002, customer: 'Jane Smith', status: 'Processing', total: 549.50, date: new Date(Date.now() - 86400000) },
        { id: 1003, customer: 'Bob Johnson', status: 'Shipped', total: 129.99, date: new Date(Date.now() - 172800000) },
        { id: 1004, customer: 'Alice Williams', status: 'Delivered', total: 799.00, date: new Date(Date.now() - 259200000) },
        { id: 1005, customer: 'Charlie Brown', status: 'Cancelled', total: 199.99, date: new Date(Date.now() - 345600000) }
      ];
    },
    filteredOrders() {
      let filtered = this.orders;

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(order => 
          order.order_number.toString().includes(query) ||
          order.customer.toLowerCase().includes(query) ||
          order.status.toLowerCase().includes(query) ||
          order.total.toString().includes(query)
        );
      }
      
      if (this.statusFilter) {
        filtered = filtered.filter(order => order.status === this.statusFilter);
      }
      
      return filtered;
    },
    pendingCount() {
      return this.orders.filter(o => o.status === 'Pending').length;
    },
    completedCount() {
      return this.orders.filter(o => o.status === 'Delivered').length;
    },
    totalRevenue() {
      return this.orders.reduce((sum, order) => sum + (order.total || 0), 0);
    },
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    }
  },
  methods: {
    sortBy(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortOrder = 'asc';
      }
    },
    getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },
    getStatusClass(status) {
      const statusMap = {
        'Pending': 'status-pending',
        'Processing': 'status-processing',
        'Shipped': 'status-shipped',
        'Delivered': 'status-delivered',
        'Cancelled': 'status-cancelled'
      };
      return statusMap[status] || 'status-default';
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    },
    formatDate(date) {
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }).format(new Date(date));
    }
  },
  created() {
    this.$store.dispatch('fetchOrders');
  }
};
</script>

<style scoped>
.order-page {
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

.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: var(--shadow-sm);
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value-primary {
  color: var(--primary-color);
}

.stat-value-success {
  color: var(--success-color);
}

.stat-value-warning {
  color: var(--warning-color);
}

.content-card {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.table-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 1rem;
  color: var(--text-tertiary);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--bg-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.filter-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-icon {
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

.btn-icon:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: var(--bg-secondary);
}

.data-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

.data-table th.text-right {
  text-align: right;
}

.table-header-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  color: var(--text-tertiary);
  transition: color 0.2s ease;
}

.sort-btn:hover {
  color: var(--text-primary);
}

.data-table tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s ease;
}

.data-table tbody tr:hover {
  background: var(--bg-secondary);
}

.data-table td {
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.data-table td.text-right {
  text-align: right;
}

.empty-table {
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--text-secondary);
}

.empty-state svg {
  color: var(--text-tertiary);
}

.cell-id {
  font-weight: 600;
  color: var(--text-secondary);
  font-family: monospace;
}

.cell-customer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.cell-date {
  color: var(--text-secondary);
}

.cell-amount {
  font-weight: 700;
  color: var(--text-primary);
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
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
  color: #3b82f6;
}

.status-delivered {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.status-cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.status-default {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-secondary);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.btn-action:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-action-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.table-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.pagination {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-pagination {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.btn-pagination:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }
  
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: 100%;
  }
  
  .data-table {
    font-size: 0.75rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.75rem 1rem;
  }
  
  .table-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
