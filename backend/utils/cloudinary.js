const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// In your cloudinary config file
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    return {
      folder: 'jonab_collection',
      format: 'webp', // Better format
      transformation: [
        { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
      ]
    };
  }
});

module.exports = { cloudinary, storage };