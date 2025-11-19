/**
 * Email Templates for Order Notifications
 */

/**
 * Generate order confirmation email template
 */
function getOrderConfirmationTemplate(orderData) {
    const {
        orderNumber,
        customerName,
        trackingUrl,
        orderDate,
        subtotal = 0,
        tax = 0,
        totalAmount,
        paymentMethod,
        items = [],
        shippingAddress
    } = orderData;

    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>${item.product_name || 'Product'}</strong>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
                ${item.quantity}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                $${parseFloat(item.price || 0).toFixed(2)}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                $${parseFloat(item.total || item.price * item.quantity || 0).toFixed(2)}
            </td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Order Confirmed!</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hi ${customerName || 'Customer'},
                            </p>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Thank you for your order! We've received your order and will begin processing it shortly.
                            </p>
                            
                            <!-- Order Details -->
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0;">Order Details</h2>
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 5px 0; color: #666666;"><strong>Order Number:</strong></td>
                                        <td style="padding: 5px 0; color: #333333; text-align: right;"><strong>${orderNumber}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #666666;">Order Date:</td>
                                        <td style="padding: 5px 0; color: #333333; text-align: right;">${orderDate || new Date().toLocaleDateString()}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #666666;">Payment Method:</td>
                                        <td style="padding: 5px 0; color: #333333; text-align: right;">${paymentMethod || 'N/A'}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Order Items -->
                            <div style="margin: 20px 0;">
                                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0;">Order Items</h2>
                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                    <thead>
                                        <tr style="background-color: #f8f9fa;">
                                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
                                            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                                            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                                            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsHtml}
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Order Summary -->
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0;">Order Summary</h2>
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #666666;">Subtotal:</td>
                                        <td style="padding: 8px 0; color: #333333; text-align: right;">$${parseFloat(subtotal || 0).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #666666;">Tax (10%):</td>
                                        <td style="padding: 8px 0; color: #333333; text-align: right;">$${parseFloat(tax || 0).toFixed(2)}</td>
                                    </tr>
                                    <tr style="border-top: 2px solid #dee2e6; margin-top: 10px;">
                                        <td style="padding: 12px 0 0 0; color: #333333;"><strong>Total Amount:</strong></td>
                                        <td style="padding: 12px 0 0 0; color: #333333; text-align: right;"><strong style="font-size: 18px; color: #667eea;">$${parseFloat(totalAmount || 0).toFixed(2)}</strong></td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Tracking Button -->
                            ${trackingUrl ? `
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                    Track Your Order
                                </a>
                            </div>
                            <p style="color: #666666; font-size: 14px; text-align: center; margin: 10px 0 0 0;">
                                Or use this tracking ID: <strong>${orderNumber}</strong>
                            </p>
                            ` : `
                            <p style="color: #666666; font-size: 14px; text-align: center; margin: 20px 0;">
                                Tracking ID: <strong>${orderNumber}</strong>
                            </p>
                            `}
                            
                            <!-- Footer -->
                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                We'll send you another email when your order ships. If you have any questions, please don't hesitate to contact us.
                            </p>
                            
                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                                Best regards,<br>
                                <strong>The SmartShop Team</strong>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

/**
 * Generate order status update email template
 */
function getOrderStatusUpdateTemplate(orderData) {
    const {
        orderNumber,
        customerName,
        status,
        trackingUrl,
        orderDate,
        totalAmount,
        statusMessage,
        cancellationReason
    } = orderData;

    const statusMessages = {
        'Processing': {
            title: 'Your Order is Being Processed',
            message: 'We\'ve received your order and our team is preparing it for shipment.',
            color: '#667eea'
        },
        'Shipped': {
            title: 'Your Order Has Shipped!',
            message: 'Great news! Your order has been shipped and is on its way to you.',
            color: '#28a745'
        },
        'Delivered': {
            title: 'Your Order Has Been Delivered',
            message: 'Your order has been successfully delivered. We hope you enjoy your purchase!',
            color: '#17a2b8'
        },
        'Cancelled': {
            title: 'Order Cancelled',
            message: 'Your order has been cancelled. If you have any questions, please contact our support team.',
            color: '#dc3545'
        },
        'Refunded': {
            title: 'Order Refunded',
            message: 'Your order has been refunded. The refund will be processed according to your payment method.',
            color: '#ffc107'
        }
    };

    const statusInfo = statusMessages[status] || {
        title: 'Order Status Update',
        message: statusMessage || 'Your order status has been updated.',
        color: '#667eea'
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: ${statusInfo.color}; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${statusInfo.title}</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hi ${customerName || 'Customer'},
                            </p>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                ${statusInfo.message}
                            </p>
                            
                            ${status === 'Cancelled' && cancellationReason ? `
                            <!-- Cancellation Reason -->
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">Cancellation Reason:</h3>
                                <p style="color: #856404; margin: 0; line-height: 1.6;">${cancellationReason}</p>
                            </div>
                            ` : ''}
                            
                            <!-- Order Details -->
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding: 5px 0; color: #666666;"><strong>Order Number:</strong></td>
                                        <td style="padding: 5px 0; color: #333333; text-align: right;"><strong>${orderNumber}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #666666;">Status:</td>
                                        <td style="padding: 5px 0; color: #333333; text-align: right;">
                                            <span style="background-color: ${statusInfo.color}; color: #ffffff; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                                ${status}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #666666;">Order Date:</td>
                                        <td style="padding: 5px 0; color: #333333; text-align: right;">${orderDate || new Date().toLocaleDateString()}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #666666;">Total Amount:</td>
                                        <td style="padding: 5px 0; color: #333333; text-align: right;">$${parseFloat(totalAmount || 0).toFixed(2)}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Tracking Button -->
                            ${trackingUrl ? `
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${trackingUrl}" style="display: inline-block; background: ${statusInfo.color}; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                    Track Your Order
                                </a>
                            </div>
                            ` : ''}
                            
                            <!-- Footer -->
                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                If you have any questions about your order, please don't hesitate to contact our support team.
                            </p>
                            
                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                                Best regards,<br>
                                <strong>The SmartShop Team</strong>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

module.exports = {
    getOrderConfirmationTemplate,
    getOrderStatusUpdateTemplate
};

