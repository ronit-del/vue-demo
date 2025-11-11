import axios from 'axios';

const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://192.168.0.111:3000',
    timeout: 5000,
});

// Dashboard API
export const getDashboardStats = async () => {
    try {
        const response = await api.get('/api/dashboard/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

// Orders API
export const getOrders = async () => {
    try {
        const response = await api.get('/api/orders');
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

export const getOrderById = async (id) => {
    try {
        const response = await api.get(`/api/orders/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
};

export const updateOrderStatus = async (id, status) => {
    try {
        const response = await api.put(`/api/orders/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

export const updateOrder = async (id, data) => {
    try {
        const response = await api.put(`/api/orders/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating order:', error);
        throw error;
    }
};

// Customers API
export const getCustomers = async () => {
    try {
        const response = await api.get('/api/customers');
        return response.data;
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
};

export const getCustomerById = async (id) => {
    try {
        const response = await api.get(`/api/customers/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching customer:', error);
        throw error;
    }
};

export const getCustomerOrders = async (id) => {
    try {
        const response = await api.get(`/api/customers/${id}/orders`);
        return response.data;
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        throw error;
    }
};

// Prices API
export const getPrices = async () => {
    try {
        const response = await api.get('/api/prices');
        return response.data;
    } catch (error) {
        console.error('Error fetching prices:', error);
        throw error;
    }
};

export const getPriceById = async (id) => {
    try {
        const response = await api.get(`/api/prices/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching price:', error);
        throw error;
    }
};

export const updatePrice = async (id, data) => {
    try {
        const response = await api.put(`/api/prices/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating price:', error);
        throw error;
    }
};

