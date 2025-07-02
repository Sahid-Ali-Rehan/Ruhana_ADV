import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Updated categories based on the provided table
  const categories = {
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

  const categoryLabels = {
    katua: "Katua",
    panjabi: "Panjabi",
    polo: "Polo",
    shirt: "Shirt",
    tshirts: "T-shirts"
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update cart and wishlist counts
  const updateCounts = useCallback(() => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart_guest')) || [];
      const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      
      const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(totalCartItems);
      setWishlistCount(wishlist.length);
    } catch (error) {
      console.error('Error reading cart/wishlist:', error);
    }
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken?.id;
        if (!userId) return;

        const response = await axios.get(`https://ruhana-adv.onrender.com/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.user) {
          setUser(response.data.user);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoggedIn(false);
      }
    };

    fetchUser();
    updateCounts();
    
    // Listen for storage changes
    const handleStorageChange = () => updateCounts();
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for updates within same tab
    const handleCustomUpdate = () => updateCounts();
    window.addEventListener('cartWishlistUpdate', handleCustomUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartWishlistUpdate', handleCustomUpdate);
    };
  }, [updateCounts]);

  // Navigation handlers
  const navigateToProducts = () => navigate('/products');
  const navigateToProfile = () => navigate('/my-profile');

  // Toggle dropdowns
  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setActiveDropdown(null);
    setIsMenuOpen(false);
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg py-2" 
          : "bg-transparent py-4"
      }`}
      style={{
        fontFamily: "'Cormorant Garamond', serif"
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Link to="/" onClick={closeAllDropdowns}>
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="p-1 rounded-full bg-white"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.img 
                    src='/Images/logo.png'
                    alt="Luxury Men's Brand" 
                    className="h-12 w-12 object-contain"
                    whileHover={{ rotate: -15 }}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.img 
                    src="/Images/J.gif"
                    alt="Jonab Logo"
                    className="h-8 w-auto object-contain"
                    animate={{
                      filter: [
                        "drop-shadow(0 0 0px rgba(0, 0, 0, 0))",
                        "drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))",
                        "drop-shadow(0 0 0px rgba(0, 0, 0, 0))"
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            {Object.entries(categories).map(([key, items]) => (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => setActiveDropdown(key)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <motion.button 
                  className="text-black hover:text-gray-600 transition-all duration-300 tracking-wider uppercase text-sm relative group"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 1 }}
                  style={{
                    fontWeight: 500,
                    letterSpacing: "1px"
                  }}
                >
                  {categoryLabels[key]}
                  <motion.span 
                    className="absolute bottom-0 left-0 w-0 h-px bg-black"
                    initial={{ width: 0 }}
                    animate={{ width: activeDropdown === key ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.button>
                
                <AnimatePresence>
                  {activeDropdown === key && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute left-0 mt-2 w-56 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-gray-300 z-50"
                      style={{
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      <div className="py-1">
                        {items.map((item) => (
                          <Link
                            to={`/products?category=${key}&subcategory=${encodeURIComponent(item.name)}`}
                            key={item.name}
                            onClick={closeAllDropdowns}
                            className="block px-4 py-3 text-sm text-gray-800 hover:bg-gray-100 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-5">
              <motion.button 
                onClick={navigateToProducts}
                className="text-black hover:text-gray-600 transition-all duration-300 tracking-wider uppercase text-sm relative group"
                whileHover={{ y: -2 }}
                whileTap={{ y: 1 }}
                style={{
                  fontWeight: 500,
                  letterSpacing: "1px"
                }}
              >
                All Collections
                <motion.span 
                  className="absolute bottom-0 left-0 w-0 h-px bg-black"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.4 }}
                />
              </motion.button>
              
              {isLoggedIn && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link 
                    to="/wish-list" 
                    className="relative text-black hover:text-gray-600 transition-all duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <AnimatePresence>
                      {wishlistCount > 0 && (
                        <motion.span 
                          className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 45 }}
                          key={wishlistCount}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          {wishlistCount > 9 ? '9+' : wishlistCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              )}
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link 
                  to="/cart" 
                  className="relative text-black hover:text-gray-600 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span 
                        className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 45 }}
                        key={cartCount}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
              
              {isLoggedIn ? (
                <motion.button 
                  onClick={navigateToProfile}
                  className="flex items-center space-x-2 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div 
                    className="relative"
                    whileHover={{ rotate: 5 }}
                    transition={{ type: "spring" }}
                  >
                    <div className="w-8 h-8 rounded-full border border-black p-0.5">
                      <div className="bg-gray-200 rounded-full w-full h-full flex items-center justify-center">
                        <span className="text-black font-medium">
                          {user?.fullname?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
                      <div className="bg-white rounded-full p-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-black" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                  <motion.span 
                    className="text-black group-hover:text-gray-600 transition-colors duration-300 text-sm"
                    style={{
                      fontWeight: 500
                    }}
                  >
                    {user?.fullname?.split(' ')[0]}
                  </motion.span>
                </motion.button>
              ) : (
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 1 }}
                  >
                    <Link
                      to="/login"
                      className="text-black hover:text-gray-600 transition-all duration-300 text-sm"
                      style={{
                        fontWeight: 500
                      }}
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/signup"
                      className="px-4 py-2 bg-black text-white rounded-full text-sm tracking-wider transition-all duration-300 shadow-lg shadow-black/20 hover:bg-gray-800"
                      style={{
                        fontWeight: 500
                      }}
                    >
                      Join
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.button
              className="lg:hidden text-black focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="lg:hidden bg-white border-t border-gray-200"
            style={{
              fontFamily: "'Inter', sans-serif"
            }}
          >
            <div className="px-4 py-5 space-y-6">
              {Object.entries(categories).map(([key, items]) => (
                <div key={key} className="border-b border-gray-200 pb-4">
                  <button
                    className="w-full flex justify-between items-center text-black hover:text-gray-600 transition-colors duration-300 text-sm uppercase tracking-wider"
                    onClick={() => toggleDropdown(key)}
                    style={{
                      fontWeight: 500,
                      letterSpacing: "1px"
                    }}
                  >
                    <span>{categoryLabels[key]}</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 transition-transform duration-300 ${activeDropdown === key ? 'rotate-180' : ''}`} 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <AnimatePresence>
                    {activeDropdown === key && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 space-y-2 pl-4"
                      >
                        {items.map((item) => (
                          <Link
                            to={`/products?category=${key}&subcategory=${encodeURIComponent(item.name)}`}
                            key={item.name}
                            onClick={closeAllDropdowns}
                            className="block py-2 text-black hover:text-gray-600 transition-colors duration-300 text-sm"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              
              <div className="pt-2 flex flex-col space-y-4">
                <button 
                  onClick={() => {
                    navigateToProducts();
                    closeAllDropdowns();
                  }}
                  className="text-left text-black hover:text-gray-600 transition-colors duration-300 text-sm uppercase tracking-wider"
                  style={{
                    fontWeight: 500,
                    letterSpacing: "1px"
                  }}
                >
                  All Collections
                </button>
                
                <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
                  {isLoggedIn && (
                    <Link 
                      to="/wish-list" 
                      className="flex items-center space-x-2 text-black hover:text-gray-600 transition-colors duration-300"
                      onClick={closeAllDropdowns}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-sm">Wishlist</span>
                    </Link>
                  )}
                  
                  <Link 
                    to="/cart" 
                    className="flex items-center space-x-2 text-black hover:text-gray-600 transition-colors duration-300"
                    onClick={closeAllDropdowns}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="text-sm">Cart</span>
                  </Link>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  {isLoggedIn ? (
                    <button 
                      onClick={() => {
                        navigateToProfile();
                        closeAllDropdowns();
                      }}
                      className="flex items-center space-x-3 group w-full"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full border border-black p-0.5">
                          <div className="bg-gray-200 rounded-full w-full h-full flex items-center justify-center">
                            <span className="text-black font-medium text-lg">
                              {user?.fullname?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
                          <div className="bg-white rounded-full p-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-black" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-black text-sm font-medium">{user?.fullname}</p>
                        <p className="text-gray-600 text-xs">View Profile</p>
                      </div>
                    </button>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      <Link
                        to="/login"
                        className="text-black hover:text-gray-600 transition-colors duration-300 text-sm font-medium text-center py-2 border border-black rounded-lg"
                        onClick={closeAllDropdowns}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        className="px-4 py-3 bg-black text-white rounded-full text-sm font-medium tracking-wider transition-all duration-300 shadow-lg shadow-black/20 text-center hover:bg-gray-800"
                        onClick={closeAllDropdowns}
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;