require('dotenv').config();
const db = require('./config/db');
const path = require('path');

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_NAME || 'dqvmwnxan';

/**
 * Convert local image path to Cloudinary URL
 * @param {string} localPath - Local path like "product-category/electronics/electronics-1.jpg"
 * @returns {string} Cloudinary URL
 */
function convertToCloudinaryUrl(localPath) {
    if (!localPath) return null;
    
    // If already a Cloudinary URL, return as is
    if (localPath.includes('cloudinary.com')) {
        return localPath;
    }
    
    // Remove leading slash if present
    let cleanPath = localPath.replace(/^\//, '');
    
    // Remove 'product-category/' prefix if present
    cleanPath = cleanPath.replace(/^product-category\//, '');
    
    // Extract file extension
    const ext = path.extname(cleanPath);
    const fileNameWithoutExt = path.basename(cleanPath, ext);
    const dirName = path.dirname(cleanPath);
    
    // Normalize directory path
    let cloudinarySubFolder = dirName
        .replace(/\\/g, '/')
        .replace(/^\.\//, '')
        .replace(/^\//, '');
    
    // Build Cloudinary public_id
    let publicId;
    if (cloudinarySubFolder === '.' || cloudinarySubFolder === '') {
        // Root images: Vue-App/products/product-category/{filename}
        publicId = `Vue-App/products/product-category/${fileNameWithoutExt}`;
    } else {
        // Subfolder images: Vue-App/products/product-category/{subfolder}/{filename}
        publicId = `Vue-App/products/product-category/${cloudinarySubFolder}/${fileNameWithoutExt}`;
    }
    
    // Construct Cloudinary URL
    // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{ext}
    // Note: Cloudinary handles spaces and special characters in public_ids automatically
    const cloudinaryUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}${ext}`;
    console.log('cloudinaryUrl', cloudinaryUrl);
    return cloudinaryUrl;
}

/**
 * Update all product images in the database
 */
async function updateProductImages() {
    try {
        console.log('🔄 Starting product image URL update...');
        
        // Initialize database connection
        const result = await db.initialize();
        if (!result.connected) {
            console.error('❌ Database not connected. Cannot update product images.');
            process.exit(1);
        }
        
        const pool = db.getPool();
        
        // Get all products
        console.log('📖 Fetching all products from database...');
        const productsResult = await pool.query(`
            SELECT id, name, image, product_code
            FROM products
            WHERE image IS NOT NULL AND image != ''
            ORDER BY created_at DESC
        `);
        
        const products = productsResult.rows;
        console.log(`📦 Found ${products.length} products with images\n`);
        
        if (products.length === 0) {
            console.log('⚠️  No products with images found.');
            process.exit(0);
        }
        
        let updated = 0;
        let skipped = 0;
        let errors = 0;
        
        // Update each product
        for (const product of products) {
            try {
                const oldImageUrl = product.image;
                
                // Skip if already a Cloudinary URL
                console.log('oldImageUrl', oldImageUrl);
                if (oldImageUrl && oldImageUrl.includes('cloudinary.com')) {
                    console.log(`⏭️  Skipping "${product.name}" (${product.product_code}): Already using Cloudinary URL`);
                    skipped++;
                    continue;
                }
                
                // Convert to Cloudinary URL
                console.log('oldImageUrl', oldImageUrl);
                const newImageUrl = convertToCloudinaryUrl(oldImageUrl);
                console.log('newImageUrl', newImageUrl);
                
                
                if (!newImageUrl) {
                    console.log(`⚠️  Skipping "${product.name}" (${product.product_code}): Invalid image path`);
                    skipped++;
                    continue;
                }
                
                // Update product in database
                /* await pool.query(`
                    UPDATE products
                    SET image = $1, updated_at = NOW()
                    WHERE id = $2
                `, [newImageUrl, product.id]);
                
                updated++;
                console.log(`✅ Updated: ${product.name} (${product.product_code})`);
                console.log(`   Old: ${oldImageUrl}`);
                console.log(`   New: ${newImageUrl}`);
                console.log('');
                
                // Show progress every 10 products
                if (updated % 10 === 0) {
                    console.log(`📊 Progress: ${updated} updated, ${skipped} skipped, ${errors} errors\n`);
                } */
                
            } catch (error) {
                errors++;
                console.error(`❌ Error updating "${product.name || 'Unknown'}":`, error.message);
            }
        }
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 Update Summary');
        console.log('='.repeat(60));
        console.log(`✅ Successfully updated: ${updated}`);
        console.log(`⏭️  Skipped (already Cloudinary/invalid): ${skipped}`);
        console.log(`❌ Errors: ${errors}`);
        console.log(`📦 Total processed: ${products.length}`);
        console.log('\n🎉 Product image URL update completed!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during product image update:', error);
        process.exit(1);
    }
}

// Run the update
updateProductImages();

