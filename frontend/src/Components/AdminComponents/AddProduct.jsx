import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

// Color palette constants
const COLORS = {
  background: "#EFE2B2",
  primary: "#9E5F57",
  accent: "#567A4B",
  text: "#814B4A",
  subtle: "#97A276",
  highlight: "#F5C9C6"
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
  });

  const formatTags = (input) => {
    return input
      .split(',')
      .map((item) => item.trim())
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
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
    <div className="p-8 min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <motion.h2 
        className="text-3xl font-bold mb-6 text-center"
        style={{ color: COLORS.text }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Add New Product
      </motion.h2>
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="p-6 rounded-lg shadow-xl max-w-4xl mx-auto"
        style={{ backgroundColor: COLORS.highlight }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <input
              type="text"
              name="productName"
              placeholder="Product Name"
              value={formData.productName}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.primary, color: COLORS.text }}
              required
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <input
              type="text"
              name="productCode"
              placeholder="Product Code"
              value={formData.productCode}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.primary, color: COLORS.text }}
              required
            />
          </motion.div>
          
          <motion.div 
            className="md:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.primary, color: COLORS.text }}
              rows="3"
              required
            />
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 gap-6 md:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.primary, color: COLORS.text }}
              required
            />
            <input
              type="number"
              name="discount"
              placeholder="Discount (%)"
              value={formData.discount}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.primary, color: COLORS.text }}
              required
            />
          </motion.div>
          
          <motion.div 
            className="text-lg font-semibold md:col-span-2 text-center"
            style={{ color: COLORS.text }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            Discounted Price: {formData.price - (formData.price * formData.discount) / 100 || 0} TK
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.45 }}
          >
            <input
              type="number"
              name="stock"
              placeholder="Stock"
              value={formData.stock}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.primary, color: COLORS.text }}
              required
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.primary, color: COLORS.text }}
              required
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.55 }}
          >
            <input
              type="text"
              name="subCategory"
              placeholder="Sub-Category"
              value={formData.subCategory}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.primary, color: COLORS.text }}
              required
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <input
              type="text"
              name="sizeChart"
              placeholder="Size Chart URL (optional)"
              value={formData.sizeChart}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.primary, color: COLORS.text }}
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.65 }}
          >
            <input
              type="text"
              name="videoUrl"
              placeholder="Video URL"
              value={formData.videoUrl || ''}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.primary, color: COLORS.text }}
            />
          </motion.div>
        </div>

        {/* Dynamic Image URLs */}
        <motion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <label className="font-semibold block mb-2" style={{ color: COLORS.text }}>Product Images (1-5)</label>
          {formData.images.map((image, index) => (
            <motion.div 
              key={index} 
              className="flex items-center gap-2 mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.75 + index * 0.05 }}
            >
              <input
                type="url"
                placeholder={`Image URL ${index + 1}`}
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
                className="p-2 border rounded-lg flex-1 bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
                style={{ borderColor: COLORS.primary, color: COLORS.text }}
              />
              {formData.images.length > 1 && (
                <motion.button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="px-3 py-1 rounded-lg text-white"
                  style={{ backgroundColor: COLORS.primary }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Remove
                </motion.button>
              )}
            </motion.div>
          ))}
          {formData.images.length < 5 && (
            <motion.button
              type="button"
              onClick={addImageField}
              className="px-4 py-2 rounded-lg text-white mt-2"
              style={{ backgroundColor: COLORS.primary }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Image
            </motion.button>
          )}
        </motion.div>

        {/* Color and Size Input */}
        <motion.div 
          className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <div>
            <label className="font-semibold block mb-2" style={{ color: COLORS.text }}>Available Colors</label>
            <input
              type="text"
              placeholder="Enter colors (comma separated)"
              value={formData.availableColors.join(', ')}
              onChange={handleColorsChange}
              className="p-2 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.primary, color: COLORS.text }}
            />
          </div>
        </motion.div>

        <motion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.85 }}
        >
          <label className="font-semibold block mb-2" style={{ color: COLORS.text }}>Available Sizes & Prices</label>
          {sizes.map((sizeEntry, index) => (
            <motion.div 
              key={index} 
              className="flex gap-4 mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.9 + index * 0.05 }}
            >
              <input
                type="text"
                placeholder="Size"
                value={sizeEntry.size}
                onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                className="p-3 border rounded-lg w-1/2 bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
                style={{ borderColor: COLORS.primary, color: COLORS.text }}
              />
              <input
                type="number"
                placeholder="Price"
                value={sizeEntry.sizePrice}
                onChange={(e) => handleSizeChange(index, 'sizePrice', e.target.value)}
                className="p-3 border rounded-lg w-1/2 bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
                style={{ borderColor: COLORS.primary, color: COLORS.text }}
              />
              {sizes.length > 1 && (
                <motion.button
                  type="button"
                  onClick={() => removeSizeField(index)}
                  className="px-3 py-1 rounded-lg text-white self-center"
                  style={{ backgroundColor: COLORS.primary }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Remove
                </motion.button>
              )}
            </motion.div>
          ))}
          <motion.button
            type="button"
            onClick={addSizeField}
            className="px-4 py-2 rounded-lg text-white mt-2"
            style={{ backgroundColor: COLORS.accent }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add Size
          </motion.button>
        </motion.div>

        {/* Best Seller */}
        <motion.div 
          className="mt-4 flex items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.95 }}
        >
          <input
            type="checkbox"
            name="isBestSeller"
            checked={formData.isBestSeller}
            onChange={handleChange}
            className="h-5 w-5"
            style={{ accentColor: COLORS.primary }}
          />
          <label htmlFor="isBestSeller" style={{ color: COLORS.text }}>Best Seller</label>
        </motion.div>

        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1 }}
        >
          <motion.button 
            type="submit" 
            className="px-6 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: COLORS.primary }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: COLORS.accent,
              boxShadow: `0 10px 25px ${COLORS.subtle}80`
            }}
            whileTap={{ scale: 0.95 }}
          >
            Add Product
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  );
};

export default AddProduct;