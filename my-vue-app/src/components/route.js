import { createRouter, createWebHistory } from 'vue-router';
import HomeComponent from './views/Home.vue';
import LoginComponent from './views/Login.vue';
import RegisterComponent from './views/Register.vue';
import ForgotPasswordComponent from './views/Forgot-Password.vue';
import VerifyComponent from './views/Verify.vue';
import ResetPasswordComponent from './views/ResetPassword.vue'
import Checkout from './views/Checkout.vue';
import ProductDetail from './views/Product-Detail.vue';
import PaymentSuccess from './views/PaymentSuccess.vue';
import ProductsComponent from './views/Products.vue';
import Profile from './views/Profile.vue';
import TrackOrder from './views/TrackOrder.vue';
import MyOrders from './views/MyOrders.vue';

const routes = [
    { path: '/', component: HomeComponent },
    { path: '/login', component: LoginComponent },
    { path: '/register', component: RegisterComponent },
    { path: '/forgot-password', component: ForgotPasswordComponent },
    { path: '/verify/:token', component: VerifyComponent },
    { path: '/reset-password/:token', component: ResetPasswordComponent },
    { path: '/product-detail/:id', component: ProductDetail },
    { path: '/checkout', component: Checkout },
    { path: '/order-success', component: PaymentSuccess},
    { path: '/products', component: ProductsComponent },
    { path: '/profile', component: Profile },
    { path: '/track-order/:orderNumber?', component: TrackOrder },
    { path: '/my-orders', component: MyOrders },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;