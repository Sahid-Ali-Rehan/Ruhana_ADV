import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
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

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://ruhana-adv.onrender.com/api/products/fetch-products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://ruhana-adv.onrender.com/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Product deleted successfully');
      setProducts(products.filter(product => product._id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: COLORS.background }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4" style={{ borderColor: COLORS.primary }}></div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <div className="flex justify-between items-center mb-6">
        <motion.h2 
          className="text-3xl font-bold"
          style={{ color: COLORS.text }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          All Products
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link to="/admin/add-products">
            <motion.button
              className="px-6 py-3 rounded-lg flex items-center gap-2"
              style={{ 
                backgroundColor: COLORS.primary,
                color: "#FFFFFF"
              }}
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: COLORS.accent 
              }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Product
            </motion.button>
          </Link>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => {
          const discount = product.discount || 0;
          const originalPrice = product.price;
          const discountedPrice = discount > 0 ? 
            originalPrice - (originalPrice * discount) / 100 : 
            originalPrice;

          return (
            <motion.div 
              key={product._id}
              className="p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
              style={{ backgroundColor: COLORS.background }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="h-72 overflow-hidden rounded-lg mb-4">
                {product.images && product.images[0] ? (
                  <motion.img
                    src={product.images[0]}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                  />
                ) : (
                  <div className="bg-gray-100 border border-gray-200 rounded-xl w-full h-full flex items-center justify-center">
                    <span style={{ color: COLORS.text }}>No Image</span>
                  </div>
                )}
              </div>
              
              <motion.h3 
                className="text-xl font-semibold truncate mb-1"
                style={{ color: COLORS.text }}
                whileHover={{ color: COLORS.accent }}
              >
                {product.productName}
              </motion.h3>
              
              <p className="text-sm mb-4 truncate text-gray-500">
                {product.description}
              </p>

              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  {discount > 0 && (
                    <p className="text-sm font-medium line-through text-gray-500">
                      BDT: {Math.floor(originalPrice)}
                    </p>
                  )}
                  <p className="text-lg font-bold" style={{ color: COLORS.text }}>
                    BDT: {Math.floor(discountedPrice)}
                  </p>
                </div>
                {product.stock > 0 ? (
                  <span className="text-sm font-semibold text-gray-600">In Stock</span>
                ) : (
                  <span className="text-sm font-semibold text-gray-500">Out of Stock</span>
                )}
              </div>

              <p className="text-sm mb-4 text-gray-500">
                Product Code: {product.productCode}
              </p>

              <div className="flex justify-between mt-4">
                <motion.button
                  onClick={() => handleEdit(product._id)}
                  className="px-4 py-2 rounded-lg border border-black"
                  style={{ backgroundColor: COLORS.background, color: COLORS.text }}
                  whileHover={{ 
                    backgroundColor: COLORS.buttonHover,
                    color: "#FFFFFF"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit
                </motion.button>
                <motion.button
                  onClick={() => handleDelete(product._id)}
                  className="px-4 py-2 rounded-lg"
                  style={{ backgroundColor: COLORS.primary, color: "#FFFFFF" }}
                  whileHover={{ 
                    scale: 1.05, 
                    backgroundColor: COLORS.accent 
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AllProducts;