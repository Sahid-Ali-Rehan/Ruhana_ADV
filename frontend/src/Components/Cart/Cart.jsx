import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from "framer-motion";

// Color palette
const COLORS = {
  parchment: "#EFE2B2",
  terracotta: "#9E5F57",
  moss: "#567A4B",
  rust: "#814B4A",
  sage: "#97A276",
  blush: "#F5C9C6"
};

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
    hidden: { opacity: 0, x: -50 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: { 
        delay: index * 0.1,
        duration: 0.5
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.parchment }}>
        <div className="text-center py-20 max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              rotate: [0, 10, -10, 5, 0]
            }}
            transition={{ 
              duration: 0.8,
              times: [0, 0.2, 0.5, 0.8, 1],
              ease: "easeInOut"
            }}
            className="inline-block mb-8"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-32 w-32 mx-auto"
              style={{ color: COLORS.terracotta }}
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
          </motion.div>
          
          <motion.h2 
            className="text-3xl font-bold mb-6"
            style={{ color: COLORS.rust }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Your Cart is Empty
          </motion.h2>
          
          <motion.p 
            className="mb-8"
            style={{ color: COLORS.terracotta }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Looks like you haven't added anything to your cart yet. Start shopping to fill it with amazing products!
          </motion.p>
          
          <motion.button 
            onClick={() => navigate('/products')}
            className="px-8 py-3 rounded-full font-bold shadow-lg"
            style={{ 
              backgroundColor: COLORS.terracotta,
              color: 'white'
            }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: COLORS.moss
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            Browse Products
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: COLORS.parchment }}>
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2 
          className="text-3xl font-bold mb-8 text-center"
          style={{ color: COLORS.rust }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Shopping Cart
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="space-y-6">
                <AnimatePresence>
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item._id + item.selectedSize + item.selectedColor}
                      className="flex flex-col md:flex-row justify-between items-center border-b pb-6"
                      style={{ borderColor: COLORS.sage + "40" }}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      custom={index}
                      layout
                    >
                      <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
                        <div className="relative">
                          <img 
                            src={item.images[0]} 
                            alt={item.productName} 
                            className="w-24 h-24 object-cover rounded-lg border-2"
                            style={{ borderColor: COLORS.sage }}
                          />
                          {item.discount > 0 && (
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                              {item.discount}%
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="font-bold" style={{ color: COLORS.rust }}>{item.productName}</p>
                          <p className="text-sm" style={{ color: COLORS.moss }}>Size: {item.selectedSize}</p>
                          <p className="text-sm" style={{ color: COLORS.moss }}>Color: {item.selectedColor}</p>
                          <p className="font-semibold mt-1" style={{ color: COLORS.terracotta }}>
                            ৳{(item.price * (1 - item.discount / 100)).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full md:w-auto">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            onClick={() => handleQuantityChange(item, -1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full"
                            style={{ backgroundColor: COLORS.sage, color: 'white' }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            -
                          </motion.button>
                          <span className="text-lg font-bold min-w-[30px] text-center" style={{ color: COLORS.rust }}>
                            {item.quantity}
                          </span>
                          <motion.button
                            onClick={() => handleQuantityChange(item, 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full"
                            style={{ backgroundColor: COLORS.sage, color: 'white' }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            +
                          </motion.button>
                        </div>
                        <p className="text-lg font-bold" style={{ color: COLORS.moss }}>
                          ৳ {(item.quantity * item.price * (1 - item.discount / 100)).toFixed(2)}
                        </p>
                        <motion.button
                          onClick={() => handleRemoveItem(item)}
                          className="px-4 py-2 rounded-full"
                          style={{ 
                            backgroundColor: COLORS.blush,
                            color: COLORS.rust
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
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
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-bold mb-6" style={{ color: COLORS.rust }}>Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span style={{ color: COLORS.terracotta }}>Subtotal</span>
                  <span className="font-semibold" style={{ color: COLORS.rust }}>৳{totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span style={{ color: COLORS.terracotta }}>Shipping</span>
                  <span className="font-semibold" style={{ color: COLORS.moss }}>৳100.00</span>
                </div>
                
                <div className="flex justify-between border-t pt-4">
                  <span className="font-bold" style={{ color: COLORS.rust }}>Total</span>
                  <span className="font-bold text-xl" style={{ color: COLORS.rust }}>৳{(totalPrice + 100).toFixed(2)}</span>
                </div>
              </div>
              
              <motion.button
                className="w-full py-4 rounded-full font-bold text-lg shadow-lg"
                style={{ 
                  backgroundColor: COLORS.terracotta,
                  color: 'white'
                }}
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: COLORS.moss
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </motion.button>
              
              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: COLORS.blush + "40" }}>
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 mr-2" style={{ color: COLORS.moss }} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm" style={{ color: COLORS.terracotta }}>
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
        toastStyle={{ 
          backgroundColor: COLORS.parchment,
          color: COLORS.rust,
          border: `2px solid ${COLORS.sage}`
        }}
        progressStyle={{ background: COLORS.terracotta }}
      />
    </div>
  );
};

export default Cart;