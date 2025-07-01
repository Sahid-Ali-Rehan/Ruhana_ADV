// src/components/AdminComponents/MobileNav.js
import React, { useState } from 'react';
import { 
  FaTachometerAlt, 
  FaBox, 
  FaShoppingCart, 
  FaUsers,
  FaCog,
  FaPlusCircle,
  FaChartLine,
  FaChartPie
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { COLORS } from '../../constants';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-3">
        {[
          { path: "/admin", label: "Dashboard", icon: <FaTachometerAlt /> },
          { path: "/admin/products", label: "Products", icon: <FaBox /> },
          { path: "/admin/orders", label: "Orders", icon: <FaShoppingCart /> },
          { path: "/admin/users", label: "Users", icon: <FaUsers /> },
          { path: "#", label: "Menu", icon: <FaCog onClick={() => setIsOpen(!isOpen)} /> }
        ].map((item, index) => (
          <motion.a 
            key={index}
            href={item.path}
            className="flex flex-col items-center text-xs"
            style={{ color: COLORS.secondary }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span>{item.label}</span>
          </motion.a>
        ))}
      </div>
      
      {isOpen && (
        <motion.div 
          className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 shadow-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-2 gap-4">
            {[
              { path: "/admin/add-products", label: "Add Products", icon: <FaPlusCircle /> },
              { path: "/admin/settings", label: "Settings", icon: <FaCog /> },
              { path: "/admin/reports", label: "Reports", icon: <FaChartLine /> },
              { path: "/admin/analytics", label: "Analytics", icon: <FaChartPie /> }
            ].map((item, index) => (
              <motion.a 
                key={index}
                href={item.path}
                className="flex items-center py-2 text-sm"
                style={{ color: COLORS.secondary }}
                whileHover={{ x: 5 }}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MobileNav;