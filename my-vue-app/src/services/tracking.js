/**
 * Order Tracking Service
 * Tracks order placement events for analytics and monitoring
 */

import axios from 'axios';

const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL,
    timeout: 5000,
});

/**
 * Track order placement event
 * @param {Object} orderData - Order information
 * @param {string} orderData.orderNumber - Order number
 * @param {string} orderData.paymentMethod - Payment method (COD, Stripe)
 * @param {number} orderData.totalAmount - Total order amount
 * @param {Array} orderData.items - Array of order items
 * @param {string} orderData.userId - User ID
 * @param {string} orderData.userEmail - User email
 * @param {string} orderData.status - Order status
 */
export const trackOrderPlaced = async (orderData) => {
    try {
        const {
            orderNumber,
            paymentMethod,
            totalAmount,
            items = [],
            userId,
            userEmail,
            status = 'Processing'
        } = orderData;

        // Prepare tracking data
        const trackingData = {
            event: 'order_placed',
            timestamp: new Date().toISOString(),
            order_number: orderNumber,
            payment_method: paymentMethod,
            total_amount: totalAmount,
            currency: 'USD',
            user_id: userId,
            user_email: userEmail,
            status: status,
            item_count: items.length,
            items: items.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name || item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity
            }))
        };

        // Track in console (for development)
        console.log('📊 Order Tracking Event:', trackingData);

        // Send to backend tracking endpoint
        try {
            await api.post('/api/tracking/order', trackingData);
        } catch (error) {
            // Silently fail tracking - don't break the order flow
            console.warn('Tracking error (non-blocking):', error.message);
        }

        // Google Analytics 4 (gtag) tracking
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'purchase', {
                transaction_id: orderNumber,
                value: totalAmount,
                currency: 'USD',
                payment_type: paymentMethod,
                items: items.map(item => ({
                    item_id: item.product_id,
                    item_name: item.product_name || item.name,
                    quantity: item.quantity,
                    price: item.price
                }))
            });
        }

        // Google Analytics Universal Analytics (ga) tracking
        if (typeof window !== 'undefined' && window.ga) {
            window.ga('send', 'event', 'Ecommerce', 'Purchase', {
                transactionId: orderNumber,
                revenue: totalAmount,
                currency: 'USD',
                paymentType: paymentMethod
            });
        }

        // Facebook Pixel tracking (if available)
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'Purchase', {
                value: totalAmount,
                currency: 'USD',
                content_name: `Order ${orderNumber}`,
                content_ids: items.map(item => item.product_id),
                num_items: items.length
            });
        }

        // Custom dataLayer for GTM (Google Tag Manager)
        if (typeof window !== 'undefined' && window.dataLayer) {
            window.dataLayer.push({
                event: 'order_placed',
                ecommerce: {
                    purchase: {
                        actionField: {
                            id: orderNumber,
                            revenue: totalAmount,
                            payment_type: paymentMethod
                        },
                        products: items.map(item => ({
                            id: item.product_id,
                            name: item.product_name || item.name,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                }
            });
        }

    } catch (error) {
        // Silently fail - tracking should never break the order flow
        console.warn('Order tracking error (non-blocking):', error);
    }
};

/**
 * Track order placement attempt (before payment confirmation)
 * @param {Object} orderData - Order information
 */
export const trackOrderAttempt = (orderData) => {
    try {
        const {
            orderNumber,
            paymentMethod,
            totalAmount,
            items = [],
            userId
        } = orderData;

        const trackingData = {
            event: 'order_attempt',
            timestamp: new Date().toISOString(),
            order_number: orderNumber,
            payment_method: paymentMethod,
            total_amount: totalAmount,
            user_id: userId,
            item_count: items.length
        };

        console.log('📊 Order Attempt Tracking:', trackingData);

        // Track in Google Analytics
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'begin_checkout', {
                currency: 'USD',
                value: totalAmount,
                items: items.map(item => ({
                    item_id: item.product_id,
                    item_name: item.product_name || item.name,
                    quantity: item.quantity,
                    price: item.price
                }))
            });
        }

        // Track in dataLayer
        if (typeof window !== 'undefined' && window.dataLayer) {
            window.dataLayer.push({
                event: 'order_attempt',
                order_number: orderNumber,
                payment_method: paymentMethod,
                total_amount: totalAmount
            });
        }

    } catch (error) {
        console.warn('Order attempt tracking error (non-blocking):', error);
    }
};

/**
 * Track order placement failure
 * @param {Object} errorData - Error information
 */
export const trackOrderFailure = (errorData) => {
    try {
        const {
            orderNumber,
            paymentMethod,
            error,
            userId
        } = errorData;

        const trackingData = {
            event: 'order_failed',
            timestamp: new Date().toISOString(),
            order_number: orderNumber,
            payment_method: paymentMethod,
            error: error?.message || error,
            user_id: userId
        };

        console.log('📊 Order Failure Tracking:', trackingData);

        // Track in Google Analytics
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'exception', {
                description: `Order placement failed: ${error?.message || error}`,
                fatal: false
            });
        }

        // Track in dataLayer
        if (typeof window !== 'undefined' && window.dataLayer) {
            window.dataLayer.push({
                event: 'order_failed',
                order_number: orderNumber,
                payment_method: paymentMethod,
                error: error?.message || error
            });
        }

    } catch (err) {
        console.warn('Order failure tracking error (non-blocking):', err);
    }
};

