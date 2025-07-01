// src/components/AdminComponents/NotificationCenter.js
import React from 'react';
import { FaTimes, FaCircle, FaRegCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { COLORS } from '../../constants';

const NotificationCenter = ({ notifications, markAsRead, onClose }) => {
  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white w-full max-w-md h-full shadow-xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30 }}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold" style={{ color: COLORS.primary }}>
            Notifications
          </h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="text-5xl mb-4" style={{ color: COLORS.accent }}>🔔</div>
              <h4 className="text-xl font-medium mb-2" style={{ color: COLORS.primary }}>
                No notifications yet
              </h4>
              <p className="text-sm" style={{ color: COLORS.secondary }}>
                We'll notify you when something arrives
              </p>
            </div>
          ) : (
            notifications.map(notification => (
              <motion.div
                key={notification.id}
                className={`p-4 border-b border-gray-100 flex items-start ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mr-3 mt-1">
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="text-gray-400 hover:text-blue-500"
                  >
                    {notification.read ? <FaRegCircle /> : <FaCircle className="text-blue-500" />}
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium" style={{ color: COLORS.primary }}>
                      {notification.title}
                    </h4>
                    <span className="text-xs" style={{ color: COLORS.secondary }}>
                      {new Date(notification.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: COLORS.secondary }}>
                    {notification.message}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationCenter;