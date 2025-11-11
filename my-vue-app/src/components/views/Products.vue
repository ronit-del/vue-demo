<template>
    <div class="products-page">
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">All Products</h1>
            <p class="page-subtitle">Browse our complete collection</p>
        </div>

        <div class="products-container">
            <!-- Sidebar - Categories Filter -->
            <aside class="sidebar">
                <div class="sidebar-content">
                    <h2 class="sidebar-title">Categories</h2>
                    <div class="category-filters">
                        <button 
                            class="category-filter-btn"
                            :class="{ active: selectedCategory === null }"
                            @click="filterByCategory(null)"
                        >
                            All Products
                            <span class="count">({{ products.length }})</span>
                        </button>
                        <button 
                            v-for="category in categories" 
                            :key="category.id"
                            class="category-filter-btn"
                            :class="{ active: selectedCategory === category.id }"
                            @click="filterByCategory(category.id)"
                        >
                            {{ category.name }}
                            <span class="count">({{ getCategoryCount(category.id) }})</span>
                        </button>
                    </div>
                </div>
            </aside>

            <!-- Main Content - Products Grid -->
            <main class="products-main">
                <!-- Products Header -->
                <div class="products-header">
                    <p class="products-count">
                        Showing {{ filteredProducts.length }} product{{ filteredProducts.length !== 1 ? 's' : '' }}
                    </p>
                    <div class="sort-options">
                        <select v-model="sortBy" class="sort-select">
                            <option value="default">Default</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name-asc">Name: A to Z</option>
                            <option value="name-desc">Name: Z to A</option>
                        </select>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="loading-state">
                    <p>Loading products...</p>
                </div>
                
                <!-- Error State -->
                <div v-else-if="error" class="error-state">
                    <p>{{ error }}</p>
                    <button @click="fetchProducts" class="retry-btn">Retry</button>
                </div>
                
                <!-- Products Grid -->
                <div v-else-if="filteredProducts.length === 0" class="empty-state">
                    <p>No products found in this category.</p>
                </div>
                <div v-else class="products-grid">
                    <div 
                        v-for="product in sortedProducts" 
                        :key="product.id" 
                        class="product-card"
                        @click="viewProduct(product)"
                    >
                        <div class="product-image-wrapper">
                            <img :src="resolveImagePath(product.image)" :alt="product.name" />
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">{{ product.name }}</h3>
                            <p class="product-price">${{ product.price }}</p>
                            <p class="product-description">{{ product.description }}</p>
                            
                            <!-- Rating -->
                            <div class="product-rating" v-if="averageRatings[product.id] !== undefined">
                                ⭐ {{ averageRatings[product.id].toFixed(1) }} / 5
                            </div>
                            <div class="product-rating" v-else>
                                <span @click.stop="getProductRatingData(product.id)">Loading rating...</span>
                            </div>

                            <button class="view-product-btn" @click.stop="viewProduct(product)">
                                View Product
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script>
    import { getProductRatingData, getProducts } from '../../services/api';

    export default {
        name: 'ProductsComponent',
        data() {
            return {
                products: [],
                loading: false,
                error: null,
                selectedCategory: null,
                sortBy: 'default',
                averageRatings: {},
                categories: [
                    {
                        id: 'electronics',
                        name: 'Electronics',
                        image: '/product-category/electronics.png'
                    },
                    {
                        id: 'clothes',
                        name: 'Clothing',
                        image: '/product-category/clothe.png'
                    },
                    {
                        id: 'home_appliances',
                        name: 'Home Appliances',
                        image: '/product-category/home_appliances.png'
                    },
                    {
                        id: 'beauty',
                        name: 'Beauty',
                        image: '/product-category/beuty.png'
                    }
                ]
            };
        },
        computed: {
            filteredProducts() {
                if (!this.selectedCategory) {
                    return this.products;
                }
                return this.products.filter(product => {
                    const category = this.getProductCategory(product);
                    return category === this.selectedCategory;
                });
            },
            sortedProducts() {
                const products = [...this.filteredProducts];
                
                switch (this.sortBy) {
                    case 'price-low':
                        return products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                    case 'price-high':
                        return products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                    case 'name-asc':
                        return products.sort((a, b) => a.name.localeCompare(b.name));
                    case 'name-desc':
                        return products.sort((a, b) => b.name.localeCompare(a.name));
                    default:
                        return products;
                }
            }
        },
        methods: {
            getProductCategory(product) {
                if (product.image && product.image.includes('electronics')) {
                    return 'electronics';
                } else if (product.image && product.image.includes('clothes')) {
                    return 'clothes';
                } else if (product.image && product.image.includes('home appliance')) {
                    return 'home_appliances';
                } else if (product.image && product.image.includes('beuty')) {
                    return 'beauty';
                }
                return null;
            },
            filterByCategory(categoryId) {
                this.selectedCategory = categoryId;
            },
            getCategoryCount(categoryId) {
                return this.products.filter(product => {
                    const category = this.getProductCategory(product);
                    return category === categoryId;
                }).length;
            },
            resolveImagePath(image) {
                if (!image) return '';
                return `/${image}`;
            },
            async getProductRatingData(product_id) {
                const user = JSON.parse(localStorage.getItem('user'));
                const data = { user_id: user?.id || null, product_id };

                try {
                    const response = await getProductRatingData(data);
                    const ratings = response.data;

                    if (ratings.length > 0) {
                        const average =
                            ratings.reduce((sum, review) => sum + review.rating, 0) / ratings.length;
                        this.averageRatings[product_id] = average;
                    } else {
                        this.averageRatings[product_id] = 0;
                    }
                } catch (error) {
                    this.averageRatings[product_id] = 0;
                }
            },
            viewProduct(product) {
                console.log('product', product);
                this.$router.push(`/product-detail/${product.id}`);
            },
            async fetchProducts() {
                this.loading = true;
                this.error = null;
                try {
                    const response = await getProducts();
                    if (response.success && response.data) {
                        this.products = response.data;
                        // Ratings will be loaded via the watch on filteredProducts
                    } else {
                        this.error = 'Failed to load products';
                        this.products = [];
                    }
                } catch (error) {
                    console.error('Error fetching products:', error);
                    this.error = 'Failed to load products. Please try again later.';
                    this.products = [];
                } finally {
                    this.loading = false;
                }
            }
        },
        mounted() {
            // Check if category is passed via route query
            if (this.$route.query.category) {
                this.selectedCategory = this.$route.query.category;
            }
            
            // Fetch products from database
            this.fetchProducts();
        },
        watch: {
            filteredProducts() {
                // Load ratings when products change
                this.filteredProducts.forEach(product => {
                    if (!this.averageRatings[product.id]) {
                        this.getProductRatingData(product.id);
                    }
                });
            }
        }
    };
</script>

<style scoped>
    .products-page {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    .page-header {
        text-align: center;
        margin-bottom: 3rem;
    }

    .page-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }

    .page-subtitle {
        font-size: 1.125rem;
        color: var(--text-secondary);
    }

    .products-container {
        display: grid;
        grid-template-columns: 250px 1fr;
        gap: 2rem;
    }

    .sidebar {
        background: var(--bg-primary);
        border-radius: 12px;
        padding: 1.5rem;
        height: fit-content;
        position: sticky;
        top: 2rem;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
    }

    .sidebar-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 1.5rem;
    }

    .category-filters {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .category-filter-btn {
        padding: 0.75rem 1rem;
        text-align: left;
        background: transparent;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-primary);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .category-filter-btn:hover {
        background: var(--bg-secondary);
        border-color: var(--primary-color);
    }

    .category-filter-btn.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
    }

    .category-filter-btn .count {
        font-size: 0.75rem;
        opacity: 0.8;
    }

    .products-main {
        flex: 1;
    }

    .products-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding: 1rem;
        background: var(--bg-primary);
        border-radius: 8px;
        border: 1px solid var(--border-color);
    }

    .products-count {
        font-size: 0.875rem;
        color: var(--text-secondary);
        font-weight: 500;
    }

    .sort-select {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-size: 0.875rem;
        cursor: pointer;
    }

    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--text-secondary);
    }

    .loading-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--text-secondary);
    }

    .error-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--error-color, #ef4444);
    }

    .retry-btn {
        margin-top: 1rem;
        padding: 0.75rem 1.5rem;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
    }

    .retry-btn:hover {
        background: var(--primary-dark);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }

    .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 2rem;
    }

    .product-card {
        background: var(--bg-primary);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .product-card:hover {
        transform: translateY(-8px);
        box-shadow: var(--shadow-xl);
    }

    .product-image-wrapper {
        width: 100%;
        height: 250px;
        overflow: hidden;
    }

    .product-image-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .product-card:hover .product-image-wrapper img {
        transform: scale(1.05);
    }

    .product-info {
        padding: 1.5rem;
    }

    .product-name {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }

    .product-price {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }

    .product-description {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 0.75rem;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .product-rating {
        font-size: 0.875rem;
        color: var(--warning-color);
        font-weight: 600;
        margin-bottom: 1rem;
    }

    .view-product-btn {
        width: 100%;
        padding: 0.875rem 1.5rem;
        background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.875rem;
        transition: all 0.3s ease;
    }

    .view-product-btn:hover {
        background: linear-gradient(135deg, var(--primary-dark), #4338ca);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }

    @media (max-width: 968px) {
        .products-container {
            grid-template-columns: 1fr;
        }

        .sidebar {
            position: static;
        }

        .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1.5rem;
        }
    }

    @media (max-width: 768px) {
        .page-title {
            font-size: 2rem;
        }

        .products-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }

        .products-grid {
            grid-template-columns: 1fr;
        }
    }
</style>

