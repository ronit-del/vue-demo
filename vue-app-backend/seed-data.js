require('dotenv').config();
const db = require('./config/db');

// Sample data generators
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Olivia', 'William', 'Sophia', 'Richard', 'Isabella', 'Joseph', 'Charlotte'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore'];
const countries = ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'India', 'Japan', 'Brazil', 'Mexico'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Toronto', 'London', 'Sydney', 'Berlin', 'Paris', 'Mumbai', 'Tokyo'];
const paymentTypes = ['Credit Card', 'Stripe', 'Debit Card', 'Cash'];
const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];

// Sample product IDs (you can use actual product IDs from your products table)
const productIds = ['PROD001', 'PROD002', 'PROD003', 'PROD004', 'PROD005', 'PROD006', 'PROD007', 'PROD008', 'PROD009', 'PROD010'];

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

function generateOrderNumber() {
  const prefix = 'ORD';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}`;
}

function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber(1, 999)}@${randomElement(domains)}`;
}

function generatePhone() {
  return `+1${randomNumber(2000000000, 9999999999)}`;
}

function generatePostalCode() {
  return `${randomNumber(10000, 99999)}`;
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Initialize database connection
    const result = await db.initialize();
    if (!result.connected) {
      console.error('❌ Database not connected. Cannot seed data.');
      process.exit(1);
    }

    const pool = db.getPool();
    const bcrypt = require('bcryptjs');

    // Step 1: Insert 8 new users
    console.log('👥 Inserting users...');
    const userIds = [];
    const password_hash = await bcrypt.hash('password123', 12);

    for (let i = 0; i < 8; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const email = generateEmail(firstName, lastName);
      
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length === 0) {
        const result = await pool.query(`
          INSERT INTO users (name, email, password_hash, phone, postal_code, address, country, email_verified, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
          RETURNING id
        `, [
          `${firstName} ${lastName}`,
          email,
          password_hash,
          generatePhone(),
          generatePostalCode(),
          `${randomNumber(100, 9999)} ${randomElement(cities)} Street`,
          randomElement(countries),
          Math.random() > 0.3, // 70% verified
          'active' // Default status
        ]);
        userIds.push(result.rows[0].id);
        console.log(`  ✅ Created user: ${firstName} ${lastName} (${email})`);
      } else {
        userIds.push(existingUser.rows[0].id);
      }
    }

    // Get all existing users (including the ones we just created)
    const allUsersResult = await pool.query('SELECT id FROM users LIMIT 20');
    const allUserIds = allUsersResult.rows.map(row => row.id);
    
    if (allUserIds.length === 0) {
      console.error('❌ No users found. Cannot create orders.');
      process.exit(1);
    }

    console.log(`  ✅ Total users available: ${allUserIds.length}`);

    // Step 2: Ensure we have some products (or use product IDs)
    console.log('📦 Checking products...');
    const productsResult = await pool.query('SELECT id as id FROM products');
    const existingProductIds = productsResult.rows.map(row => row.id);
    
    // Use existing products or fallback to string IDs
    const availableProductIds = existingProductIds.length > 0 ? existingProductIds : productIds;
    console.log(`  ✅ Using ${availableProductIds.length} products`);

    // Step 3: Insert 75 orders with order_details
    console.log('📝 Inserting orders and order details...');
    const orderIds = [];
    const numOrders = 75;

    for (let i = 0; i < numOrders; i++) {
      const userId = randomElement(allUserIds);
      const orderNumber = generateOrderNumber();
      const paymentType = randomElement(paymentTypes);
      const status = randomElement(orderStatuses);
      const orderDateDaysAgo = randomNumber(0, 90);
      
      // Create order with 1-4 products
      const numProducts = randomNumber(1, 4);
      let orderTotal = 0;

      // First, create the order
      const orderResult = await pool.query(`
        INSERT INTO orders (order_number, user_id, total_amount, payment_type, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${orderDateDaysAgo} days', NOW() - INTERVAL '${orderDateDaysAgo} days')
        RETURNING id
      `, [
        orderNumber,
        userId,
        0, // Will be updated after order_details are created
        paymentType,
        status
      ]);

      const orderId = orderResult.rows[0].id;
      orderIds.push(orderId);

      // Then, create order_details entries that reference the order
      for (let j = 0; j < numProducts; j++) {
        const productId = randomElement(availableProductIds);
        const basePrice = randomDecimal(10.00, 500.00);
        const quantity = randomNumber(1, 5);
        const totalAmount = parseFloat((basePrice * quantity).toFixed(2));
        orderTotal += totalAmount;

        await pool.query(`
          INSERT INTO order_details (order_id, order_number, user_id, product_id, base_price, quantity, total_amount, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '${orderDateDaysAgo} days', NOW() - INTERVAL '${orderDateDaysAgo} days')
        `, [orderId, orderNumber, userId, productId, basePrice, quantity, totalAmount]);
      }

      // Update order total_amount
      await pool.query(`
        UPDATE orders 
        SET total_amount = $1 
        WHERE id = $2
      `, [parseFloat(orderTotal.toFixed(2)), orderId]);

      if ((i + 1) % 10 === 0) {
        console.log(`  ✅ Created ${i + 1}/${numOrders} orders`);
      }
    }

    console.log(`  ✅ Created ${numOrders} orders with order details`);

    // Step 4: Insert product ratings
    console.log('⭐ Inserting product ratings...');
    const ratingReviews = [
      'Great product! Highly recommend.',
      'Excellent quality and fast shipping.',
      'Good value for money.',
      'Not bad, but could be better.',
      'Amazing! Exceeded my expectations.',
      'Decent product, works as expected.',
      'Outstanding quality and service.',
      'Very satisfied with this purchase.',
      'Good product, but delivery was slow.',
      'Love it! Will buy again.',
      null, // Some ratings without reviews
      null,
      null
    ];

    let ratingsInserted = 0;
    const maxRatings = 150; // More ratings than orders for variety

    for (let i = 0; i < maxRatings; i++) {
      const userId = randomElement(allUserIds);
      const productId = randomElement(availableProductIds);
      const rating = randomNumber(1, 5);
      const review = Math.random() > 0.3 ? randomElement(ratingReviews) : null;

      try {
        await pool.query(`
          INSERT INTO product_ratings (user_id, product_id, rating, review, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW() - INTERVAL '${randomNumber(0, 90)} days', NOW() - INTERVAL '${randomNumber(0, 90)} days')
          ON CONFLICT (product_id, user_id) DO NOTHING
        `, [userId, productId, rating, review]);
        ratingsInserted++;
      } catch (error) {
        // Ignore duplicate key errors (due to UNIQUE constraint)
        if (!error.message.includes('duplicate key')) {
          console.error(`  ⚠️  Error inserting rating: ${error.message}`);
        }
      }
    }

    console.log(`  ✅ Created ${ratingsInserted} product ratings`);

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`  ✅ Users: ${allUserIds.length} total`);
    console.log(`  ✅ Orders: ${numOrders}`);
    console.log(`  ✅ Product Ratings: ${ratingsInserted}`);
    console.log('\n🎉 Database seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();

