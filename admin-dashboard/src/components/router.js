import { createRouter, createWebHistory } from 'vue-router';
import store from '../services/stores/index.js';
import Dashboard from './Dashboard.vue';
import Orders from './Order.vue';
import OrderDetails from './OrderDetails.vue';
import OrderEdit from './OrderEdit.vue';
import Customers from './Customer.vue';
import CustomerEdit from './CustomerEdit.vue';
import Prices from './Price.vue';
import Login from './Login.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetails',
    component: OrderDetails,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/:id/edit',
    name: 'OrderEdit',
    component: OrderEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/customers',
    name: 'Customers',
    component: Customers,
    meta: { requiresAuth: true }
  },
  {
    path: '/customers/:id/edit',
    name: 'CustomerEdit',
    component: CustomerEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/prices',
    name: 'Prices',
    component: Prices,
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.state.auth.isAuthenticated;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if route requires auth and user is not authenticated
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    // Redirect to dashboard if already logged in and trying to access login
    next('/');
  } else {
    next();
  }
});

export default router;