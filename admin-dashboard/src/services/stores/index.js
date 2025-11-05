import { createStore } from 'vuex';
import {
  getDashboardStats,
  getOrders,
  getCustomers,
  getPrices
} from '../api';

export default createStore({
  state: {
    orders: [],
    customers: [],
    prices: {},
    products: [],
    dashboardStats: {
      totalOrders: 0,
      totalCustomers: 0,
      revenue: 0,
      pendingOrders: 0
    }
  },
  mutations: {
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
  },
  actions: {
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
  },
  modules: {},
});