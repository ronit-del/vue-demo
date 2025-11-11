<template>
    <div class="home-container">
        <!-- Hero Section -->
        <section class="hero-section">
            <div class="hero-content">
                <h1>SmartShop - Best Deals Just for You</h1>
                <p>Order your favorite products with amazing discounts!</p>
            </div>
        </section>

        <!-- Categories Section -->
        <section class="categories">
            <h2 class="section-title">Shop by Categories</h2>
            <div class="category-list">
                <div 
                    v-for="category in categories" 
                    :key="category.id"
                    class="category-item"
                    @click="filterByCategory(category.id)"
                    :class="{ active: selectedCategory === category.id }"
                >
                    <img :src="category.image" :alt="category.name" />
                    <h3>{{ category.name }}</h3>
                    <p class="category-count">{{ getCategoryCount(category.id) }} products</p>
                </div>
            </div>
        </section>

        <!-- Featured Products Section -->
        <section class="featured-products">
            <h2 class="section-title">Featured Products</h2>
            <div v-if="loading" class="loading-state">
                <p>Loading products...</p>
            </div>
            <div v-else-if="products.length === 0" class="empty-state">
                <p>No products available at the moment.</p>
            </div>
            <div v-else class="product-list">
                <div v-for="(product) in displayedProducts" :key="product.id" class="product-item">
                    <img :src="resolveImagePath(product.image)" :alt="product.name" />
                    <h3>{{ product.name }}</h3>
                    <p>${{ product.price }}</p>

                    <!-- ⭐ Show Average Rating -->
                    <div class="product-rating">
                        <span v-if="averageRatings[product.id] !== undefined">
                            ⭐ {{ averageRatings[product.id].toFixed(1) }} / 5
                        </span>
                        <span v-else>Loading rating...</span>
                    </div>

                    <div v-if="!cartItems[product.id]" class="product-item-list">
                        <button class="view-product-btn" @click="viewProduct(product)">
                            <span>View Product</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Show More Button -->
            <div v-if="!loading && products.length > 0 && productsToShow < allProducts.length" class="show-more-btn">
                <button @click="goToProductsPage">Show More Products</button>
            </div>
        </section>

        <!-- Best Offers Section -->
        <!-- <section class="best-offers">
            <h2 class="section-title">Best Offers</h2>
            <div class="offers-list">
                <div class="offer-item">
                    <img src="" alt="Offer 1" />
                    <h3>20% Off on Electronics</h3>
                </div>
                <div class="offer-item">
                    <img src="" alt="Offer 2" />
                    <h3>Buy 1 Get 1 Free on Clothing</h3>
                </div>
                <div class="offer-item">
                    <img src="" alt="Offer 3" />
                    <h3>50% Off on Home Appliances</h3>
                </div>
            </div>
        </section> -->

        <!-- Testimonials Section -->
        <section class="testimonials">
            <h2 class="section-title">What Our Customers Say</h2>
            <div class="testimonial-list">
                <div class="testimonial-item">
                    <p>"Great shopping experience! I found everything I needed at great prices."</p>
                    <h3>Mark William</h3>
                </div>
                <div class="testimonial-item">
                    <p>"Fast shipping and amazing customer support. Will shop again!"</p>
                    <h3>David Roy</h3>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div class="footer-content">
                <p>&copy; 2025 SmartShop. All Rights Reserved.</p>
                <div class="social-links">
                    <a href="#">Facebook</a>
                    <a href="#">Instagram</a>
                    <a href="#">Twitter</a>
                </div>
            </div>
        </footer>
    </div>
</template>

<script>
    import { orderData, getProductRatingData, getProducts } from '../../services/api';

    export default {
        name: 'HomeComponent',
        data() {
            return {
                products: [],
                loading: true,
                productsToShow: 4, // number of products to show initially (minimal)
                cartItems: {}, // product_id → quantity
                loadingItems: {}, // product_id → loading state
                selectedFile: null,
                previewImage: null,
                averageRatings: {},
                selectedCategory: null, // selected category filter
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
            allProducts() {
                // Filter by category if one is selected
                if (this.selectedCategory) {
                    return this.products.filter(product => {
                        const category = this.getProductCategory(product);
                        return category === this.selectedCategory;
                    });
                }
                return [...this.products];
            },
            displayedProducts() {
                return this.allProducts.slice(0, this.productsToShow);
            }
        },

        methods: {
            async fetchProducts() {
                this.loading = true;
                try {
                    const response = await getProducts();
                    if (response.success && response.data) {
                        this.products = response.data;
                    } else {
                        console.error('Failed to fetch products:', response);
                        this.products = [];
                    }
                } catch (error) {
                    console.error('Error fetching products:', error);
                    this.products = [];
                    alert('Failed to load products. Please try again later.');
                } finally {
                    this.loading = false;
                }
            },
            getProductCategory(product) {
                // Determine category based on image path
                if (product.image && product.image.includes('electronics')) {
                    return 'electronics';
                } else if (product.image && product.image.includes('clothes')) {
                    return 'clothes';
                } else if (product.image && product.image.includes('home appliance')) {
                    return 'home_appliances';
                } else if (product.image && product.image.includes('beauty')) {
                    return 'beauty';
                }
                return null;
            },
            filterByCategory(categoryId) {
                if (this.selectedCategory === categoryId) {
                    // If clicking the same category, deselect it
                    this.selectedCategory = null;
                } else {
                    this.selectedCategory = categoryId;
                }
                // Reset products to show
                this.productsToShow = 6;
            },
            getCategoryCount(categoryId) {
                return this.products.filter(product => {
                    const category = this.getProductCategory(product);
                    return category === categoryId;
                }).length;
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

            resolveImagePath(image) {
                if (!image) return '';
                return `/${image}`;
            },

            addToCart(product) {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user) {
                    alert('Please log in first');
                    return;
                }

                this.loadingItems[product.id] = true;

                const data = {
                    user_id: user.id,
                    product_id: product.id,
                    price: product.price,
                    quantity: 1
                };

                orderData(data)
                    .then((response) => {
                        if (response.success) {
                        this.cartItems[product.id] = 1;
                        alert(response.message);
                        } else {
                        alert(response.error);
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        alert(error.response?.data?.error || 'Something went wrong');
                    })
                    .finally(() => {
                        this.loadingItems[product.id] = false;
                    }
                );
            },

            viewProduct(product) {
                console.log(product);
                this.$router.push(`/product-detail/${product.id}`)
            },

            goToProductsPage() {
                // Redirect to products page with category filter if one is selected
                if (this.selectedCategory) {
                    this.$router.push({ path: '/products', query: { category: this.selectedCategory } });
                } else {
                    this.$router.push('/products');
                }
            }
        },

        async mounted() {
            await this.fetchProducts();
            // Fetch ratings for displayed products after products are loaded
            if (this.displayedProducts.length > 0) {
                this.displayedProducts.forEach(product => {
                    this.getProductRatingData(product.id);
                });
            }
        }
    };
</script>


<style scoped>
    * {
        box-sizing: border-box;
    }

    body {
        background-color: var(--bg-secondary);
        font-family: 'Montserrat', sans-serif;
        margin: 0;
        padding: 0;
    }

    .home-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 1rem;
    }

    .hero-section {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        padding: 6rem 2rem 4rem;
        color: white;
        text-align: center;
        border-radius: 16px;
        margin: 2rem 0;
        box-shadow: var(--shadow-lg);
        position: relative;
        overflow: hidden;
    }

    .hero-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
        opacity: 0.3;
    }

    .hero-content {
        position: relative;
        z-index: 1;
    }

    .hero-section h1 {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    .hero-section p {
        font-size: 1.25rem;
        margin-bottom: 2rem;
        opacity: 0.95;
    }

    .search-bar {
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }

    .search-bar input {
        padding: 10px;
        width: 60%;
        border-radius: 20px 0 0 20px;
        border: 2px solid #167bff;
        font-size: 16px;
    }

    .search-bar button {
        padding: 10px 20px;
        background-color: #167bff;
        border: none;
        border-radius: 0 20px 20px 0;
        color: white;
        cursor: pointer;
    }

    .search-bar button:hover {
        background-color: #0056b3;
    }

    .categories {
        margin: 4rem 0;
        text-align: center;
    }

    .section-title {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 2rem;
        text-align: center;
    }

    .categories .category-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        justify-items: center;
    }

    .category-item {
        width: 100%;
        max-width: 300px;
        text-align: center;
        background: var(--bg-primary);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
    }

    .category-item:hover {
        transform: translateY(-8px);
        box-shadow: var(--shadow-xl);
    }

    .category-item.active {
        border: 2px solid var(--primary-color);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .category-count {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-top: 0.5rem;
        font-weight: 500;
    }

    .category-item img {
        width: 100%;
        height: 250px;
        object-fit: cover;
    }

    .category-item h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 1rem 0;
        color: var(--text-primary);
    }

    .featured-products {
        margin: 4rem 0;
    }

    .product-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 2rem;
        padding: 1rem 0;
    }

    .loading-state,
    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--text-secondary);
    }

    .loading-state p,
    .empty-state p {
        font-size: 1.125rem;
        font-weight: 500;
    }

    .product-item {
        background-color: var(--bg-primary);
        border-radius: 12px;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        padding: 1.5rem;
        text-align: center;
        transition: all 0.3s ease;
        overflow: hidden;
        position: relative;
    }

    .product-item:hover {
        transform: translateY(-8px);
        box-shadow: var(--shadow-xl);
    }

    .product-item img {
        width: 100%;
        height: 220px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 1rem;
        transition: transform 0.3s ease;
    }

    .product-item:hover img {
        transform: scale(1.05);
    }

    .product-item h3 {
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0.75rem 0;
        color: var(--text-primary);
        line-height: 1.4;
    }

    .product-item p {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary-color);
        margin: 0.75rem 0;
    }

    .product-rating {
        margin: 0.75rem 0;
        font-size: 0.875rem;
        color: var(--text-secondary);
        font-weight: 600;
    }

    .product-rating span {
        color: var(--warning-color);
    }

    .product-item-list {
        display: flex;
        justify-content: space-around;
    }

    .add-to-cart-btn {
        padding: 10px 20px;
        background-color: #167bff;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .add-to-cart-btn:hover {
        background-color: #0056b3;
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
        margin-top: 0.75rem;
    }

    .view-product-btn:hover {
        background: linear-gradient(135deg, var(--primary-dark), #4338ca);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }

    .quantity-control {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    }

    .qty-btn {
    background-color: #167bff;
    color: white;
    border: none;
    border-radius: 4px;
    width: 30px;
    height: 30px;
    font-size: 20px;
    cursor: pointer;
    }

    .qty-btn:hover {
    background-color: #0056b3;
    }

    .qty-value {
    font-size: 18px;
    font-weight: 600;
    }


    .best-offers {
        /* background-color: #f1f1f1; */
        padding: 60px 20px;
        text-align: center;
    }

    .best-offers .offers-list {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
    }

    .show-more-btn {
        text-align: center;
        margin-top: 3rem;
    }

    .show-more-btn button {
        padding: 1rem 2rem;
        background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.3s ease;
        box-shadow: var(--shadow-md);
    }

    .show-more-btn button:hover {
        background: linear-gradient(135deg, var(--primary-dark), #4338ca);
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }

    .offer-item {
        width: 30%;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        padding: 20px;
        margin: 10px;
    }

    .offer-item img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
    }

    .offer-item h3 {
        font-size: 18px;
        font-weight: 600;
        margin-top: 15px;
    }

    .testimonials {
        margin: 4rem 0;
        padding: 3rem 0;
        text-align: center;
    }

    .testimonials .testimonial-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        justify-items: center;
        margin-top: 2rem;
    }

    .testimonial-item {
        width: 100%;
        max-width: 350px;
        background-color: var(--bg-primary);
        padding: 2rem;
        border-radius: 12px;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
    }

    .testimonial-item:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
    }

    .testimonial-item p {
        font-size: 1rem;
        font-style: italic;
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 1rem;
    }

    .testimonial-item h3 {
        font-size: 1.125rem;
        font-weight: 600;
        margin-top: 1rem;
        color: var(--text-primary);
    }

    .footer {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        color: white;
        padding: 3rem 2rem;
        text-align: center;
        margin-top: 4rem;
        border-radius: 16px 16px 0 0;
    }

    .footer-content {
        max-width: 1200px;
        margin: 0 auto;
    }

    .footer-content p {
        margin-bottom: 1rem;
        color: rgba(255, 255, 255, 0.8);
    }

    .social-links {
        margin-top: 1.5rem;
        display: flex;
        justify-content: center;
        gap: 1.5rem;
    }

    .social-links a {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        font-weight: 500;
        transition: all 0.3s ease;
        padding: 0.5rem 1rem;
        border-radius: 6px;
    }

    .social-links a:hover {
        color: white;
        background: rgba(255, 255, 255, 0.1);
    }

    @media (max-width: 768px) {
        .hero-section {
            padding: 4rem 1.5rem 3rem;
        }

        .hero-section h1 {
            font-size: 2rem;
        }

        .hero-section p {
            font-size: 1rem;
        }

        .section-title {
            font-size: 1.5rem;
        }

        .product-list {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1.5rem;
        }

        .category-list {
            grid-template-columns: 1fr;
        }
    }
</style>