// src/components/AdminComponents/TopNav.js
import React from 'react';
import { 
  FaTachometerAlt, 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaBell, 
  FaSearch, 
  FaUserCircle,
  FaCog
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { COLORS, FONTS } from '../../constants';

const TopNav = ({ 
  currentTime, 
  unreadCount, 
  setShowNotifications,
  markAsRead
}) => {
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div 
      className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 shadow-sm"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
           {/* Replaced text with logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src="/Images/logo.png" 
              alt="Admin Logo" 
              className="h-10 w-auto"
            />
          </motion.div>
          
          <div className="ml-12 hidden lg:flex items-center space-x-8">
            {[
              { path: "/admin", label: "Dashboard", icon: <FaTachometerAlt /> },
              { path: "/admin/products", label: "Products", icon: <FaBox /> },
              { path: "/admin/orders", label: "Orders", icon: <FaShoppingCart /> },
              { path: "/admin/users", label: "Users", icon: <FaUsers /> },
              { path: "/admin/settings", label: "Settings", icon: <FaCog /> }
            ].map((item, index) => (
              <motion.a 
                key={index}
                href={item.path}
                className="flex items-center py-2 text-sm font-medium transition-colors hover:text-black"
                style={{ color: COLORS.secondary }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </motion.a>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <motion.div 
            className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-lg mr-2" style={{ color: COLORS.primary }}>
              {formatTime(currentTime)}
            </span>
          </motion.div>
          
          <motion.button 
            className="relative p-1 text-gray-500 hover:text-black transition-colors"
            onClick={() => setShowNotifications(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaBell className="text-xl" />
            {unreadCount > 0 && (
              <motion.span 
                className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-xs"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm w-52"
              style={{ fontFamily: FONTS.primary }}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              <FaUserCircle className="text-2xl text-gray-400" />
            </div>
            <div className="ml-3 hidden md:block">
              <p className="text-sm font-medium" style={{ color: COLORS.primary }}>Admin User</p>
              <p className="text-xs" style={{ color: COLORS.secondary }}>Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TopNav;