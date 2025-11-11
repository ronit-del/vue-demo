import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './Dashboard.vue';
import Orders from './Order.vue';
import OrderDetails from './OrderDetails.vue';
import OrderEdit from './OrderEdit.vue';
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
    path: '/orders/:id',
    name: 'OrderDetails',
    component: OrderDetails,
  },
  {
    path: '/orders/:id/edit',
    name: 'OrderEdit',
    component: OrderEdit,
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