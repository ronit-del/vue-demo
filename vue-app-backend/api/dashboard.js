require('dotenv').config();
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const pool = db.getPool();
const { statusCode } = require("../common");

// Get dashboard statistics
router.get("/stats", async (req, res) => {
    try {
        // Fetch current period statistics (this month)
        const currentStatsResult = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM orders WHERE created_at >= date_trunc('month', CURRENT_DATE)) as total_orders_current,
                (SELECT COUNT(*) FROM users WHERE created_at >= date_trunc('month', CURRENT_DATE)) as total_customers_current,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE (status = 'Processing' OR status = 'Shipped' OR status = 'Delivered') AND created_at >= date_trunc('month', CURRENT_DATE)) as revenue_current,
                (SELECT COUNT(*) FROM orders WHERE status = 'Pending' AND created_at >= date_trunc('month', CURRENT_DATE)) as pending_orders_current
        `);

        // Fetch previous period statistics (last month)
        const previousStatsResult = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM orders WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
                    AND created_at < date_trunc('month', CURRENT_DATE)) as total_orders_previous,
                (SELECT COUNT(*) FROM users WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
                    AND created_at < date_trunc('month', CURRENT_DATE)) as total_customers_previous,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE (status = 'Processing' OR status = 'Shipped' OR status = 'Delivered')
                    AND created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
                    AND created_at < date_trunc('month', CURRENT_DATE)) as revenue_previous,
                (SELECT COUNT(*) FROM orders WHERE status = 'Pending' 
                    AND created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
                    AND created_at < date_trunc('month', CURRENT_DATE)) as pending_orders_previous
        `);

        // Get all-time totals
        const allTimeStatsResult = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM orders WHERE status IN ('Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded')) as total_orders,
                (SELECT COUNT(*) FROM users) as total_customers,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('Processing', 'Shipped', 'Delivered')) as revenue,
                (SELECT COUNT(*) FROM orders WHERE status = 'Pending') as pending_orders
        `);

        const currentStats = currentStatsResult.rows[0];
        const previousStats = previousStatsResult.rows[0];
        const allTimeStats = allTimeStatsResult.rows[0];

        // Helper function to calculate percentage change
        const calculatePercentageChange = (current, previous) => {
            if (!previous || previous === 0) {
                return current > 0 ? 100 : 0;
            }
            const change = ((current - previous) / previous) * 100;
            return Math.round(change * 10) / 10; // Round to 1 decimal place
        };

        // Calculate percentage changes
        const totalOrdersChange = calculatePercentageChange(
            parseInt(currentStats.total_orders_current) || 0,
            parseInt(previousStats.total_orders_previous) || 0
        );

        const totalCustomersChange = calculatePercentageChange(
            parseInt(currentStats.total_customers_current) || 0,
            parseInt(previousStats.total_customers_previous) || 0
        );

        const revenueChange = calculatePercentageChange(
            parseFloat(currentStats.revenue_current) || 0,
            parseFloat(previousStats.revenue_previous) || 0
        );

        const pendingOrdersChange = calculatePercentageChange(
            parseInt(currentStats.pending_orders_current) || 0,
            parseInt(previousStats.pending_orders_previous) || 0
        );

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Dashboard statistics fetched successfully!",
            data: {
                totalOrders: parseInt(allTimeStats.total_orders) || 0,
                totalCustomers: parseInt(allTimeStats.total_customers) || 0,
                revenue: parseFloat(allTimeStats.revenue) || 0,
                pendingOrders: parseInt(allTimeStats.pending_orders) || 0,
                changes: {
                    totalOrdersChange,
                    totalCustomersChange,
                    revenueChange,
                    pendingOrdersChange
                }
            }
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching dashboard statistics.",
            error: error.message
        });
    }
});

// Get chart data for orders and customers
router.get("/charts", async (req, res) => {
    try {
        const { type = 'day', period = '30' } = req.query; // type: 'day', 'month', 'year', period: number of periods

        let dateFormat, dateTrunc, interval;
        
        if (type === 'day') {
            dateFormat = 'YYYY-MM-DD';
            dateTrunc = 'day';
            interval = `${parseInt(period)} days`;
        } else if (type === 'month') {
            dateFormat = 'YYYY-MM';
            dateTrunc = 'month';
            interval = `${parseInt(period)} months`;
        } else if (type === 'year') {
            dateFormat = 'YYYY';
            dateTrunc = 'year';
            interval = `${parseInt(period)} years`;
        } else {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Invalid type. Must be 'day', 'month', or 'year'"
            });
        }

        // Get orders chart data
        const ordersResult = await pool.query(`
            SELECT 
                TO_CHAR(date_trunc('${dateTrunc}', created_at), '${dateFormat}') as period,
                COUNT(*) as count
            FROM orders
            WHERE created_at >= CURRENT_DATE - INTERVAL '${interval}'
            GROUP BY date_trunc('${dateTrunc}', created_at)
            ORDER BY period ASC
        `);

        // Get customers chart data
        const customersResult = await pool.query(`
            SELECT 
                TO_CHAR(date_trunc('${dateTrunc}', created_at), '${dateFormat}') as period,
                COUNT(*) as count
            FROM users
            WHERE created_at >= CURRENT_DATE - INTERVAL '${interval}'
            GROUP BY date_trunc('${dateTrunc}', created_at)
            ORDER BY period ASC
        `);

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Chart data fetched successfully!",
            data: {
                type: type,
                period: period,
                orders: ordersResult.rows.map(row => ({
                    period: row.period,
                    count: parseInt(row.count) || 0
                })),
                customers: customersResult.rows.map(row => ({
                    period: row.period,
                    count: parseInt(row.count) || 0
                }))
            }
        });
    } catch (error) {
        console.error("Chart data error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching chart data.",
            error: error.message
        });
    }
});

// Generate random order data
router.post("/generate-orders", async (req, res) => {
    try {
        const { count = 50 } = req.body; // Number of orders to generate

        // Get all existing users
        const usersResult = await pool.query('SELECT id FROM users');
        if (usersResult.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "No users found in database. Please create users first."
            });
        }
        const userIds = usersResult.rows.map(row => row.id);

        // Get all existing products
        const productsResult = await pool.query('SELECT id, price FROM products');
        if (productsResult.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "No products found in database. Please create products first."
            });
        }
        const products = productsResult.rows;

        const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
        const paymentTypes = ['COD', 'Stripe', 'Credit Card', 'Debit Card'];
        const cancellationReasons = [
            'Customer requested cancellation',
            'Out of stock - item unavailable',
            'Payment failed',
            'Duplicate order',
            'Customer changed mind',
            'Shipping address incorrect',
            'Product no longer needed',
            'Found better price elsewhere',
            'Order placed by mistake',
            'Customer requested refund instead',
            'Item damaged during processing',
            'Customer unavailable for delivery',
            'Order timeout - payment not received',
            'Fraudulent order detected',
            'Customer account issue',
            'Shipping restrictions to address',
            'Product discontinued',
            'Customer requested to cancel before shipping',
            'Payment method declined',
            'Order exceeds shipping weight limit'
        ];
        
        const generateOrderNumber = (orderDate = null) => {
            const date = orderDate || new Date();
            const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
            const random = Math.random().toString(36).substr(2, 6).toUpperCase();
            return `ORD-${dateStr}-${random}`;
        };

        const randomElement = (array) => array[Math.floor(Math.random() * array.length)];
        const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const randomDecimal = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < count; i++) {
            try {
                const userId = randomElement(userIds);
                const paymentType = randomElement(paymentTypes);
                const status = randomElement(orderStatuses);

                // IMPORTANT: Only set cancellation_reason for 'Cancelled' status orders
                // All other statuses must have null cancellation_reason
                const cancellationReason = status === 'Cancelled' ? randomElement(cancellationReasons) : null;

                // Generate random date between 2015 and 2025
                const startYear = 2015;
                const endYear = 2025;
                const startDate = new Date(startYear, 0, 1); // January 1, 2015
                const endDate = new Date(endYear, 11, 31, 23, 59, 59); // December 31, 2025
                const timeDiff = endDate.getTime() - startDate.getTime();
                const randomTime = Math.random() * timeDiff;
                const orderDate = new Date(startDate.getTime() + randomTime);
                const orderDateStr = orderDate.toISOString();
                
                // Generate order number based on the order date
                const orderNumber = generateOrderNumber(orderDate);

                // Create order with 1-4 products
                const numProducts = randomNumber(1, 4);
                let orderTotal = 0;
                const selectedProducts = [];

                // Randomly select products for this order (avoid duplicates)
                for (let j = 0; j < numProducts; j++) {
                    const product = randomElement(products);
                    if (!selectedProducts.find(p => p.id === product.id)) {
                        selectedProducts.push(product);
                    }
                }

                // Create the order
                // Note: cancellation_reason is only set for 'Cancelled' status, null for all other statuses
                const orderResult = await pool.query(`
                    INSERT INTO orders (order_number, user_id, total_amount, payment_type, status, cancellation_reason, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
                    RETURNING id
                `, [
                    orderNumber,
                    userId,
                    0,
                    paymentType,
                    status,
                    cancellationReason, // null for non-cancelled orders, random reason for cancelled orders
                    orderDateStr
                ]);

                const orderId = orderResult.rows[0].id;

                // Create order_details entries
                for (const product of selectedProducts) {
                    const basePrice = parseFloat(product.price) || randomDecimal(10.00, 500.00);
                    const quantity = randomNumber(1, 5);
                    const totalAmount = parseFloat((basePrice * quantity).toFixed(2));
                    orderTotal += totalAmount;

                    await pool.query(`
                        INSERT INTO order_details (order_id, order_number, user_id, product_id, base_price, quantity, total_amount, created_at, updated_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
                    `, [
                        orderId,
                        orderNumber,
                        userId,
                        product.id,
                        basePrice,
                        quantity,
                        totalAmount,
                        orderDateStr
                    ]);
                }

                // Update order total_amount (including 10% tax)
                const subtotal = orderTotal;
                const tax = parseFloat((subtotal * 0.1).toFixed(2));
                const finalTotal = parseFloat((subtotal + tax).toFixed(2));

                await pool.query(`
                    UPDATE orders 
                    SET total_amount = $1 
                    WHERE id = $2
                `, [finalTotal, orderId]);

                successCount++;
            } catch (error) {
                errorCount++;
                console.error(`Error generating order ${i + 1}:`, error.message);
            }
        }

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: `Generated ${successCount} orders successfully`,
            data: {
                requested: count,
                successful: successCount,
                failed: errorCount
            }
        });
    } catch (error) {
        console.error("Generate orders error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while generating orders.",
            error: error.message
        });
    }
});

module.exports = router;