require('dotenv').config();
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");
const stripe = require('stripe')(process.env.STRIPE_KEY);
const axios = require('axios');
const db = require("../config/db");
const pool = db.getPool();

const { statusCode, generateVerificationToken } = require("../common");

const sendMail = require("../config/mail");

function generateJWTToken(user, secret, expiresIn) {
    return jwt.sign(user, secret, { expiresIn: expiresIn });
}

// Login route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(statusCode.BAD_REQUEST.code).json({ error: "Email and password are required" });
        }

        // Find user by email
        const result = await pool.query(
            "SELECT id, name, email, password_hash, email_verified FROM users WHERE email = $1",
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(statusCode.UNAUTHORIZED.code).json({
                message: statusCode.UNAUTHORIZED.message,
                error: "Invalid email or password"
            });
        }

        // Check if email is verified
        if (!user.email_verified) {
            return res.status(statusCode.UNAUTHORIZED.code).json({
                message: statusCode.UNAUTHORIZED.message,
                error: "Please verify your email before logging in"
            });
        }

        const userToken = {
            id: user.id,
            name: user.name,
            email: user.email,
        };

        const token = generateJWTToken(userToken, process.env.JWT_SECRET, '1h');

        res.status(statusCode.SUCCESS.code).json({
            success: true,
            userToken,
            message: "Login successfully!",
            token,
        });
    } catch (error) {
        console.log('error', error);

        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            message: statusCode.INTERNAL_SERVER_ERROR.message,
            error: error.Error
        });
    }
});

// Register route
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone, postal_code, address, country } = req.body;

        // Validate input
        if (!name || !email || !password || !phone || !postal_code || !address || !country) {
            return res.status(statusCode.BAD_REQUEST.code).json({ error: "Name, email, password, phone, postal_code, address, and country are required" });
        }

        if (password.length < 6) {
            return res
                .status(statusCode.BAD_REQUEST.code)
                .json({ error: "Password must be at least 6 characters long" });
        }

        // Check if user already exists
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res
                .status(statusCode.BAD_REQUEST.code)
                .json({ error: "User with this email already exists" });
        }

        // Hash password
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Generate verification token
        // const verification_token = generateVerificationToken();
        const userToken = {
            id: user.id,
            name: user.name,
            email: user.email,
        };
        const token = generateJWTToken(userToken, process.env.JWT_SECRET, '1h');
        const expirationTime = new Date(Date.now() + 60 * 1000); // 1 minute from now

        // Insert user
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, phone, postal_code, address, country, 
                email_verified, email_verification_token, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            RETURNING id, name, email, email_verified`,
            [name, email.toLowerCase(), password_hash, phone, postal_code, address, country, false, token]
        );

        const user = result.rows[0];

        const origin = req.get('origin');
        const verificationUrl = `${origin}/verify/${token}`;

        const html = `
            <html>
                <head>
                    <meta charset="UTF-8" />
                    <title>Verify Your Email</title>
                    <style>
                        a {
                            background-color: #007bff;
                            color: #ffffff;
                            padding: 10px 20px;
                            text-decoration: none;
                            border-radius: 5px;
                        }
                        a:hover {
                            background-color: #0056b3;
                            color: #ffffff;
                        }
                        .container {
                            font-family: Arial, sans-serif;
                            max-width: 600px;
                            margin: auto;
                            color: #333;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>
                            Email Verification
                        </h2>
                        <p>
                            Hi ${user.name},
                        </p>
                        <p>
                            Thank you for signing up! Please click the button below to verify your email address.
                        </p>
                        <p>
                            <a href="${verificationUrl}" target="_blank">
                                Verify Email
                            </a>
                        </p>
                        <p>
                            If you didn’t create an account, you can safely ignore this email.
                        </p>
                        <p>
                            Thanks,<br>The Vue App Team
                        </p>
                    </div>
                </body>
            </html>
        `;

        const mail = await sendMail({
            to: email,
            subject: "Verifie Email",
            text: "",
            html,
        });

        if (mail) {
            res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: "User registered successfully!",
                user: {
                    email: user.email,
                },
            });
        }
    } catch (error) {
        console.error("Registration error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            message: statusCode.INTERNAL_SERVER_ERROR.message,
            error: error.error
        });
    }
});

// Get profile route
router.get("/profile", async (req, res) => {
    try {
        // Get user_id from query parameter or session
        let user_id = req.query.user_id;

        // If no user_id in query, try to get from session
        if (!user_id && req.session && req.session.user) {
            user_id = req.session.user.id;
        }

        // If still no user_id, try to get from authorization header
        if (!user_id && req.headers.authorization && req.headers.authorization !== '') {
            try {
                const userData = JSON.parse(req.headers.authorization);
                if (userData && userData.id) {
                    user_id = userData.id;
                }
            } catch (error) {
                console.error('Error parsing Authorization header:', error);
            }
        }

        if (!user_id) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                error: "User ID is required"
            });
        }

        // Fetch user profile from database
        const result = await pool.query(
            `SELECT id, name, email, phone, postal_code, address, country, email_verified, created_at, updated_at 
             FROM users WHERE id = $1`,
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                error: "User not found"
            });
        }

        const user = result.rows[0];

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Profile fetched successfully!",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                postal_code: user.postal_code || '',
                address: user.address || '',
                country: user.country || '',
                email_verified: user.email_verified,
                created_at: user.created_at,
                updated_at: user.updated_at
            }
        });
    } catch (error) {
        console.error("Profile fetch error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: statusCode.INTERNAL_SERVER_ERROR.message,
            error: error.message || "An error occurred while fetching profile"
        });
    }
});

// Register route
router.post("/update-user", async (req, res) => {
    try {
        const { name, email, phone, postal_code, address, country } = req.body;

        // Check if user already exists
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            const result = await pool.query(
                `UPDATE users SET name = $1, email = $2, phone = $3, postal_code = $4, address = $5, 
                    country = $6, updated_at = NOW() WHERE email = $2 RETURNING id, name, email`,
                [name, email.toLowerCase(), phone, postal_code, address, country]
            );

            if (result.rowCount > 0) {
                return res.status(statusCode.SUCCESS.code).json({
                    success: true, message: "User profile update successfully!"
                });
            } else {
                return res.status(statusCode.NOT_MODIFIED.code).json({
                    success: false, message: "Something went wrong!"
                });
            }
        } else {
            return res.status(statusCode.UNAUTHORIZED.code).json({
                success: false, message: "User not found!"
            });
        }
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            message: statusCode.INTERNAL_SERVER_ERROR.message,
            error: error.error
        });
    }
});

// Email verification route
router.get("/verify/:token", async (req, res) => {
    try {
        const { token } = req.params;

        const result = await pool.query(
            `SELECT id, name, email, email_verified, email_verification_expires FROM users WHERE email_verification_token = $1`,
            [token]
        );

        const user = result.rows[0];

        // Check if the user exists and if the token is expired
        if (!user) {
            return res.status(statusCode.BAD_REQUEST.code).json({ error: "Invalid verification token" });
        }

        if (user.email_verified) {
            return res.status(statusCode.SUCCESS.code).json({ message: "Email already verified" });
        }

        const currentTime = new Date();

        // Check if the token is expired
        if (currentTime > new Date(user.email_verification_expires)) {
            return res.status(statusCode.BAD_REQUEST.code).json({ error: "Verification token expired" });
        }

        // Token is valid, mark email as verified
        await pool.query(
            `UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1`,
            [user.id]
        );

        res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Email verified successfully!",
        });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            message: statusCode.INTERNAL_SERVER_ERROR.message,
            error: "An error occurred during verification."
        });
    }
});

// Forgot password route
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Check if user exists
        const result = await pool.query(
            "SELECT id, name, email FROM users WHERE email = $1",
            [email.toLowerCase()]
        );

        // Always return success (don't reveal if email exists)
        if (result.rows.length > 0) {
            const resetToken = generateVerificationToken();
            const user = result.rows[0];
            // Store reset token
            await pool.query(
                `UPDATE users SET email_verification_token = $1, email_verification_expires = NOW() + 
                    INTERVAL '1 hour' WHERE email = $2 RETURNING id, name, email
                `,
                [resetToken, email.toLowerCase()]
            );

            const origin = req.get('origin');
            const resetUrl = `${origin}/reset-password/${resetToken}`;

            const html = `
                <html>
                    <head>
                        <meta charset="UTF-8" />
                        <title>Reset Your Password</title>
                        <style>
                            a {
                                background-color: #007bff;
                                color: #ffffff;
                                padding: 10px 20px;
                                text-decoration: none;
                                border-radius: 5px;
                            }
                            a:hover {
                                background-color: #0056b3;
                                color: #ffffff;
                            }
                            .container {
                                font-family: Arial, sans-serif;
                                max-width: 600px;
                                margin: auto;
                                color: #333;
                            }
                            .container a {
                                color: black;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>Password Reset Request</h2>
                            <p>Hi ${user.name},</p>
                            <p>We received a request to reset your password. Click the button below to reset it:</p>
                            <p>
                                <a href="${resetUrl}" target="_blank">Reset Password</a>
                            </p>
                            <p>If you did not request this, you can safely ignore this email</p>
                            <p>Thanks,<br>The Vue App Team</p>
                        </div>
                    </body>
                </html>
            `;

            const mail = await sendMail({
                to: email,
                subject: "Reset Password Link",
                text: "",
                html,
            });

            if (mail) {
                res
                    .status(200)
                    .json({
                        success: true,
                        message:
                            "If an account with that email exists, password reset link sent to your email! Please check your inbox.",
                    });
            } else {
                res
                    .status(200)
                    .json({
                        success: false,
                        message:
                            "Failed to send email. Please try again later or contact support if the issue persists.",
                    });
            }
        } else {
            res.status(200).json({ success: false, message: "User doesn't exist" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
});

// Reset password route
router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const result = await pool.query(
            `SELECT id, name, email, email_verified, email_verification_expires FROM users WHERE email_verification_token = $1`,
            [token]
        );

        const user = result.rows[0];

        // Check if the user exists and if the token is expired
        if (!user) {
            return res.status(statusCode.BAD_REQUEST.code).json({ error: "Invalid verification token" });
        }

        // Hash password
        const saltRounds = 12;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const updatePassword = await pool.query(
            "UPDATE users SET password_hash = $1 WHERE email_verification_token = $2",
            [password_hash, token]
        );

        if (updatePassword.rowCount > 0) {
            return res.status(statusCode.SUCCESS.code).json({ success: true, message: "Password has been reset successfully!" });
        } else {
            return res.status(statusCode.NOT_MODIFIED.code).json({ success: false, message: "Something went wrong!" });
        }
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            message: statusCode.INTERNAL_SERVER_ERROR.message,
            error: "Password has been not updated!!"
        });
    }
});

// Get Product Order route - Get order details for a specific product in user's cart
router.post("/get-product-order", async (req, res) => {
    try {
        const { user_id, product_code } = req.body;

        if (!user_id) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "user_id is required"
            });
        }

        // First, get the product by product_code to get product_id
        let productId = null;
        if (product_code) {
            const productResult = await pool.query(
                `SELECT id FROM products WHERE product_code = $1`,
                [product_code]
            );
            if (productResult.rows.length > 0) {
                productId = productResult.rows[0].id;
            }
        }

        // Query order_details for this user and product
        // Also check if they're part of a pending order
        let result;
        if (productId) {
            result = await pool.query(
                `SELECT 
                    od.id,
                    od.user_id,
                    od.product_id,
                    od.order_number,
                    od.base_price,
                    od.quantity,
                    od.total_amount,
                    od.created_at,
                    od.updated_at,
                    p.product_code,
                    p.name as product_name,
                    p.price as current_price,
                    o.id as order_id,
                    o.status as order_status,
                    o.total_amount as order_total
                FROM order_details od
                LEFT JOIN products p ON od.product_id = p.id
                LEFT JOIN orders o ON o.id = od.order_id
                WHERE od.user_id = $1 AND od.product_id = $2
                AND (o.status = 'Pending' OR o.status IS NULL)
                ORDER BY od.created_at DESC
                LIMIT 1`,
                [user_id, productId]
            );
        } else {
            // If no product_code provided, return empty
            result = { rows: [] };
        }

        if (result.rows.length > 0) {
            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: "Order details fetched successfully!",
                data: result.rows,
            });
        } else {
            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: "No orders found for this product.",
                data: [],
            });
        }
    } catch (error) {
        console.error("Order details error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching order details.",
            error: error.message,
        });
    }
});

// Get Order route
router.post("/get-order", async (req, res) => {
    try {
        const { user_id } = req.body;
        
        const result = await pool.query(
            `SELECT 
                COALESCE(
                    o.id,
                    FIRST_VALUE(o.id) OVER (PARTITION BY od.user_id ORDER BY od.created_at)
                ) AS order_id,
                COALESCE(
                    o.status,
                    FIRST_VALUE(o.status) OVER (PARTITION BY od.user_id ORDER BY od.created_at)
                ) AS order_status,
                u.name as full_name, u.email, u.address, u.country, u.postal_code, u.phone,
                od.order_number,
                od.*,
                p.*
                FROM order_details od
                LEFT JOIN orders o ON o.id = od.order_id AND o.status = 'Pending'
                JOIN users u ON od.user_id = u.id 
                JOIN products p ON od.product_id = p.id
                WHERE od.user_id = $1 AND o.status = 'Pending';
            `,
            [user_id]
        );

        if (result.rows.length > 0) {
            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: "Orders details fetched successfully!",
                data: result.rows,
            });
        } else {
            return res.status(statusCode.SUCCESS.code).json({
                success: false,
                message: "No orders found",
                data: [],
            });
        }
    } catch (error) {
        console.error("Order details error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while orders insert.",
            error: error.message,
        });
    }
});

// Order route - Add item to cart (order_details)
router.post("/order", async (req, res) => {
    try {
        const data = req.body;
        
        let orderNumber = data.orderNumber;
        const { user_id, product_id, price, quantity = 1 } = data;
        let result;

        // Validate required fields
        if (!user_id || !product_id || !price) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: 'Missing required fields: user_id, product_id, and price are required',
            });
        }

        // Calculate total amount for this line item
        const base_price = parseFloat(price);
        const item_quantity = parseInt(quantity) || 1;
        const total_amount = parseFloat((base_price * item_quantity).toFixed(2));

        // First, check if there's ANY existing pending order for this user
        // This ensures all items are added to the same cart/order
        let existingOrder = await pool.query(
            `SELECT id, order_number FROM orders 
             WHERE user_id = $1 AND status = 'Pending'
             ORDER BY created_at DESC
             LIMIT 1`,
            [user_id]
        );

        let orderId = null;
        
        // If we found an existing pending order, use it (ignore the orderNumber from request)
        // This ensures all "Add to cart" clicks add to the same order
        if (existingOrder.rows.length > 0) {
            orderId = existingOrder.rows[0].id;
            orderNumber = existingOrder.rows[0].order_number;
        }

        // If no pending order found, generate a new order_number
        if (!orderNumber) {
            orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        }

        // Check if this product already exists in order_details for pending orders
        let existingDetail = null;
        if (orderId) {
            // Get all order_details for this user that are part of pending orders
            const allOrderDetails = await pool.query(
                `SELECT od.id, od.product_id, od.base_price, od.quantity, od.total_amount, od.order_number
                 FROM order_details od
                 WHERE od.order_id = $1 AND od.product_id = $2
                 LIMIT 1`,
                [orderId, product_id]
            );
            
            if (allOrderDetails.rows.length > 0) {
                existingDetail = allOrderDetails.rows[0];
            }
        }

        if (existingDetail) {
            // Update existing order_detail (increase quantity)
            const newQuantity = existingDetail.quantity + item_quantity;
            const newTotalAmount = parseFloat((existingDetail.base_price * newQuantity).toFixed(2));

            result = await pool.query(
                `UPDATE order_details 
                 SET quantity = $1, total_amount = $2, order_number = $3, updated_at = NOW()
                 WHERE id = $4
                 RETURNING id, base_price, quantity, total_amount, order_number`,
                [newQuantity, newTotalAmount, orderNumber, existingDetail.id]
            );

            // Recalculate and update the order total_amount (sum of all order_details for this order)
            const orderTotalResult = await pool.query(
                `SELECT COALESCE(SUM(od.total_amount), 0) as total
                 FROM order_details od
                 WHERE od.order_id = $1`,
                [orderId]
            );

            const newOrderTotal = parseFloat(orderTotalResult.rows[0].total);

            await pool.query(
                `UPDATE orders 
                 SET total_amount = $1, updated_at = NOW()
                 WHERE id = $2`,
                [newOrderTotal, orderId]
            );

        } else {
            // If no existing order, create a new one first
            if (!orderId) {
                const newOrderResult = await pool.query(
                    `INSERT INTO orders (order_number, user_id, total_amount, payment_type, status, created_at, updated_at)
                     VALUES ($1, $2, $3, NULL, 'Pending', NOW(), NOW())
                     RETURNING id`,
                    [orderNumber, user_id, total_amount]
                );
                orderId = newOrderResult.rows[0].id;
            }

            // Create new order_detail entry with order_number and order_id
            result = await pool.query(
                `INSERT INTO order_details (order_id, order_number, user_id, product_id, base_price, quantity, total_amount, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
                 RETURNING id, base_price, quantity, total_amount, order_number`,
                [orderId, orderNumber, user_id, product_id, base_price, item_quantity, total_amount]
            );

            // Recalculate and update the order total_amount (sum of all order_details for this order)
            const orderTotalResult = await pool.query(
                `SELECT COALESCE(SUM(od.total_amount), 0) as total
                 FROM order_details od
                 WHERE od.order_id = $1`,
                [orderId]
            );

            const newOrderTotal = parseFloat(orderTotalResult.rows[0].total);

            await pool.query(
                `UPDATE orders 
                 SET total_amount = $1, updated_at = NOW()
                 WHERE id = $2`,
                [newOrderTotal, orderId]
            );
        }

        if (result.rows.length > 0) {
            
            await pool.query(
                `UPDATE products SET stock_quantity = stock_quantity - $1, updated_at = NOW()
                WHERE id = $2`,
                [item_quantity, product_id]
            );

            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: 'Order added successfully!',
                data: result.rows[0],
                orderNumber: orderNumber // Include orderNumber for frontend to store
            });
        } else {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: 'Something went wrong!!',
            });
        }
    } catch (error) {
        console.error("Order error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: statusCode.INTERNAL_SERVER_ERROR.message,
            error: error.message || "An error occurred during order."
        });
    }
});

// Order record update - Update order_details quantity and total_amount
router.put("/order-update", async (req, res) => {
    try {
        const { user_id, product_id, quantity, total_amount, type } = req.body;

        // Validate required fields
        if (!user_id || !product_id || !quantity || total_amount === undefined) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: 'Missing required fields: user_id, product_id, quantity, and total_amount are required',
            });
        }

        // Find the order_detail for this user and product
        // Also check if it's part of a pending order
        const orderDetailResult = await pool.query(
            `SELECT od.id, od.base_price, od.quantity, od.total_amount, od.order_number, od.order_id, o.status as order_status
             FROM order_details od
             LEFT JOIN orders o ON o.id = od.order_id
             WHERE od.user_id = $1 AND od.product_id = $2
             AND (o.status = 'Pending' OR o.status IS NULL)
             ORDER BY od.created_at DESC
             LIMIT 1`,
            [user_id, product_id]
        );

        if (orderDetailResult.rows.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: 'Order detail not found for this product',
            });
        }

        const orderDetail = orderDetailResult.rows[0];
        const parsedQuantity = parseInt(quantity);
        const parsedTotalAmount = parseFloat(total_amount);

        // Update order_details (preserve order_number)
        const updateResult = await pool.query(
            `UPDATE order_details 
             SET quantity = $1, total_amount = $2, updated_at = NOW()
             WHERE id = $3
             RETURNING id, quantity, total_amount, order_number`,
            [parsedQuantity, parsedTotalAmount, orderDetail.id]
        );

        if (updateResult.rows.length > 0) {
            // If this order_detail is part of a pending order, update the order total
            if (orderDetail.order_id) {
                // Recalculate order total from all order_details in this order
                const orderTotalResult = await pool.query(
                    `SELECT COALESCE(SUM(od.total_amount), 0) as total
                     FROM order_details od
                     WHERE od.order_id = $1`,
                    [orderDetail.order_id]
                );

                const newOrderTotal = parseFloat(orderTotalResult.rows[0].total);

                await pool.query(
                    `UPDATE orders 
                     SET total_amount = $1, updated_at = NOW()
                     WHERE id = $2`,
                    [newOrderTotal, orderDetail.order_id]
                );

                if (type === 'increase') {
                    await pool.query(
                        `UPDATE products SET stock_quantity = stock_quantity - $1, updated_at = NOW()
                        WHERE id = $2`,
                        [1, product_id]
                    );
                } else if (type === 'decrease') {
                    await pool.query(
                        `UPDATE products SET stock_quantity = stock_quantity + $1, updated_at = NOW()
                        WHERE id = $2`,
                        [1, product_id]
                    );
                }
            }

            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: 'Order updated successfully!',
                data: updateResult.rows[0]
            });
        } else {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: 'Order update failed',
            });
        }
    } catch (error) {
        console.error("Order record error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while updating the order.",
            error: error.message,
        });
    }
});

router.post("/delete-order", async (req, res) => {
    try {
        console.log('req.body', req.body);

        const { user_id, product_id } = req.body;

        // Find the order_detail for this user and product in a pending order
        const orderDetailResult = await pool.query(
            `SELECT od.id, od.order_id, od.order_number
             FROM order_details od
             LEFT JOIN orders o ON o.id = od.order_id
             WHERE od.user_id = $1 AND od.product_id = $2
             AND (o.status = 'Pending' OR o.status IS NULL)
             ORDER BY od.created_at DESC
             LIMIT 1`,
            [user_id, product_id]
        );

        if (orderDetailResult.rows.length > 0) {
            const orderDetail = orderDetailResult.rows[0];
            const orderId = orderDetail.order_id;

            // Delete the order_detail
            await pool.query(
                `DELETE FROM order_details WHERE id = $1`,
                [orderDetail.id]
            );

            // Check if there are any remaining order_details for this order
            const remainingDetails = await pool.query(
                `SELECT COUNT(*) as count FROM order_details WHERE order_id = $1`,
                [orderId]
            );

            // If no remaining order_details, delete the order as well
            if (parseInt(remainingDetails.rows[0].count) === 0 && orderId) {
                await pool.query(
                    `DELETE FROM orders WHERE id = $1`,
                    [orderId]
                );
            } else if (orderId) {
                // Recalculate order total from remaining order_details
                const orderTotalResult = await pool.query(
                    `SELECT COALESCE(SUM(od.total_amount), 0) as total
                     FROM order_details od
                     WHERE od.order_id = $1`,
                    [orderId]
                );

                const newOrderTotal = parseFloat(orderTotalResult.rows[0].total);

                await pool.query(
                    `UPDATE orders 
                     SET total_amount = $1, updated_at = NOW()
                     WHERE id = $2`,
                    [newOrderTotal, orderId]
                );
            }

            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: "Order item deleted successfully!",
            });
        } else {
            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: "No order item found to delete.",
                data: [],
            });
        }

    } catch (error) {
        console.error("Delete order error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while deleting the order item.",
            error: error.message,
        });
    }
});

// Product rating route
router.post("/get-product-rating", async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        const result = await pool.query(
            `SELECT * FROM product_ratings WHERE user_id = $1 AND product_id = $2`,
            [user_id, product_id]
        );

        if (result.rows.length > 0) {
            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: "Record found!",
                data: result.rows,
            });
        } else {
            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: "No record found",
                data: [],
            });
        }
    } catch (error) {
        console.log("Product rating get record error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching product rating record.",
            error: error.message,
        });
    }
});

// Add product rating route
router.post("/add-product-rating", async (req, res) => {
    try {
        const { user_id, product_id, rating, review } = req.body;

        const ratingReview = await pool.query(
            `INSERT INTO product_ratings (user_id, product_id, rating, review, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING product_id`,
            [user_id, product_id, rating, review]
        );

        if (ratingReview.rows.length > 0) {
            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: 'Product rating and review added successfully!',
            });
        } else {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: 'Something went wrong!!',
            });
        }

    } catch (error) {
        console.log("Add product rating error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while add product rating record.",
            error: error.message,
        });
    }
});

router.post('/create-stripe-session', async (req, res) => {
    const { cart, userDetail, orderId, orderNumber, payment_method } = req.body;
    const cartId = cart.map((c) => c.id);

    try {
        // Handle COD payment method - no Stripe processing needed
        if (payment_method === 'cod') {
            await pool.query(`
                UPDATE orders SET status = 'Processing', payment_type = 'COD'
                WHERE user_id = $1 AND status = 'Pending' AND id = $2
            `, [userDetail.user_id, orderId]);

            return res.status(200).json({
                status: true,
                success: true,
                message: 'Order placed successfully with COD',
                payment_method: 'cod'
            });
        }

        // Create a PaymentIntent for Stripe (if you're using PaymentIntents instead of Sessions)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: cart.reduce((total, item) => total + item.price * item.quantity * 100, 0), // Total in cents
            currency: 'usd',
            metadata: {
                user_name: userDetail.name,
                user_email: userDetail.email,
            },
        });
        
        if (paymentIntent && paymentIntent.client_secret) {

            await pool.query(`
                UPDATE orders SET status = 'Processing', payment_type = 'Stripe' 
                WHERE user_id = $1 AND status = 'Pending' AND order_number = $2
            `, [userDetail.user_id, orderNumber]);

            return res.status(200).json({
                status: true,
                clientSecret: paymentIntent.client_secret, // Send the client secret to the frontend
            });
        } else {
            return res.status(200).json({
                status: false,
                clientSecret: null,
            });
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error creating payment intent');
    }
});

module.exports = router;
