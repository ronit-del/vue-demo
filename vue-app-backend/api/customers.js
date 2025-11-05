require('dotenv').config();
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const pool = db.getPool();
const { statusCode } = require("../common");

// Get all customers (users)
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                name,
                email,
                phone,
                postal_code,
                address,
                country,
                email_verified,
                created_at,
                updated_at
            FROM users
            ORDER BY created_at DESC
        `);

        // Format the response
        const customers = result.rows.map(customer => ({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            postal_code: customer.postal_code,
            address: customer.address,
            country: customer.country,
            email_verified: customer.email_verified,
            created_at: customer.created_at,
            updated_at: customer.updated_at
        }));

        return res.status(statusCode.SUCCESS.code).json(customers);
    } catch (error) {
        console.error("Get customers error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching customers.",
            error: error.message
        });
    }
});

// Get customer by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                id,
                name,
                email,
                phone,
                postal_code,
                address,
                country,
                email_verified,
                created_at,
                updated_at
            FROM users
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Get customer error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching the customer.",
            error: error.message
        });
    }
});

// Get customer orders
router.get("/:id/orders", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                o.id,
                o.product_id,
                o.price,
                o.quantity,
                o.total_amount as total,
                o.status,
                o.created_at as date,
                o.updated_at
            FROM orders o
            WHERE o.user_id = $1
            ORDER BY o.created_at DESC
        `, [id]);

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error("Get customer orders error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching customer orders.",
            error: error.message
        });
    }
});

module.exports = router;

