<template>
  <div class="price-page">
    <div class="page-header">
      <div class="header-content">
        <!-- <div class="header-info">
          <h1 class="page-title">Product Prices</h1>
          <p class="page-subtitle">Manage product pricing and inventory</p>
        </div> -->
        <button class="btn btn-primary" @click="openAddModal">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4V16M10 4L6 8M10 4L14 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Add Product
        </button>
      </div>
    </div>

    <div class="content-card">
      <div class="table-header">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M19 19L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <input type="text" v-model="searchQuery" placeholder="Search products..." class="search-input" />
        </div>
        <div class="table-actions">
          <button class="btn-icon" title="Bulk Edit">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 3L15 7L5 17H1V13L11 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M9 5L13 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button class="btn-icon" title="Export" @click="exportToCSV">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12V2M10 2L6 6M10 2L14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M3 12H17V18C17 18.5523 16.5523 19 16 19H4C3.44772 19 3 18.5523 3 18V12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
                      <path d="M5 6L8 3L11 6M5 10L8 13L11 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
                      <path d="M5 6L8 3L11 6M5 10L8 13L11 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
                      <path d="M5 6L8 3L11 6M5 10L8 13L11 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
                    <path
                      d="M24 10V38M24 10C22.8954 10 22 10.8954 22 12C22 13.1046 22.8954 14 24 14M24 10C25.1046 10 26 10.8954 26 12C26 13.1046 25.1046 14 24 14M24 28C22.8954 28 22 28.8954 22 30C22 31.1046 22.8954 32 24 32M24 28C25.1046 28 26 28.8954 26 30C26 31.1046 25.1046 32 24 32"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <p>No products found</p>
                </div>
              </td>
            </tr>
            <tr v-for="product in paginatedProducts" :key="product.id" class="table-row">
              <td>
                <div class="cell-product">
                  <div class="product-icon">
                    <img v-if="product.image" :src="product.image" :alt="product.name" class="product-image" />
                    <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3H17L16 11H4L3 3ZM3 3L2 1M5 15H7M17 15H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
                      <path d="M11 3L15 7L5 17H1V13L11 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M9 5L13 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
          <span v-if="filteredProducts.length > 0">
            Showing {{ paginationStart }} to {{ paginationEnd }} of {{ filteredProducts.length }} products
          </span>
          <span v-else>
            No products found
          </span>
        </div>
        <div class="pagination">
          <button class="btn-pagination" :disabled="currentPage === 1" @click="currentPage--">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn-pagination" :disabled="currentPage === totalPages" @click="currentPage++">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Product Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Add New Product</h3>
          <button class="modal-close" @click="showAddModal = false">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleAddProduct" class="edit-form">
            <div class="form-group">
              <label class="form-label">Product Name <span class="required">*</span></label>
              <input type="text" v-model="addFormData.name" class="form-input" required placeholder="Enter product name" />
            </div>

            <div class="form-group">
              <label class="form-label">Category</label>
              <select v-model="addFormData.category" class="form-input">
                <option value="">Select a category</option>
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
              <small class="form-hint">Choose the product category</small>
            </div>

            <div class="form-group">
              <label class="form-label">Product Code (SKU)</label>
              <input type="text" v-model="addFormData.product_code" class="form-input" placeholder="Leave empty to auto-generate" />
              <small class="form-hint">If left empty, a unique code will be generated automatically</small>
            </div>

            <div class="form-group">
              <label class="form-label">Price <span class="required">*</span></label>
              <div class="input-with-symbol">
                <span class="input-symbol">$</span>
                <input type="number" v-model.number="addFormData.price" class="form-input" step="0.01" min="0" required placeholder="0.00" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Stock Quantity <span class="required">*</span></label>
              <input type="number" v-model.number="addFormData.stock_quantity" class="form-input" min="0" required placeholder="0" />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea v-model="addFormData.description" class="form-textarea" rows="3" placeholder="Enter product description"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Product Image</label>
              <div class="image-upload-section">
                <div v-if="imagePreview && !uploadingImage" class="image-preview">
                  <img :src="imagePreview" alt="Preview" class="preview-image" />
                  <button type="button" class="btn-remove-image" @click="removeImage">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                </div>
                <div v-else-if="!uploadingImage" class="upload-area" :class="{ 'drag-over': isDragging }"
                  @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop">
                  <input type="file" ref="fileInput" @change="handleImageSelect" accept="image/*" class="file-input" id="product-image-upload" />
                  <label for="product-image-upload" class="upload-label">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span>Click to upload image</span>
                    <small>or drag and drop</small>
                  </label>
                </div>
                <div v-if="uploadingImage" class="upload-progress">
                  <div class="spinner-small"></div>
                  <span>Uploading image...</span>
                </div>
              </div>
              <input v-if="!imagePreview && !uploadingImage" type="text" v-model="addFormData.image" class="form-input" style="margin-top: 0.5rem;" placeholder="Or enter image URL manually" />
              <small v-if="imagePreview && addFormData.image" class="form-hint" style="margin-top: 0.5rem; color: var(--success-color);">
                ✓ Image uploaded successfully
              </small>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showAddModal = false" :disabled="adding">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="adding">
                <svg v-if="adding" class="spinner-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="50.265" stroke-dashoffset="12.566" />
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 4V14M9 4L5 8M9 4L13 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                {{ adding ? 'Adding...' : 'Add Product' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Product Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Edit Product</h3>
          <button class="modal-close" @click="showEditModal = false">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="product-info">
            <div class="product-name">{{ productToEdit?.name }}</div>
            <div class="product-code">
              SKU: {{ productToEdit?.product_code || productToEdit?.id?.slice(0, 8).toUpperCase() }}
            </div>
          </div>

          <form @submit.prevent="handleUpdateProduct" class="edit-form">
            <div class="form-group">
              <label class="form-label">Price <span class="required">*</span></label>
              <div class="input-with-symbol">
                <span class="input-symbol">$</span>
                <input type="number" v-model.number="editFormData.price" class="form-input" step="0.01" min="0" required placeholder="0.00" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Stock Quantity <span class="required">*</span></label>
              <input type="number" v-model.number="editFormData.stock_quantity" class="form-input" min="0" required placeholder="0" />
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showEditModal = false" :disabled="editing">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="editing">
                <svg v-if="editing" class="spinner-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="50.265" stroke-dashoffset="12.566" />
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 4.5L6.75 12.75L3 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                {{ editing ? 'Updating...' : 'Update Product' }}
              </button>
            </div>
          </form>
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
      showAddModal: false,
      showEditModal: false,
      productToEdit: null,
      editing: false,
      editFormData: {
        price: 0,
        stock_quantity: 0
      },
      adding: false,
      addFormData: {
        name: '',
        product_code: '',
        price: 0,
        stock_quantity: 0,
        description: '',
        image: '',
        category: ''
      },
      categories: [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothes', label: 'Clothing' },
        { value: 'home_appliances', label: 'Home Appliances' },
        { value: 'beauty', label: 'Beauty' }
      ],
      uploadingImage: false,
      imagePreview: null,
      isDragging: false
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
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1;
    },

    paginationStart() {
      if (this.filteredProducts.length === 0) return 0;
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },

    paginationEnd() {
      const end = this.currentPage * this.itemsPerPage;
      return Math.min(end, this.filteredProducts.length);
    }
  },

  watch: {
    searchQuery() {
      this.currentPage = 1;
    },

    filteredProducts() {
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

    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    },

    getCategory(product) {
      // Use stored category if available, otherwise infer from image path
      if (product.category) {
        const categoryMap = {
          'electronics': 'Electronics',
          'clothes': 'Clothing',
          'home_appliances': 'Home Appliances',
          'beauty': 'Beauty'
        };
        return categoryMap[product.category] || product.category;
      }

      // Fallback: Extract category from image path
      if (product.image) {
        if (product.image.includes('electronics')) return 'Electronics';
        if (product.image.includes('clothes')) return 'Clothing';
        if (product.image.includes('home_appliances') || product.image.includes('home appliance')) return 'Home Appliances';
        if (product.image.includes('beuty') || product.image.includes('beauty')) return 'Beauty';
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
      this.productToEdit = product;
      this.editFormData = {
        price: parseFloat(product.price) || 0,
        stock_quantity: parseInt(product.stock_quantity) || 0
      };
      this.showEditModal = true;
    },

    async handleUpdateProduct() {
      if (!this.productToEdit) return;

      this.editing = true;
      try {
        const { updatePrice } = await import('../services/api');
        const response = await updatePrice(this.productToEdit.id, {
          price: this.editFormData.price,
          stock_quantity: this.editFormData.stock_quantity
        });

        if (response.success) {
          // Refresh products list
          await this.$store.dispatch('fetchPrices');
          this.showEditModal = false;
          this.productToEdit = null;
        } else {
          alert(response.message || 'Failed to update product');
        }
      } catch (error) {
        console.error('Error updating product:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update product. Please try again.';
        alert(errorMessage);
      } finally {
        this.editing = false;
      }
    },

    resetAddForm() {
      this.addFormData = {
        name: '',
        product_code: '',
        price: 0,
        stock_quantity: 0,
        description: '',
        image: '',
        category: ''
      };
      this.imagePreview = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    openAddModal() {
      this.resetAddForm();
      this.showAddModal = true;
    },

    viewProduct(product) {
      // TODO: Implement view details modal
      alert(`Product: ${product.name}\nPrice: $${product.price}\nStock: ${product.stock_quantity}\nDescription: ${product.description || 'N/A'}`);
    },

    async handleImageSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = '';
        }
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = '';
        }
        return;
      }

      // Validate category is selected
      if (!this.addFormData.category) {
        alert('Please select a category before uploading an image');
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = '';
        }
        return;
      }

      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);

      // Upload image to server
      this.uploadingImage = true;
      try {
        const { uploadImage } = await import('../services/api');
        const result = await uploadImage(file, this.addFormData.category);

        if (result.success) {
          this.addFormData.image = result.data.url;
          this.imagePreview = result.data.url;
        } else {
          alert(result.message || 'Failed to upload image');
          this.imagePreview = null;
          this.addFormData.image = '';
          if (this.$refs.fileInput) {
            this.$refs.fileInput.value = '';
          }
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image. Please try again.';
        alert(errorMessage);
        this.imagePreview = null;
        this.addFormData.image = '';
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = '';
        }
      } finally {
        this.uploadingImage = false;
      }
    },

    removeImage() {
      this.imagePreview = null;
      this.addFormData.image = '';
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    handleDrop(event) {
      event.preventDefault();
      this.isDragging = false;
      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        // Create a fake event object to reuse handleImageSelect
        const fakeEvent = {
          target: {
            files: [file]
          }
        };
        this.handleImageSelect(fakeEvent);
      }
    },

    async handleAddProduct() {
      // Validate required fields
      if (!this.addFormData.name || !this.addFormData.name.trim()) {
        alert('Please enter a product name');
        return;
      }

      if (!this.addFormData.price || this.addFormData.price <= 0) {
        alert('Please enter a valid price');
        return;
      }

      if (this.addFormData.stock_quantity < 0) {
        alert('Stock quantity cannot be negative');
        return;
      }

      // If image preview exists but no image URL, wait for upload to complete
      if (this.imagePreview && !this.addFormData.image && this.uploadingImage) {
        alert('Please wait for image upload to complete');
        return;
      }

      this.adding = true;
      try {
        const { createProduct } = await import('../services/api');
        const response = await createProduct({
          name: this.addFormData.name.trim(),
          product_code: this.addFormData.product_code?.trim() || undefined,
          price: parseFloat(this.addFormData.price),
          stock_quantity: parseInt(this.addFormData.stock_quantity) || 0,
          description: this.addFormData.description?.trim() || undefined,
          image: this.addFormData.image || undefined,
          category: this.addFormData.category || undefined
        });

        if (response.success) {
          // Refresh products list
          await this.$store.dispatch('fetchPrices');
          // Reset form
          this.resetAddForm();
          this.showAddModal = false;
          // Show success message (optional - you can replace with a toast notification)
          alert('Product added successfully!');
        } else {
          alert(response.message || 'Failed to create product');
        }
      } catch (error) {
        console.error('Error creating product:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create product. Please try again.';
        alert(errorMessage);
      } finally {
        this.adding = false;
      }
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
      const headers = ['Product', 'SKU', 'Price', 'Category', 'Stock'];

      // Prepare CSV rows from filtered products
      const rows = this.filteredProducts.map(product => {
        const productName = product.name || '';
        const sku = product.product_code || product.id?.slice(0, 8).toUpperCase() || '';
        const price = product.price ? `$${this.formatCurrency(product.price)}` : '$0.00';
        const category = this.getCategory(product);
        const stock = product.stock_quantity || 0;

        return [
          escapeCSV(productName),
          escapeCSV(sku),
          escapeCSV(price),
          escapeCSV(category),
          escapeCSV(stock)
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
      const filename = `products_export_${dateStr}.csv`;
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
  justify-content: end;
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
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
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

.modal-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.product-info {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.product-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.product-code {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.required {
  color: var(--danger-color);
}

.form-input {
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

.form-input select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%236366F1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--bg-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-with-symbol {
  position: relative;
  display: flex;
  align-items: center;
}

.input-symbol {
  position: absolute;
  left: 1rem;
  color: var(--text-secondary);
  font-weight: 600;
  pointer-events: none;
}

.input-with-symbol .form-input {
  padding-left: 2rem;
}

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
  resize: vertical;
  min-height: 80px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--bg-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  display: block;
}

.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-secondary);
  position: relative;
}

.upload-area:hover {
  border-color: var(--primary-color);
  background: var(--bg-tertiary);
}

.upload-area.drag-over {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.1);
  border-style: solid;
}

.file-input {
  display: none;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.upload-label svg {
  color: var(--primary-color);
}

.upload-label span {
  font-weight: 600;
  color: var(--text-primary);
}

.upload-label small {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.image-preview {
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.preview-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.btn-remove-image {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-remove-image:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.1);
}

.upload-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: var(--text-secondary);
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
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

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-icon {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

  .modal-content {
    margin: 1rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
