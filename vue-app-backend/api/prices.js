require('dotenv').config();
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const pool = db.getPool();
const { statusCode } = require("../common");

// Get all products with prices
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                product_code,
                name,
                image,
                description,
                price,
                stock_quantity,
                created_at,
                updated_at
            FROM products
            ORDER BY created_at DESC
        `);

        // Format the response as an object with product_id as key and price as value
        // This matches the expected format: { product_id: price }
        const prices = {};
        result.rows.forEach(product => {
            prices[product.id] = parseFloat(product.price) || 0;
        });

        // Also return full product list for reference
        const products = result.rows.map(product => ({
            id: product.id,
            product_code: product.product_code || null,
            name: product.name,
            image: product.image || null,
            description: product.description || null,
            price: parseFloat(product.price) || 0,
            stock_quantity: parseInt(product.stock_quantity) || 0,
            created_at: product.created_at,
            updated_at: product.updated_at
        }));

        return res.status(statusCode.SUCCESS.code).json({
            prices,
            products
        });
    } catch (error) {
        console.error("Get prices error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching prices.",
            error: error.message
        });
    }
});

// Get product price by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                id,
                product_code,
                name,
                image,
                description,
                price,
                stock_quantity,
                created_at,
                updated_at
            FROM products
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Product not found"
            });
        }

        const product = result.rows[0];
        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            data: {
                id: product.id,
                product_code: product.product_code || null,
                name: product.name,
                image: product.image || null,
                description: product.description || null,
                price: parseFloat(product.price) || 0,
                stock_quantity: parseInt(product.stock_quantity) || 0,
                created_at: product.created_at,
                updated_at: product.updated_at
            }
        });
    } catch (error) {
        console.error("Get product price error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching the product price.",
            error: error.message
        });
    }
});

// Update product price
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { price, stock_quantity } = req.body;

        if (!price && !stock_quantity) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Price or stock_quantity is required"
            });
        }

        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        if (price !== undefined) {
            updateFields.push(`price = $${paramIndex++}`);
            updateValues.push(price);
        }

        if (stock_quantity !== undefined) {
            updateFields.push(`stock_quantity = $${paramIndex++}`);
            updateValues.push(stock_quantity);
        }

        updateValues.push(id);

        const result = await pool.query(
            `UPDATE products SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`,
            updateValues
        );

        if (result.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Product price updated successfully!",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Update product price error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while updating the product price.",
            error: error.message
        });
    }
});

module.exports = router;

