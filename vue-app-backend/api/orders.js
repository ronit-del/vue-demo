require('dotenv').config();
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const pool = db.getPool();
const { statusCode } = require("../common");

// Get all orders with user details and order items
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                o.id,
                o.order_number,
                o.user_id,
                o.total_amount as total,
                o.payment_type,
                o.status,
                o.created_at as date,
                o.updated_at,
                u.name as customer,
                u.email as customer_email,
                u.phone as customer_phone,
                u.address as customer_address,
                u.country as customer_country,
                u.postal_code as customer_postal_code,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', od.id,
                            'product_id', od.product_id,
                            'base_price', od.base_price,
                            'quantity', od.quantity,
                            'total_amount', od.total_amount
                        )
                    ) FILTER (WHERE od.id IS NOT NULL),
                    '[]'
                ) as order_items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_details od ON o.order_id = od.id
            GROUP BY o.id, o.order_number, o.user_id, o.total_amount, o.payment_type, 
                     o.status, o.created_at, o.updated_at, u.name, u.email, u.phone, 
                     u.address, u.country, u.postal_code
            ORDER BY o.created_at DESC
        `);

        // Format the response to match frontend expectations
        const orders = result.rows.map(order => ({
            id: order.id,
            order_number: order.order_number,
            customer: order.customer || 'Unknown Customer',
            customer_email: order.customer_email,
            customer_phone: order.customer_phone,
            customer_address: order.customer_address,
            customer_country: order.customer_country,
            customer_postal_code: order.customer_postal_code,
            status: order.status,
            payment_type: order.payment_type,
            total: parseFloat(order.total) || 0,
            date: order.date,
            updated_at: order.updated_at,
            user_id: order.user_id,
            order_items: order.order_items || []
        }));

        return res.status(statusCode.SUCCESS.code).json(orders);
    } catch (error) {
        console.error("Get orders error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching orders.",
            error: error.message
        });
    }
});

// Get order by ID with order details
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Get order header
        const orderResult = await pool.query(`
            SELECT 
                o.id,
                o.order_number,
                o.user_id,
                o.total_amount as total,
                o.payment_type,
                o.status,
                o.created_at as date,
                o.updated_at,
                u.name as customer,
                u.email as customer_email,
                u.phone as customer_phone,
                u.address as customer_address,
                u.country as customer_country,
                u.postal_code as customer_postal_code
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = $1
        `, [id]);

        if (orderResult.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Order not found"
            });
        }

        // Get order details (line items)
        const orderDetailsResult = await pool.query(`
            SELECT 
                id,
                product_id,
                base_price,
                quantity,
                total_amount,
                created_at,
                updated_at
            FROM order_details
            WHERE order_id = $1
            ORDER BY created_at ASC
        `, [id]);

        const order = orderResult.rows[0];
        const formattedOrder = {
            id: order.id,
            order_number: order.order_number,
            customer: order.customer || 'Unknown Customer',
            customer_email: order.customer_email,
            customer_phone: order.customer_phone,
            customer_address: order.customer_address,
            customer_country: order.customer_country,
            customer_postal_code: order.customer_postal_code,
            status: order.status,
            payment_type: order.payment_type,
            total: parseFloat(order.total) || 0,
            date: order.date,
            updated_at: order.updated_at,
            user_id: order.user_id,
            order_items: orderDetailsResult.rows.map(item => ({
                id: item.id,
                product_id: item.product_id,
                base_price: parseFloat(item.base_price) || 0,
                quantity: parseInt(item.quantity) || 0,
                total_amount: parseFloat(item.total_amount) || 0,
                created_at: item.created_at,
                updated_at: item.updated_at
            }))
        };

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            data: formattedOrder
        });
    } catch (error) {
        console.error("Get order error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching the order.",
            error: error.message
        });
    }
});

// Update order status
router.put("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Status is required"
            });
        }

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const result = await pool.query(
            `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Order status updated successfully!",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Update order status error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while updating the order status.",
            error: error.message
        });
    }
});

module.exports = router;

