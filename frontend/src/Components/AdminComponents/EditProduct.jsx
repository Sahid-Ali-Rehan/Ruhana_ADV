import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
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

const EditProduct = () => {
  const { productId } = useParams();
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
  const navigate = useNavigate();

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            toast.error('Authentication token missing');
            return;
          }
          const response = await axios.get(`https://ruhana-adv.onrender.com/api/products/details/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFormData(response.data);
        } catch (error) {
          console.error('Error fetching product:', error.response ? error.response.data : error.message);
          toast.error('Failed to fetch product details');
        }
      };
      fetchProduct();
    }
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      discount: Number(formData.discount),
    };
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`https://ruhana-adv.onrender.com/api/products/update/${productId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(response.data.message);
      navigate('/all-products');
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
        Edit Product
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
          {Object.entries({
            productName: 'Product Name',
            productCode: 'Product Code',
            description: 'Description',
            price: 'Price',
            discount: 'Discount (%)',
            stock: 'Stock',
            category: 'Category',
            subCategory: 'Sub Category',
            sizeChart: 'Size Chart URL',
            videoUrl: 'Video URL'
          }).map(([key, placeholder], index) => (
            <motion.div 
              key={key}
              className={key === 'description' ? 'md:col-span-2' : ''}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
            >
              {key === 'description' ? (
                <textarea
                  name={key}
                  placeholder={placeholder}
                  value={formData[key]}
                  onChange={handleChange}
                  className="p-3 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
                  style={{ borderColor: COLORS.primary, color: COLORS.text }}
                  rows="3"
                  required
                />
              ) : (
                <input
                  type={key === 'price' || key === 'discount' || key === 'stock' ? 'number' : 'text'}
                  name={key}
                  placeholder={placeholder}
                  value={formData[key] || ''}
                  onChange={handleChange}
                  className="p-3 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
                  style={{ borderColor: COLORS.primary, color: COLORS.text }}
                  required={key !== 'sizeChart' && key !== 'videoUrl'}
                />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <label className="font-semibold block mb-2" style={{ color: COLORS.text }}>Available Colors</label>
          <input
            type="text"
            placeholder="Enter colors (comma separated)"
            value={formData.availableColors.join(', ')}
            onChange={(e) => setFormData({...formData, availableColors: e.target.value.split(',').map(c => c.trim())})}
            className="p-3 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
            style={{ borderColor: COLORS.primary, color: COLORS.text }}
          />
        </motion.div>

        <motion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.75 }}
        >
          <label className="font-semibold block mb-2" style={{ color: COLORS.text }}>Available Sizes</label>
          <input
            type="text"
            placeholder="Enter sizes (comma separated)"
            value={formData.availableSizes.map(s => s.size).join(', ')}
            onChange={(e) => setFormData({...formData, availableSizes: e.target.value.split(',').map(s => ({ size: s.trim(), sizePrice: 0 }))})}
            className="p-3 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
            style={{ borderColor: COLORS.primary, color: COLORS.text }}
          />
        </motion.div>

        <motion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <label className="font-semibold block mb-2" style={{ color: COLORS.text }}>Product Images</label>
          {formData.images.map((image, index) => (
            <motion.div 
              key={index} 
              className="flex gap-4 items-center mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.85 + index * 0.05 }}
            >
              <input
                type="text"
                value={image}
                onChange={(e) => {
                  const updatedImages = [...formData.images];
                  updatedImages[index] = e.target.value;
                  setFormData({ ...formData, images: updatedImages });
                }}
                className="p-3 border rounded-lg w-full bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2"
                style={{ borderColor: COLORS.primary, color: COLORS.text }}
                placeholder={`Image URL ${index + 1}`}
              />
              <motion.button
                type="button"
                className="px-3 py-2 rounded-lg text-white"
                style={{ backgroundColor: COLORS.primary }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const updatedImages = formData.images.filter((_, i) => i !== index);
                  setFormData({ ...formData, images: updatedImages });
                }}
              >
                Remove
              </motion.button>
            </motion.div>
          ))}
          <motion.button
            type="button"
            className="px-4 py-2 rounded-lg text-white mt-2"
            style={{ backgroundColor: COLORS.accent }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (formData.images.length < 5) {
                setFormData({ ...formData, images: [...formData.images, ''] });
              } else {
                toast.error('You can add a maximum of 5 images.');
              }
            }}
          >
            Add Image
          </motion.button>
        </motion.div>

        <motion.div 
          className="mt-4 flex items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
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
          transition={{ duration: 0.3, delay: 0.95 }}
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
            Save Changes
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  );
};

export default EditProduct;