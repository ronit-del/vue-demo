require('dotenv').config();
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const pool = db.getPool();
const { statusCode } = require("../common");

// Get all notifications (for admin)
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                n.id,
                n.order_id,
                n.order_number,
                n.message,
                n.type,
                n.is_read,
                n.created_at,
                n.read_at,
                o.total_amount as order_total,
                u.name as customer_name
            FROM notifications n
            LEFT JOIN orders o ON n.order_id = o.id
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY n.created_at DESC
            LIMIT 50
        `);

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error("Get notifications error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching notifications.",
            error: error.message
        });
    }
});

// Get unread notifications count
router.get("/count", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT COUNT(*) as count
            FROM notifications
            WHERE is_read = FALSE
        `);

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            count: parseInt(result.rows[0].count) || 0
        });
    } catch (error) {
        console.error("Get notification count error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching notification count.",
            error: error.message
        });
    }
});

// Mark notification as read
router.put("/:id/read", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE notifications 
             SET is_read = TRUE, read_at = NOW() 
             WHERE id = $1 AND is_read = FALSE
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Notification not found or already read"
            });
        }

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Notification marked as read",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Mark notification as read error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while marking notification as read.",
            error: error.message
        });
    }
});

// Mark all notifications as read
router.put("/read-all", async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE notifications 
             SET is_read = TRUE, read_at = NOW() 
             WHERE is_read = FALSE
             RETURNING id`
        );

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: `${result.rows.length} notifications marked as read`,
            count: result.rows.length
        });
    } catch (error) {
        console.error("Mark all notifications as read error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while marking all notifications as read.",
            error: error.message
        });
    }
});

// Helper function to create notification (can be imported by other modules)
async function createNotification(orderId, orderNumber, message, type = 'order_processing') {
    try {
        const result = await pool.query(
            `INSERT INTO notifications (order_id, order_number, message, type, created_at)
             VALUES ($1, $2, $3, $4, NOW())
             RETURNING *`,
            [orderId, orderNumber, message, type]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Create notification error:", error);
        return null;
    }
}

module.exports = router;
module.exports.createNotification = createNotification;

