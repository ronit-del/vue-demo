require('dotenv').config();
const express = require("express");
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { statusCode } = require("../common");
const db = require("../config/db");
const pool = db.getPool();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME || 'dqvmwnxan',
    api_key: process.env.CLOUDINARY_API_KEY || '812965777242228',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'pOE-7S5Um_Ck1OrNgllFYsTcvXs'
});

// Configure multer for memory storage (we'll upload directly to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

/**
 * Get the next image number for a category
 * @param {string} category - Product category (home_appliances, clothes, electronics)
 * @returns {Promise<number>} - Next image number
 */
async function getNextImageNumber(category) {
    try {
        // Normalize category name for image filename
        let categoryName = category;
        if (category === 'home_appliances') {
            categoryName = 'home appliance';
        } else if (category === 'clothes') {
            categoryName = 'clothes';
        } else if (category === 'electronics') {
            categoryName = 'electronics';
        }

        // Query all products with images in this category
        const result = await pool.query(
            `SELECT image FROM products WHERE category = $1 AND image IS NOT NULL AND image != ''`,
            [category]
        );

        let maxNumber = 0;
        // Pattern to match: categoryName-number.ext (works with full URLs or just filenames)
        // Escape special characters in categoryName for regex
        const escapedCategoryName = categoryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const imagePattern = new RegExp(`${escapedCategoryName}-(\\d+)\\.(jpg|jpeg|png|webp)`, 'i');

        // Extract numbers from existing image URLs
        result.rows.forEach(row => {
            if (row.image) {
                let imagePath = row.image;
                // If it's a Cloudinary URL, extract the path after /upload/
                if (imagePath.includes('cloudinary.com')) {
                    // Extract the path after /image/upload/
                    const uploadIndex = imagePath.indexOf('/image/upload/');
                    if (uploadIndex !== -1) {
                        const pathAfterUpload = imagePath.substring(uploadIndex + '/image/upload/'.length);
                        // Remove query parameters if any
                        imagePath = pathAfterUpload.split('?')[0];
                    } else {
                        // Fallback: just get the filename
                        const urlParts = imagePath.split('/');
                        imagePath = urlParts[urlParts.length - 1].split('?')[0];
                    }
                } else {
                    // Remove query parameters if any
                    imagePath = imagePath.split('?')[0];
                }
                
                // Try to match the pattern in the full path or just filename
                const match = imagePath.match(imagePattern);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNumber) {
                        maxNumber = num;
                    }
                }
            }
        });

        // Return next number (if maxNumber is 0, start from 1, otherwise increment)
        return maxNumber > 0 ? maxNumber + 1 : 1;
    } catch (error) {
        console.error("Error getting next image number:", error);
        // Default to 1 if there's an error
        return 1;
    }
}

// Upload image to Cloudinary
router.post("/image", upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "No image file provided"
            });
        }

        // Get category from request body or query params
        const category = req.body.category || req.query.category;

        if (!category) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Category is required for image upload"
            });
        }

        // Validate category
        const validCategories = ['home_appliances', 'clothes', 'electronics'];
        if (!validCategories.includes(category)) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }

        // Get next image number for this category
        const imageNumber = await getNextImageNumber(category);

        // Determine category name for filename
        let categoryName = category;
        if (category === 'home_appliances') {
            categoryName = 'home appliance';
        }

        // Get file extension
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase() || 'jpg';
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        const finalExtension = allowedExtensions.includes(fileExtension) ? fileExtension : 'jpg';

        // Generate public_id for Cloudinary
        // Format: Vue-App/products/product-category/{category}/{category}-{number}.{ext}
        const publicId = `Vue-App/products/product-category/${category}/${categoryName}-${imageNumber}`;

        // Convert buffer to base64
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        // Upload to Cloudinary with specific public_id
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            public_id: publicId,
            resource_type: 'auto',
            format: finalExtension,
            transformation: [
                { width: 800, height: 800, crop: 'limit' }, // Resize if needed
                { quality: 'auto' } // Optimize quality
            ]
        });

        // Construct the expected URL format
        const expectedUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME || 'dqvmwnxan'}/image/upload/Vue-App/products/product-category/${category}/${categoryName}-${imageNumber}.${finalExtension}`;

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Image uploaded successfully",
            data: {
                url: expectedUrl,
                public_id: uploadResult.public_id,
                width: uploadResult.width,
                height: uploadResult.height,
                format: uploadResult.format,
                category: category,
                imageNumber: imageNumber
            }
        });
    } catch (error) {
        console.error("Upload image error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while uploading the image.",
            error: error.message
        });
    }
});

// Upload multiple images
router.post("/images", upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "No image files provided"
            });
        }

        const uploadPromises = req.files.map(file => {
            const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            return cloudinary.uploader.upload(base64Image, {
                folder: 'vue-app/products',
                resource_type: 'auto',
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto' }
                ]
            });
        });

        const uploadResults = await Promise.all(uploadPromises);

        const images = uploadResults.map(result => ({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
        }));

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Images uploaded successfully",
            data: images
        });
    } catch (error) {
        console.error("Upload images error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while uploading the images.",
            error: error.message
        });
    }
});

// Delete image from Cloudinary
router.delete("/image/:public_id", async (req, res) => {
    try {
        const { public_id } = req.params;

        if (!public_id) {
            return res.status(statusCode.BAD_REQUEST.code).json({
                success: false,
                message: "Public ID is required"
            });
        }

        const result = await cloudinary.uploader.destroy(public_id);

        return res.status(statusCode.SUCCESS.code).json({
            success: true,
            message: "Image deleted successfully",
            data: result
        });
    } catch (error) {
        console.error("Delete image error:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR.code).json({
            success: false,
            message: "An error occurred while deleting the image.",
            error: error.message
        });
    }
});

module.exports = router;

