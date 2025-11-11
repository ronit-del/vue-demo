/* eslint-disable no-useless-catch */
import { createStore } from 'vuex';
import {
  getDashboardStats,
  getOrders,
  getCustomers,
  getPrices,
  getProducts,
  login as loginAPI,
  getNotifications,
  getNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../api';

// Load auth state from localStorage
const loadAuthState = () => {
  try {
    const user = localStorage.getItem('admin_user');
    const token = localStorage.getItem('admin_token');
    if (user && token) {
      return {
        user: JSON.parse(user),
        token: token,
        isAuthenticated: true
      };
    }
  } catch (error) {
    console.error('Error loading auth state:', error);
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false
  };
};

const authState = loadAuthState();

export default createStore({
  state: {
    auth: {
      user: authState.user,
      token: authState.token,
      isAuthenticated: authState.isAuthenticated
    },
    orders: [],
    customers: [],
    prices: {},
    products: [],
    dashboardStats: {
      totalOrders: 0,
      totalCustomers: 0,
      revenue: 0,
      pendingOrders: 0
    },
    notifications: [],
    notificationCount: 0
  },
  mutations: {
    setAuth(state, { user, token }) {
      state.auth.user = user;
      state.auth.token = token;
      state.auth.isAuthenticated = true;
      localStorage.setItem('admin_user', JSON.stringify(user));
      localStorage.setItem('admin_token', token);
    },
    clearAuth(state) {
      state.auth.user = null;
      state.auth.token = null;
      state.auth.isAuthenticated = false;
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_token');
    },
    setOrders(state, orders) {
      state.orders = orders;
    },
    setCustomers(state, customers) {
      state.customers = customers;
    },
    setPrices(state, prices) {
      state.prices = prices;
    },
    setProducts(state, products) {
      state.products = products;
    },
    setDashboardStats(state, stats) {
      state.dashboardStats = stats;
    },
    setNotifications(state, notifications) {
      state.notifications = notifications;
    },
    setNotificationCount(state, count) {
      state.notificationCount = count;
    },
    updateNotificationRead(state, notificationId) {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.is_read = true;
        notification.read_at = new Date().toISOString();
      }
      if (state.notificationCount > 0) {
        state.notificationCount--;
      }
    },
    markAllNotificationsRead(state) {
      state.notifications.forEach(n => {
        n.is_read = true;
        n.read_at = new Date().toISOString();
      });
      state.notificationCount = 0;
    },
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await loginAPI(credentials);
        if (response.success && response.userToken && response.token) {
          commit('setAuth', {
            user: response.userToken,
            token: response.token
          });
          return response;
        } else {
          throw new Error(response.error || 'Login failed');
        }
      } catch (error) {
        throw error;
      }
    },
    logout({ commit }) {
      commit('clearAuth');
    },
    async fetchOrders({ commit }) {
      try {
        const data = await getOrders();
        commit('setOrders', data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Keep existing data or set empty array on error
        commit('setOrders', []);
      }
    },
    async fetchCustomers({ commit }) {
      try {
        const data = await getCustomers();
        commit('setCustomers', data);
      } catch (error) {
        console.error('Error fetching customers:', error);
        commit('setCustomers', []);
      }
    },
    async fetchPrices({ commit }) {
      try {
        const data = await getPrices();
        // The API returns { prices: {}, products: [] }
        commit('setPrices', data.prices || {});
        commit('setProducts', data.products || []);
      } catch (error) {
        console.error('Error fetching prices:', error);
        commit('setPrices', {});
        commit('setProducts', []);
      }
    },
    async fetchDashboardStats({ commit }) {
      try {
        const response = await getDashboardStats();
        if (response.success && response.data) {
          commit('setDashboardStats', response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Keep existing stats on error
      }
    },
    async fetchProducts({ commit }) {
      try {
        const response = await getProducts();
        if (response.success && response.data) {
          commit('setProducts', response.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        commit('setProducts', []);
      }
    },
    async fetchNotifications({ commit }) {
      try {
        const response = await getNotifications();
        if (response.success && response.data) {
          commit('setNotifications', response.data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        commit('setNotifications', []);
      }
    },
    async fetchNotificationCount({ commit }) {
      try {
        const response = await getNotificationCount();
        if (response.success) {
          commit('setNotificationCount', response.count || 0);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
        commit('setNotificationCount', 0);
      }
    },
    async markNotificationRead({ commit }, notificationId) {
      try {
        const response = await markNotificationAsRead(notificationId);
        if (response.success) {
          commit('updateNotificationRead', notificationId);
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    async markAllNotificationsRead({ commit }) {
      try {
        const response = await markAllNotificationsAsRead();
        if (response.success) {
          commit('markAllNotificationsRead');
        }
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    },
  },
  modules: {},
});