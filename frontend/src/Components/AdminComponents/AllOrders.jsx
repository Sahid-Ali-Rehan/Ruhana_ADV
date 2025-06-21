import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced color palette
const COLORS = {
  background: "#F8F5E4",
  primary: "#9E5F57",
  accent: "#5B8C5A",
  text: "#7A4A48",
  subtle: "#A8B38D",
  highlight: "#FFE3E0",
  success: "#4CAF50",
  warning: "#FFC107",
  danger: "#F44336"
};

// Animation variants for smoother transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 120 
    }
  },
  hover: { 
    y: -5,
    boxShadow: "0 10px 25px rgba(158, 95, 87, 0.2)"
  }
};

const expandVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { 
    height: "auto", 
    opacity: 1,
    transition: { 
      duration: 0.4,
      ease: "easeInOut"
    } 
  },
  exit: { 
    height: 0, 
    opacity: 0,
    transition: { 
      duration: 0.3,
      ease: "easeInOut"
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirm': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-indigo-100 text-indigo-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'CancellationRequested': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    e.target.onerror = null;
    const placeholder = document.createElement('div');
    placeholder.className = 'bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center';
    placeholder.style.width = e.target.width + 'px';
    placeholder.style.height = e.target.height + 'px';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'h-1/2 w-1/2 text-gray-400');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('stroke', 'currentColor');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('strokeLinecap', 'round');
    path.setAttribute('strokeLinejoin', 'round');
    path.setAttribute('strokeWidth', '2');
    path.setAttribute('d', 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z');
    
    svg.appendChild(path);
    placeholder.appendChild(svg);
    
    e.target.parentNode.replaceChild(placeholder, e.target);
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-8" 
      style={{ backgroundColor: COLORS.background }}
    >
      <motion.h1 
        className="text-3xl font-bold mb-6 text-center"
        style={{ color: COLORS.text }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 100,
          damping: 15
        }}
      >
        Order Management Dashboard
      </motion.h1>
      
      {/* Search and Filter Section */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="md:col-span-2">
          <motion.div whileHover={{ scale: 1.01 }}>
            <input
              type="text"
              placeholder="🔍 Search orders by ID, name or phone..."
              className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 shadow-sm"
              style={{ 
                backgroundColor: COLORS.highlight, 
                borderColor: COLORS.primary,
                color: COLORS.text
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
        </div>
        
        <div>
          <motion.div whileHover={{ scale: 1.01 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 shadow-sm"
              style={{ 
                backgroundColor: COLORS.highlight, 
                borderColor: COLORS.primary,
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" 
               style={{ borderColor: COLORS.primary }}></div>
        </motion.div>
      ) : filteredOrders.length === 0 ? (
        <motion.div 
          className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-md mx-auto"
          style={{ backgroundColor: COLORS.highlight }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 100,
            damping: 15
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke={COLORS.primary}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.text }}>No Orders Found</h3>
          <p className="mb-4" style={{ color: COLORS.text }}>No orders match your search criteria</p>
          <motion.button
            className="px-4 py-2 rounded-xl"
            style={{ backgroundColor: COLORS.primary, color: "white" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
              className="order-card bg-white rounded-2xl shadow-lg overflow-hidden"
              style={{ backgroundColor: COLORS.highlight }}
              variants={itemVariants}
              whileHover="hover"
            >
              <div 
                className="p-4 cursor-pointer flex flex-wrap items-center justify-between gap-4"
                onClick={() => toggleOrderExpand(order._id)}
              >
                <div className="flex items-center gap-4">
                  {/* Display product image with error handling */}
                  {order.items[0]?.productImage ? (
                    <div className="relative">
                      <img 
                        src={order.items[0].productImage} 
                        alt={order.items[0].productName} 
                        className="w-16 h-16 object-cover rounded-xl border"
                        style={{ borderColor: COLORS.subtle }}
                        onError={handleImageError}
                      />
                      <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
                        <span className="text-xs font-bold" style={{ color: COLORS.accent }}>
                          {order.items.length}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center relative">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
                        <span className="text-xs font-bold" style={{ color: COLORS.accent }}>
                          {order.items.length}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: COLORS.text }}>
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm" style={{ color: COLORS.text }}>
                      {order.name} • {order.phone}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <span className="text-lg font-bold" style={{ color: COLORS.accent }}>
                    ৳{order.totalAmount}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-xs opacity-75" style={{ color: COLORS.text }}>
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
                    style={{ borderColor: COLORS.subtle }}
                  >
                    <div className="p-4">
                      <div className="mb-4">
                        <h4 className="font-semibold mb-3 text-lg" style={{ color: COLORS.text }}>Products</h4>
                        <div className="flex overflow-x-auto pb-2 gap-4">
                          {order.items.map((item, index) => (
                            <motion.div
                              key={index}
                              className="flex-shrink-0 w-28"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ 
                                delay: index * 0.1,
                                type: "spring",
                                stiffness: 100
                              }}
                            >
                              {/* Display product image with error handling */}
                              {item.productImage ? (
                                <img 
                                  src={item.productImage} 
                                  alt={item.productName} 
                                  className="w-28 h-28 object-cover rounded-xl border"
                                  style={{ borderColor: COLORS.subtle }}
                                  onError={handleImageError}
                                />
                              ) : (
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-28 h-28 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              <p className="text-sm font-medium truncate mt-2" style={{ color: COLORS.text }}>
                                {item.productName}
                              </p>
                              <div className="flex justify-between mt-1">
                                <p className="text-xs" style={{ color: COLORS.text }}>
                                  Qty: {item.quantity}
                                </p>
                                <p className="text-xs font-bold" style={{ color: COLORS.accent }}>
                                  ৳{item.price}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <div className="bg-white rounded-xl p-4 shadow-inner">
                          <h4 className="font-semibold mb-2 text-lg" style={{ color: COLORS.text }}>Shipping Info</h4>
                          <div className="text-sm space-y-2" style={{ color: COLORS.text }}>
                            <p><span className="font-medium">Name:</span> {order.name}</p>
                            <p><span className="font-medium">Phone:</span> {order.phone}</p>
                            <p><span className="font-medium">Address:</span> {order.address}</p>
                            <p><span className="font-medium">Area:</span> {order.upazela}, {order.jela}</p>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 shadow-inner">
                          <h4 className="font-semibold mb-2 text-lg" style={{ color: COLORS.text }}>Order Details</h4>
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
                          <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>Update Status</label>
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order._id, e.target.value)}
                            className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 shadow-sm"
                            style={{ 
                              backgroundColor: COLORS.highlight, 
                              borderColor: COLORS.primary,
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
                            className="px-4 py-2 rounded-xl flex items-center gap-2"
                            style={{ backgroundColor: COLORS.subtle, color: 'white' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Excel</span>
                          </motion.button>
                          
                          <motion.button
                            onClick={() => setSelectedOrder(order)}
                            className="px-4 py-2 rounded-xl flex items-center gap-2"
                            style={{ backgroundColor: COLORS.primary, color: 'white' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Details</span>
                          </motion.button>
                          
                          {order.status === "CancellationRequested" && (
                            <motion.button
                              onClick={() => handleApproveCancellation(order._id)}
                              className="px-4 py-2 rounded-xl flex items-center gap-2"
                              style={{ backgroundColor: COLORS.danger, color: 'white' }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: COLORS.highlight }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { 
                  type: "spring", 
                  stiffness: 100,
                  damping: 20
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.9,
                transition: { duration: 0.2 } 
              }}
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold" style={{ color: COLORS.text }}>
                    Order Details • #{selectedOrder._id.slice(-8).toUpperCase()}
                  </h2>
                  <motion.button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-full hover:bg-opacity-20"
                    style={{ backgroundColor: COLORS.primary + '30' }}
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl p-4 shadow-inner">
                      <h3 className="font-semibold mb-3 text-lg" style={{ color: COLORS.text }}>Customer Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm opacity-75">Name</p>
                          <p className="font-medium" style={{ color: COLORS.text }}>{selectedOrder.name}</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-75">Phone</p>
                          <p className="font-medium" style={{ color: COLORS.text }}>{selectedOrder.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-75">Address</p>
                          <p className="font-medium" style={{ color: COLORS.text }}>{selectedOrder.address}</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-75">Area</p>
                          <p className="font-medium" style={{ color: COLORS.text }}>{selectedOrder.upazela}, {selectedOrder.jela}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 shadow-inner">
                      <h3 className="font-semibold mb-3 text-lg" style={{ color: COLORS.text }}>Order Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm opacity-75">Subtotal</span>
                          <span className="font-medium" style={{ color: COLORS.text }}>৳{selectedOrder.totalAmount - selectedOrder.deliveryCharge}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm opacity-75">Delivery</span>
                          <span className="font-medium" style={{ color: COLORS.text }}>৳{selectedOrder.deliveryCharge}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="font-semibold" style={{ color: COLORS.text }}>Total</span>
                          <span className="font-bold text-lg" style={{ color: COLORS.accent }}>৳{selectedOrder.totalAmount}</span>
                        </div>
                        <div className="mt-3">
                          <span className="text-sm opacity-75">Payment Method</span>
                          <p className="font-medium" style={{ color: COLORS.text }}>{selectedOrder.paymentMethod}</p>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm opacity-75">Status</span>
                          <p className={`px-3 py-1 rounded-full inline-block font-medium ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status}
                          </p>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm opacity-75">Order Date</span>
                          <p className="font-medium" style={{ color: COLORS.text }}>
                            {new Date(selectedOrder.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="bg-white rounded-xl p-4 shadow-inner">
                      <h3 className="font-semibold mb-3 text-lg" style={{ color: COLORS.text }}>Products ({selectedOrder.items.length})</h3>
                      <div className="space-y-4">
                        {selectedOrder.items.map((item, index) => (
                          <motion.div 
                            key={index}
                            className="flex gap-4 p-4 rounded-lg border"
                            style={{ borderColor: COLORS.subtle }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {/* Display product image with error handling */}
                            {item.productImage ? (
                              <img 
                                src={item.productImage} 
                                alt={item.productName} 
                                className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                                onError={handleImageError}
                              />
                            ) : (
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-20 h-20 flex-shrink-0 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-lg mb-2" style={{ color: COLORS.text }}>{item.productName}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-sm opacity-75">Size</p>
                                  <p className="font-medium" style={{ color: COLORS.text }}>{item.selectedSize || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm opacity-75">Color</p>
                                  <p className="font-medium" style={{ color: COLORS.text }}>{item.selectedColor || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm opacity-75">Qty</p>
                                  <p className="font-medium" style={{ color: COLORS.text }}>{item.quantity}</p>
                                </div>
                                <div>
                                  <p className="text-sm opacity-75">Price</p>
                                  <p className="font-bold" style={{ color: COLORS.accent }}>৳{item.price}</p>
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
                        className="px-5 py-3 rounded-xl flex items-center gap-2"
                        style={{ backgroundColor: COLORS.subtle, color: 'white' }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Invoice
                      </motion.button>
                      
                      <motion.button
                        onClick={() => {
                          setSelectedOrder(null);
                          setExpandedOrderId(selectedOrder._id);
                        }}
                        className="px-5 py-3 rounded-xl flex items-center gap-2"
                        style={{ backgroundColor: COLORS.primary, color: 'white' }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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