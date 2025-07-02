import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

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
            toast.error('Authentication required');
            return;
          }
          const response = await axios.get(`https://ruhana-adv.onrender.com/api/products/details/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFormData(response.data);
        } catch (error) {
          console.error('Fetch error:', error.response?.data || error.message);
          toast.error('Failed to load product details');
        }
      };
      fetchProduct();
    }
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      const response = await axios.put(
        `https://ruhana-adv.onrender.com/api/products/update/${productId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Product updated successfully');
      navigate('/all-products');
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      toast.error(error.response?.data.message || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-2">Update product details below</p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 'productName', label: 'Product Name', type: 'text', span: 1 },
              { id: 'productCode', label: 'Product Code', type: 'text', span: 1 },
              { id: 'category', label: 'Category', type: 'text', span: 1 },
              { id: 'subCategory', label: 'Sub Category', type: 'text', span: 1 },
              { id: 'price', label: 'Price ($)', type: 'number', span: 1 },
              { id: 'discount', label: 'Discount (%)', type: 'number', span: 1 },
              { id: 'stock', label: 'Stock', type: 'number', span: 1 },
              { id: 'sizeChart', label: 'Size Chart URL', type: 'text', span: 1 },
              { id: 'videoUrl', label: 'Video URL', type: 'text', span: 1 },
              { id: 'description', label: 'Description', type: 'textarea', span: 2 },
            ].map((field, index) => (
              <motion.div
                key={field.id}
                className={field.span === 2 ? 'md:col-span-2' : ''}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
              >
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-800 mb-2">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    name={field.id}
                    value={formData[field.id] || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    rows="4"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                ) : (
                  <input
                    type={field.type}
                    id={field.id}
                    name={field.id}
                    value={formData[field.id] || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Available Colors
              </label>
              <input
                type="text"
                value={formData.availableColors.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  availableColors: e.target.value.split(',').map(c => c.trim())
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="Red, Blue, Green"
              />
              <p className="mt-1 text-xs text-gray-500">Enter comma-separated values</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.65 }}
            >
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Available Sizes
              </label>
              <input
                type="text"
                value={formData.availableSizes.map(s => s.size).join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  availableSizes: e.target.value.split(',').map(s => ({ size: s.trim(), sizePrice: 0 }))
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="S, M, L, XL"
              />
              <p className="mt-1 text-xs text-gray-500">Enter comma-separated values</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-800">
                  Product Images
                </label>
                <span className="text-xs text-gray-500">{formData.images.length}/5 images</span>
              </div>
              
              <div className="space-y-3">
                {formData.images.map((image, index) => (
                  <motion.div
                    key={index}
                    className="flex gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 * index }}
                  >
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => {
                        const updatedImages = [...formData.images];
                        updatedImages[index] = e.target.value;
                        setFormData({ ...formData, images: updatedImages });
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                      placeholder={`Image URL #${index + 1}`}
                    />
                    <button
                      type="button"
                      className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        const updatedImages = formData.images.filter((_, i) => i !== index);
                        setFormData({ ...formData, images: updatedImages });
                      }}
                    >
                      Remove
                    </button>
                  </motion.div>
                ))}
              </div>
              
              <button
                type="button"
                className="mt-3 px-4 py-3 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors w-full"
                onClick={() => {
                  if (formData.images.length < 5) {
                    setFormData({ ...formData, images: [...formData.images, ''] });
                  } else {
                    toast.error('Maximum 5 images allowed');
                  }
                }}
                disabled={formData.images.length >= 5}
              >
                + Add Image URL
              </button>
            </motion.div>

            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.75 }}
            >
              <input
                id="best-seller"
                type="checkbox"
                name="isBestSeller"
                checked={formData.isBestSeller}
                onChange={handleChange}
                className="h-5 w-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <label htmlFor="best-seller" className="ml-2 text-sm font-medium text-gray-800">
                Mark as Best Seller
              </label>
            </motion.div>
          </div>

          <motion.div
            className="mt-10 pt-6 border-t border-gray-200 flex justify-end space-x-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <button
              type="button"
              onClick={() => navigate('/all-products')}
              className="px-6 py-3 border border-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Save Changes
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default EditProduct;