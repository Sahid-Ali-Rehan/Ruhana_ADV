import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";

// Premium monochrome palette
const COLORS = {
  background: "#FFFFFF",
  card: "#FCFCFC",
  text: "#0A0A0A",
  textSecondary: "#666666",
  border: "#EEEEEE",
  primary: "#121212",
  accent: "#222222",
  highlight: "#F8F8F8",
  success: "#333333",
  warning: "#444444",
  danger: "#222222",
};

// Sophisticated typography
const FONTS = {
  heading: "font-medium font-['Inter'] tracking-tight",
  body: "font-normal font-['Inter']",
  mono: "font-mono"
};

// Refined animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.06,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.98 },
  visible: { 
    y: 0, 
    opacity: 1,
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 180,
      damping: 15
    }
  },
  hover: { 
    y: -2,
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

const expandVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { 
    height: "auto", 
    opacity: 1,
    transition: { 
      duration: 0.4,
      ease: [0.19, 1.0, 0.22, 1.0]
    } 
  },
  exit: { 
    height: 0, 
    opacity: 0,
    transition: { 
      duration: 0.3,
      ease: [0.19, 1.0, 0.22, 1.0]
    } 
  }
};

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          toast.warning("Please log in to view orders");
          return;
        }

        const response = await axios.get(
          "https://ruhana-adv.onrender.com/api/orders/all-orders",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const ordersWithImages = response.data.map(order => ({
          ...order,
          items: order.items.map(item => ({
            ...item,
            productImage: item.productImage || item.productId?.images?.[0] || null
          }))
        }));
        
        setOrders(ordersWithImages);
      } catch (err) {
        toast.error("Failed to fetch orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://ruhana-adv.onrender.com/api/orders/update-status/${orderId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status } : order
      ));
      
      toast.success("Order status updated", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true
      });
    } catch (error) {
      toast.error("Error updating status");
      console.error(error);
    }
  };

  const handleDownload = (order) => {
    const worksheetData = [
      ["Order ID", order._id],
      ["Customer Name", order.name || "N/A"],
      ["Phone", order.phone || "N/A"],
      ["Address", order.address || "N/A"],
      ["Jela", order.jela || "N/A"],
      ["Upazela", order.upazela || "N/A"],
      ["Payment Method", order.paymentMethod || "N/A"],
      ["Status", order.status || "N/A"],
      ["Total Amount", `TK. ${order.totalAmount}`],
      [],
      ["Items", "Size", "Color", "Quantity", "Price"]
    ];

    order.items.forEach(item => {
      worksheetData.push([
        item.productName || "Unknown Product",
        item.selectedSize || "N/A",
        item.selectedColor || "N/A",
        item.quantity,
        `TK. ${item.price}`
      ]);
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    worksheet["!cols"] = [
      { wch: 25 }, { wch: 20 }, { wch: 15 }, 
      { wch: 15 }, { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Order Details");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Order_${order._id.slice(-6)}.xlsx`);
  };

  const handleApproveCancellation = async (orderId) => {
    const isConfirmed = window.confirm('Are you sure you want to cancel this order?');
    if (!isConfirmed) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://ruhana-adv.onrender.com/api/orders/cancel/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Order cancelled");
      setOrders(orders.filter(order => order._id !== orderId));
    } catch (error) {
      toast.error("Failed to cancel order");
      console.error(error);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': 
        return { 
          backgroundColor: '#F0F0F0', 
          color: COLORS.text,
          border: "1px solid #E0E0E0"
        };
      case 'Confirm': 
        return { 
          backgroundColor: '#E8E8E8', 
          color: COLORS.text,
          border: "1px solid #D0D0D0"
        };
      case 'Shipped': 
        return { 
          backgroundColor: '#D0D0D0', 
          color: '#FFFFFF',
          border: "1px solid #B0B0B0"
        };
      case 'Delivered': 
        return { 
          backgroundColor: '#0A0A0A', 
          color: '#FFFFFF',
          border: "1px solid #000"
        };
      case 'CancellationRequested': 
        return { 
          backgroundColor: '#333', 
          color: '#FFFFFF',
          border: "1px solid #222"
        };
      default: 
        return { 
          backgroundColor: '#F0F0F0', 
          color: COLORS.text,
          border: "1px solid #E0E0E0"
        };
    }
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    e.target.onerror = null;
    const placeholder = document.createElement('div');
    placeholder.className = 'bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center';
    placeholder.style.width = e.target.width + 'px';
    placeholder.style.height = e.target.height + 'px';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'h-8 w-8 text-gray-300');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('stroke', 'currentColor');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('strokeLinecap', 'round');
    path.setAttribute('strokeLinejoin', 'round');
    path.setAttribute('strokeWidth', '1.5');
    path.setAttribute('d', 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z');
    
    svg.appendChild(path);
    placeholder.appendChild(svg);
    
    e.target.parentNode.replaceChild(placeholder, e.target);
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-8 relative"
      style={{ 
        backgroundColor: COLORS.background,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
      }}
    >
      <motion.h1 
        className={`text-3xl md:text-4xl font-bold mb-6 md:mb-10 text-center ${FONTS.heading}`}
        style={{ color: COLORS.text }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 120,
          damping: 15
        }}
      >
        <span className="inline-block pb-2 border-b-2 border-black">
          Order Management
        </span>
      </motion.h1>
      
      {/* Search and Filter Section */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="md:col-span-2">
          <motion.div 
            whileHover={{ scale: 1.005 }}
          >
            <input
              type="text"
              placeholder="🔍 Search orders by ID, name or phone..."
              className="w-full p-3 md:p-4 rounded-xl border focus:outline-none focus:ring-1 shadow-sm text-base md:text-lg"
              style={{ 
                backgroundColor: COLORS.highlight, 
                borderColor: COLORS.border,
                color: COLORS.text
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
        </div>
        
        <div>
          <motion.div 
            whileHover={{ scale: 1.005 }}
          >
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-3 md:p-4 rounded-xl border focus:outline-none focus:ring-1 shadow-sm text-base md:text-lg"
              style={{ 
                backgroundColor: COLORS.highlight, 
                borderColor: COLORS.border,
                color: COLORS.text
              }}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirm">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="CancellationRequested">Cancellation Requested</option>
            </select>
          </motion.div>
        </div>
      </motion.div>
      
      {loading ? (
        <motion.div 
          className="flex justify-center items-center h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="rounded-full h-14 w-14 border-t-2 border-b-2 flex items-center justify-center"
            style={{ borderColor: COLORS.primary }}
            animate={{ 
              rotate: 360,
              transition: {
                duration: 1,
                ease: "linear",
                repeat: Infinity
              } 
            }}
          >
            <div className="rounded-full h-8 w-8 border-t-2 border-b-2" 
                 style={{ borderColor: COLORS.textSecondary }} />
          </motion.div>
        </motion.div>
      ) : filteredOrders.length === 0 ? (
        <motion.div 
          className="bg-white rounded-xl p-6 text-center max-w-md mx-auto border"
          style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 120,
            damping: 15
          }}
        >
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke={COLORS.primary}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h4a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </motion.div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.text }}>No Orders Found</h3>
          <p className="mb-5 text-base" style={{ color: COLORS.textSecondary }}>No orders match your search criteria</p>
          <motion.button
            className="px-5 py-2.5 rounded-lg text-base font-medium"
            style={{ backgroundColor: COLORS.primary, color: "white" }}
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
          >
            Reset Filters
          </motion.button>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              className="order-card rounded-xl overflow-hidden border"
              style={{ 
                backgroundColor: COLORS.card,
                borderColor: COLORS.border
              }}
              variants={itemVariants}
              whileHover="hover"
            >
              <div 
                className="p-4 md:p-5 cursor-pointer flex flex-wrap items-center justify-between gap-3 md:gap-4"
                onClick={() => toggleOrderExpand(order._id)}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  {/* Display product image with error handling */}
                  {order.items[0]?.productImage ? (
                    <motion.div 
                      className="relative"
                      whileHover={{ scale: 1.03 }}
                    >
                      <img 
                        src={order.items[0].productImage} 
                        alt={order.items[0].productName} 
                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border"
                        style={{ borderColor: COLORS.border }}
                        onError={handleImageError}
                      />
                      <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-1 shadow-sm border text-xs"
                           style={{ borderColor: COLORS.border }}>
                        <span className="font-medium" style={{ color: COLORS.text }}>
                          {order.items.length}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="bg-gray-100 border border-gray-200 rounded-lg w-16 h-16 md:w-20 md:h-20 flex items-center justify-center relative"
                      whileHover={{ scale: 1.03 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-1 shadow-sm border text-xs"
                           style={{ borderColor: COLORS.border }}>
                        <span className="font-medium" style={{ color: COLORS.text }}>
                          {order.items.length}
                        </span>
                      </div>
                    </motion.div>
                  )}
                  
                  <div>
                    <h3 className={`font-semibold text-lg md:text-xl ${FONTS.heading}`} style={{ color: COLORS.text }}>
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm md:text-base" style={{ color: COLORS.textSecondary }}>
                      {order.name} • {order.phone}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-lg md:text-xl font-semibold ${FONTS.heading}`} style={{ color: COLORS.text }}>
                    ৳{order.totalAmount}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={getStatusStyle(order.status)}>
                    {order.status}
                  </span>
                  <span className="text-xs opacity-75" style={{ color: COLORS.textSecondary }}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              <AnimatePresence>
                {expandedOrderId === order._id && (
                  <motion.div
                    variants={expandVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="border-t"
                    style={{ borderColor: COLORS.border }}
                  >
                    <div className="p-4 md:p-5">
                      <div className="mb-5">
                        <h4 className={`font-semibold mb-3 text-lg ${FONTS.heading}`} style={{ color: COLORS.text }}>Products</h4>
                        <div className="flex overflow-x-auto pb-2 gap-4">
                          {order.items.map((item, index) => (
                            <motion.div
                              key={index}
                              className="flex-shrink-0 w-28 md:w-32"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ 
                                delay: index * 0.1,
                                type: "spring",
                                stiffness: 120
                              }}
                            >
                              {/* Display product image with error handling */}
                              {item.productImage ? (
                                <motion.img 
                                  src={item.productImage} 
                                  alt={item.productName} 
                                  className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-lg border"
                                  style={{ borderColor: COLORS.border }}
                                  onError={handleImageError}
                                  whileHover={{ scale: 1.03 }}
                                />
                              ) : (
                                <motion.div 
                                  className="bg-gray-100 border border-gray-200 rounded-lg w-28 h-28 md:w-32 md:h-32 flex items-center justify-center"
                                  whileHover={{ scale: 1.03 }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </motion.div>
                              )}
                              <p className="text-sm font-medium truncate mt-2" style={{ color: COLORS.text }}>
                                {item.productName}
                              </p>
                              <div className="flex justify-between mt-1.5">
                                <p className="text-xs" style={{ color: COLORS.textSecondary }}>
                                  Qty: {item.quantity}
                                </p>
                                <p className="text-sm font-semibold" style={{ color: COLORS.text }}>
                                  ৳{item.price}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <div className="bg-white rounded-lg p-4 border"
                             style={{ backgroundColor: COLORS.highlight, borderColor: COLORS.border }}>
                          <h4 className={`font-semibold mb-2 text-md ${FONTS.heading}`} style={{ color: COLORS.text }}>Shipping Info</h4>
                          <div className="text-sm space-y-2" style={{ color: COLORS.text }}>
                            <p><span className="font-medium">Name:</span> {order.name}</p>
                            <p><span className="font-medium">Phone:</span> {order.phone}</p>
                            <p><span className="font-medium">Address:</span> {order.address}</p>
                            <p><span className="font-medium">Area:</span> {order.upazela}, {order.jela}</p>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border"
                             style={{ backgroundColor: COLORS.highlight, borderColor: COLORS.border }}>
                          <h4 className={`font-semibold mb-2 text-md ${FONTS.heading}`} style={{ color: COLORS.text }}>Order Details</h4>
                          <div className="text-sm space-y-2" style={{ color: COLORS.text }}>
                            <p><span className="font-medium">Payment:</span> {order.paymentMethod}</p>
                            <p><span className="font-medium">Items:</span> {order.items.length}</p>
                            <p><span className="font-medium">Delivery:</span> ৳{order.deliveryCharge}</p>
                            <p><span className="font-medium">Total:</span> ৳{order.totalAmount}</p>
                            <p><span className="font-medium">Order Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-sm font-medium mb-1.5" style={{ color: COLORS.text }}>Update Status</label>
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order._id, e.target.value)}
                            className="w-full p-2.5 rounded-lg border focus:outline-none focus:ring-1 shadow-sm text-sm"
                            style={{ 
                              backgroundColor: COLORS.highlight, 
                              borderColor: COLORS.border,
                              color: COLORS.text
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirm">Confirm</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <motion.button
                            onClick={() => handleDownload(order)}
                            className="px-4 py-2 rounded-lg flex items-center gap-1.5 font-medium text-sm"
                            style={{ backgroundColor: COLORS.textSecondary, color: 'white' }}
                            whileHover={{ 
                              scale: 1.03,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Excel</span>
                          </motion.button>
                          
                          <motion.button
                            onClick={() => setSelectedOrder(order)}
                            className="px-4 py-2 rounded-lg flex items-center gap-1.5 font-medium text-sm"
                            style={{ backgroundColor: COLORS.primary, color: 'white' }}
                            whileHover={{ 
                              scale: 1.03,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Details</span>
                          </motion.button>
                          
                          {order.status === "CancellationRequested" && (
                            <motion.button
                              onClick={() => handleApproveCancellation(order._id)}
                              className="px-4 py-2 rounded-lg flex items-center gap-1.5 font-medium text-sm"
                              style={{ backgroundColor: COLORS.danger, color: 'white' }}
                              whileHover={{ 
                                scale: 1.03,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                              }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Cancel</span>
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border"
              style={{ 
                backgroundColor: COLORS.background,
                borderColor: COLORS.border
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { 
                  type: "spring", 
                  stiffness: 120,
                  damping: 20
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.95,
                transition: { duration: 0.2 } 
              }}
            >
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center pb-3 border-b"
                     style={{ borderColor: COLORS.border }}>
                  <h2 className={`text-2xl font-bold ${FONTS.heading}`} style={{ color: COLORS.text }}>
                    Order Details • #{selectedOrder._id.slice(-8).toUpperCase()}
                  </h2>
                  <motion.button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 rounded-full hover:bg-gray-100"
                    whileHover={{ rotate: 90, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke={COLORS.text} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-lg p-4 border"
                         style={{ backgroundColor: COLORS.highlight, borderColor: COLORS.border }}>
                      <h3 className={`font-semibold mb-3 text-lg ${FONTS.heading}`} style={{ color: COLORS.text }}>Customer Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs opacity-75">Name</p>
                          <p className="font-medium" style={{ color: COLORS.text }}>{selectedOrder.name}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-75">Phone</p>
                          <p className="font-medium" style={{ color: COLORS.text }}>{selectedOrder.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-75">Address</p>
                          <p className="font-medium" style={{ color: COLORS.text }}>{selectedOrder.address}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-75">Area</p>
                          <p className="font-medium" style={{ color: COLORS.text }}>{selectedOrder.upazela}, {selectedOrder.jela}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border"
                         style={{ backgroundColor: COLORS.highlight, borderColor: COLORS.border }}>
                      <h3 className={`font-semibold mb-3 text-lg ${FONTS.heading}`} style={{ color: COLORS.text }}>Order Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm opacity-75">Subtotal</span>
                          <span className="font-medium" style={{ color: COLORS.text }}>৳{selectedOrder.totalAmount - selectedOrder.deliveryCharge}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm opacity-75">Delivery</span>
                          <span className="font-medium" style={{ color: COLORS.text }}>৳{selectedOrder.deliveryCharge}</span>
                        </div>
                        <div className="flex justify-between border-t pt-3 mt-3">
                          <span className={`font-semibold text-lg ${FONTS.heading}`} style={{ color: COLORS.text }}>Total</span>
                          <span className={`font-bold text-xl ${FONTS.heading}`} style={{ color: COLORS.text }}>৳{selectedOrder.totalAmount}</span>
                        </div>
                        <div className="mt-4">
                          <span className="text-xs opacity-75">Payment Method</span>
                          <p className="font-medium" style={{ color: COLORS.text }}>{selectedOrder.paymentMethod}</p>
                        </div>
                        <div className="mt-3">
                          <span className="text-xs opacity-75">Status</span>
                          <p className={`px-2.5 py-1 rounded-full inline-block font-medium text-xs`}
                             style={getStatusStyle(selectedOrder.status)}>
                            {selectedOrder.status}
                          </p>
                        </div>
                        <div className="mt-3">
                          <span className="text-xs opacity-75">Order Date</span>
                          <p className="font-medium" style={{ color: COLORS.text }}>
                            {new Date(selectedOrder.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="bg-white rounded-lg p-4 border"
                         style={{ backgroundColor: COLORS.highlight, borderColor: COLORS.border }}>
                      <h3 className={`font-semibold mb-4 text-lg ${FONTS.heading}`} style={{ color: COLORS.text }}>Products ({selectedOrder.items.length})</h3>
                      <div className="space-y-4">
                        {selectedOrder.items.map((item, index) => (
                          <motion.div 
                            key={index}
                            className="flex gap-4 p-4 rounded-lg border"
                            style={{ borderColor: COLORS.border }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {/* Display product image with error handling */}
                            {item.productImage ? (
                              <motion.img 
                                src={item.productImage} 
                                alt={item.productName} 
                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                onError={handleImageError}
                                whileHover={{ scale: 1.03 }}
                              />
                            ) : (
                              <motion.div 
                                className="bg-gray-100 border border-gray-200 rounded-lg w-20 h-20 flex-shrink-0 flex items-center justify-center"
                                whileHover={{ scale: 1.03 }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </motion.div>
                            )}
                            
                            <div className="flex-1">
                              <h4 className={`font-medium text-lg mb-2 ${FONTS.heading}`} style={{ color: COLORS.text }}>{item.productName}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-xs opacity-75">Size</p>
                                  <p className="font-medium text-sm" style={{ color: COLORS.text }}>{item.selectedSize || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs opacity-75">Color</p>
                                  <p className="font-medium text-sm" style={{ color: COLORS.text }}>{item.selectedColor || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs opacity-75">Qty</p>
                                  <p className="font-medium text-sm" style={{ color: COLORS.text }}>{item.quantity}</p>
                                </div>
                                <div>
                                  <p className="text-xs opacity-75">Price</p>
                                  <p className={`font-bold text-sm ${FONTS.heading}`} style={{ color: COLORS.text }}>৳{item.price}</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-4">
                      <motion.button
                        onClick={() => handleDownload(selectedOrder)}
                        className="px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm"
                        style={{ backgroundColor: COLORS.textSecondary, color: 'white' }}
                        whileHover={{ 
                          scale: 1.03,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Invoice
                      </motion.button>
                      
                      <motion.button
                        onClick={() => {
                          setSelectedOrder(null);
                          setExpandedOrderId(selectedOrder._id);
                        }}
                        className="px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm"
                        style={{ backgroundColor: COLORS.primary, color: 'white' }}
                        whileHover={{ 
                          scale: 1.03,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Manage Order
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllOrders;