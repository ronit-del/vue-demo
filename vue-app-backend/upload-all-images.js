require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary with provided credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME || 'dqvmwnxan',
    api_key: process.env.CLOUDINARY_API_KEY || '812965777242228',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'pOE-7S5Um_Ck1OrNgllFYsTcvXs'
});

// Supported image extensions
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

// Recursively find all image files
function findImageFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Skip node_modules and other common directories
            if (!file.startsWith('.') && file !== 'node_modules') {
                findImageFiles(filePath, fileList);
            }
        } else {
            const ext = path.extname(file).toLowerCase();
            if (imageExtensions.includes(ext)) {
                fileList.push(filePath);
            }
        }
    });
    
    return fileList;
}

// Upload a single image to Cloudinary
async function uploadImage(filePath, baseDir) {
    try {
        // Get relative path from product-category directory to maintain folder structure
        const relativePath = path.relative(baseDir, filePath);
        const dirName = path.dirname(relativePath);
        const fileName = path.basename(filePath, path.extname(filePath));
        
        // Normalize directory name
        let cloudinarySubFolder = dirName
            .replace(/\\/g, '/') // Replace backslashes with forward slashes
            .replace(/^\.\//, '') // Remove leading ./
            .replace(/^\//, ''); // Remove leading slash
        
        // If in root of product-category, subfolder is empty
        if (cloudinarySubFolder === '.' || cloudinarySubFolder === '') {
            cloudinarySubFolder = '';
        }
        
        // Build the public_id with proper folder structure
        // Base folder is 'Vue-App/products/product-category' in Cloudinary
        let publicId;
        if (cloudinarySubFolder) {
            // Images in subfolders: Vue-App/products/product-category/{subfolder}/{filename}
            publicId = `Vue-App/products/product-category/${cloudinarySubFolder}/${fileName}`;
        } else {
            // Root images: Vue-App/products/product-category/{filename}
            publicId = `Vue-App/products/product-category/${fileName}`;
        }
        
        console.log(`Setting public_id: ${publicId}`);
        
        // Upload to Cloudinary
        // Using public_id with full path (includes folder) for better control
        const result = await cloudinary.uploader.upload(filePath, {
            public_id: publicId,
            use_filename: false, // Don't use the original filename
            unique_filename: false, // Don't add unique suffix
            resource_type: 'auto',
            overwrite: true, // Overwrite existing images to ensure correct public_id
            invalidate: true, // Invalidate CDN cache
            transformation: [
                { quality: 'auto' }, // Optimize quality
                { fetch_format: 'auto' } // Auto format
            ]
        });
        
        console.log(`Uploaded: ${relativePath}`);
        console.log(`Public ID: ${result.public_id}`);
        console.log(`URL: ${result.secure_url}`);
        console.log('---');
        
        return {
            success: true,
            localPath: filePath,
            cloudinaryUrl: result.secure_url,
            publicId: result.public_id,
            folder: cloudinarySubFolder || 'Vue-App/products/product-category'
        };
    } catch (error) {
        return {
            success: false,
            localPath: filePath,
            error: error.message
        };
    }
}

// Main function
async function uploadAllImages() {
    // Target specifically the product-category directory
    const productCategoryDir = path.join(__dirname, '..', 'my-vue-app', 'public', 'product-category');
    
    // Check if directory exists
    if (!fs.existsSync(productCategoryDir)) {
        console.error(`❌ Directory not found: ${productCategoryDir}`);
        process.exit(1);
    }
    
    console.log('🔍 Scanning for images in:', productCategoryDir);
    console.log('📋 Cloudinary Configuration:');
    console.log(`   Cloud Name: ${cloudinary.config().cloud_name}`);
    console.log(`   API Key: ${cloudinary.config().api_key}`);
    console.log('');
    
    // Find all image files in product-category directory
    const imageFiles = findImageFiles(productCategoryDir);
    
    console.log(`📸 Found ${imageFiles.length} image files to upload\n`);
    
    if (imageFiles.length === 0) {
        console.log('No images found to upload.');
        return;
    }
    
    const results = {
        successful: [],
        failed: []
    };
    
    // Upload images with progress
    for (let i = 0; i < imageFiles.length; i++) {
        const filePath = imageFiles[i];
        const relativePath = path.relative(productCategoryDir, filePath);
        const progress = `[${i + 1}/${imageFiles.length}]`;
        
        process.stdout.write(`${progress} Uploading: ${relativePath}... `);
        
        const result = await uploadImage(filePath, productCategoryDir);
        
        if (result.success) {
            console.log('✅');
            results.successful.push(result);
        } else {
            console.log(`❌ Error: ${result.error}`);
            results.failed.push(result);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Upload Summary');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${results.successful.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`📁 Total: ${imageFiles.length}`);
    
    if (results.successful.length > 0) {
        console.log('\n✅ Successfully uploaded images:');
        results.successful.forEach((result, index) => {
            const relativePath = path.relative(productCategoryDir, result.localPath);
            console.log(`   ${index + 1}. ${relativePath}`);
            console.log(`      Cloudinary URL: ${result.cloudinaryUrl}`);
            console.log(`      Public ID: ${result.publicId}`);
        });
    }
    
    if (results.failed.length > 0) {
        console.log('\n❌ Failed uploads:');
        results.failed.forEach((result, index) => {
            const relativePath = path.relative(productCategoryDir, result.localPath);
            console.log(`   ${index + 1}. ${relativePath}`);
            console.log(`      Error: ${result.error}`);
        });
    }
    
    // Save results to a JSON file
    const resultsFile = path.join(__dirname, 'upload-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsFile}`);
}

// Run the script
uploadAllImages()
    .then(() => {
        console.log('\n✨ Upload process completed!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });

