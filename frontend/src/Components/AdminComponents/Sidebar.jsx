import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaPlusCircle, 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaChevronLeft,
  FaChevronRight,
  FaCog
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const COLORS = {
  parchment: "#EFE2B2",
  terracotta: "#9E5F57",
  moss: "#567A4B",
  rust: "#814B4A",
  sage: "#97A276",
  blush: "#F5C9C6"
};

const Sidebar = ({ collapsed, toggleCollapse }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/admin/add-products", label: "Add Products", icon: <FaPlusCircle /> },
    { path: "/admin/products", label: "All Products", icon: <FaBox /> },
    { path: "/admin/orders", label: "All Orders", icon: <FaShoppingCart /> },
    { path: "/admin/users", label: "All Users", icon: <FaUsers /> },
    { path: "/admin/settings", label: "Settings", icon: <FaCog /> }
  ];

  return (
    <motion.div 
      className={`h-screen sticky top-0 overflow-hidden transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      style={{ backgroundColor: COLORS.sage }}
      initial={{ width: collapsed ? '5rem' : '16rem' }}
      animate={{ width: collapsed ? '5rem' : '16rem' }}
    >
      <div className="p-5">
        <div className="flex justify-between items-center mb-6">
          {!collapsed && (
            <motion.h1 
              className="text-2xl font-bold"
              style={{ color: COLORS.rust }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Admin Panel
            </motion.h1>
          )}
          
          <motion.button
            onClick={toggleCollapse}
            className="p-2 rounded-full"
            style={{ backgroundColor: COLORS.terracotta }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {collapsed ? <FaChevronRight className="text-white" /> : <FaChevronLeft className="text-white" />}
          </motion.button>
        </div>
        
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.li 
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={item.path}
                className={`flex items-center p-3 rounded-lg transition-all ${
                  location.pathname === item.path 
                    ? 'bg-white shadow-md' 
                    : 'hover:bg-white hover:bg-opacity-30'
                }`}
              >
                <div className="text-xl" style={{ color: location.pathname === item.path ? COLORS.terracotta : 'white' }}>
                  {item.icon}
                </div>
                
                {!collapsed && (
                  <motion.span 
                    className="ml-3"
                    style={{ color: location.pathname === item.path ? COLORS.rust : 'white' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
      
      {!collapsed && (
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-5 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-xs" style={{ color: COLORS.parchment }}>
            Ruhana Admin v1.0
          </div>
          <div className="text-xs mt-1" style={{ color: COLORS.parchment + 'aa' }}>
            © 2023 All Rights Reserved
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Sidebar;