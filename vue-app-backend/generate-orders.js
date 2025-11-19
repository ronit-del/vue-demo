require('dotenv').config();
const db = require('./config/db');

// Order statuses
const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
const paymentTypes = ['COD', 'Stripe', 'Credit Card', 'Debit Card'];

// Cancellation reasons
const cancellationReasons = [
  'Customer requested cancellation',
  'Out of stock - item unavailable',
  'Payment failed',
  'Duplicate order',
  'Customer changed mind',
  'Shipping address incorrect',
  'Product no longer needed',
  'Found better price elsewhere',
  'Order placed by mistake',
  'Customer requested refund instead',
  'Item damaged during processing',
  'Customer unavailable for delivery',
  'Order timeout - payment not received',
  'Fraudulent order detected',
  'Customer account issue',
  'Shipping restrictions to address',
  'Product discontinued',
  'Customer requested to cancel before shipping',
  'Payment method declined',
  'Order exceeds shipping weight limit'
];

// Generate random data
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function generateOrderNumber(orderDate = null) {
  const date = orderDate || new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, '');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `ORD-${dateStr}-${random}`;
}

// Main function to generate random orders
async function generateRandomOrders() {
  try {
    console.log('🛒 Starting to generate random order data...');

    // Initialize database connection
    const result = await db.initialize();
    if (!result.connected) {
      console.error('❌ Database not connected. Cannot generate orders.');
      process.exit(1);
    }

    const pool = db.getPool();

    // Get all existing users
    const usersResult = await pool.query('SELECT id FROM users');
    if (usersResult.rows.length === 0) {
      console.error('❌ No users found in database. Please create users first.');
      process.exit(1);
    }
    const userIds = usersResult.rows.map(row => row.id);
    console.log(`✅ Found ${userIds.length} users`);

    // Get all existing products
    const productsResult = await pool.query('SELECT id, price FROM products');
    if (productsResult.rows.length === 0) {
      console.error('❌ No products found in database. Please create products first.');
      process.exit(1);
    }
    const products = productsResult.rows;
    console.log(`✅ Found ${products.length} products`);

    // Ask for number of orders to generate
    const numOrders = process.argv[2] ? parseInt(process.argv[2]) : 50;
    console.log(`📦 Generating ${numOrders} random orders...\n`);

    const orderIds = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < numOrders; i++) {
      try {
        const userId = randomElement(userIds);
        const paymentType = randomElement(paymentTypes);
        const status = randomElement(orderStatuses);
        
        // IMPORTANT: Only set cancellation_reason for 'Cancelled' status orders
        // All other statuses must have null cancellation_reason
        const cancellationReason = status === 'Cancelled' ? randomElement(cancellationReasons) : null;
        
        // Generate random date between 2015 and 2025
        const startYear = 2015;
        const endYear = 2025;
        const startDate = new Date(startYear, 0, 1); // January 1, 2015
        const endDate = new Date(endYear, 11, 31, 23, 59, 59); // December 31, 2025
        const timeDiff = endDate.getTime() - startDate.getTime();
        const randomTime = Math.random() * timeDiff;
        const orderDate = new Date(startDate.getTime() + randomTime);
        const orderDateStr = orderDate.toISOString();
        
        // Generate order number based on the order date
        const orderNumber = generateOrderNumber(orderDate);

        // Create order with 1-4 products
        const numProducts = randomNumber(1, 4);
        let orderTotal = 0;
        const selectedProducts = [];

        // Randomly select products for this order
        for (let j = 0; j < numProducts; j++) {
          const product = randomElement(products);
          // Avoid duplicate products in same order
          if (!selectedProducts.find(p => p.id === product.id)) {
            selectedProducts.push(product);
          }
        }

        // First, create the order
        // Note: cancellation_reason is only set for 'Cancelled' status, null for all other statuses
        const orderResult = await pool.query(`
          INSERT INTO orders (order_number, user_id, total_amount, payment_type, status, cancellation_reason, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
          RETURNING id
        `, [
          orderNumber,
          userId,
          0, // Will be updated after order_details are created
          paymentType,
          status,
          cancellationReason, // null for non-cancelled orders, random reason for cancelled orders
          orderDateStr
        ]);

        const orderId = orderResult.rows[0].id;
        orderIds.push(orderId);

        // Then, create order_details entries
        for (const product of selectedProducts) {
          const basePrice = parseFloat(product.price) || randomDecimal(10.00, 500.00);
          const quantity = randomNumber(1, 5);
          const totalAmount = parseFloat((basePrice * quantity).toFixed(2));
          orderTotal += totalAmount;

          await pool.query(`
            INSERT INTO order_details (order_id, order_number, user_id, product_id, base_price, quantity, total_amount, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
          `, [
            orderId,
            orderNumber,
            userId,
            product.id,
            basePrice,
            quantity,
            totalAmount,
            orderDateStr
          ]);
        }

        // Update order total_amount (including 10% tax)
        const subtotal = orderTotal;
        const tax = parseFloat((subtotal * 0.1).toFixed(2));
        const finalTotal = parseFloat((subtotal + tax).toFixed(2));

        await pool.query(`
          UPDATE orders 
          SET total_amount = $1 
          WHERE id = $2
        `, [finalTotal, orderId]);

        successCount++;
        if ((i + 1) % 10 === 0) {
          console.log(`  ✅ Generated ${i + 1}/${numOrders} orders...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error generating order ${i + 1}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully generated ${successCount} orders with order_details`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} orders failed to generate`);
    }

    // Display summary
    const summaryResult = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(DISTINCT user_id) as unique_customers,
        SUM(total_amount) as total_revenue,
        status,
        COUNT(*) as count_by_status
      FROM orders
      GROUP BY status
    `);

    console.log('\n📊 Order Summary:');
    console.log('─'.repeat(50));
    summaryResult.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count_by_status} orders`);
    });

    // Show cancellation reasons if there are cancelled orders
    const cancelledOrdersResult = await pool.query(`
      SELECT cancellation_reason, COUNT(*) as count
      FROM orders
      WHERE status = 'Cancelled' AND cancellation_reason IS NOT NULL
      GROUP BY cancellation_reason
      ORDER BY count DESC
      LIMIT 10
    `);

    if (cancelledOrdersResult.rows.length > 0) {
      console.log('\n📋 Top Cancellation Reasons:');
      console.log('─'.repeat(50));
      cancelledOrdersResult.rows.forEach(row => {
        console.log(`  "${row.cancellation_reason}": ${row.count} orders`);
      });
    }

    const totalResult = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(DISTINCT user_id) as unique_customers,
        SUM(total_amount) as total_revenue,
        MIN(created_at) as earliest_order,
        MAX(created_at) as latest_order
      FROM orders
    `);

    if (totalResult.rows.length > 0) {
      const totals = totalResult.rows[0];
      console.log('─'.repeat(50));
      console.log(`  Total Orders: ${totals.total_orders}`);
      console.log(`  Unique Customers: ${totals.unique_customers}`);
      console.log(`  Total Revenue: $${parseFloat(totals.total_revenue || 0).toFixed(2)}`);
      if (totals.earliest_order) {
        console.log(`  Date Range: ${new Date(totals.earliest_order).toLocaleDateString()} to ${new Date(totals.latest_order).toLocaleDateString()}`);
      }
    }

    console.log('\n✨ Order generation completed!');
    console.log(`📅 Orders generated with dates between 2015 and 2025`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating orders:', error);
    process.exit(1);
  }
}

// Run the script
generateRandomOrders();

