import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Color palette constants
const COLORS = {
  background: "#EFE2B2",
  primary: "#9E5F57",
  accent: "#567A4B",
  text: "#814B4A",
  subtle: "#97A276",
  highlight: "#F5C9C6"
};

// Categories structure from Navbar
const categories = {
  showpieces: [
    { name: "Matir Fuldani", link: "/category/matir-fuldani" },
    { name: "Mirror Bottle", link: "/category/mirror-bottle" },
    { name: "Premium Showpieces", link: "/category/premium-showpieces" },
    { name: "Traditional Art", link: "/category/traditional-art" },
  ],
  candles: [
    { name: "Scented Candles", link: "/category/scented-candles" },
    { name: "Decorative Candles", link: "/category/decorative-candles" },
    { name: "Tea Light Candles", link: "/category/tea-light-candles" },
    { name: "Aromatic Candles", link: "/category/aromatic-candles" },
  ],
  walmart: [
    { name: "Home Decor", link: "/category/walmart-home-decor" },
    { name: "Kitchen Essentials", link: "/category/walmart-kitchen" },
    { name: "Seasonal Specials", link: "/category/walmart-seasonal" },
    { name: "Walmart Exclusives", link: "/category/walmart-exclusives" },
  ],
  totebags: [
    { name: "Canvas Totes", link: "/category/canvas-totes" },
    { name: "Eco-friendly Bags", link: "/category/eco-bags" },
    { name: "Printed Totes", link: "/category/printed-totes" },
    { name: "Premium Tote Bags", link: "/category/premium-totes" },
  ],
  tshirts: [
    { name: "Graphic Tees", link: "/category/graphic-tees" },
    { name: "Premium Cotton", link: "/category/premium-cotton" },
    { name: "Oversized T-shirts", link: "/category/oversized-tees" },
    { name: "Minimalist Designs", link: "/category/minimalist-tees" },
  ],
  collections: [
    { name: "New Arrivals", link: "/category/new-arrivals" },
    { name: "Best Sellers", link: "/category/best-sellers" },
    { name: "Limited Editions", link: "/category/limited-editions" },
    { name: "Festive Collection", link: "/category/festive-collection" },
  ],
};

const categoryLabels = {
  showpieces: "Show Pieces",
  candles: "Candles",
  walmart: "Walmart",
  totebags: "Tote Bags",
  tshirts: "T-Shirts",
  collections: "Collections"
};

const AddProduct = () => {
  const [sizes, setSizes] = useState([{ size: '', sizePrice: 0 }]);
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    images: [''],
    sizeChart: '',
    availableColors: [],
    availableSizes: [],
    stock: 0,
    price: 0,
    discount: 0,
    productCode: '',
    category: '',
    subCategory: '',
    isBestSeller: false,
    videoUrl: '',
  });
  
  // Get subcategories based on selected category
  const getSubCategories = () => {
    if (!formData.category) return [];
    return categories[formData.category] || [];
  };

  const formatTags = (input) => {
    return input
      .split(',')
      .map((item) => item.trim())
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'category') {
      setFormData({
        ...formData,
        [name]: value,
        subCategory: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleImageChange = (index, value) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = value;
    setFormData({ ...formData, images: updatedImages });
  };

  const addImageField = () => {
    if (formData.images.length < 5) {
      setFormData({ ...formData, images: [...formData.images, ''] });
    } else {
      toast.error('You can add a maximum of 5 images.');
    }
  };

  const removeImageField = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  const handleColorsChange = (e) => {
    const formattedColors = formatTags(e.target.value);
    setFormData({ ...formData, availableColors: formattedColors });
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...sizes];
    updatedSizes[index][field] = field === 'sizePrice' ? Number(value) : value;
    setSizes(updatedSizes);
  };
  
  const addSizeField = () => {
    setSizes([...sizes, { size: '', sizePrice: 0 }]);
  };
  
  const removeSizeField = (index) => {
    const updatedSizes = sizes.filter((_, i) => i !== index);
    setSizes(updatedSizes);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      availableSizes: sizes,
    };
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('https://ruhana-adv.onrender.com/api/products/add', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success(response.data.message);
      setFormData({
        productName: '',
        description: '',
        images: [''],
        sizeChart: '',
        availableColors: [],
        availableSizes: [],
        stock: 0,
        price: 0,
        discount: 0,
        productCode: '',
        category: '',
        subCategory: '',
        videoUrl: '',
        isBestSeller: false,
      });
      setSizes([{ size: '', sizePrice: 0 }]);
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      toast.error('Something went wrong.');
    }
  };

  return (
    <div className="p-4 min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <motion.div 
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="text-3xl font-bold mb-6 text-center pt-6"
          style={{ color: COLORS.text }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Add New Product
        </motion.h2>
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="p-6 rounded-xl shadow-2xl"
          style={{ backgroundColor: COLORS.highlight }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                Product Name
              </label>
              <input
                type="text"
                name="productName"
                placeholder="Enter product name"
                value={formData.productName}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: COLORS.primary, 
                  color: COLORS.text,
                  boxShadow: `0 2px 4px ${COLORS.subtle}20`
                }}
                required
              />
            </motion.div>
            
            {/* Product Code */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
              <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                Product Code
              </label>
              <input
                type="text"
                name="productCode"
                placeholder="Enter product code"
                value={formData.productCode}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: COLORS.primary, 
                  color: COLORS.text,
                  boxShadow: `0 2px 4px ${COLORS.subtle}20`
                }}
                required
              />
            </motion.div>
            
            {/* Description */}
            <motion.div 
              className="md:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                Description
              </label>
              <textarea
                name="description"
                placeholder="Enter product description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: COLORS.primary, 
                  color: COLORS.text,
                  boxShadow: `0 2px 4px ${COLORS.subtle}20`,
                  minHeight: '100px'
                }}
                required
              />
            </motion.div>
            
            {/* Price and Discount */}
            <motion.div 
              className="grid grid-cols-2 gap-6 md:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
            >
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                  Price (TK)
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="Product price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    borderColor: COLORS.primary, 
                    color: COLORS.text,
                    boxShadow: `0 2px 4px ${COLORS.subtle}20`
                  }}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  placeholder="Discount percentage"
                  value={formData.discount}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    borderColor: COLORS.primary, 
                    color: COLORS.text,
                    boxShadow: `0 2px 4px ${COLORS.subtle}20`
                  }}
                  required
                />
              </div>
            </motion.div>
            
            {/* Discounted Price */}
            <motion.div 
              className="text-lg font-semibold md:col-span-2 text-center py-2 rounded-lg"
              style={{ 
                color: COLORS.text,
                backgroundColor: COLORS.subtle + '20',
                border: `1px solid ${COLORS.subtle}`
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              Discounted Price: {formData.price - (formData.price * formData.discount) / 100 || 0} TK
            </motion.div>
            
            {/* Stock */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.55 }}
            >
              <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                placeholder="Available stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: COLORS.primary, 
                  color: COLORS.text,
                  boxShadow: `0 2px 4px ${COLORS.subtle}20`
                }}
                required
              />
            </motion.div>
            
            {/* CATEGORY DROPDOWN */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                Category
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    borderColor: COLORS.primary, 
                    color: COLORS.text,
                    boxShadow: `0 2px 4px ${COLORS.subtle}20`
                  }}
                  required
                >
                  <option value="">Select Category</option>
                  {Object.keys(categories).map((key) => (
                    <option key={key} value={key}>
                      {categoryLabels[key]}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </motion.div>
            
            {/* SUBCATEGORY DROPDOWN */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.65 }}
            >
              <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                Sub-Category
              </label>
              <div className="relative">
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    borderColor: COLORS.primary, 
                    color: COLORS.text,
                    boxShadow: `0 2px 4px ${COLORS.subtle}20`
                  }}
                  disabled={!formData.category}
                  required
                >
                  <option value="">Select Sub-Category</option>
                  {getSubCategories().map((subCat, index) => (
                    <option key={index} value={subCat.name}>
                      {subCat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </motion.div>
            
            {/* Size Chart */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                Size Chart URL (optional)
              </label>
              <input
                type="text"
                name="sizeChart"
                placeholder="Size chart image URL"
                value={formData.sizeChart}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: COLORS.primary, 
                  color: COLORS.text,
                  boxShadow: `0 2px 4px ${COLORS.subtle}20`
                }}
              />
            </motion.div>
            
            {/* Video URL */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.75 }}
            >
              <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
                Video URL (optional)
              </label>
              <input
                type="text"
                name="videoUrl"
                placeholder="Product video URL"
                value={formData.videoUrl || ''}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: COLORS.primary, 
                  color: COLORS.text,
                  boxShadow: `0 2px 4px ${COLORS.subtle}20`
                }}
              />
            </motion.div>
          </div>

          {/* Dynamic Image URLs */}
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium" style={{ color: COLORS.text }}>
                Product Images (1-5)
              </label>
              {formData.images.length < 5 && (
                <motion.button
                  type="button"
                  onClick={addImageField}
                  className="flex items-center text-sm px-3 py-1 rounded-lg"
                  style={{ 
                    backgroundColor: COLORS.primary,
                    color: 'white'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Image
                </motion.button>
              )}
            </div>
            
            <div className="space-y-3">
              {formData.images.map((image, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.85 + index * 0.05 }}
                >
                  <input
                    type="url"
                    placeholder={`Image URL ${index + 1}`}
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="flex-1 p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      borderColor: COLORS.primary, 
                      color: COLORS.text,
                      boxShadow: `0 2px 4px ${COLORS.subtle}20`
                    }}
                  />
                  {formData.images.length > 1 && (
                    <motion.button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: COLORS.primary }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Color Input */}
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>
              Available Colors (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Red, Blue, Green"
              value={formData.availableColors.join(', ')}
              onChange={handleColorsChange}
              className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                borderColor: COLORS.primary, 
                color: COLORS.text,
                boxShadow: `0 2px 4px ${COLORS.subtle}20`
              }}
            />
          </motion.div>

          {/* Sizes & Prices */}
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.95 }}
          >
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium" style={{ color: COLORS.text }}>
                Available Sizes & Prices
              </label>
              <motion.button
                type="button"
                onClick={addSizeField}
                className="flex items-center text-sm px-3 py-1 rounded-lg"
                style={{ 
                  backgroundColor: COLORS.accent,
                  color: 'white'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Size
              </motion.button>
            </div>
            
            <div className="space-y-3">
              {sizes.map((sizeEntry, index) => (
                <motion.div 
                  key={index} 
                  className="flex gap-3 items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1 + index * 0.05 }}
                >
                  <div className="flex-1">
                    <label className="block text-xs mb-1 opacity-70" style={{ color: COLORS.text }}>
                      Size
                    </label>
                    <input
                      type="text"
                      placeholder="Size name"
                      value={sizeEntry.size}
                      onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                      className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ 
                        borderColor: COLORS.primary, 
                        color: COLORS.text,
                        boxShadow: `0 2px 4px ${COLORS.subtle}20`
                      }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-xs mb-1 opacity-70" style={{ color: COLORS.text }}>
                      Price (TK)
                    </label>
                    <input
                      type="number"
                      placeholder="Price"
                      value={sizeEntry.sizePrice}
                      onChange={(e) => handleSizeChange(index, 'sizePrice', e.target.value)}
                      className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ 
                        borderColor: COLORS.primary, 
                        color: COLORS.text,
                        boxShadow: `0 2px 4px ${COLORS.subtle}20`
                      }}
                    />
                  </div>
                  
                  {sizes.length > 1 && (
                    <motion.button
                      type="button"
                      onClick={() => removeSizeField(index)}
                      className="p-2 rounded-lg self-end"
                      style={{ backgroundColor: COLORS.primary }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Best Seller */}
          <motion.div 
            className="mt-6 flex items-center gap-3 p-3 rounded-lg"
            style={{ backgroundColor: COLORS.subtle + '20' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.1 }}
          >
            <input
              type="checkbox"
              name="isBestSeller"
              checked={formData.isBestSeller}
              onChange={handleChange}
              className="h-5 w-5"
              style={{ accentColor: COLORS.primary }}
            />
            <label htmlFor="isBestSeller" className="font-medium" style={{ color: COLORS.text }}>
              Mark as Best Seller
            </label>
          </motion.div>

          {/* Submit Button */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.2 }}
          >
            <motion.button 
              type="submit" 
              className="px-8 py-4 rounded-xl text-white font-medium text-lg relative overflow-hidden"
              style={{ 
                backgroundColor: COLORS.primary,
                boxShadow: `0 10px 25px ${COLORS.subtle}50`
              }}
              whileHover={{ 
                scale: 1.03,
                backgroundColor: COLORS.accent,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">Add Product</span>
              <motion.div 
                className="absolute inset-0 z-0"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                style={{ 
                  background: `radial-gradient(circle, ${COLORS.highlight} 0%, transparent 70%)`,
                }}
              />
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default AddProduct;