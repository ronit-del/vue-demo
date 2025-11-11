<template>
  <div class="customer-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">Customers</h1>
          <p class="page-subtitle">Manage your customer database</p>
        </div>
        <!-- <button class="btn btn-primary" @click="showAddModal = true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Add Customer
        </button> -->
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
            placeholder="Search customers..." 
            class="search-input"
          />
        </div>
        <div class="table-actions">
          <button class="btn-icon" title="Filter">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 5H17M5 10H15M7 15H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="btn-icon" title="Export" @click="exportToCSV">
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
              <!-- <th>
                <div class="table-header-cell">
                  <span>Customer ID</span>
                  <button class="sort-btn" @click="sortBy('id')">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 6L8 3L11 6M5 10L8 13L11 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </th> -->
              <th>
                <div class="table-header-cell">
                  <span>Name</span>
                  <button class="sort-btn" @click="sortBy('name')">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 6L8 3L11 6M5 10L8 13L11 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </th>
              <th>
                <div class="table-header-cell">
                  <span>Email</span>
                  <button class="sort-btn" @click="sortBy('email')">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 6L8 3L11 6M5 10L8 13L11 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </th>
              <th>
                <div class="table-header-cell">
                  <span>Status</span>
                </div>
              </th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredCustomers.length === 0">
              <td colspan="5" class="empty-table">
                <div class="empty-state">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 19V17C17 15.9391 17.4214 14.9217 18.1716 14.1716C18.9217 13.4214 19.9391 13 21 13H27C28.0609 13 29.0783 13.4214 29.8284 14.1716C30.5786 14.9217 31 15.9391 31 17V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M24 29C26.2091 29 28 27.2091 28 25C28 22.7909 26.2091 21 24 21C21.7909 21 20 22.7909 20 25C20 27.2091 21.7909 29 24 29Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <p>No customers found</p>
                </div>
              </td>
            </tr>
            <tr v-for="customer in paginatedCustomers" :key="customer.id" class="table-row">
              <!-- <td>
                <span class="cell-id">#{{ customer.id }}</span>
              </td> -->
              <td>
                <div class="cell-name">
                  <div class="avatar">
                    {{ getInitials(customer.name) }}
                  </div>
                  <span>{{ customer.name }}</span>
                </div>
              </td>
              <td>
                <span class="cell-email">{{ customer.email }}</span>
              </td>
              <td>
                <span class="status-badge" :class="getStatusClass(customer)">
                  {{ getStatusText(customer) }}
                </span>
              </td>
              <td class="text-right">
                <div class="action-buttons">
                  <button class="btn-action" title="Edit" @click="$router.push(`/customers/${customer.id}/edit`)">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 3L15 7L5 17H1V13L11 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 5L13 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button class="btn-action btn-action-danger" title="Delete" @click="confirmDelete(customer)">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 5H15M13 5V14C13 14.5523 12.5523 15 12 15H6C5.44772 15 5 14.5523 5 14V5M7 5V3C7 2.44772 7.44772 2 8 2H10C10.5523 2 11 2.44772 11 3V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <div class="pagination-info">
          <span v-if="filteredCustomers.length > 0">
            Showing {{ paginationStart }} to {{ paginationEnd }} of {{ filteredCustomers.length }} customers
          </span>
          <span v-else>
            No customers found
          </span>
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

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Delete Customer</h3>
          <button class="modal-close" @click="showDeleteModal = false">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong>{{ customerToDelete?.name }}</strong>?</p>
          <p class="warning-text">This action cannot be undone. If the customer has orders, they must be deleted first.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDeleteModal = false" :disabled="deleting">
            Cancel
          </button>
          <button class="btn btn-danger" @click="deleteCustomer" :disabled="deleting">
            <svg v-if="deleting" class="spinner-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="50.265" stroke-dashoffset="12.566"/>
            </svg>
            {{ deleting ? 'Deleting...' : 'Delete Customer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { COUNTRIES } from '../services/api';

export default {
  name: 'CustomerComponent',
  data() {
    return {
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10,
      sortField: 'id',
      sortOrder: 'asc',
      showDeleteModal: false,
      customerToDelete: null,
      deleting: false,
      adding: false,
      addError: null,
      countries: COUNTRIES,
      newCustomer: {
        name: '',
        email: '',
        phone: '',
        address: '',
        country: '',
        postal_code: '',
        status: 'active'
      }
    }
  },
  computed: {
    customers() {
      return this.$store.state.customers.length > 0 
        ? this.$store.state.customers 
        : [
            { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
            { id: 3, name: 'Bob Johnson', email: 'bob.johnson@example.com' },
            { id: 4, name: 'Alice Williams', email: 'alice.williams@example.com' },
            { id: 5, name: 'Charlie Brown', email: 'charlie.brown@example.com' }
          ];
    },
    filteredCustomers() {
      let filtered = this.customers;
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(customer => 
          customer.name.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query) ||
          customer.id.toString().includes(query)
        );
      }
      
      // Apply sorting
      if (this.sortField) {
        filtered = [...filtered].sort((a, b) => {
          let aValue, bValue;
          
          if (this.sortField === 'name') {
            aValue = (a.name || '').toLowerCase();
            bValue = (b.name || '').toLowerCase();
          } else if (this.sortField === 'email') {
            aValue = (a.email || '').toLowerCase();
            bValue = (b.email || '').toLowerCase();
          } else if (this.sortField === 'id') {
            aValue = a.id || 0;
            bValue = b.id || 0;
          } else {
            aValue = a[this.sortField];
            bValue = b[this.sortField];
          }
          
          if (aValue < bValue) {
            return this.sortOrder === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return this.sortOrder === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      
      return filtered;
    },
    totalPages() {
      return Math.ceil(this.filteredCustomers.length / this.itemsPerPage) || 1;
    },
    paginatedCustomers() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredCustomers.slice(start, end);
    },
    paginationStart() {
      if (this.filteredCustomers.length === 0) return 0;
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    paginationEnd() {
      const end = this.currentPage * this.itemsPerPage;
      return Math.min(end, this.filteredCustomers.length);
    }
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    filteredCustomers() {
      // Reset to page 1 if current page is out of bounds
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = 1;
      }
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
    getStatusClass(customer) {
      const status = customer.status || (customer.is_active !== undefined ? (customer.is_active ? 'active' : 'inactive') : 'active');
      return status === 'active' ? 'status-active' : 'status-inactive';
    },
    getStatusText(customer) {
      const status = customer.status || (customer.is_active !== undefined ? (customer.is_active ? 'active' : 'inactive') : 'active');
      return status === 'active' ? 'Active' : 'Inactive';
    },
    confirmDelete(customer) {
      this.customerToDelete = customer;
      this.showDeleteModal = true;
    },
    async deleteCustomer() {
      if (!this.customerToDelete) return;
      
      this.deleting = true;
      try {
        const { deleteCustomer } = await import('../services/api');
        const response = await deleteCustomer(this.customerToDelete.id);
        
        if (response.success) {
          // Refresh customers list
          await this.$store.dispatch('fetchCustomers');
          this.showDeleteModal = false;
          this.customerToDelete = null;
        } else {
          alert(response.message || 'Failed to delete customer');
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete customer. Please try again.';
        alert(errorMessage);
      } finally {
        this.deleting = false;
      }
    },
    async handleAddCustomer() {
      this.adding = true;
      this.addError = null;
      
      try {
        const { createCustomer } = await import('../services/api');
        const response = await createCustomer(this.newCustomer);
        
        if (response.success) {
          // Refresh customers list
          await this.$store.dispatch('fetchCustomers');
          this.closeAddModal();
        } else {
          this.addError = response.message || 'Failed to add customer';
        }
      } catch (error) {
        console.error('Error adding customer:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to add customer. Please try again.';
        this.addError = errorMessage;
      } finally {
        this.adding = false;
      }
    },
    closeAddModal() {
      this.addError = null;
      this.newCustomer = {
        name: '',
        email: '',
        phone: '',
        address: '',
        country: '',
        postal_code: '',
        status: 'active'
      };
    },
    exportToCSV() {
      // Escape commas and quotes in CSV values
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };
      
      // Prepare CSV headers
      const headers = ['Name', 'Email', 'Status'];
      
      // Prepare CSV rows from filtered customers
      const rows = this.filteredCustomers.map(customer => {
        const name = customer.name || '';
        const email = customer.email || '';
        const status = this.getStatusText(customer);
        
        return [
          escapeCSV(name),
          escapeCSV(email),
          escapeCSV(status)
        ];
      });
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Add BOM for UTF-8 to support Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `customers_export_${dateStr}.csv`;
      link.setAttribute('download', filename);
      
      // Trigger download
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    }
  },
  created() {
    this.$store.dispatch('fetchCustomers');
  }
};
</script>

<style scoped>
.customer-page {
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

.table-actions {
  display: flex;
  gap: 0.5rem;
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

.cell-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 36px;
  height: 36px;
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

.cell-email {
  color: var(--text-secondary);
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

.status-active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.status-inactive {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
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
