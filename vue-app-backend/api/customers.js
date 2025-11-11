require('dotenv').config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const pool = db.getPool();
const { statusCode } = require("../common");

// Create new customer
router.post("/", async (req, res) => {
    try {
        const { name, email, phone, address, country, postal_code, status } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !address || !country || !postal_code || !status) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "All fields are required: name, email, phone, address, country, postal_code, and status"
            });
        }

        // Check if email already exists
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Customer with this email already exists"
            });
        }

        // Generate a default password (admin-created customers won't have a password initially)
        // For admin-created customers, we'll set a random password that can be reset
        const saltRounds = 12;
        const defaultPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
        const password_hash = await bcrypt.hash(defaultPassword, saltRounds);

        // Insert new customer
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, phone, postal_code, address, country, status, email_verified, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
             RETURNING id, name, email, phone, postal_code, address, country, status, email_verified, created_at, updated_at`,
            [
                name,
                email.toLowerCase(),
                password_hash,
                phone,
                postal_code,
                address,
                country,
                status,
                false // email_verified defaults to false for admin-created customers
            ]
        );

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Customer created successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Create customer error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while creating the customer.",
            error: error.message
        });
    }
});

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
                status,
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
            status: customer.status || (customer.is_active !== undefined && customer.is_active !== null ? (customer.is_active ? 'active' : 'inactive') : 'active'),
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
                status,
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

// Update customer
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, country, postal_code, status } = req.body;

        // Build update query dynamically based on provided fields
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (email !== undefined) {
            updates.push(`email = $${paramIndex++}`);
            values.push(email.toLowerCase());
        }
        if (phone !== undefined) {
            updates.push(`phone = $${paramIndex++}`);
            values.push(phone);
        }
        if (address !== undefined) {
            updates.push(`address = $${paramIndex++}`);
            values.push(address);
        }
        if (country !== undefined) {
            updates.push(`country = $${paramIndex++}`);
            values.push(country);
        }
        if (postal_code !== undefined) {
            updates.push(`postal_code = $${paramIndex++}`);
            values.push(postal_code);
        }
        if (status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            values.push(status);
        }

        if (updates.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "No fields to update"
            });
        }

        // Add updated_at
        updates.push(`updated_at = NOW()`);
        values.push(id);

        const query = `
            UPDATE users 
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING id, name, email, phone, postal_code, address, country, status, created_at, updated_at
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Customer updated successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Update customer error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while updating the customer.",
            error: error.message
        });
    }
});

// Delete customer
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Check if customer exists
        const customerCheck = await pool.query(
            `SELECT id FROM users WHERE id = $1`,
            [id]
        );

        if (customerCheck.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Customer not found"
            });
        }

        // Check if customer has orders
        const ordersCheck = await pool.query(
            `SELECT COUNT(*) as order_count FROM orders WHERE user_id = $1`,
            [id]
        );

        const orderCount = parseInt(ordersCheck.rows[0].order_count);

        if (orderCount > 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: `Cannot delete customer. Customer has ${orderCount} order(s). Please delete orders first or deactivate the customer instead.`
            });
        }

        // Delete customer
        const result = await pool.query(
            `DELETE FROM users WHERE id = $1 RETURNING id, name, email`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Failed to delete customer"
            });
        }

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Customer deleted successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Delete customer error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while deleting the customer.",
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
                o.order_number,
                o.total_amount as total,
                o.payment_type,
                o.status,
                o.created_at as date,
                o.updated_at,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', od.id,
                            'product_id', od.product_id,
                            'base_price', od.base_price,
                            'quantity', od.quantity,
                            'total_amount', od.total_amount,
                            'order_number', od.order_number
                        )
                    ) FILTER (WHERE od.id IS NOT NULL),
                    '[]'
                ) as order_items
            FROM orders o
            LEFT JOIN order_details od ON od.order_id = o.id
            WHERE o.user_id = $1
            GROUP BY o.id, o.order_number, o.total_amount, o.payment_type, 
                     o.status, o.created_at, o.updated_at
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

