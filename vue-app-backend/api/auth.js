require('dotenv').config();
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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

// Get Product Order route
router.post("/get-product-order", async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        const result = await pool.query(
            `SELECT * FROM orders WHERE user_id = $1 AND product_id = $2`,
            [user_id, product_id]
        );

        if (result.rows.length > 0) {
            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: "Orders details fetched successfully!",
                data: result.rows,
            });
        } else {
            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: "No orders found for this user.",
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

// Get Order route
router.post("/get-order", async (req, res) => {
    try {
        const { user_id } = req.body;

        const result = await pool.query(
            `SELECT o.*, o.id, u.name, u.email, u.address, u.country, u.postal_code, u.phone FROM 
                orders o JOIN users u ON o.user_id = u.id WHERE o.user_id = $1 AND status = 'Pending'`,
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

// Order route
router.post("/order", async (req, res) => {
    try {
        const data = req.body;
        let result;

        const productExist = await pool.query(
            `SELECT id, price, quantity, total_amount FROM orders WHERE user_id = $1 AND product_id = $2`,
            [data.user_id, data.product_id]
        );

        const product = productExist.rows[0];

        if (product && product.id) {
            result = await pool.query(
                `UPDATE orders SET quantity = ${product.quantity + 1}, 
                    total_amount = ${(product.quantity + 1) * product.price}
                    WHERE user_id = $1 AND product_id = $2 RETURNING product_id`,
                [data.user_id, data.product_id]
            );
        } else {
            result = await pool.query(
                `INSERT INTO orders (user_id, product_id, price, quantity, total_amount, status, created_at, 
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                RETURNING product_id`,
                [data.user_id, data.product_id, data.price, data.quantity, data.price, 'Pending']
            );
        }
        console.log('result -----', result.rows.length > 0);

        if (result.rows.length > 0) {
            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: 'Order added successfully!',
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
            message: statusCode.INTERNAL_SERVER_ERROR.message,
            error: "An error occurred during order."
        });
    }
});

// Order record update
router.put("/order-update", async (req, res) => {
    try {

        const { user_id, product_id, quantity, total_amount } = req.body;

        const orderExist = await pool.query(
            `SELECT * FROM orders WHERE user_id = $1 AND product_id = $2`,
            [user_id, product_id]
        );

        if (orderExist.rows.length > 0) {
            const updateOrder = await pool.query(
                `UPDATE orders SET quantity = ${quantity}, total_amount = ${total_amount} 
                    WHERE user_id = $1 AND product_id = $2 RETURNING *
                `, [user_id, product_id]
            );

            if (updateOrder && updateOrder.rows[0]) {
                return res.status(statusCode.SUCCESS.code).json({
                    success: true,
                    message: 'Order updated successfully!',
                });
            } else {
                return res.status(statusCode.SUCCESS.code).json({
                    success: false,
                    message: 'Order updated failed',
                });
            }
        } else {
            return res.status(statusCode.SUCCESS.code).json({
                success: false,
                message: 'Order not exist',
            });
        }
    } catch (error) {
        console.error("Order record error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while fetching orders update.",
            error: error.message,
        });
    }
});

router.post("/delete-order", async (req, res) => {
    try {
        console.log('req.body', req.body);

        const { user_id, product_id } = req.body;

        const orderExist = await pool.query(
            `SELECT * FROM orders WHERE user_id = $1 AND product_id = $2`,
            [user_id, product_id]
        )

        if (orderExist.rows.length > 0) {

            const deleteOrder = await pool.query(
                `DELETE FROM orders WHERE user_id = $1 AND product_id = $2`,
                [user_id, product_id]
            )

            if (deleteOrder) {
                return res.status(statusCode.SUCCESS.code).json({
                    success: true,
                    message: "Orders delete successfully!",
                });
            } else {
                return res.status(statusCode.BAD_REQUEST.code).json({
                    success: true,
                    message: "Orders delete failed!",
                    data: result.rows,
                });
            }
        } else {
            return res.status(statusCode.SUCCESS.code).json({
                success: true,
                message: "No orders found.",
                data: [],
            });
        }

    } catch (error) {
        console.error("Delete order error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while orders delete.",
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
    const { cart, userDetail } = req.body;
    const cartId = cart.map((c) => c.id);

    try {
        // Create a PaymentIntent (if you're using PaymentIntents instead of Sessions)
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
                UPDATE orders SET status = 'Ordered' 
                WHERE user_id = $1 AND status = 'Pending' AND id = Any($2)
            `, [userDetail.user_id, cartId]);

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
