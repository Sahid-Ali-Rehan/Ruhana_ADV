import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import confetti from 'canvas-confetti';
import Navbar from "../Navigations/Navbar";
import Footer from "../Footer/Footer";
import { 
  CheckCircleIcon, 
  ArrowDownTrayIcon, 
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/solid";
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
  const [orderCount, setOrderCount] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  
  useEffect(() => {
    if (order) {
      localStorage.setItem(`order_${order._id.slice(-8).toUpperCase()}`, order._id);
    }
  }, [order]);

  useEffect(() => {
    const fetchOrderCount = async (retries = 3) => {
      try {
        const response = await fetch('/api/orders/count');
        if (!response.ok) throw new Error('Failed to fetch order count');
        const data = await response.json();
        setOrderCount(data.count || 0);
        setFetchError(false);
      } catch (error) {
        console.error('Error fetching order count:', error);
        if (retries > 0) {
          setTimeout(() => fetchOrderCount(retries - 1), 1500);
        } else {
          setOrderCount(0);
          setFetchError(true);
        }
      }
    };

    if (order) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 7);
      setExpectedDelivery(currentDate);
      
      fetchOrderCount();

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
  }, [navigate]);

  useEffect(() => {
    if (order && expectedDelivery && orderCount !== null && !invoiceGenerated) {
      generateInvoice(order, expectedDelivery, orderCount);
      setInvoiceGenerated(true);
    }
  }, [order, expectedDelivery, orderCount, invoiceGenerated]);

  const handleDownloadInvoice = async () => {
    setIsGenerating(true);
    try {
      if (orderCount === null) {
        try {
          const response = await fetch('/api/orders/count');
          if (!response.ok) throw new Error('Failed to fetch order count');
          const data = await response.json();
          const count = data.count || 0;
          setOrderCount(count);
          generateInvoice(order, expectedDelivery, count);
        } catch (error) {
          console.error('Error fetching order count:', error);
          generateInvoice(order, expectedDelivery, 0);
        }
      } else {
        generateInvoice(order, expectedDelivery, orderCount);
      }
    } catch (error) {
      console.error("Invoice generation failed:", error);
      alert("Failed to generate invoice. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInvoice = (order, deliveryDate, count) => {
    try {
      const doc = new jsPDF("portrait", "px", "a4");
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

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
  const topLeftImage = "Invoice/Top-Left-Corner.png";
  const topRightImage = "Invoice/T-Logo.png";
  const topCenterImage = "Invoice/Top-Center.png";

  try {
    doc.addImage(topLeftImage, "PNG", -30, -30, 160, 160);
    doc.addImage(topRightImage, "PNG", pageWidth - 100, 20, 80, 80);
    doc.addImage(topCenterImage, "PNG", 100, -80, 350, 250);

    // Add "Jonab-BD" Text to Top Left
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor("#000000");
    doc.text("Jonab-BD", 40, 65); // Adjust padding as needed
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
      const invoiceNo = `Invoice No: #${count}`;
      const orderId = `Order ID: ${order._id.slice(-8).toUpperCase()}`;
      const invoiceDate = `Invoice Date: ${new Date().toLocaleDateString()}`;
      const deliveryDateText = `Delivery Date: ${deliveryDate.toDateString()}`;

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
      const customerInfo = [
        order.name,
        `${order.phone}`,
        `${order.jela}`,
        `${order.upazela}`,
        `${order.address}`
      ];

      doc.setFont("helvetica", "bold");
      doc.setTextColor("#000000");
      doc.setFontSize(12);
      doc.text("BILLED TO:", 20, 150);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#333333");
      doc.setFontSize(10);
      let infoY = 170;
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
      // FIXED: Use selectedSize and selectedColor
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

        // Calculation line - FIXED: Show final price instead of discount amount
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

      doc.save(`jonab-invoice-${count}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      throw new Error("Failed to generate PDF");
    }
  };

  if (!order || !expectedDelivery) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-8">
            <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Order Information Missing</h2>
          <p className="text-gray-600 mb-6">
            We couldn't retrieve your order details. This might be because:
          </p>
          <ul className="text-left text-gray-600 mb-8 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Your session expired</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>You refreshed the page after checkout</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>There was an issue with order processing</span>
            </li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/my-profile")}
              className="px-6 py-3 bg-black text-white rounded-lg font-medium"
            >
              Check Order History
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg font-medium"
            >
              Continue Shopping
            </button>
          </div>
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
                Your invoice has been generated
              </motion.p>
            </div>

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
                      <span className="text-gray-600">Invoice ID:</span>
                      <span className="font-medium text-gray-900">
                        {orderCount !== null ? `#${orderCount}` : (
                          <span className="flex items-center text-yellow-600">
                            <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
                            Loading...
                          </span>
                        )}
                      </span>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2V9H3V7h18v2z" />
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

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-light tracking-tight mb-6 text-gray-900">Your Selection</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.items.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <ImageWithFallback 
                      src={item.productImage} 
                      alt={item.productName} 
                      className="w-16 h-16 object-cover rounded-lg mr-4 border border-gray-200"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity} | Tk. {item.price.toFixed(2)}</p>
                      {/* FIXED: Size/color display */}
                      <p className="text-xs text-gray-500 mt-1">
                        {item.size && item.size !== 'Free' ? `${item.size}${item.color ? ' | ' : ''}` : ''}
                        {item.color || (item.size ? '' : 'Standard')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

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
                  navigate("/my-profile", { state: { orderId: order._id } });
                }}
              >
                Track Your Order
                <TruckIcon className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-3 py-4 px-8 bg-white border border-gray-900 text-gray-900 rounded-lg font-medium tracking-wide shadow-[0_0_0_0_#000] hover:shadow-[4px_4px_0_0_#000] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleDownloadInvoice}
                disabled={isGenerating || fetchError}
              >
                {isGenerating ? (
                  <span className="flex items-center">
                    <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </span>
                ) : fetchError ? (
                  <span className="flex items-center text-red-600">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                    Failed - Try Again
                  </span>
                ) : (
                  <span className="flex items-center">
                    Download Invoice
                    <ArrowDownTrayIcon className="w-5 h-5 ml-2" />
                  </span>
                )}
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