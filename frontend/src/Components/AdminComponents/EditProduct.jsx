import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

// Modern Black and White Premium Color Palette
const COLORS = {
  background: "#FFFFFF",          // Pure white background
  primary: "#000000",             // Deep black for primary elements
  accent: "#333333",              // Dark gray for accents
  text: "#222222",                // Almost black for text
  subtle: "#E0E0E0",              // Light gray for subtle elements
  highlight: "#F5F5F5",           // Very light gray for highlights
  border: "#D1D1D1",              // Border color
  buttonHover: "#1A1A1A"          // Slightly lighter black for hover
};

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [sizes, setSizes] = useState([{ size: '', sizePrice: 0 }]);
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    images: [],
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
  
  // State for image management
  const [uploadMethod, setUploadMethod] = useState('url');
  const [previewImages, setPreviewImages] = useState([]);
  const [fileInputs, setFileInputs] = useState([null]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Categories state
  const [categories, setCategories] = useState({});
  const [categoryLabels, setCategoryLabels] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchCategories();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://ruhana-adv.onrender.com/api/products/details/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const product = response.data;
      
      // Set form data
      setFormData({
        ...product,
        // Ensure arrays are properly set
        availableColors: product.availableColors || [],
        availableSizes: product.availableSizes || [],
      });
      
      // Set sizes
      setSizes(product.availableSizes || [{ size: '', sizePrice: 0 }]);
      
      // Set preview images
      setPreviewImages(product.images || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error.response?.data || error.message);
      toast.error('Failed to load product details');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://ruhana-adv.onrender.com/api/categories', 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.categories && response.data.labels) {
        setCategories(response.data.categories);
        setCategoryLabels(response.data.labels);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Handle file uploads
  const handleFileUpload = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://ruhana-adv.onrender.com/api/products/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: progressEvent => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(prev => ({
              ...prev,
              [files[0].name]: percentCompleted
            }));
          }
        }
      );

      setPreviewImages(prev => [...prev, ...response.data.urls]);
      setFileInputs(prev => [...prev, null]);
      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Image upload failed');
    }
  };

  // Handle URL images
  const handleUrlImage = () => {
    const url = document.getElementById('image-url-input').value;
    if (url) {
      setPreviewImages(prev => [...prev, url]);
      document.getElementById('image-url-input').value = '';
    }
  };

  // Handle file changes
  const handleFileChange = async (index, e) => {
    const files = e.target.files;
    if (files.length > 0) {
      try {
        const newFile = files[0];
        const newFileInputs = [...fileInputs];
        newFileInputs[index] = newFile;
        setFileInputs(newFileInputs);
        
        // Upload immediately
        const formData = new FormData();
        formData.append('images', newFile);
        
        const token = localStorage.getItem('token');
        const response = await axios.post(
          'https://ruhana-adv.onrender.com/api/products/upload',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        // Add to previews
        setPreviewImages(prev => [...prev, ...response.data.urls]);
        
      } catch (error) {
        toast.error('File upload failed');
      }
    }
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

  const formatTags = (input) => {
    return input
      .split(',')
      .map((item) => item.trim())
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
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
    
    // Prepare data with proper type conversions
    const payload = {
      ...formData,
      images: previewImages,
      stock: Number(formData.stock),
      price: Number(formData.price),
      discount: Number(formData.discount),
      availableSizes: sizes,
      isBestSeller: formData.isBestSeller
    };

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `https://ruhana-adv.onrender.com/api/products/update/${productId}`,
        payload,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        }
      );
      
      toast.success(response.data.message);
      navigate('/all-products');
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Product update failed');
    }
  };

  // Get subcategories based on selected category
  const getSubCategories = () => {
    if (!formData.category) return [];
    return categories[formData.category] || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          <p className="mt-4 text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <motion.div 
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="text-3xl font-bold mb-6 text-center pt-2"
          style={{ color: COLORS.text }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Edit Product
        </motion.h2>
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="p-6 rounded-xl shadow-lg"
          style={{ 
            backgroundColor: COLORS.background,
            border: `1px solid ${COLORS.border}`,
          }}
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
                className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                style={{ 
                  borderColor: COLORS.border, 
                  color: COLORS.text,
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
                className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                style={{ 
                  borderColor: COLORS.border, 
                  color: COLORS.text,
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
                className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                style={{ 
                  borderColor: COLORS.border, 
                  color: COLORS.text,
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
                  className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                  style={{ 
                    borderColor: COLORS.border, 
                    color: COLORS.text,
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
                  className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                  style={{ 
                    borderColor: COLORS.border, 
                    color: COLORS.text,
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
                backgroundColor: COLORS.highlight,
                border: `1px solid ${COLORS.border}`
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
                className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                style={{ 
                  borderColor: COLORS.border, 
                  color: COLORS.text,
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
                  className="w-full p-3 rounded-lg border bg-white appearance-none focus:outline-none focus:ring-1"
                  style={{ 
                    borderColor: COLORS.border, 
                    color: COLORS.text,
                  }}
                  required
                  disabled={loadingCategories}
                >
                  <option value="">Select Category</option>
                  {Object.keys(categories).map((key) => (
                    <option key={key} value={key}>
                      {categoryLabels[key]}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {loadingCategories && (
                <div className="text-sm mt-1 text-gray-500">Loading categories...</div>
              )}
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
                  className="w-full p-3 rounded-lg border bg-white appearance-none focus:outline-none focus:ring-1"
                  style={{ 
                    borderColor: COLORS.border, 
                    color: COLORS.text,
                  }}
                  disabled={!formData.category || loadingCategories}
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
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {loadingCategories && (
                <div className="text-sm mt-1 text-gray-500">Loading subcategories...</div>
              )}
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
                className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                style={{ 
                  borderColor: COLORS.border, 
                  color: COLORS.text,
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
                className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                style={{ 
                  borderColor: COLORS.border, 
                  color: COLORS.text,
                }}
              />
            </motion.div>
          </div>

          {/* Image Upload Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium" style={{ color: COLORS.text }}>
                Product Images (1-5)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`px-3 py-1 rounded-lg border ${
                    uploadMethod === 'url' ? 'bg-black text-white' : 'border-black'
                  }`}
                  onClick={() => setUploadMethod('url')}
                >
                  Add URL
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-lg border ${
                    uploadMethod === 'upload' ? 'bg-black text-white' : 'border-black'
                  }`}
                  onClick={() => setUploadMethod('upload')}
                >
                  Upload File
                </button>
              </div>
            </div>

            {uploadMethod === 'url' && (
              <div className="flex gap-2 mb-4">
                <input
                  id="image-url-input"
                  type="url"
                  placeholder="Enter image URL"
                  className="flex-1 p-3 rounded-lg border bg-white"
                  style={{ borderColor: COLORS.border }}
                />
                <button
                  type="button"
                  className="px-4 py-3 bg-black text-white rounded-lg"
                  onClick={handleUrlImage}
                >
                  Add
                </button>
              </div>
            )}

            {uploadMethod === 'upload' && (
              <div className="space-y-3 mb-4">
                {fileInputs.map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(index, e)}
                      className="flex-1 p-3 rounded-lg border bg-white"
                      style={{ borderColor: COLORS.border }}
                    />
                    {fileInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newInputs = [...fileInputs];
                          newInputs.splice(index, 1);
                          setFileInputs(newInputs);
                          
                          const newPreviews = [...previewImages];
                          newPreviews.splice(index, 1);
                          setPreviewImages(newPreviews);
                        }}
                        className="p-2 rounded-lg border border-black"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                {fileInputs.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setFileInputs([...fileInputs, null])}
                    className="flex items-center text-sm px-3 py-1 rounded-lg border border-black"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Another
                  </button>
                )}
              </div>
            )}

            {/* Image Previews */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {previewImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={img} 
                    alt={`Preview ${index}`}
                    className="w-full h-32 object-contain border rounded-lg"
                    style={{ borderColor: COLORS.border }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newPreviews = [...previewImages];
                      newPreviews.splice(index, 1);
                      setPreviewImages(newPreviews);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {uploadProgress[img] && uploadProgress[img] < 100 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-2">
                      <div 
                        className="bg-green-500 h-2"
                        style={{ width: `${uploadProgress[img]}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

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
              className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
              style={{ 
                borderColor: COLORS.border, 
                color: COLORS.text,
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
                className="flex items-center text-sm px-3 py-1 rounded-lg border border-black"
                style={{ 
                  backgroundColor: COLORS.background,
                  color: COLORS.text
                }}
                whileHover={{ 
                  backgroundColor: COLORS.buttonHover,
                  color: "#FFFFFF"
                }}
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
                      className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                      style={{ 
                        borderColor: COLORS.border, 
                        color: COLORS.text,
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
                      className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                      style={{ 
                        borderColor: COLORS.border, 
                        color: COLORS.text,
                      }}
                    />
                  </div>
                  
                  {sizes.length > 1 && (
                    <motion.button
                      type="button"
                      onClick={() => removeSizeField(index)}
                      className="p-2 rounded-lg self-end border border-black"
                      style={{ backgroundColor: COLORS.background }}
                      whileHover={{ backgroundColor: COLORS.buttonHover, color: "#FFFFFF" }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
            style={{ backgroundColor: COLORS.highlight }}
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
              }}
              whileHover={{ 
                scale: 1.03,
                backgroundColor: COLORS.accent,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">Update Product</span>
              <motion.div 
                className="absolute inset-0 z-0"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                style={{ 
                  background: `radial-gradient(circle, ${COLORS.subtle} 0%, transparent 70%)`,
                }}
              />
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default EditProduct;