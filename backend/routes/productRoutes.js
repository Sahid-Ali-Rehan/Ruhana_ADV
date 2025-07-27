const express = require('express');
const mongoose = require('mongoose'); // Add this line
// Add at top
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });

const Product = require('../models/Product');
const router = express.Router();

const jwt = require('jsonwebtoken');

const isAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Increase payload size limit at the top of your routes
router.use(express.json({ limit: '50mb' }));
router.use(express.urlencoded({ limit: '50mb', extended: true }));

// Update your Cloudinary upload route
router.post('/upload', upload.array('images', 5), (req, res) => { // Limit to 5 files
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const urls = req.files.map(file => file.path);
    res.status(200).json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Update your add product route
router.post('/add', async (req, res) => {
  try {
    // Parse sizes if needed
    const availableSizes = Array.isArray(req.body.availableSizes) ? 
      req.body.availableSizes : 
      JSON.parse(req.body.availableSizes || '[]');

    const newProduct = new Product({
      ...req.body,
      images: req.body.images || [],
      availableSizes
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ 
      message: 'Error adding product', 
      error: error.message,
      stack: error.stack // For debugging
    });
  }
});

// Add Product (Admin Only)
router.post('/add', async (req, res) => {
  const {
    productName,
    description,
    images,
    sizeChart,
    availableColors,
    availableSizes,
    sizesWithPrices,
    stock,
    price,
    discount,
    productCode,
    category,
    subCategory,
    isBestSeller,
    videoUrl,
  } = req.body;

  try {
    const newProduct = new Product({
      productName,
      description,
      images,
      sizeChart,
      availableColors,
      availableSizes,
      sizesWithPrices,
      stock,
      price,
      discount,
      productCode,
      category,
      subCategory,
      isBestSeller,
      videoUrl,
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
});


router.post('/add', async (req, res) => {
  const { availableSizes } = req.body;

  // Optional validation for availableSizes
  if (
    availableSizes &&
    !availableSizes.every(
      (item) => typeof item.size === 'string' && typeof item.sizePrice === 'number'
    )
  ) {
    return res.status(400).json({ message: 'Invalid format for availableSizes' });
  }

  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
});


// Update Product (Admin Only)
// Update Product (Admin Only)
router.put('/update/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});





// Fetch a product by ID (Admin or anyone with a valid token can access)
router.get('/details/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log("Fetching product with ID:", id); // Log the product ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.log("Error fetching product:", error); // Log the error
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});



// Fetch all products
// Adjusted route for pagination and filtering
router.get('/fetch-products', async (req, res) => {
  const { search, category, subCategory, color, size, sort, page = 1, perPage = 10, productCode } = req.query;

  let query = {};

  if (search) query.productName = { $regex: search, $options: 'i' };
  if (productCode) query.productCode = { $regex: productCode, $options: 'i' };

  if (category) query.category = category;
  if (subCategory) query.subCategory = subCategory;
  if (color) query.availableColors = { $in: [color] };
  if (size) query.availableSizes = { $in: [size] };

  let sortOrder = {};
  if (sort === 'low-to-high') {
    sortOrder.price = 1;
  } else if (sort === 'high-to-low') {
    sortOrder.price = -1;
  }

  try {
    const products = await Product.find(query)
      .sort(sortOrder)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Route to get a single product by ID
router.get('/single/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id); // Assuming you're using MongoDB
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
});


router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format using Mongoose
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      message: 'Error deleting product', 
      error: error.message 
    });
  }
});

router.get('/related/:category', async (req, res) => {
  const { category } = req.params;
  try {
      const relatedProducts = await Product.find({ category }).limit(10); // Fetch related products with a limit
      res.json(relatedProducts);
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch related products' });
  }
});

  

module.exports = router;
