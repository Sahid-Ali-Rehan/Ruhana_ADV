import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { motion } from "framer-motion";
import 'react-toastify/dist/ReactToastify.css';

// Color palette
const COLORS = {
  parchment: "#EFE2B2",
  terracotta: "#9E5F57",
  moss: "#567A4B",
  rust: "#814B4A",
  sage: "#97A276",
  blush: "#F5C9C6"
};

const RelatedProducts = ({ category }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://ruhana-adv.onrender.com/api/products/related/${category}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch related products");
        }
        const data = await response.json();
        setRelatedProducts(data);
      } catch (err) {
        console.error(err.message);
        toast.error("Failed to load related products");
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchRelatedProducts();
    }
  }, [category]);

  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * discount) / 100;
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: { 
      y: -10,
      boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`,
      transition: { duration: 0.3 }
    }
  };

  if (loading) {
    return (
      <div className="w-full py-12" style={{ backgroundColor: COLORS.parchment }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-64 bg-gray-200 animate-pulse rounded-t-xl"></div>
                <div className="p-4 bg-gray-100">
                  <div className="h-6 w-3/4 bg-gray-300 animate-pulse mb-2 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-300 animate-pulse mb-4 rounded"></div>
                  <div className="h-8 w-3/4 bg-gray-300 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) return null;

  return (
    <div className="w-full py-12" style={{ backgroundColor: COLORS.parchment }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold" style={{ color: COLORS.rust }}>Related Products</h2>
          <Link 
            to={`/products/category/${category}`} 
            className="text-lg font-semibold flex items-center hover:underline" 
            style={{ color: COLORS.terracotta }}
          >
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          ref={containerRef}
          initial="hidden"
          animate="visible"
        >
          {relatedProducts.map((product, index) => {
            const discountedPrice = calculateDiscountedPrice(
              product.price,
              product.discount
            );
            
            return (
              <motion.div
                key={product._id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                custom={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.img
                      src={product.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 1 }}
                      whileHover={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.img
                      src={product.images[1] || 'https://via.placeholder.com/400x300?text=No+Image+Hover'}
                      alt={product.productName}
                      className="w-full h-full object-cover absolute inset-0"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  
                  {product.discount > 0 && (
                    <motion.div 
                      className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                      style={{ backgroundColor: COLORS.blush, color: COLORS.rust }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {product.discount}% OFF
                    </motion.div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-4 w-full">
                      <motion.button 
                        className="w-full py-2 rounded-lg text-white font-semibold"
                        style={{ backgroundColor: COLORS.terracotta }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add to Cart
                      </motion.button>
                    </div>
                  </div>
                </div>
                
                <Link to={`/products/single/${product._id}`}>
                  <div className="p-4" style={{ backgroundColor: COLORS.sage + "40" }}>
                    <h3 className="font-bold text-lg truncate" style={{ color: COLORS.rust }}>
                      {product.productName}
                    </h3>
                    <p className="text-sm truncate" style={{ color: COLORS.terracotta }}>
                      {product.productCode}
                    </p>
                    <div className="flex items-center mt-3">
                      <p className="font-bold text-xl" style={{ color: COLORS.moss }}>
                        ৳{discountedPrice.toFixed(2)}
                      </p>
                      {product.discount > 0 && (
                        <p className="ml-2 line-through text-sm" style={{ color: COLORS.rust }}>
                          ৳{product.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default RelatedProducts;