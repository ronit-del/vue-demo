require('dotenv').config();
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const pool = db.getPool();
const { statusCode } = require("../common");

// Create new product
router.post("/", async (req, res) => {
    try {
        const { name, product_code, price, stock_quantity, description, image, category } = req.body;

        // Validate required fields
        if (!name || !price || !category) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Name, price, and category are required"
            });
        }

        // Generate product_code if not provided
        let finalProductCode = product_code;
        if (!finalProductCode) {
            // Generate a unique product code
            const timestamp = Date.now().toString(36).toUpperCase();
            const random = Math.random().toString(36).substring(2, 6).toUpperCase();
            finalProductCode = `${random}`;
        }

        // Check if product_code already exists
        const existingProduct = await pool.query(
            `SELECT id FROM products WHERE product_code = $1`,
            [finalProductCode]
        );

        if (existingProduct.rows.length > 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Product code already exists"
            });
        }

        // Insert new product
        const result = await pool.query(
            `INSERT INTO products (name, product_code, price, stock_quantity, description, image, category, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
             RETURNING *`,
            [
                name,
                finalProductCode,
                parseFloat(price) || 0,
                parseInt(stock_quantity) || 0,
                description || null,
                image || null,
                category || null
            ]
        );

        const product = result.rows[0];
        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Product created successfully",
            data: {
                id: product.id,
                product_code: product.product_code,
                name: product.name,
                image: product.image || null,
                description: product.description || null,
                price: parseFloat(product.price) || 0,
                stock_quantity: parseInt(product.stock_quantity) || 0,
                category: product.category || null,
                created_at: product.created_at,
                updated_at: product.updated_at
            }
        });
    } catch (error) {
        console.error("Create product error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while creating the product.",
            error: error.message
        });
    }
});

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
                category,
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
            category: product.category || null,
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
                category,
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
                category: product.category || null,
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
                category,
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
                category: product.category || null,
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

// Update product
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, product_code, price, stock_quantity, description, image, category } = req.body;

        // Build update query dynamically based on provided fields
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (product_code !== undefined) {
            updates.push(`product_code = $${paramIndex++}`);
            values.push(product_code);
        }
        if (price !== undefined) {
            updates.push(`price = $${paramIndex++}`);
            values.push(parseFloat(price));
        }
        if (stock_quantity !== undefined) {
            updates.push(`stock_quantity = $${paramIndex++}`);
            values.push(parseInt(stock_quantity));
        }
        if (description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(description);
        }
        if (image !== undefined) {
            updates.push(`image = $${paramIndex++}`);
            values.push(image);
        }
        if (category !== undefined) {
            updates.push(`category = $${paramIndex++}`);
            values.push(category);
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
            UPDATE products 
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Product not found"
            });
        }

        const product = result.rows[0];
        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Product updated successfully",
            data: {
                id: product.id,
                product_code: product.product_code || null,
                name: product.name,
                image: product.image || null,
                description: product.description || null,
                price: parseFloat(product.price) || 0,
                stock_quantity: parseInt(product.stock_quantity) || 0,
                category: product.category || null,
                created_at: product.created_at,
                updated_at: product.updated_at
            }
        });
    } catch (error) {
        console.error("Update product error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while updating the product.",
            error: error.message
        });
    }
});

// Bulk update product categories based on image paths
router.post("/update-categories", async (req, res) => {
    try {
        // Get all products without categories
        const productsResult = await pool.query(`
            SELECT id, name, product_code, image, category
            FROM products
            WHERE category IS NULL OR category = ''
        `);
        
        const products = productsResult.rows;
        
        if (products.length === 0) {
            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: "No products need category updates",
                data: {
                    updated: 0,
                    skipped: 0
                }
            });
        }
        
        let updated = 0;
        let skipped = 0;
        
        // Helper function to infer category from image path
        const inferCategory = (imagePath) => {
            if (!imagePath) return null;
            const lowerPath = imagePath.toLowerCase();
            if (lowerPath.includes('electronics')) return 'electronics';
            if (lowerPath.includes('clothes') || lowerPath.includes('clothe')) return 'clothes';
            if (lowerPath.includes('home_appliances') || lowerPath.includes('home appliance')) return 'home_appliances';
            if (lowerPath.includes('beauty') || lowerPath.includes('beuty')) return 'beauty';
            return null;
        };
        
        // Update each product
        for (const product of products) {
            const inferredCategory = inferCategory(product.image);
            
            if (inferredCategory) {
                await pool.query(`
                    UPDATE products
                    SET category = $1, updated_at = NOW()
                    WHERE id = $2
                `, [inferredCategory, product.id]);
                updated++;
            } else {
                skipped++;
            }
        }
        
        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Product categories updated successfully",
            data: {
                updated,
                skipped,
                total: products.length
            }
        });
    } catch (error) {
        console.error("Bulk update categories error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while updating product categories.",
            error: error.message
        });
    }
});

module.exports = router;

