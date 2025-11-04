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
                <div class="category-item">
                    <img src="/product-category/electronics.png" alt="Electronics" />
                    <h3>Electronics</h3>
                </div>
                <div class="category-item">
                    <img src="/product-category/clothe.png" alt="Clothing" />
                    <h3>Clothing</h3>
                </div>
            </div>
        </section>

        <!-- Featured Products Section -->
        <section class="featured-products">
            <h2 class="section-title">Featured Products</h2>
            <div class="product-list">
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
            <div v-if="productsToShow < allProducts.length" class="show-more-btn">
                <button @click="showMoreProducts">Show More</button>
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
    import product from '../../constant.json';
    import { orderData, getProductRatingData } from '../../services/api';

    export default {
        name: 'HomeComponent',
        data() {
            return {
                products: product,
                productsToShow: 6, // number of products to show initially
                productsBatch: 6, // number of products to add per "Show More"
                cartItems: {}, // product_id → quantity
                loadingItems: {} // product_id → loading state

                ,selectedFile: null,
                previewImage: null,

                averageRatings: {}
            };
        },

        computed: {
            allProducts() {
                return [...this.products];
            },
            displayedProducts() {
                return this.allProducts.slice(0, this.productsToShow);
            }
        },

        methods: {
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
                this.$router.push(`/product-detail/${product.id}`)
            },

            showMoreProducts() {
                this.productsToShow += this.productsBatch;
            }
        },

        mounted() {
            this.displayedProducts.forEach(product => {
                this.getProductRatingData(product.id);
            });
        }
    };
</script>


<style scoped>
    * {
        box-sizing: border-box;
    }

    body {
        background-color: #f8f9fa;
        font-family: 'Montserrat', sans-serif;
        margin: 0;
        padding: 0;
    }

    .hero-section {
        /* background: url("") no-repeat center center/cover; */
        padding: 100px 20px 0px 20px;
        color: #fff;
        text-align: center;
    }

    .hero-section h1 {
        font-size: 48px;
        font-weight: 700;
        margin-bottom: 20px;
    }

    .hero-section p {
        font-size: 20px;
        margin-bottom: 40px;
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
        margin: 60px 0;
        text-align: center;
    }

    .categories .category-list {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
    }

    .category-item {
        width: 200px;
        text-align: center;
        margin: 20px;
        border-radius: 8px;
        overflow: hidden;
    }

    .category-item img {
        width: 100%;
        height: 200px;
        object-fit: cover;
    }

    .category-item h3 {
        font-size: 20px;
        font-weight: 600;
        margin-top: 10px;
    }

    .featured-products {
        margin: 60px 0;
    }

    .product-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 90px;
    }

    .product-item {
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
        padding: 20px;
        text-align: center;
        transition: transform 0.3s ease;
    }

    .product-item:hover {
        transform: scale(1.05);
    }

    .product-item img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
    }

    .product-item h3 {
        font-size: 18px;
        font-weight: 600;
        margin-top: 10px;
    }

    .product-item p {
        font-size: 16px;
        color: #167bff;
        margin: 10px 0;
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
        padding: 10px 20px;
        background-color: #167bff;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
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
        margin-top: 20px;
    }

    .show-more-btn button {
        padding: 10px 20px;
        background-color: #167bff;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .show-more-btn button:hover {
        background-color: #0056b3;
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
        /* background-color: #e7eff6; */
        padding: 40px 20px;
        text-align: center;
    }

    .testimonials .testimonial-list {
        display: flex;
        justify-content: center;
        gap: 50px;
        flex-wrap: wrap;
    }

    .testimonial-item {
        width: 280px;
        background-color: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .testimonial-item p {
        font-size: 16px;
        font-style: italic;
    }

    .testimonial-item h3 {
        font-size: 18px;
        font-weight: 600;
        margin-top: 10px;
    }

    .footer {
        background-color: #333;
        color: #fff;
        padding: 40px 20px;
        text-align: center;
    }

    .footer-content {
        max-width: 1200px;
        margin: 0 auto;
    }

    .social-links {
        margin-top: 20px;
    }

    .social-links a {
        color: #fff;
        margin: 0 10px;
        text-decoration: none;
    }

    .social-links a:hover {
        color: #167bff;
    }
</style>