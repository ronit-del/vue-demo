require('dotenv').config();
const db = require('./config/db');
const fs = require('fs');
const path = require('path');

// Path to the constant.json file
const constantJsonPath = path.join(__dirname, '../my-vue-app/src/constant.json');

async function importProducts() {
  try {
    console.log('🌱 Starting product import from constant.json...');

    // Initialize database connection
    const result = await db.initialize();
    if (!result.connected) {
      console.error('❌ Database not connected. Cannot import products.');
      process.exit(1);
    }

    const pool = db.getPool();

    // Read and parse the constant.json file
    console.log(`📖 Reading ${constantJsonPath}...`);
    if (!fs.existsSync(constantJsonPath)) {
      console.error(`❌ File not found: ${constantJsonPath}`);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(constantJsonPath, 'utf8');
    const products = JSON.parse(fileContent);

    if (!Array.isArray(products)) {
      console.error('❌ Invalid JSON format: expected an array of products');
      process.exit(1);
    }

    console.log(`📦 Found ${products.length} products to import`);

    // Check if products table exists
    const tableExists = await db.checkTableExists('products');
    if (!tableExists) {
      console.log('⚠️  Products table does not exist. Please run database initialization first.');
      process.exit(1);
    }

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Import each product
    for (const product of products) {
      try {
        // Validate required fields
        if (!product.name || !product.price) {
          console.log(`⚠️  Skipping product: missing required fields (name or price)`);
          skipped++;
          continue;
        }

        // Check if product with same name already exists
        const existingProduct = await pool.query(
          'SELECT id FROM products WHERE name = $1',
          [product.name]
        );

        if (existingProduct.rows.length > 0) {
          console.log(`⏭️  Skipping "${product.name}": already exists`);
          skipped++;
          continue;
        }

        // Parse price (handle both string and number formats)
        let price;
        if (typeof product.price === 'string') {
          price = parseFloat(product.price);
        } else {
          price = parseFloat(product.price);
        }

        if (isNaN(price)) {
          console.log(`⚠️  Skipping "${product.name}": invalid price format`);
          skipped++;
          continue;
        }

        // Generate random stock quantity between 501 and 5000
        const stockQuantity = Math.floor(Math.random() * (5000 - 501 + 1)) + 501;

        // Insert product into database
        const insertResult = await pool.query(`
          INSERT INTO products (product_code, name, image, description, price, stock_quantity, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING id, name
        `, [
          product.product_code,
          product.name,
          product.image || null,
          product.description || null,
          price,
          stockQuantity // Random stock quantity greater than 500
        ]);

        imported++;
        console.log(`✅ Imported: ${product.name} (ID: ${insertResult.rows[0].id})`);

        // Show progress every 10 products
        if (imported % 10 === 0) {
          console.log(`📊 Progress: ${imported} imported, ${skipped} skipped, ${errors} errors`);
        }

      } catch (error) {
        errors++;
        console.error(`❌ Error importing "${product.name || 'Unknown'}":`, error);
      }
    }

    // Summary
    console.log('\n📊 Import Summary:');
    console.log(`  ✅ Successfully imported: ${imported}`);
    console.log(`  ⏭️  Skipped (duplicates/missing fields): ${skipped}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log(`  📦 Total processed: ${products.length}`);
    console.log('\n🎉 Product import completed!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during product import:', error);
    process.exit(1);
  }
}

// Run the import
importProducts();

