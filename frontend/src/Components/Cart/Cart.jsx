import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isRemoving, setIsRemoving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart_guest')) || [];
    const updatedCart = storedCart.map(item => ({
      ...item,
      productId: item.productId || item._id,
    }));
    
    setCartItems(updatedCart);
    const total = updatedCart.reduce((acc, item) => 
      acc + item.quantity * item.price * (1 - item.discount / 100), 0
    );
    setTotalPrice(total);
  }, []);

  const handleQuantityChange = (item, amount) => {
    const updatedCartItems = cartItems.map((cartItem) => {
      if (cartItem._id === item._id && 
          cartItem.selectedSize === item.selectedSize && 
          cartItem.selectedColor === item.selectedColor) {
        
        const newQuantity = cartItem.quantity + amount;
        
        if (newQuantity > cartItem.stock) {
          toast.error(`Cannot exceed available stock of ${cartItem.stock}`);
          return cartItem;
        }
        if (newQuantity <= 0) {
          toast.error("Quantity cannot be less than 1");
          return cartItem;
        }
        
        return { ...cartItem, quantity: newQuantity };
      }
      return cartItem;
    });

    setCartItems(updatedCartItems);
    localStorage.setItem('cart_guest', JSON.stringify(updatedCartItems));
    
    const total = updatedCartItems.reduce((acc, item) => 
      acc + item.quantity * item.price * (1 - item.discount / 100), 0
    );
    setTotalPrice(total);
  };

  const handleRemoveItem = (item) => {
    setIsRemoving(true);
    
    setTimeout(() => {
      const updatedCartItems = cartItems.filter((cartItem) => 
        !(cartItem._id === item._id && 
        cartItem.selectedSize === item.selectedSize && 
        cartItem.selectedColor === item.selectedColor)
      );
  
      setCartItems(updatedCartItems);
      localStorage.setItem('cart_guest', JSON.stringify(updatedCartItems));
      
      const total = updatedCartItems.reduce((acc, item) => 
        acc + item.quantity * item.price * (1 - item.discount / 100), 0
      );
      setTotalPrice(total);
      toast.success("Item removed from cart");
      setIsRemoving(false);
    }, 300);
  };

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: index * 0.05,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }),
    exit: { 
      opacity: 0, 
      x: 50,
      transition: { duration: 0.3 }
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center py-20 max-w-md">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1,
              opacity: 1,
              rotate: [0, 3, -3, 1, 0]
            }}
            transition={{ 
              duration: 0.8,
              ease: "easeInOut"
            }}
            className="inline-block mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-40 animate-shimmer"></div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-32 w-32 mx-auto relative z-10"
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>
          
          <motion.h2 
            className="text-4xl font-light tracking-tight mb-6 text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Your Cart is Empty
          </motion.h2>
          
          <motion.p 
            className="mb-8 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Discover our premium collection and fill your cart with exceptional pieces
          </motion.p>
          
          <motion.button 
            onClick={() => navigate('/products')}
            className="px-8 py-3 rounded-lg font-medium tracking-wide border border-gray-900 bg-white text-gray-900 shadow-[0_0_0_0_#000] hover:shadow-[4px_4px_0_0_#000] transition-all duration-300"
            whileHover={{ 
              scale: 1.02,
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            Explore Collection
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2 
          className="text-4xl font-light tracking-tight mb-12 text-center text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Selection
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="rounded-xl p-8 bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
              <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item._id + item.selectedSize + item.selectedColor}
                      className="flex flex-col md:flex-row justify-between items-center pb-8 border-b border-gray-100"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={index}
                      layout
                    >
                      <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-lg"></div>
                          <img 
                            src={item.images[0]} 
                            alt={item.productName} 
                            className="w-24 h-24 object-cover rounded-lg relative z-10 border border-gray-100"
                          />
                          {item.discount > 0 && (
                            <div className="absolute top-0 right-0 z-20 -mt-2 -mr-2 bg-black text-white text-xs font-medium rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                              {item.discount}%
                            </div>
                          )}
                        </div>
                        <div className="ml-6">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-500 mt-1">Size: {item.selectedSize}</p>
                          <p className="text-sm text-gray-500">Color: {item.selectedColor}</p>
                          <p className="font-medium mt-2 text-gray-900">
                            ৳{(item.price * (1 - item.discount / 100)).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full md:w-auto">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            onClick={() => handleQuantityChange(item, -1)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700"
                            whileHover={{ 
                              backgroundColor: "#f9fafb",
                              scale: 1.05
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            -
                          </motion.button>
                          <span className="text-lg font-medium min-w-[30px] text-center text-gray-900">
                            {item.quantity}
                          </span>
                          <motion.button
                            onClick={() => handleQuantityChange(item, 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700"
                            whileHover={{ 
                              backgroundColor: "#f9fafb",
                              scale: 1.05
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            +
                          </motion.button>
                        </div>
                        <p className="text-lg font-medium text-gray-900">
                          ৳ {(item.quantity * item.price * (1 - item.discount / 100)).toFixed(2)}
                        </p>
                        <motion.button
                          onClick={() => handleRemoveItem(item)}
                          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                          whileHover={{ 
                            scale: 1.02,
                            backgroundColor: "#f9fafb"
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Remove
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          <div>
            <motion.div 
              className="rounded-xl p-8 bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] sticky top-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-medium mb-8 text-gray-900 border-b border-gray-100 pb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">৳{totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">৳100.00</span>
                </div>
                
                <div className="flex justify-between border-t border-gray-100 pt-4">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-medium text-xl text-gray-900">৳{(totalPrice + 100).toFixed(2)}</span>
                </div>
              </div>
              
              <motion.button
                className="w-full py-4 rounded-lg font-medium text-lg bg-gray-900 text-white shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_0_0_rgba(0,0,0,0.2)] active:shadow-[0_2px_0_0_rgba(0,0,0,0.2)] transition-all duration-200"
                whileHover={{ 
                  y: -2,
                }}
                whileTap={{ 
                  y: 2,
                  scale: 0.99
                }}
                onClick={() => navigate("/checkout")}
              >
                Complete Purchase
              </motion.button>
              
              <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    Free shipping for orders over ৳2000. Additional discounts available at checkout.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <ToastContainer 
        position="bottom-right"
        toastClassName="!bg-white !text-gray-900 !border !border-gray-200 !shadow-lg !rounded-xl"
        progressClassName="!bg-gray-900"
        bodyClassName="!text-gray-700"
      />
    </div>
  );
};

export default Cart;