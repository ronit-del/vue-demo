require('dotenv').config();
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const pool = db.getPool();
const { statusCode } = require("../common");

/**
 * Track order placement event
 * POST /api/tracking/order
 * 
 * Body:
 * {
 *   event: 'order_placed' | 'order_attempt' | 'order_failed',
 *   timestamp: ISO string,
 *   order_number: string,
 *   payment_method: 'COD' | 'Stripe',
 *   total_amount: number,
 *   currency: string,
 *   user_id: string,
 *   user_email: string,
 *   status: string,
 *   item_count: number,
 *   items: array
 * }
 */
router.post("/order", async (req, res) => {
    try {
        const trackingData = req.body;
        
        // Validate required fields
        if (!trackingData.event || !trackingData.order_number) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: 'Missing required fields: event and order_number are required'
            });
        }

        // Log tracking event (for monitoring/debugging)
        console.log('📊 Tracking Event:', {
            event: trackingData.event,
            order_number: trackingData.order_number,
            payment_method: trackingData.payment_method,
            total_amount: trackingData.total_amount,
            timestamp: trackingData.timestamp || new Date().toISOString()
        });

        // Store tracking data in database if tracking table exists
        // First, check if tracking table exists
        try {
            const tableExists = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'order_tracking'
                );
            `);

            if (tableExists.rows[0].exists) {
                // Insert tracking record
                await pool.query(`
                    INSERT INTO order_tracking (
                        event_type,
                        order_number,
                        payment_method,
                        total_amount,
                        currency,
                        user_id,
                        user_email,
                        order_status,
                        item_count,
                        items_data,
                        timestamp,
                        created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
                `, [
                    trackingData.event,
                    trackingData.order_number,
                    trackingData.payment_method || null,
                    trackingData.total_amount || 0,
                    trackingData.currency || 'USD',
                    trackingData.user_id || null,
                    trackingData.user_email || null,
                    trackingData.status || null,
                    trackingData.item_count || 0,
                    JSON.stringify(trackingData.items || []),
                    trackingData.timestamp || new Date().toISOString()
                ]);
            }
        } catch (dbError) {
            // If table doesn't exist or there's a DB error, just log it
            // Don't fail the tracking request - tracking should be non-blocking
            console.warn('Tracking table not available or error:', dbError.message);
        }

        // Here you can add integrations with external analytics services:
        // - Google Analytics Measurement Protocol
        // - Mixpanel
        // - Segment
        // - Custom analytics service
        // etc.

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: 'Tracking event recorded successfully'
        });

    } catch (error) {
        console.error("Tracking error:", error);
        // Always return success for tracking - don't break the order flow
        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: 'Tracking event processed (errors logged)'
        });
    }
});

/**
 * Test tracking endpoint - for development/testing
 * POST /api/tracking/test
 * 
 * This endpoint allows you to test the tracking functionality without placing an actual order
 */
router.post("/test", async (req, res) => {
    try {
        const testData = req.body;
        
        // Generate test order data if not provided
        const trackingData = {
            event: testData.event || 'order_placed',
            timestamp: new Date().toISOString(),
            order_number: testData.order_number || `TEST-ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            payment_method: testData.payment_method || 'COD',
            total_amount: testData.total_amount || 99.99,
            currency: testData.currency || 'USD',
            user_id: testData.user_id || null,
            user_email: testData.user_email || 'test@example.com',
            status: testData.status || 'Processing',
            item_count: testData.item_count || 2,
            items: testData.items || [
                {
                    product_id: 'test-product-1',
                    product_name: 'Test Product 1',
                    quantity: 1,
                    price: 49.99,
                    total: 49.99
                },
                {
                    product_id: 'test-product-2',
                    product_name: 'Test Product 2',
                    quantity: 1,
                    price: 50.00,
                    total: 50.00
                }
            ]
        };

        // Log test event
        console.log('🧪 TEST Tracking Event:', {
            event: trackingData.event,
            order_number: trackingData.order_number,
            payment_method: trackingData.payment_method,
            total_amount: trackingData.total_amount,
            timestamp: trackingData.timestamp
        });

        // Store tracking data in database if tracking table exists
        try {
            const tableExists = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'order_tracking'
                );
            `);

            if (tableExists.rows[0].exists) {
                // Insert tracking record
                const result = await pool.query(`
                    INSERT INTO order_tracking (
                        event_type,
                        order_number,
                        payment_method,
                        total_amount,
                        currency,
                        user_id,
                        user_email,
                        order_status,
                        item_count,
                        items_data,
                        timestamp,
                        created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
                    RETURNING id, created_at
                `, [
                    trackingData.event,
                    trackingData.order_number,
                    trackingData.payment_method || null,
                    trackingData.total_amount || 0,
                    trackingData.currency || 'USD',
                    trackingData.user_id || null,
                    trackingData.user_email || null,
                    trackingData.status || null,
                    trackingData.item_count || 0,
                    JSON.stringify(trackingData.items || []),
                    trackingData.timestamp || new Date().toISOString()
                ]);

                return res.status(statusCode.SUCCESS.code).json({
                    success: true,
                    message: 'Test tracking event recorded successfully',
                    test_mode: true,
                    data: {
                        tracking_id: result.rows[0].id,
                        order_number: trackingData.order_number,
                        event: trackingData.event,
                        created_at: result.rows[0].created_at
                    }
                });
            } else {
                return res.status(statusCode.SUCCESS.code).json({
                    success: true,
                    message: 'Test tracking event processed (table not initialized)',
                    test_mode: true,
                    warning: 'Tracking table does not exist. Run database initialization first.',
                    data: trackingData
                });
            }
        } catch (dbError) {
            console.error('Test tracking DB error:', dbError);
            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: 'Test tracking event processed (DB error logged)',
                test_mode: true,
                error: dbError.message,
                data: trackingData
            });
        }

    } catch (error) {
        console.error("Test tracking error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: 'Test tracking failed',
            error: error.message
        });
    }
});

/**
 * Get recent tracking events (for testing/debugging)
 * GET /api/tracking/recent?limit=10
 */
router.get("/recent", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        // Check if tracking table exists
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'order_tracking'
            );
        `);

        if (!tableExists.rows[0].exists) {
            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: 'Tracking table not initialized',
                data: []
            });
        }

        // Get recent tracking events
        const result = await pool.query(`
            SELECT 
                id,
                event_type,
                order_number,
                payment_method,
                total_amount,
                currency,
                user_id,
                user_email,
                order_status,
                item_count,
                items_data,
                timestamp,
                created_at
            FROM order_tracking
            ORDER BY created_at DESC
            LIMIT $1
        `, [limit]);

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            count: result.rows.length,
            data: result.rows.map(row => ({
                id: row.id,
                event_type: row.event_type,
                order_number: row.order_number,
                payment_method: row.payment_method,
                total_amount: parseFloat(row.total_amount) || 0,
                currency: row.currency,
                user_id: row.user_id,
                user_email: row.user_email,
                order_status: row.order_status,
                item_count: row.item_count,
                items: row.items_data,
                timestamp: row.timestamp,
                created_at: row.created_at
            }))
        });

    } catch (error) {
        console.error("Get recent tracking events error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching recent tracking events.",
            error: error.message
        });
    }
});

/**
 * Public order tracking endpoint
 * GET /api/tracking/order/:orderNumber
 * 
 * Allows customers to track their order using order number
 */
router.get("/order/:orderNumber", async (req, res) => {
    try {
        const { orderNumber } = req.params;

        if (!orderNumber) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: 'Order number is required'
            });
        }

        // Get order details
        const orderResult = await pool.query(`
            SELECT 
                o.id,
                o.order_number,
                o.total_amount,
                o.payment_type,
                o.status,
                o.cancellation_reason,
                o.created_at,
                o.updated_at,
                u.name as customer_name,
                u.email as customer_email,
                u.phone as customer_phone,
                u.address as customer_address,
                u.country as customer_country,
                u.postal_code as customer_postal_code
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.order_number = $1
        `, [orderNumber]);

        if (orderResult.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: 'Order not found'
            });
        }

        const order = orderResult.rows[0];

        // Get order items
        const itemsResult = await pool.query(`
            SELECT 
                od.id,
                od.product_id,
                od.quantity,
                od.base_price,
                od.total_amount,
                p.name as product_name,
                p.image as product_image,
                p.product_code
            FROM order_details od
            LEFT JOIN products p ON p.id = od.product_id
            WHERE od.order_id = $1
            ORDER BY od.created_at ASC
        `, [order.id]);

        // Get tracking history
        const trackingHistory = await pool.query(`
            SELECT 
                event_type,
                timestamp,
                created_at
            FROM order_tracking
            WHERE order_number = $1
            ORDER BY created_at ASC
        `, [orderNumber]);

        // Format response
        const formattedOrder = {
            id: order.id,
            order_number: order.order_number,
            status: order.status,
            payment_type: order.payment_type,
            cancellation_reason: order.cancellation_reason,
            total_amount: parseFloat(order.total_amount) || 0,
            created_at: order.created_at,
            updated_at: order.updated_at,
            customer: {
                name: order.customer_name,
                email: order.customer_email,
                phone: order.customer_phone,
                address: order.customer_address,
                country: order.customer_country,
                postal_code: order.customer_postal_code
            },
            items: itemsResult.rows.map(item => ({
                id: item.id,
                product_id: item.product_id,
                product_code: item.product_code,
                product_name: item.product_name,
                product_image: item.product_image,
                quantity: item.quantity,
                base_price: parseFloat(item.base_price) || 0,
                total_amount: parseFloat(item.total_amount) || 0
            })),
            tracking_history: trackingHistory.rows.map(track => ({
                event: track.event_type,
                timestamp: track.timestamp,
                created_at: track.created_at
            }))
        };

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            data: formattedOrder
        });

    } catch (error) {
        console.error("Get order tracking error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching order tracking information.",
            error: error.message
        });
    }
});

/**
 * Get tracking statistics
 * GET /api/tracking/stats
 */
router.get("/stats", async (req, res) => {
    try {
        // Check if tracking table exists
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'order_tracking'
            );
        `);

        if (!tableExists.rows[0].exists) {
            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: 'Tracking table not initialized',
                data: {
                    total_orders: 0,
                    successful_orders: 0,
                    failed_orders: 0,
                    total_revenue: 0
                }
            });
        }

        // Get tracking statistics
        const stats = await pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE event_type = 'order_placed') as total_orders,
                COUNT(*) FILTER (WHERE event_type = 'order_placed') as successful_orders,
                COUNT(*) FILTER (WHERE event_type = 'order_failed') as failed_orders,
                COALESCE(SUM(total_amount) FILTER (WHERE event_type = 'order_placed'), 0) as total_revenue
            FROM order_tracking
            WHERE created_at >= NOW() - INTERVAL '30 days'
        `);

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            data: {
                total_orders: parseInt(stats.rows[0].total_orders) || 0,
                successful_orders: parseInt(stats.rows[0].successful_orders) || 0,
                failed_orders: parseInt(stats.rows[0].failed_orders) || 0,
                total_revenue: parseFloat(stats.rows[0].total_revenue) || 0
            }
        });

    } catch (error) {
        console.error("Get tracking stats error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching tracking statistics.",
            error: error.message
        });
    }
});

module.exports = router;

