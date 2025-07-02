import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

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

// Default categories structure
const initialCategories = {
  katua: [
    { name: "Cotton Katua", link: "/category/katua/cotton" },
    { name: "Embroidered Katua", link: "/category/katua/embroidered" },
    { name: "Silk Katua", link: "/category/katua/silk" },
    { name: "Printed Katua", link: "/category/katua/printed" },
    { name: "Handloom Katua", link: "/category/katua/handloom" },
  ],
  panjabi: [
    { name: "Casual Panjabi", link: "/category/panjabi/casual" },
    { name: "Formal Panjabi", link: "/category/panjabi/formal" },
    { name: "Festival Panjabi", link: "/category/panjabi/festival" },
    { name: "Embroidered Panjabi", link: "/category/panjabi/embroidered" },
    { name: "Jamdani Panjabi", link: "/category/panjabi/jamdani" },
  ],
  polo: [
    { name: "Solid Color Polo", link: "/category/polo/solid" },
    { name: "Striped Polo", link: "/category/polo/striped" },
    { name: "Logo Embroidered Polo", link: "/category/polo/embroidered" },
    { name: "Slim Fit Polo", link: "/category/polo/slim-fit" },
    { name: "Long Sleeve Polo", link: "/category/polo/long-sleeve" },
  ],
  shirt: [
    { name: "Formal Shirt", link: "/category/shirt/formal" },
    { name: "Casual Shirt", link: "/category/shirt/casual" },
    { name: "Check Shirt", link: "/category/shirt/check" },
    { name: "Denim Shirt", link: "/category/shirt/denim" },
    { name: "Linen Shirt", link: "/category/shirt/linen" },
  ],
  tshirts: [
    { name: "Graphic T-shirt", link: "/category/tshirts/graphic" },
    { name: "Plain T-shirt", link: "/category/tshirts/plain" },
    { name: "Oversized T-shirt", link: "/category/tshirts/oversized" },
    { name: "V-Neck T-shirt", link: "/category/tshirts/v-neck" },
    { name: "Full Sleeve T-shirt", link: "/category/tshirts/full-sleeve" },
  ],
};

const initialCategoryLabels = {
  katua: "Katua",
  panjabi: "Panjabi",
  polo: "Polo",
  shirt: "Shirt",
  tshirts: "T-shirts"
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
  
  // State for category management
  const [categories, setCategories] = useState({});
  const [categoryLabels, setCategoryLabels] = useState({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [activeTab, setActiveTab] = useState('product');
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories from backend API
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://ruhana-adv.onrender.com/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.categories && response.data.labels) {
        setCategories(response.data.categories);
        setCategoryLabels(response.data.labels);
      } else {
        // Fallback to initial categories if API returns nothing
        setCategories(initialCategories);
        setCategoryLabels(initialCategoryLabels);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories. Using default.');
      setCategories(initialCategories);
      setCategoryLabels(initialCategoryLabels);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Initialize categories from backend
  useEffect(() => {
    fetchCategories();
  }, []);

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

  // Category management functions
  const addNewCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    const key = newCategoryName.toLowerCase().replace(/\s+/g, '-');
    
    if (categories[key]) {
      toast.error('Category already exists');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://ruhana-adv.onrender.com/api/categories/add',
        { key, name: newCategoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setCategories(prev => ({ ...prev, [key]: [] }));
      setCategoryLabels(prev => ({ ...prev, [key]: newCategoryName }));
      setNewCategoryName('');
      toast.success(`Category "${newCategoryName}" added successfully`);
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const deleteCategory = async (categoryKey) => {
    if (!window.confirm(`Are you sure you want to delete the "${categoryLabels[categoryKey]}" category?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://ruhana-adv.onrender.com/api/categories/${categoryKey}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      const newCategories = { ...categories };
      delete newCategories[categoryKey];
      
      const newLabels = { ...categoryLabels };
      delete newLabels[categoryKey];
      
      setCategories(newCategories);
      setCategoryLabels(newLabels);
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const addSubcategory = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }
    
    if (!newSubcategoryName.trim()) {
      toast.error('Subcategory name cannot be empty');
      return;
    }
    
    const existingSubcategories = categories[selectedCategory] || [];
    if (existingSubcategories.some(sc => sc.name === newSubcategoryName)) {
      toast.error('Subcategory already exists in this category');
      return;
    }
    
    const newSubcategory = {
      name: newSubcategoryName,
      link: `/category/${selectedCategory}/${newSubcategoryName.toLowerCase().replace(/\s+/g, '-')}`
    };
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://ruhana-adv.onrender.com/api/categories/${selectedCategory}/subcategories`,
        newSubcategory,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setCategories(prev => ({
        ...prev,
        [selectedCategory]: [...prev[selectedCategory], newSubcategory]
      }));
      
      setNewSubcategoryName('');
      toast.success(`Subcategory "${newSubcategoryName}" added to "${categoryLabels[selectedCategory]}"`);
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast.error('Failed to add subcategory');
    }
  };

  const deleteSubcategory = async (categoryKey, subcategoryIndex) => {
    const categoryName = categoryLabels[categoryKey];
    const subcategoryName = categories[categoryKey][subcategoryIndex].name;
    
    if (!window.confirm(`Are you sure you want to delete "${subcategoryName}" from "${categoryName}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `https://ruhana-adv.onrender.com/api/categories/${categoryKey}/subcategories/${subcategoryIndex}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      const updatedSubcategories = categories[categoryKey].filter((_, i) => i !== subcategoryIndex);
      
      setCategories(prev => ({
        ...prev,
        [categoryKey]: updatedSubcategories
      }));
      
      toast.success('Subcategory deleted successfully');
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
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
        {/* Tabs for Product Form vs Category Management */}
        <div className="flex border-b mb-6">
          <button
            className={`py-3 px-6 font-medium text-sm ${activeTab === 'product' ? 'border-b-2 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('product')}
          >
            Add Product
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm ${activeTab === 'categories' ? 'border-b-2 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('categories')}
          >
            Manage Categories
          </button>
        </div>

        {/* Product Form Tab */}
        <AnimatePresence>
          {activeTab === 'product' && (
            <motion.div
              key="product-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h2 
                className="text-3xl font-bold mb-6 text-center pt-2"
                style={{ color: COLORS.text }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Add New Product
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
                          className="flex-1 p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                          style={{ 
                            borderColor: COLORS.border, 
                            color: COLORS.text,
                          }}
                        />
                        {formData.images.length > 1 && (
                          <motion.button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="p-2 rounded-lg border border-black"
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
                    <span className="relative z-10">Add Product</span>
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
          )}
        </AnimatePresence>

        {/* Category Management Tab */}
        <AnimatePresence>
          {activeTab === 'categories' && (
            <motion.div
              key="category-management"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="p-6 rounded-xl shadow-lg"
              style={{ 
                backgroundColor: COLORS.background,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <motion.h2 
                className="text-3xl font-bold mb-6 text-center"
                style={{ color: COLORS.text }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Manage Categories
              </motion.h2>

              {/* Add New Category */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{ color: COLORS.text }}>Add New Category</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter new category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                    style={{ 
                      borderColor: COLORS.border, 
                      color: COLORS.text,
                    }}
                  />
                  <motion.button
                    onClick={addNewCategory}
                    className="px-4 py-3 bg-black text-white rounded-lg font-medium"
                    whileHover={{ backgroundColor: COLORS.buttonHover }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add Category
                  </motion.button>
                </div>
              </div>

              {/* Add New Subcategory */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{ color: COLORS.text }}>Add New Subcategory</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-3 rounded-lg border bg-white appearance-none focus:outline-none focus:ring-1"
                        style={{ 
                          borderColor: COLORS.border, 
                          color: COLORS.text,
                        }}
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
                  </div>
                  <div className="md:col-span-1">
                    <input
                      type="text"
                      placeholder="Enter subcategory name"
                      value={newSubcategoryName}
                      onChange={(e) => setNewSubcategoryName(e.target.value)}
                      className="w-full p-3 rounded-lg border bg-white placeholder-gray-400 focus:outline-none focus:ring-1"
                      style={{ 
                        borderColor: COLORS.border, 
                        color: COLORS.text,
                      }}
                      disabled={!selectedCategory || loadingCategories}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <motion.button
                      onClick={addSubcategory}
                      className="w-full px-4 py-3 bg-black text-white rounded-lg font-medium"
                      whileHover={{ backgroundColor: COLORS.buttonHover }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!selectedCategory || loadingCategories}
                    >
                      Add Subcategory
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Categories List */}
              <div>
                <h3 className="text-xl font-semibold mb-4" style={{ color: COLORS.text }}>Existing Categories</h3>
                
                {loadingCategories ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
                    <p className="mt-2">Loading categories...</p>
                  </div>
                ) : Object.keys(categories).length === 0 ? (
                  <div className="text-center py-8 border rounded-lg" style={{ borderColor: COLORS.border }}>
                    <p>No categories found</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.keys(categories).map((key) => (
                      <div key={key} className="border rounded-lg overflow-hidden" style={{ borderColor: COLORS.border }}>
                        <div className="flex justify-between items-center p-4 bg-gray-100">
                          <span className="font-medium" style={{ color: COLORS.text }}>
                            {categoryLabels[key]}
                          </span>
                          <motion.button
                            onClick={() => deleteCategory(key)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
                            whileHover={{ backgroundColor: '#fee2e2' }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Delete Category
                          </motion.button>
                        </div>
                        
                        <div className="p-4 bg-white">
                          <h4 className="font-medium mb-3" style={{ color: COLORS.text }}>Subcategories:</h4>
                          <div className="space-y-2">
                            {categories[key].map((subcat, index) => (
                              <div key={index} className="flex justify-between items-center py-2 border-b" style={{ borderColor: COLORS.subtle }}>
                                <span>{subcat.name}</span>
                                <motion.button
                                  onClick={() => deleteSubcategory(key, index)}
                                  className="px-2 py-1 text-red-500 hover:text-red-700"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </motion.button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AddProduct;