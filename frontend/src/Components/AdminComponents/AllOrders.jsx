import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";
import { FaTruck, FaDownload, FaFileExcel, FaTrash, FaEdit, FaSearch, FaExternalLinkAlt } from "react-icons/fa";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

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
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          toast.warning("Please log in to view orders");
          return;
        }

        // Fetch orders
        const ordersResponse = await axios.get(
          "https://ruhana-adv.onrender.com/api/orders/all-orders",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Sort orders
        const sortedOrders = ordersResponse.data.sort((a, b) => {
          const dateA = a.createdAt || a._id ? new Date(parseInt(a._id.substring(0, 8), 16) * 1000) : new Date(0);
          const dateB = b.createdAt || b._id ? new Date(parseInt(b._id.substring(0, 8), 16) * 1000) : new Date(0);
          return dateB - dateA;
        });
        
        // Create sequential order numbers (1 = oldest, N = newest)
        const ordersWithSequentialNumbers = sortedOrders.map((order, index, array) => {
          return {
            ...order,
            sequentialNumber: array.length - index
          };
        });
        
        const ordersWithImages = ordersWithSequentialNumbers.map(order => ({
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

    fetchData();
  }, []);
  
  // Toggle order selection
  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  // Select all/deselect all
  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order._id));
    }
  };

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

  // Handle Excel download for single order
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
    
    // Auto size columns
    const colWidths = [
      { wch: 25 }, 
      { wch: 20 }, 
      { wch: 15 }, 
      { wch: 15 }, 
      { wch: 15 }
    ];
    worksheet['!cols'] = colWidths;

    // Add styling
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        
        if (R === 0 || R === 10) { // Header rows
          if (!worksheet[cell_ref]) worksheet[cell_ref] = {};
          if (!worksheet[cell_ref].s) worksheet[cell_ref].s = {};
          worksheet[cell_ref].s = { font: { bold: true } };
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Order Details");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Order_${order._id.slice(-6)}.xlsx`);
  };

  // Handle Excel download for multiple orders
  const handleBulkExcelDownload = () => {
    const workbook = XLSX.utils.book_new();
    
    selectedOrders.forEach(orderId => {
      const order = orders.find(o => o._id === orderId);
      if (!order) return;
      
      const worksheetData = [
        ["Order ID", order._id],
        ["Customer", order.name || "N/A"],
        ["Phone", order.phone || "N/A"],
        ["Total Amount", `TK. ${order.totalAmount}`],
        ["Status", order.status || "N/A"],
        ["Date", formatDateTime(order.createdAt)],
        [],
        ["Product", "Size", "Color", "Qty", "Price"]
      ];
      
      order.items.forEach(item => {
        worksheetData.push([
          item.productName || "Unknown",
          item.selectedSize || "N/A",
          item.selectedColor || "N/A",
          item.quantity,
          `TK. ${item.price}`
        ]);
      });
      
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, `Order_${order._id.slice(-4)}`);
    });
    
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Bulk_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
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

  // Delete multiple orders
  const handleBulkDelete = async () => {
    const isConfirmed = window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`);
    if (!isConfirmed) return;
    
    try {
      const token = localStorage.getItem("token");
      await Promise.all(selectedOrders.map(orderId => 
        axios.delete(
          `https://ruhana-adv.onrender.com/api/orders/cancel/${orderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ));
      
      toast.success(`${selectedOrders.length} orders deleted`);
      setOrders(orders.filter(order => !selectedOrders.includes(order._id)));
      setSelectedOrders([]);
    } catch (error) {
      toast.error("Failed to delete orders");
      console.error(error);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  // Format date with AM/PM and seconds - FIXED DATE FORMAT
  const formatDateTime = (dateString) => {
    if (!dateString) return "Date not available";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      // Get date components
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'short' });
      const day = date.getDate();
      
      // Get time components
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      
      // Convert to 12-hour format with AM/PM
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Handle midnight (0 hours)
      
      return `${day} ${month} ${year} ${hours}:${minutes}:${seconds} ${ampm}`;
    } catch (e) {
      console.error("Invalid date format:", dateString);
      return "Invalid date";
    }
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

  // Generate PDF invoice using old design
const generateInvoiceDocument = (order) => {
  const doc = new jsPDF("portrait", "px", "a4");
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Money formatting function
  const formatMoney = (num) =>
    `Tk. ${Number(num).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // White background
  doc.setFillColor("#FFFFFF");
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Add decorative images
  const addImages = () => {
    const topLeftImage = "/Invoice/Top-Left-Corner.png";
    const topRightImage = "/Invoice/T-Logo.png";
    const topCenterImage = "/Invoice/Top-Center.png";

    try {
      doc.addImage(topLeftImage, "PNG", -30, -30, 160, 160);
      doc.addImage(topRightImage, "PNG", pageWidth - 100, 20, 80, 80);
      doc.addImage(topCenterImage, "PNG", 100, -80, 350, 250);

      // Add "Ruhana Fashions" Text to Top Left
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor("#000000");
      doc.text("Jonab-BD", 40, 65);
    } catch (e) {
      console.log("Image loading error:", e);
    }
  };
  addImages();

  // Invoice Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor("#000000");
  doc.text("INVOICE", pageWidth / 2, 120, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  // Invoice details
  const invoiceNo = `Invoice No: #${order.sequentialNumber}`;
  const orderId = `Order ID: ${order._id.slice(-8).toUpperCase()}`;
  const invoiceDate = `Invoice Date: ${new Date().toLocaleDateString()}`;
  const deliveryDateText = `Delivery Date: ${new Date(order.estimatedDeliveryDate).toDateString()}`;

  const strings = [invoiceNo, orderId, invoiceDate, deliveryDateText];
  const widths = strings.map(str => doc.getTextWidth(str));
  const maxWidth = Math.max(...widths);
  const startX = pageWidth - maxWidth - 20;

  doc.setTextColor("#000000");
  doc.text(invoiceNo, startX, 150);
  doc.text(orderId, startX, 170);
  doc.text(invoiceDate, startX, 190);
  doc.text(deliveryDateText, startX, 210);

  // Customer info
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#000000");
  doc.setFontSize(12);
  doc.text("BILLED TO:", 20, 150);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#333333");
  doc.setFontSize(10);
  let infoY = 170;
  const customerInfo = [
    order.name,
    `${order.phone}`,
    `${order.jela}`,
    `${order.upazela}`,
    `${order.address}`
  ];
  customerInfo.forEach((line) => {
    doc.text(line, 20, infoY);
    infoY += 15;
  });

  // Table Headers
  let yOffset = 260;

  doc.setFont("helvetica", "bold");
  doc.setFillColor("#f0f0f0");
  doc.rect(20, yOffset, pageWidth - 40, 20, "F");
  doc.setTextColor("#000000");
  doc.text("No.", 30, yOffset + 15);
  doc.text("Description", 80, yOffset + 15);
  doc.text("Quantity", pageWidth - 120, yOffset + 15, { align: "right" });
  doc.text("Amount", pageWidth - 50, yOffset + 15, { align: "right" });

  // Order Items
  yOffset += 30;
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#333333");

  order.items.forEach((item, index) => {
    // Use selectedSize and selectedColor
    const sizeText = item.selectedSize && item.selectedSize !== 'Free' ? item.selectedSize : '';
    const colorText = item.selectedColor && item.selectedColor !== 'N/A' ? item.selectedColor : '';
    const description = [item.productName, sizeText, colorText].filter(Boolean).join(' | ') || item.productName;
    
    const itemTotal = item.quantity * item.price;
    const itemDiscount = item.discount ? itemTotal * (item.discount / 100) : 0;
    const itemFinal = itemTotal - itemDiscount;

    doc.text(`${index + 1}`, 30, yOffset);
    doc.text(description, 80, yOffset);
    doc.text(`${item.quantity}`, pageWidth - 120, yOffset, { align: "right" });
    doc.text(formatMoney(itemFinal), pageWidth - 50, yOffset, { align: "right" });

    // Calculation line
    doc.setFontSize(8);
    doc.setTextColor("#666666");
    const calcText = `${item.quantity} × Tk.${item.price.toFixed(2)} = ${formatMoney(itemTotal)}`;
    let discountText = "";
    
    if (itemDiscount > 0) {
      discountText = ` - ${item.discount}% discount = ${formatMoney(itemFinal)}`;
    }
    
    doc.text(calcText + discountText, 80, yOffset + 8);
    doc.setFontSize(10);
    doc.setTextColor("#333333");

    yOffset += 25;
  });

  // Totals
  yOffset += 10;
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#000000");

  const subtotal = order.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.price;
    const discount = item.discount ? itemTotal * (item.discount / 100) : 0;
    return sum + (itemTotal - discount);
  }, 0);
  
  const delivery = order.deliveryCharge;
  const orderDiscount = order.discount ? subtotal * (order.discount / 100) : 0;
  const finalAmount = subtotal - orderDiscount + delivery;

  doc.text(`Subtotal: ${formatMoney(subtotal)}`, pageWidth - 50, yOffset, { align: "right" });
  yOffset += 20;

  if (orderDiscount > 0) {
    doc.text(`Discount (${order.discount}%): -${formatMoney(orderDiscount)}`, pageWidth - 50, yOffset, { align: "right" });
    yOffset += 20;
  }

  doc.text(`Delivery Charge: ${formatMoney(delivery)}`, pageWidth - 50, yOffset, { align: "right" });
  yOffset += 20;

  doc.setFontSize(12);
  doc.text(`Total: ${formatMoney(finalAmount)}`, pageWidth - 50, yOffset, { align: "right" });
  doc.setFontSize(10);

  // Payment note
  yOffset += 30;
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#000000");
  doc.text("Payment Note:", 20, yOffset);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#333333");
  doc.text(`Payment Method: ${order.paymentMethod === "COD" ? "Cash on Delivery" : "Credit Card"}`, 20, yOffset + 15);
  doc.text("Payment must be made immediately upon delivery", 20, yOffset + 30);

  // Footer
  const footerY = pageHeight - 50;
  const footerText = "Thank you for shopping with Jonab-BD!";

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor("#666666");
  doc.text(footerText, pageWidth / 2, footerY, { align: "center" });

  doc.setDrawColor("#000000");
  doc.setLineWidth(0.5);
  doc.line(20, footerY + 10, pageWidth - 20, footerY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#666666");
  doc.text("@copyright 2025 reserved by Jonab-BD", pageWidth / 2, footerY + 25, { align: "center" });

  return doc;
};
  // Download PDF invoice
  const generateInvoice = (order) => {
    const doc = generateInvoiceDocument(order);
    doc.save(`ruhana-invoice-${order.sequentialNumber}.pdf`);
  };

  // Open invoice in new tab
  const openInvoiceInNewTab = async (order) => {
    const doc = generateInvoiceDocument(order);
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    
    window.open(blobUrl, '_blank');
    
    // Clean up after 10 seconds
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 10000);
  };

  // Handle bulk invoice download
  const handleBulkInvoiceDownload = async () => {
    const zip = new JSZip();
    
    for (const orderId of selectedOrders) {
      const order = orders.find(o => o._id === orderId);
      if (!order) continue;
      
      // Generate PDF
      const doc = generateInvoiceDocument(order);
      const pdfBlob = doc.output('blob');
      zip.file(`Invoice_${order.sequentialNumber}.pdf`, pdfBlob);
    }
    
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `Invoices_${new Date().toISOString().slice(0, 10)}.zip`);
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
      
      {/* Bulk Actions Toolbar */}
      {selectedOrders.length > 0 && (
        <motion.div 
          className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-4 shadow-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="font-medium" style={{ color: COLORS.text }}>
            {selectedOrders.length} {selectedOrders.length === 1 ? 'Order' : 'Orders'} Selected
          </span>
          
          <div className="flex flex-wrap gap-3">
            <motion.button
              onClick={handleBulkInvoiceDownload}
              className="px-4 py-2 rounded-lg flex items-center gap-1.5 font-medium text-sm"
              style={{ backgroundColor: COLORS.textSecondary, color: 'white' }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <FaDownload className="w-4 h-4" />
              <span>Download Invoices</span>
            </motion.button>
            
            <motion.button
              onClick={handleBulkExcelDownload}
              className="px-4 py-2 rounded-lg flex items-center gap-1.5 font-medium text-sm"
              style={{ backgroundColor: COLORS.textSecondary, color: 'white' }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <FaFileExcel className="w-4 h-4" />
              <span>Download Excel</span>
            </motion.button>
            
            <motion.button
              onClick={handleBulkDelete}
              className="px-4 py-2 rounded-lg flex items-center gap-1.5 font-medium text-sm"
              style={{ backgroundColor: COLORS.danger, color: 'white' }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <FaTrash className="w-4 h-4" />
              <span>Delete Selected</span>
            </motion.button>
          </div>
          
          <motion.button
            onClick={() => setSelectedOrders([])}
            className="ml-auto px-4 py-2 rounded-lg font-medium text-sm"
            style={{ 
              backgroundColor: COLORS.background, 
              color: COLORS.text,
              border: `1px solid ${COLORS.border}`
            }}
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            Clear Selection
          </motion.button>
        </motion.div>
      )}
      
      {/* Search and Filter Section */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 md:mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="md:col-span-1 flex items-center">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black mr-3"
            checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length}
            onChange={toggleSelectAll}
            disabled={filteredOrders.length === 0}
          />
          <label className="text-sm" style={{ color: COLORS.textSecondary }}>
            Select All
          </label>
        </div>
        
        <div className="md:col-span-2">
          <motion.div 
            whileHover={{ scale: 1.005 }}
            className="relative"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders by ID, name or phone..."
              className="w-full pl-10 pr-4 py-3 md:py-4 rounded-xl border focus:outline-none focus:ring-1 shadow-sm text-base md:text-lg"
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
                  <input 
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                    checked={selectedOrders.includes(order._id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleOrderSelection(order._id);
                    }}
                  />
                  
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
                      Order #{order.sequentialNumber}
                    </h3>
                    <p className="text-sm md:text-base" style={{ color: COLORS.textSecondary }}>
                      {order.name} • {order.phone}
                    </p>
                    <p className="text-xs mt-1" style={{ color: COLORS.textSecondary }}>
                      {formatDateTime(order.createdAt)}
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
                            <p><span className="font-medium">Order Date:</span> {formatDateTime(order.createdAt)}</p>
                            <p><span className="font-medium">Est. Delivery:</span> {new Date(order.estimatedDeliveryDate).toDateString()}</p>
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
                            <FaFileExcel className="w-4 h-4" />
                            <span>Excel</span>
                          </motion.button>
                          
                          <motion.button
                            onClick={() => generateInvoice(order)}
                            className="px-4 py-2 rounded-lg flex items-center gap-1.5 font-medium text-sm"
                            style={{ backgroundColor: COLORS.textSecondary, color: 'white' }}
                            whileHover={{ 
                              scale: 1.03,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FaDownload className="w-4 h-4" />
                            <span>Download</span>
                          </motion.button>
                          
                          {/* New button to open invoice in new tab */}
                          <motion.button
                            onClick={() => openInvoiceInNewTab(order)}
                            className="px-4 py-2 rounded-lg flex items-center gap-1.5 font-medium text-sm"
                            style={{ backgroundColor: COLORS.primary, color: 'white' }}
                            whileHover={{ 
                              scale: 1.03,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FaExternalLinkAlt className="w-4 h-4" />
                            <span>View</span>
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
                              <FaTrash className="w-4 h-4" />
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
                    Order Details • #{selectedOrder.sequentialNumber}
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
                            {formatDateTime(selectedOrder.createdAt)}
                          </p>
                        </div>
                        <div className="mt-3">
                          <span className="text-xs opacity-75">Est. Delivery</span>
                          <p className="font-medium" style={{ color: COLORS.text }}>
                            {new Date(selectedOrder.estimatedDeliveryDate).toDateString()}
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
                        <FaFileExcel className="w-4 h-4" />
                        Download Excel
                      </motion.button>
                      
                      <motion.button
                        onClick={() => generateInvoice(selectedOrder)}
                        className="px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm"
                        style={{ backgroundColor: COLORS.textSecondary, color: 'white' }}
                        whileHover={{ 
                          scale: 1.03,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaDownload className="w-4 h-4" />
                        Download Invoice
                      </motion.button>
                      
                      <motion.button
                        onClick={() => openInvoiceInNewTab(selectedOrder)}
                        className="px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm"
                        style={{ backgroundColor: COLORS.primary, color: 'white' }}
                        whileHover={{ 
                          scale: 1.03,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaExternalLinkAlt className="w-4 h-4" />
                        View Invoice
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
                        <FaEdit className="w-4 h-4" />
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