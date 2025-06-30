import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import confetti from 'canvas-confetti';
import Navbar from "../Navigations/Navbar";
import Footer from "../Footer/Footer";
import { CheckCircleIcon, ArrowDownTrayIcon, TruckIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

const ImageWithFallback = ({ src, alt, className }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) {
    return (
      <div className={`${className} bg-gray-200 border border-dashed rounded-lg flex items-center justify-center`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setImgError(true)}
    />
  );
};

const Success = () => {
  const navigate = useNavigate();
  const order = JSON.parse(localStorage.getItem("orderSuccess"));
  const [expectedDelivery, setExpectedDelivery] = useState(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const checkRef = useRef(null);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);

  useEffect(() => {
    if (order) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 7);
      setExpectedDelivery(currentDate);
      
      setTimeout(() => {
        generateInvoice(order, currentDate);
        setInvoiceGenerated(true);
      }, 500);

      if (order.paymentMethod === "Stripe") {
        const colors = ['#000', '#222', '#444', '#666', '#888'];
        const count = 300;
        const defaults = { origin: { y: 0.7 }, zIndex: 2000 };

        const fire = (particleRatio, opts) => {
          confetti({
            ...defaults,
            ...opts,
            colors: colors,
            particleCount: Math.floor(count * particleRatio),
            shapes: ['circle', 'star']
          });
        };

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.5 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      }

      setTimeout(() => {
        setIsAnimating(false);
      }, 1500);
    } else {
      navigate("/");
    }
  }, []);

const generateInvoice = (order, deliveryDate) => {
  const doc = new jsPDF("portrait", "px", "a4");
  
  // Page Dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Money formatting function
  const formatMoney = (num) => 
    `Tk. ${Number(num).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Set Background Color
  doc.setFillColor("#fff");
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Add geometric patterns
  const addPatterns = () => {
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    
    // Top-left triangle
    doc.line(0, 0, 50, 50);
    doc.line(0, 50, 50, 0);
    
    // Bottom-right patterns
    for (let i = 0; i < 8; i++) {
      const x = pageWidth - 20 - i * 15;
      const y = pageHeight - 20;
      doc.line(x, y, x + 10, y - 10);
    }
    
    // Center diamond
    doc.line(pageWidth/2 - 20, pageHeight/2, pageWidth/2, pageHeight/2 - 20);
    doc.line(pageWidth/2, pageHeight/2 - 20, pageWidth/2 + 20, pageHeight/2);
    doc.line(pageWidth/2 + 20, pageHeight/2, pageWidth/2, pageHeight/2 + 20);
    doc.line(pageWidth/2, pageHeight/2 + 20, pageWidth/2 - 20, pageHeight/2);
  };
  addPatterns();

  // Add Header
  const addHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(0); // Pure black
    doc.text(`INVOICE`, pageWidth / 2, 60, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("PREMIUM EDITION", pageWidth / 2, 75, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(150);

    // Invoice details
    const invoiceNo = `Invoice No: ${order._id}`;
    const invoiceDate = `Date: ${new Date().toLocaleDateString()}`;
    const deliveryDateText = `Delivery: ${deliveryDate.toDateString()}`;

    const rightMargin = 30;
    doc.text(invoiceNo, pageWidth - rightMargin, 100, { align: "right" });
    doc.text(invoiceDate, pageWidth - rightMargin, 115, { align: "right" });
    doc.text(deliveryDateText, pageWidth - rightMargin, 130, { align: "right" });
  };
  addHeader();

  // Add Customer Details
  const addCustomerDetails = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("CLIENT DETAILS", 30, 150);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    
    doc.text(`${order.name}`, 30, 170);
    doc.text(`${order.phone}`, 30, 185);
    doc.text(`${order.email || "N/A"}`, 30, 200);
    doc.text(`${order.address}`, 30, 215, { maxWidth: 200 });
  };
  addCustomerDetails();

  // Add Order Table
  const addOrderTable = () => {
    let yOffset = 240;
    
    // Table Header
    doc.setFont("helvetica", "bold");
    doc.setFillColor(245); // Light gray
    doc.setDrawColor(200);
    doc.rect(30, yOffset, pageWidth - 60, 15, "F");
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text("PRODUCT", 35, yOffset + 10);
    doc.text("QTY", pageWidth - 120, yOffset + 10, { align: "right" });
    doc.text("AMOUNT", pageWidth - 40, yOffset + 10, { align: "right" });

    // Table Content
    yOffset += 25;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    order.items.forEach((item, index) => {
      doc.setFontSize(9);
      doc.text(item.productName, 35, yOffset, { maxWidth: 200 });
      doc.text(`${item.quantity}`, pageWidth - 120, yOffset, { align: "right" });
      doc.text(formatMoney(item.quantity * item.price), pageWidth - 40, yOffset, { align: "right" });
      yOffset += 15;
    });

    // Total Section
    yOffset += 20;
    doc.setDrawColor(200);
    doc.line(30, yOffset, pageWidth - 30, yOffset);
    yOffset += 15;
    
    const discountAmount = order.discount ? order.totalAmount * (order.discount / 100) : 0;
    const finalAmount = order.totalAmount - discountAmount + order.deliveryCharge;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Delivery:`, pageWidth - 120, yOffset, { align: "right" });
    doc.text(formatMoney(order.deliveryCharge), pageWidth - 40, yOffset, { align: "right" });
    yOffset += 15;

    if (order.discount) {
      doc.text(`Discount:`, pageWidth - 120, yOffset, { align: "right" });
      doc.text(formatMoney(-discountAmount), pageWidth - 40, yOffset, { align: "right" });
      yOffset += 15;
    }

    doc.setFontSize(12);
    doc.text(`TOTAL:`, pageWidth - 120, yOffset, { align: "right" });
    doc.text(formatMoney(finalAmount), pageWidth - 40, yOffset, { align: "right" });
  };
  addOrderTable();

  // Footer
  const addFooter = () => {
    const footerY = pageHeight - 30;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Thank you for your premium purchase", pageWidth / 2, footerY, { align: "center" });

    // Signature line
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 150, footerY + 10, pageWidth - 30, footerY + 10);
    doc.setFontSize(7);
    doc.text("Authorized Signature", pageWidth - 90, footerY + 15, { align: "center" });
  };
  addFooter();

  // Save PDF
  doc.save(`invoice-${order._id.slice(-8)}.pdf`);
};

  if (!expectedDelivery) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gray-200 mb-8 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gray-300 animate-pulse"></div>
          </div>
          <div className="h-12 bg-gray-300 rounded w-80 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)]"
        >
          {/* Geometric decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-50 to-white border-l border-b border-gray-200 -rotate-45 translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 border-t border-r border-gray-200 translate-x-12 translate-y-12"></div>
          
          <div className="relative z-10 p-8 md:p-12">
            <div className="text-center mb-12">
              <motion.div 
                ref={checkRef}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: isAnimating ? 1.2 : 1,
                  opacity: 1
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300,
                  damping: 15
                }}
                className="inline-flex items-center justify-center p-2 rounded-full mb-6"
              >
                <div className="w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
                  <CheckCircleIcon 
                    className={`w-20 h-20 text-black transition-all duration-1000 ${
                      isAnimating ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
                    }`} 
                  />
                </div>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-light tracking-tight mb-4 text-gray-900"
              >
                {order.paymentMethod === "COD" ? "Order Confirmed" : "Payment Processed"}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-gray-600 max-w-2xl mx-auto"
              >
                Your premium invoice has been generated
              </motion.p>
            </div>

            {/* Order summary card */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-12 p-8 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-2xl font-light tracking-tight mb-6 text-gray-900 flex items-center">
                    <TruckIcon className="w-6 h-6 mr-2 text-gray-700" />
                    Order Details
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between pb-3 border-b border-gray-100">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium text-gray-900">{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-gray-100">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium text-gray-900 capitalize">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-gray-100">
                      <span className="text-gray-600">Delivery Date:</span>
                      <span className="font-medium text-gray-900">{expectedDelivery.toDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium text-gray-900">{order.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-light tracking-tight mb-6 text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment Summary
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between pb-3 border-b border-gray-100">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium text-gray-900">Tk. {order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-gray-100">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-medium text-gray-900">Tk. {order.deliveryCharge.toFixed(2)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between pb-3 border-b border-gray-100">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium text-gray-900">-Tk. {(order.totalAmount * (order.discount / 100)).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-4">
                      <span className="text-lg font-light text-gray-900">Total:</span>
                      <span className="text-xl font-medium text-gray-900">
                        Tk. {(order.totalAmount + order.deliveryCharge - (order.discount ? order.totalAmount * (order.discount / 100) : 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order items preview */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-light tracking-tight mb-6 text-gray-900">Your Selection</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.items.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <ImageWithFallback 
                      src={item.productImage} 
                      alt={item.productName} 
                      className="w-16 h-16 object-cover rounded-lg mr-4 border border-gray-200"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity} | Tk. {item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-3 py-4 px-8 bg-black text-white rounded-lg font-medium tracking-wide shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_0_0_rgba(0,0,0,0.2)] transition-all duration-200"
                onClick={() => {
                  localStorage.removeItem("orderSuccess");
                  navigate("/my-profile");
                }}
              >
                Track Your Order
                <TruckIcon className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-3 py-4 px-8 bg-white border border-gray-900 text-gray-900 rounded-lg font-medium tracking-wide shadow-[0_0_0_0_#000] hover:shadow-[4px_4px_0_0_#000] transition-all duration-200"
                onClick={() => generateInvoice(order, expectedDelivery)}
              >
                Download Invoice
                <ArrowDownTrayIcon className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Success;