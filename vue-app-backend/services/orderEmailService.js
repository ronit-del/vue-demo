/**
 * Order Email Service
 * Handles sending emails for order confirmations and status updates
 */

const sendEmail = require('../config/mail');
const { getOrderConfirmationTemplate, getOrderStatusUpdateTemplate } = require('../config/emailTemplates');
const db = require('../config/db');
const pool = db.getPool();

/**
 * Send order confirmation email
 */
async function sendOrderConfirmationEmail(orderId, orderNumber, userEmail, customerName) {
    try {
        // Get order details
        const orderResult = await pool.query(`
            SELECT 
                o.id,
                o.order_number,
                o.total_amount,
                o.payment_type,
                o.status,
                o.created_at,
                u.name as customer_name,
                u.email as customer_email,
                u.address,
                u.country,
                u.postal_code
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = $1
        `, [orderId]);

        if (orderResult.rows.length === 0) {
            console.error('Order not found for email:', orderId);
            return false;
        }

        const order = orderResult.rows[0];

        // Get order items
        const itemsResult = await pool.query(`
            SELECT 
                od.product_id,
                od.quantity,
                od.base_price,
                od.total_amount,
                p.name as product_name
            FROM order_details od
            LEFT JOIN products p ON p.id = od.product_id
            WHERE od.order_id = $1
        `, [orderId]);

        const items = itemsResult.rows.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name || 'Product',
            quantity: item.quantity,
            price: item.base_price,
            total: item.total_amount
        }));

        // Calculate subtotal (sum of all order items)
        const subtotal = items.reduce((sum, item) => {
            return sum + parseFloat(item.total || 0);
        }, 0);

        // Calculate tax (10% of subtotal)
        const tax = subtotal * 0.1;

        // Generate tracking URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
        const trackingUrl = `${frontendUrl}/track-order/${orderNumber}`;

        // Prepare email data
        const emailData = {
            orderNumber: order.order_number,
            customerName: customerName || order.customer_name,
            trackingUrl: trackingUrl,
            orderDate: new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            subtotal: subtotal,
            tax: tax,
            totalAmount: parseFloat(order.total_amount || 0),
            paymentMethod: order.payment_type || 'N/A',
            items: items,
            shippingAddress: `${order.address}, ${order.country} ${order.postal_code}`
        };

        // Generate email HTML
        const html = getOrderConfirmationTemplate(emailData);

        // Send email
        await sendEmail({
            to: userEmail || order.customer_email,
            subject: `Order Confirmation - ${order.order_number}`,
            html: html
        });

        console.log(`✅ Order confirmation email sent to ${userEmail || order.customer_email} for order ${orderNumber}`);
        return true;

    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        // Don't throw - email failures shouldn't break the order flow
        return false;
    }
}

/**
 * Send order status update email
 */
async function sendOrderStatusUpdateEmail(orderId, orderNumber, newStatus, userEmail, cancellationReason = null) {
    try {
        // Get order details
        const orderResult = await pool.query(`
            SELECT 
                o.id,
                o.order_number,
                o.total_amount,
                o.status,
                o.created_at,
                u.name as customer_name,
                u.email as customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = $1
        `, [orderId]);

        if (orderResult.rows.length === 0) {
            console.error('Order not found for status update email:', orderId);
            return false;
        }

        const order = orderResult.rows[0];

        // Generate tracking URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
        const trackingUrl = `${frontendUrl}/track-order/${orderNumber}`;

        // Prepare email data
        const emailData = {
            orderNumber: order.order_number,
            customerName: order.customer_name,
            status: newStatus,
            trackingUrl: trackingUrl,
            orderDate: new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            totalAmount: parseFloat(order.total_amount || 0),
            cancellationReason: cancellationReason
        };

        // Generate email HTML
        const html = getOrderStatusUpdateTemplate(emailData);

        // Send email
        await sendEmail({
            to: userEmail || order.customer_email,
            subject: `Order ${newStatus} - ${order.order_number}`,
            html: html
        });

        console.log(`✅ Order status update email sent to ${userEmail || order.customer_email} for order ${orderNumber} - Status: ${newStatus}`);
        return true;

    } catch (error) {
        console.error('Error sending order status update email:', error);
        // Don't throw - email failures shouldn't break the order flow
        return false;
    }
}

/**
 * Send admin notification email when order is placed
 */
async function sendAdminOrderNotification(orderId, orderNumber) {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || process.env.USER_EMAIL;

        if (!adminEmail) {
            console.warn('Admin email not configured, skipping admin notification email');
            return false;
        }

        // Get order details with customer and product information
        const orderResult = await pool.query(`
            SELECT 
                o.id,
                o.order_number,
                o.total_amount,
                o.payment_type,
                o.status,
                o.created_at,
                u.name as customer_name,
                u.email as customer_email,
                u.phone as customer_phone,
                u.address,
                u.country,
                u.postal_code
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = $1
        `, [orderId]);

        if (orderResult.rows.length === 0) {
            console.error('Order not found for admin notification:', orderId);
            return false;
        }

        const order = orderResult.rows[0];

        // Get order items
        const itemsResult = await pool.query(`
            SELECT 
                od.product_id,
                od.quantity,
                od.base_price,
                od.total_amount,
                p.name as product_name,
                p.product_code
            FROM order_details od
            LEFT JOIN products p ON p.id = od.product_id
            WHERE od.order_id = $1
        `, [orderId]);

        const items = itemsResult.rows.map(item => ({
            product_code: item.product_code || 'N/A',
            product_name: item.product_name || 'Product',
            quantity: item.quantity,
            price: parseFloat(item.base_price || 0),
            total: parseFloat(item.total_amount || 0)
        }));

        // Calculate subtotal (sum of all order items)
        const subtotal = items.reduce((sum, item) => {
            return sum + parseFloat(item.total || 0);
        }, 0);

        // Calculate tax (10% of subtotal)
        const tax = subtotal * 0.1;

        // Generate admin dashboard URL
        const adminUrl = process.env.ADMIN_URL || process.env.FRONTEND_URL || 'http://localhost:8080';
        const orderUrl = `${adminUrl}/admin/orders/${orderId}`;

        // Create admin notification email HTML
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Order Notification</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #2c3e50;
                        background-color: #f8f9fa;
                        margin: 0;
                        padding: 20px;
                    }
                    .email-container {
                        max-width: 800px;
                        margin: 0 auto;
                        background-color: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        font-size: 28px;
                        margin-bottom: 10px;
                    }
                    .badge {
                        background-color: #27ae60;
                        color: white;
                        padding: 8px 20px;
                        border-radius: 25px;
                        font-size: 14px;
                        font-weight: bold;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        display: inline-block;
                        margin-top: 10px;
                    }
                    .content {
                        padding: 30px;
                    }
                    .section {
                        margin: 20px 0;
                        padding: 20px;
                        border-radius: 8px;
                        background-color: #f8f9fa;
                        border-left: 4px solid #667eea;
                    }
                    .section-title {
                        font-size: 18px;
                        font-weight: bold;
                        color: #2c3e50;
                        margin-bottom: 15px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 10px 0;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    .info-row:last-child {
                        border-bottom: none;
                    }
                    .info-label {
                        font-weight: bold;
                        color: #7f8c8d;
                        font-size: 14px;
                    }
                    .info-value {
                        color: #2c3e50;
                        font-size: 14px;
                        text-align: right;
                    }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                    }
                    .items-table th,
                    .items-table td {
                        padding: 12px;
                        text-align: left;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    .items-table th {
                        background-color: #667eea;
                        color: white;
                        font-weight: bold;
                    }
                    .items-table tr:hover {
                        background-color: #f5f5f5;
                    }
                    .total-section {
                        margin-top: 20px;
                        padding-top: 20px;
                        border-top: 2px solid #667eea;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 16px;
                        font-weight: bold;
                        padding: 10px 0;
                    }
                    .grand-total {
                        font-size: 20px;
                        color: #667eea;
                    }
                    .button {
                        display: inline-block;
                        background-color: #667eea;
                        color: white;
                        padding: 12px 30px;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: bold;
                        margin-top: 20px;
                        text-align: center;
                    }
                    .button:hover {
                        background-color: #5568d3;
                    }
                    .footer {
                        background-color: #f8f9fa;
                        padding: 20px;
                        text-align: center;
                        color: #7f8c8d;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h1>🛒 New Order Received</h1>
                        <div class="badge">Order #${order.order_number}</div>
                    </div>
                    <div class="content">
                        <div class="section">
                            <div class="section-title">Customer Information</div>
                            <div class="info-row">
                                <span class="info-label">Name:</span>
                                <span class="info-value">${order.customer_name || 'N/A'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Email:</span>
                                <span class="info-value">${order.customer_email || 'N/A'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Phone:</span>
                                <span class="info-value">${order.customer_phone || 'N/A'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Address:</span>
                                <span class="info-value">${order.address || 'N/A'}, ${order.country || ''} ${order.postal_code || ''}</span>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">Order Details</div>
                            <div class="info-row">
                                <span class="info-label">Order Number:</span>
                                <span class="info-value">${order.order_number}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Payment Method:</span>
                                <span class="info-value">${order.payment_type || 'N/A'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Status:</span>
                                <span class="info-value">${order.status}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Order Date:</span>
                                <span class="info-value">${new Date(order.created_at).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">Order Items</div>
                            <table class="items-table">
                                <thead>
                                    <tr>
                                        <th>Product Code</th>
                                        <th>Product Name</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${items.map(item => `
                                        <tr>
                                            <td>${item.product_code}</td>
                                            <td>${item.product_name}</td>
                                            <td>${item.quantity}</td>
                                            <td>$${item.price.toFixed(2)}</td>
                                            <td>$${item.total.toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            <div class="total-section">
                                <div class="total-row">
                                    <span>Subtotal:</span>
                                    <span>$${subtotal.toFixed(2)}</span>
                                </div>
                                <div class="total-row">
                                    <span>Tax (10%):</span>
                                    <span>$${tax.toFixed(2)}</span>
                                </div>
                                <div class="total-row grand-total">
                                    <span>Grand Total:</span>
                                    <span>$${parseFloat(order.total_amount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div style="text-align: center;">
                            <a href="${orderUrl}" class="button">View Order in Dashboard</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send email
        await sendEmail({
            to: adminEmail,
            subject: `New Order Received - ${order.order_number}`,
            html: html
        });

        console.log(`✅ Admin notification email sent to ${adminEmail} for order ${orderNumber}`);
        return true;

    } catch (error) {
        console.error('Error sending admin notification email:', error);
        // Don't throw - email failures shouldn't break the order flow
        return false;
    }
}

module.exports = {
    sendOrderConfirmationEmail,
    sendOrderStatusUpdateEmail,
    sendAdminOrderNotification
};

