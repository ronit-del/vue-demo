import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './Dashboard.vue';
import Orders from './Order.vue';
import Customers from './Customer.vue';
import Prices from './Price.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
  },
  {
    path: '/customers',
    name: 'Customers',
    component: Customers,
  },
  {
    path: '/prices',
    name: 'Prices',
    component: Prices,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;