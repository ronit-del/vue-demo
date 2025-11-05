<template>
  <div class="price-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">Product Prices</h1>
          <p class="page-subtitle">Manage product pricing and inventory</p>
        </div>
        <button class="btn btn-primary" @click="showAddModal = true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4V16M10 4L6 8M10 4L14 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Add Product
        </button>
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
            placeholder="Search products..." 
            class="search-input"
          />
        </div>
        <div class="table-actions">
          <button class="btn-icon" title="Bulk Edit">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 3L15 7L5 17H1V13L11 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 5L13 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
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
                  <span>Product</span>
                  <button class="sort-btn" @click="sortBy('product')">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 6L8 3L11 6M5 10L8 13L11 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </th>
              <th>
                <div class="table-header-cell">
                  <span>SKU</span>
                </div>
              </th>
              <th>
                <div class="table-header-cell">
                  <span>Price</span>
                  <button class="sort-btn" @click="sortBy('price')">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 6L8 3L11 6M5 10L8 13L11 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </th>
              <th>
                <div class="table-header-cell">
                  <span>Category</span>
                </div>
              </th>
              <th>
                <div class="table-header-cell">
                  <span>Stock</span>
                  <button class="sort-btn" @click="sortBy('stock')">
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
            <tr v-if="paginatedProducts.length === 0">
              <td colspan="6" class="empty-table">
                <div class="empty-state">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 10V38M24 10C22.8954 10 22 10.8954 22 12C22 13.1046 22.8954 14 24 14M24 10C25.1046 10 26 10.8954 26 12C26 13.1046 25.1046 14 24 14M24 28C22.8954 28 22 28.8954 22 30C22 31.1046 22.8954 32 24 32M24 28C25.1046 28 26 28.8954 26 30C26 31.1046 25.1046 32 24 32" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <p>No products found</p>
                </div>
              </td>
            </tr>
            <tr v-for="product in paginatedProducts" :key="product.id" class="table-row">
              <td>
                <div class="cell-product">
                  <div class="product-icon">
                    <img v-if="product.image" :src="getImageUrl(product.image)" :alt="product.name" class="product-image" />
                    <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3H17L16 11H4L3 3ZM3 3L2 1M5 15H7M17 15H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <span>{{ product.name }}</span>
                </div>
              </td>
              <td>
                <span class="cell-sku">{{ product.product_code || product.id.slice(0, 8).toUpperCase() }}</span>
              </td>
              <td>
                <span class="cell-price">${{ formatCurrency(product.price) }}</span>
              </td>
              <td>
                <span class="category-badge">{{ getCategory(product) }}</span>
              </td>
              <td>
                <div class="stock-info">
                  <span class="stock-value" :class="getStockClass(product.stock_quantity)">
                    {{ product.stock_quantity }}
                  </span>
                  <span class="stock-label">units</span>
                </div>
              </td>
              <td class="text-right">
                <div class="action-buttons">
                  <button class="btn-action" title="Edit Price" @click="editProduct(product)">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 3L15 7L5 17H1V13L11 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 5L13 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button class="btn-action" title="View Details" @click="viewProduct(product)">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 9C1 9 4 4 9 4C14 4 17 9 17 9C17 9 14 14 9 14C4 14 1 9 1 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 11C10.1046 11 11 10.1046 11 9C11 7.89543 10.1046 7 9 7C7.89543 7 7 7.89543 7 9C7 10.1046 7.89543 11 9 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
          Showing {{ paginatedProducts.length }} of {{ filteredProducts.length }} products ({{ productsCount }} total)
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
  name: 'PriceComponent',
  data() {
    return {
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10,
      sortField: 'product',
      sortOrder: 'asc',
      showAddModal: false
    }
  },
  computed: {
    products() {
      return this.$store.state.products || [];
    },
    filteredProducts() {
      let products = this.products;
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        products = products.filter(product => 
          product.name.toLowerCase().includes(query) ||
          (product.product_code && product.product_code.toLowerCase().includes(query)) ||
          (product.description && product.description.toLowerCase().includes(query))
        );
      }
      
      // Apply sorting
      if (this.sortField) {
        products = [...products].sort((a, b) => {
          let aVal, bVal;
          
          switch (this.sortField) {
            case 'product':
              aVal = a.name.toLowerCase();
              bVal = b.name.toLowerCase();
              break;
            case 'price':
              aVal = parseFloat(a.price) || 0;
              bVal = parseFloat(b.price) || 0;
              break;
            case 'stock':
              aVal = parseInt(a.stock_quantity) || 0;
              bVal = parseInt(b.stock_quantity) || 0;
              break;
            default:
              aVal = a.name.toLowerCase();
              bVal = b.name.toLowerCase();
          }
          
          if (this.sortOrder === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
          }
        });
      }
      
      return products;
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredProducts.slice(start, end);
    },
    productsCount() {
      return this.products.length;
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
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
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    },
    getImageUrl(imagePath) {
      if (!imagePath) return '';
      // If image path is relative, construct full URL
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      // For relative paths, assume they're in the public folder or assets
      const baseURL = process.env.VUE_APP_FRONTEND_URL || 'http://192.168.0.111:8080';
      return `${baseURL}/${imagePath}`;
    },
    getCategory(product) {
      // Extract category from image path or description
      if (product.image) {
        if (product.image.includes('electronics')) return 'Electronics';
        if (product.image.includes('clothes')) return 'Clothing';
        if (product.image.includes('home_appliances')) return 'Home Appliances';
        if (product.image.includes('beuty')) return 'Beauty';
      }
      return 'General';
    },
    getStockClass(stock) {
      const stockNum = parseInt(stock) || 0;
      if (stockNum < 50) return 'stock-low';
      if (stockNum < 100) return 'stock-medium';
      return 'stock-high';
    },
    editProduct(product) {
      // TODO: Implement edit modal
      const newPrice = prompt(`Enter new price for ${product.name}:`, product.price);
      if (newPrice && !isNaN(newPrice)) {
        this.updateProductPrice(product.id, parseFloat(newPrice));
      }
    },
    viewProduct(product) {
      // TODO: Implement view details modal
      alert(`Product: ${product.name}\nPrice: $${product.price}\nStock: ${product.stock_quantity}\nDescription: ${product.description || 'N/A'}`);
    },
    async updateProductPrice(productId, price) {
      try {
        const { updatePrice } = await import('../services/api');
        await updatePrice(productId, { price });
        // Refresh products list
        await this.$store.dispatch('fetchPrices');
        alert('Price updated successfully!');
      } catch (error) {
        console.error('Error updating price:', error);
        alert('Failed to update price. Please try again.');
      }
    }
  },
  created() {
    this.$store.dispatch('fetchPrices');
  }
};
</script>

<style scoped>
.price-page {
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

.cell-product {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cell-sku {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.cell-price {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1rem;
}

.category-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stock-value {
  font-weight: 700;
  font-size: 0.875rem;
}

.stock-high {
  color: var(--success-color);
}

.stock-medium {
  color: var(--warning-color);
}

.stock-low {
  color: var(--danger-color);
}

.stock-label {
  font-size: 0.75rem;
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
