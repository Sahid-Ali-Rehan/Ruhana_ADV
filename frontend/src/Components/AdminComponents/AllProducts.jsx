import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
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
      <motion.h2 
        className="text-3xl font-bold mb-6 text-center"
        style={{ color: COLORS.text }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        All Products
      </motion.h2>
      
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
              className="p-6 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300"
              style={{ backgroundColor: COLORS.highlight }}
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
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
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
              
              <p className="text-sm mb-4 truncate opacity-80" style={{ color: COLORS.text }}>
                {product.description}
              </p>

              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  {discount > 0 && (
                    <p className="text-lg font-bold line-through" style={{ color: COLORS.primary }}>
                      BDT: {Math.floor(originalPrice)}
                    </p>
                  )}
                  <p className="text-lg font-bold" style={{ color: COLORS.accent }}>
                    BDT: {Math.floor(discountedPrice)}
                  </p>
                </div>
                {product.stock > 0 ? (
                  <span className="text-sm font-semibold" style={{ color: COLORS.accent }}>In Stock</span>
                ) : (
                  <span className="text-sm font-semibold" style={{ color: COLORS.primary }}>Out of Stock</span>
                )}
              </div>

              <p className="text-sm mb-4 opacity-80" style={{ color: COLORS.text }}>
                Product Code: {product.productCode}
              </p>

              <div className="flex justify-between mt-4">
                <motion.button
                  onClick={() => handleEdit(product._id)}
                  className="px-4 py-2 rounded-lg"
                  style={{ backgroundColor: COLORS.subtle, color: 'white' }}
                  whileHover={{ scale: 1.05, backgroundColor: COLORS.primary }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit
                </motion.button>
                <motion.button
                  onClick={() => handleDelete(product._id)}
                  className="px-4 py-2 rounded-lg"
                  style={{ backgroundColor: COLORS.primary, color: 'white' }}
                  whileHover={{ scale: 1.05, backgroundColor: COLORS.accent }}
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