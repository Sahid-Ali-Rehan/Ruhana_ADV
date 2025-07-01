// src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import DashboardStats from '../../Components/AdminComponents/DashboardStats';
import TopNav from '../../Components/AdminComponents/TopNav';
import MobileNav from '../../Components/AdminComponents/MobileNav';
import NotificationCenter from '../../Components/AdminComponents/NotificationCenter';
import { motion } from 'framer-motion';
import { COLORS, FONTS } from '../../constants';

const AdminPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Simulate receiving notifications
  useEffect(() => {
    const notificationInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newNotification = {
          id: Date.now(),
          type: ['order', 'user', 'system'][Math.floor(Math.random() * 3)],
          title: ['New Order Received', 'User Signed Up', 'System Update'][Math.floor(Math.random() * 3)],
          message: `Notification details ${notifications.length + 1}`,
          time: new Date(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    }, 10000);
    
    return () => clearInterval(notificationInterval);
  }, [notifications.length]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? {...n, read: true} : n)
    );
    setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
  };

  return (
    <motion.div 
      className="flex flex-col min-h-screen"
      style={{ 
        backgroundColor: COLORS.background,
        fontFamily: FONTS.primary
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <TopNav 
        currentTime={currentTime}
        notifications={notifications}
        unreadCount={unreadCount}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        markAsRead={markAsRead}
      />
      
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 pb-24 lg:pb-6">
        <div className="mb-8">
          <motion.h1 
            className="text-3xl font-bold tracking-tight"
            style={{ color: COLORS.primary }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Dashboard Overview
          </motion.h1>
          <motion.p 
            className="text-lg mt-2"
            style={{ color: COLORS.secondary }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </motion.p>
        </div>
        
        <DashboardStats />
      </main>
      
      <MobileNav />
      
      {showNotifications && (
        <NotificationCenter 
          notifications={notifications}
          markAsRead={markAsRead}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </motion.div>
  );
};

export default AdminPage;