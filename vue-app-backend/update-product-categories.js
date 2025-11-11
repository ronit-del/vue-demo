require('dotenv').config();
const db = require('./config/db');
const pool = db.getPool();

/**
 * Infer category from image path
 * @param {string} imagePath - Image path or URL
 * @returns {string|null} Category value or null
 */
function inferCategoryFromImage(imagePath) {
    if (!imagePath) return null;
    
    const lowerPath = imagePath.toLowerCase();
    
    if (lowerPath.includes('electronics')) {
        return 'electronics';
    } else if (lowerPath.includes('clothes') || lowerPath.includes('clothe')) {
        return 'clothes';
    } else if (lowerPath.includes('home_appliances') || lowerPath.includes('home appliance')) {
        return 'home_appliances';
    } else if (lowerPath.includes('beauty') || lowerPath.includes('beuty')) {
        return 'beauty';
    }
    
    return null;
}

/**
 * Update product categories in the database
 */
async function updateProductCategories() {
    try {
        console.log('🔄 Starting product category update...\n');
        
        // Ensure database connection
        await db.initialize();

        const pool = db.getPool();
        
        // Get all products
        const result = await pool.query(`
            SELECT id, name, product_code, image, category
            FROM products
            ORDER BY created_at DESC
        `);
        
        const products = result.rows;
        console.log(`📦 Found ${products.length} products\n`);
        
        if (products.length === 0) {
            console.log('✅ No products to update');
            return;
        }
        
        let updated = 0;
        let skipped = 0;
        let errors = 0;
        
        // Update each product
        for (const product of products) {
            try {
                // Skip if category is already set
                if (product.category) {
                    console.log(`⏭️  Skipping "${product.name}" (${product.product_code}): Category already set to "${product.category}"`);
                    skipped++;
                    continue;
                }
                
                // Infer category from image path
                const inferredCategory = inferCategoryFromImage(product.image);
                
                if (!inferredCategory) {
                    console.log(`⚠️  Skipping "${product.name}" (${product.product_code}): Could not infer category from image path`);
                    skipped++;
                    continue;
                }
                
                // Update product category in database
                await pool.query(`
                    UPDATE products
                    SET category = $1, updated_at = NOW()
                    WHERE id = $2
                `, [inferredCategory, product.id]);
                
                updated++;
                console.log(`✅ Updated: ${product.name} (${product.product_code})`);
                console.log(`   Category: ${inferredCategory}`);
                console.log(`   Image: ${product.image || 'N/A'}`);
                console.log('');
                
                // Show progress every 10 products
                if (updated % 10 === 0) {
                    console.log(`📊 Progress: ${updated} updated, ${skipped} skipped, ${errors} errors\n`);
                }
                
            } catch (error) {
                errors++;
                console.error(`❌ Error updating "${product.name}" (${product.product_code}):`, error.message);
            }
        }
        
        console.log('\n📊 Final Summary:');
        console.log(`   ✅ Updated: ${updated}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log('\n✅ Category update completed!');
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

// Run the update
if (require.main === module) {
    updateProductCategories();
}

module.exports = { updateProductCategories, inferCategoryFromImage };

