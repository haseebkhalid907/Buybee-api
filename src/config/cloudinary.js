const { v2: cloudinary } = require('cloudinary');

/**
 * Configure Cloudinary with credentials
 */
const setupCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'gamicacloud',
        api_key: process.env.CLOUDINARY_API_KEY || '461918623291918',
        api_secret: process.env.CLOUDINARY_API_SECRET || 'LxFAfuWxw5zIqBuke0wyBjV3cqE',
        secure: true,
    });
};

module.exports = {
    cloudinary,
    setupCloudinary,
};
