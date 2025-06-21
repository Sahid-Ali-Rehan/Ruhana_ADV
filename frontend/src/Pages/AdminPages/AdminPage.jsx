import React, { useState } from 'react';
import Sidebar from '../../Components/AdminComponents/Sidebar';
import DashboardStats from '../../Components/AdminComponents/DashboardStats';
import { motion } from 'framer-motion';

const COLORS = {
  parchment: "#EFE2B2",
  terracotta: "#9E5F57",
  moss: "#567A4B",
  rust: "#814B4A",
  sage: "#97A276",
  blush: "#F5C9C6"
};

const AdminPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <motion.div 
      className="flex h-screen overflow-hidden bg-[#EFE2B2]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Sidebar 
        collapsed={sidebarCollapsed} 
        toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div 
        className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h2 
            className="text-3xl font-bold"
            style={{ color: COLORS.rust }}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Dashboard Overview
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-4"
          >
            <div className="relative">
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2" style={{ borderColor: COLORS.terracotta }}>
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full" />
              </div>
            </div>
            <div>
              <p className="font-semibold" style={{ color: COLORS.rust }}>Admin User</p>
              <p className="text-sm" style={{ color: COLORS.terracotta }}>Administrator</p>
            </div>
          </motion.div>
        </div>
        
        <DashboardStats />
      </div>
    </motion.div>
  );
};

export default AdminPage;