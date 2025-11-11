require('dotenv').config();
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const pool = db.getPool();
const { statusCode } = require("../common");

// Get all products
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
            success: true,
            data: products
        });
    } catch (error) {
        console.error("Get products error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching products.",
            error: error.message
        });
    }
});

// Get product by ID
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
        console.error("Get product error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching the product.",
            error: error.message
        });
    }
});

// Get product by product_code
router.get("/code/:product_code", async (req, res) => {
    try {
        const { product_code } = req.params;

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
            WHERE product_code = $1
        `, [product_code]);

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
        console.error("Get product by code error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching the product.",
            error: error.message
        });
    }
});

module.exports = router;

