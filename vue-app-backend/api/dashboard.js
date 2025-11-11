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

module.exports = router;

