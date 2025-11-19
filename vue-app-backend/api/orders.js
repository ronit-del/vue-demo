require('dotenv').config();
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const pool = db.getPool();
const { statusCode } = require("../common");
const { createNotification } = require("./notifications");
const { sendOrderStatusUpdateEmail } = require("../services/orderEmailService");

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
                            'product_code', p.product_code,
                            'product_name', p.name,
                            'product_image', p.image,
                            'base_price', od.base_price,
                            'quantity', od.quantity,
                            'total_amount', od.total_amount,
                            'order_number', od.order_number
                        )
                    ) FILTER (WHERE od.id IS NOT NULL),
                    '[]'
                ) as order_items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_details od ON od.order_id = o.id
            LEFT JOIN products p ON p.id = od.product_id 
            WHERE o.payment_type IN ('COD', 'Stripe')
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
                o.cancellation_reason,
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

        // Get order details (line items) with product information
        const orderDetailsResult = await pool.query(`
            SELECT 
                od.id,
                od.order_number,
                od.product_id,
                od.base_price,
                od.quantity,
                od.total_amount,
                od.created_at,
                od.updated_at,
                p.product_code,
                p.name as product_name,
                p.image as product_image,
                p.description as product_description
            FROM order_details od
            LEFT JOIN products p ON p.id = od.product_id
            WHERE od.order_id = $1
            ORDER BY od.created_at ASC
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
            cancellation_reason: order.cancellation_reason,
            total: parseFloat(order.total) || 0,
            date: order.date,
            updated_at: order.updated_at,
            user_id: order.user_id,
            order_items: orderDetailsResult.rows.map(item => ({
                id: item.id,
                product_id: item.product_id,
                product_code: item.product_code,
                product_name: item.product_name,
                product_image: item.product_image,
                product_description: item.product_description,
                order_number: item.order_number,
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
        const { status, cancellation_reason } = req.body;

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

        // Get order details before update
        const orderBeforeUpdate = await pool.query(
            `SELECT id, order_number, status FROM orders WHERE id = $1`,
            [id]
        );

        if (orderBeforeUpdate.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Order not found"
            });
        }

        const oldStatus = orderBeforeUpdate.rows[0].status;
        const orderNumber = orderBeforeUpdate.rows[0].order_number;

        // Build update query with optional cancellation_reason
        let updateQuery;
        let updateValues;
        
        if (status === 'Cancelled' && cancellation_reason) {
            updateQuery = `UPDATE orders SET status = $1, cancellation_reason = $2, updated_at = NOW() WHERE id = $3 RETURNING *`;
            updateValues = [status, cancellation_reason, id];
        } else {
            updateQuery = `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
            updateValues = [status, id];
        }

        const result = await pool.query(updateQuery, updateValues);

        if (result.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Order not found"
            });
        }

        // Get user email for status update email
        const userResult = await pool.query(`
            SELECT u.email, u.name FROM users u
            JOIN orders o ON o.user_id = u.id
            WHERE o.id = $1
        `, [id]);

        // Get cancellation reason if status is Cancelled
        const cancellationReasonResult = await pool.query(
            `SELECT cancellation_reason FROM orders WHERE id = $1`,
            [id]
        );
        const cancellationReason = (status === 'Cancelled' && cancellationReasonResult.rows[0]?.cancellation_reason) 
            ? cancellationReasonResult.rows[0].cancellation_reason 
            : null;

        // Send status update email (async, non-blocking)
        if (userResult.rows.length > 0 && oldStatus !== status) {
            sendOrderStatusUpdateEmail(
                id,
                orderNumber,
                status,
                userResult.rows[0].email,
                cancellationReason
            ).catch(emailError => {
                console.error('Failed to send status update email (non-blocking):', emailError);
            });
        }

        // Create notification if status changed to Processing
        if (status === 'Processing' && oldStatus !== 'Processing') {
            const message = `Order ${orderNumber} is now being processed`;
            await createNotification(id, orderNumber, message, 'order_processing');
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

// Update entire order
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status, payment_type, order_items, cancellation_reason } = req.body;

        // Check if order exists
        const orderCheck = await pool.query(
            `SELECT id, status FROM orders WHERE id = $1`,
            [id]
        );

        if (orderCheck.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Order not found"
            });
        }

        const currentOrder = orderCheck.rows[0];
        const oldStatus = currentOrder.status;
        let orderNumber = null;

        // Get order_number for notification
        const orderInfo = await pool.query(
            `SELECT order_number FROM orders WHERE id = $1`,
            [id]
        );
        if (orderInfo.rows.length > 0) {
            orderNumber = orderInfo.rows[0].order_number;
        }

        // Update order fields
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        if (status !== undefined) {
            const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
            if (!validStatuses.includes(status)) {
                return res.status(statusCode.BAD_REQUEST.code).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }
            updateFields.push(`status = $${paramIndex++}`);
            updateValues.push(status);
        }

        if (payment_type !== undefined) {
            updateFields.push(`payment_type = $${paramIndex++}`);
            updateValues.push(payment_type);
        }

        if (cancellation_reason !== undefined) {
            updateFields.push(`cancellation_reason = $${paramIndex++}`);
            updateValues.push(cancellation_reason);
        }

        if (updateFields.length > 0) {
            updateFields.push(`updated_at = NOW()`);
            const whereParamIndex = paramIndex;
            updateValues.push(id);

            const updateQuery = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = $${whereParamIndex}`;
            await pool.query(updateQuery, updateValues);

            // Send status update email if status changed
            if (status !== undefined && oldStatus !== status && orderNumber) {
                const userResult = await pool.query(`
                    SELECT u.email FROM users u
                    JOIN orders o ON o.user_id = u.id
                    WHERE o.id = $1
                `, [id]);

                if (userResult.rows.length > 0) {
                    // Get cancellation reason if status is Cancelled
                    const cancellationReason = (status === 'Cancelled' && cancellation_reason) ? cancellation_reason : null;
                    sendOrderStatusUpdateEmail(
                        id,
                        orderNumber,
                        status,
                        userResult.rows[0].email,
                        cancellationReason
                    ).catch(emailError => {
                        console.error('Failed to send status update email (non-blocking):', emailError);
                    });
                }
            }

            // Create notification if status changed to Processing
            if (status !== undefined && status === 'Processing' && oldStatus !== 'Processing' && orderNumber) {
                const message = `Order ${orderNumber} is now being processed`;
                await createNotification(id, orderNumber, message, 'order_processing');
            }
        }

        // If order_items provided, update order_details
        if (order_items && Array.isArray(order_items)) {
            // Delete existing order_details
            await pool.query(
                `DELETE FROM order_details WHERE order_id = $1`,
                [id]
            );

            // Insert new order_details
            for (const item of order_items) {
                const { product_id, base_price, quantity, total_amount } = item;
                
                if (!product_id || !base_price || !quantity) {
                    continue; // Skip invalid items
                }

                const itemTotal = total_amount || (parseFloat(base_price) * parseInt(quantity));

                // Get order_number from order
                const orderInfo = await pool.query(
                    `SELECT order_number FROM orders WHERE id = $1`,
                    [id]
                );

                if (orderInfo.rows.length > 0) {
                    const orderNumber = orderInfo.rows[0].order_number;
                    
                    // Get user_id from order
                    const userInfo = await pool.query(
                        `SELECT user_id FROM orders WHERE id = $1`,
                        [id]
                    );
                    const userId = userInfo.rows[0].user_id;

                    await pool.query(
                        `INSERT INTO order_details (order_id, order_number, user_id, product_id, base_price, quantity, total_amount, created_at, updated_at)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
                        [id, orderNumber, userId, product_id, base_price, quantity, itemTotal]
                    );
                }
            }

            // Recalculate order total
            const orderTotalResult = await pool.query(
                `SELECT COALESCE(SUM(od.total_amount), 0) as total
                 FROM order_details od
                 WHERE od.order_id = $1`,
                [id]
            );

            const newOrderTotal = parseFloat(orderTotalResult.rows[0].total);

            await pool.query(
                `UPDATE orders SET total_amount = $1, updated_at = NOW() WHERE id = $2`,
                [newOrderTotal, id]
            );
        }

        // Return updated order
        const updatedOrder = await pool.query(`
            SELECT 
                o.id,
                o.order_number,
                o.user_id,
                o.total_amount as total,
                o.payment_type,
                o.status,
                o.created_at as date,
                o.updated_at
            FROM orders o
            WHERE o.id = $1
        `, [id]);

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Order updated successfully!",
            data: updatedOrder.rows[0]
        });
    } catch (error) {
        console.error("Update order error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while updating the order.",
            error: error.message
        });
    }
});

// Delete order
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Check if order exists
        const orderCheck = await pool.query(
            `SELECT id, status FROM orders WHERE id = $1`,
            [id]
        );

        if (orderCheck.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Order not found"
            });
        }

        // Delete order_details first (cascade should handle this, but being explicit)
        await pool.query(
            `DELETE FROM order_details WHERE order_id = $1`,
            [id]
        );

        // Delete order
        await pool.query(
            `DELETE FROM orders WHERE id = $1`,
            [id]
        );

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Order deleted successfully!"
        });
    } catch (error) {
        console.error("Delete order error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while deleting the order.",
            error: error.message
        });
    }
});

// Get orders by status
router.get("/status/:status", async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];

        if (!validStatuses.includes(status)) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

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
                            'product_code', p.product_code,
                            'product_name', p.name,
                            'product_image', p.image,
                            'base_price', od.base_price,
                            'quantity', od.quantity,
                            'total_amount', od.total_amount,
                            'order_number', od.order_number
                        )
                    ) FILTER (WHERE od.id IS NOT NULL),
                    '[]'
                ) as order_items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_details od ON od.order_id = o.id
            LEFT JOIN products p ON p.id = od.product_id
            WHERE o.status = $1
            GROUP BY o.id, o.order_number, o.user_id, o.total_amount, o.payment_type, 
                o.status, o.created_at, o.updated_at, u.name, u.email, u.phone, 
                u.address, u.country, u.postal_code
            ORDER BY o.created_at DESC
        `, [status]);

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
        console.error("Get orders by status error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching orders.",
            error: error.message
        });
    }
});

module.exports = router;

