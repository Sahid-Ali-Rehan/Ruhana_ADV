import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import confetti from 'canvas-confetti';
import Navbar from "../Navigations/Navbar";
import Footer from "../Footer/Footer";
import { CheckCircleIcon, ArrowDownTrayIcon, TruckIcon } from "@heroicons/react/24/solid";

// Add this component for image fallback handling
const ImageWithFallback = ({ src, alt, className }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) {
    return (
      <div className={`${className} bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center`}>
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
      
      // Generate invoice after a small delay to allow UI to render
      setTimeout(() => {
        generateInvoice(order, currentDate);
        setInvoiceGenerated(true);
      }, 500);

      // Enhanced confetti with new color scheme
      if (order.paymentMethod === "Stripe") {
        const colors = ['#9E5F57', '#567A4B', '#814B4A', '#97A276', '#F5C9C6'];
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

      // Checkmark animation
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

  // Money formatting function from new version
  const formatMoney = (num) => 
    `Tk. ${Number(num).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Set Background Color
  doc.setFillColor("#efeab3");
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Add Images
  const addImages = () => {
    const topLeftImage = "Invoice/Top-Left-Corner.png";
    const topRightImage = "Invoice/T-Logo.png";
    const topCenterImage = "Invoice/Top-Center.png";
    const centerImage = "Invoice/Center.png";

    doc.addImage(topLeftImage, "PNG", -30, -30, 160, 160); // Top-left corner
    doc.addImage(topRightImage, "PNG", pageWidth - 100, 20, 80, 80); // Top-right logo
    doc.addImage(topCenterImage, "PNG", 100, -80, 350, 250); // Center-top design
    doc.addImage(centerImage, "PNG", (pageWidth - 300) / 2, (pageHeight - 300) / 2, 300, 300); // Central decoration
  };
  addImages();

  // Add Header
  const addHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor("#8d5c51"); // Brown for the main header
    doc.text(`INVOICE`, pageWidth / 2, 120, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Use order ID for invoice number (from new version)
    const invoiceNo = `Invoice No: ${order._id}`;
    const invoiceDate = `Invoice Date: ${new Date().toLocaleDateString()}`;
    const deliveryDateText = `Delivery Date: ${deliveryDate.toDateString()}`;

    // Set the x position to align the text to the right
    const invoiceNoWidth = doc.getTextWidth(invoiceNo);
    const invoiceDateWidth = doc.getTextWidth(invoiceDate);
    const deliveryDateWidth = doc.getTextWidth(deliveryDateText);

    const rightMargin = 20; // Adjust the margin for right alignment

    // Split the text for styling (parent and child)
    const invoiceNoParts = invoiceNo.split(':');
    const invoiceDateParts = invoiceDate.split(':');
    const deliveryDateParts = deliveryDateText.split(':');

    // Apply the styles
    doc.setTextColor("#8d5c51"); // Brown for the parent (before colon)
    doc.text(invoiceNoParts[0] + ":", pageWidth - Math.max(invoiceNoWidth, invoiceDateWidth, deliveryDateWidth) - rightMargin, 150);

    doc.setTextColor("#556B2F"); // Olive Green for the child (after colon)
    doc.setFont("helvetica", "normal");
    doc.text(invoiceNoParts[1], pageWidth - Math.max(invoiceNoWidth, invoiceDateWidth, deliveryDateWidth) - rightMargin + doc.getTextWidth(invoiceNoParts[0] + ":"), 150);

    doc.setTextColor("#8d5c51"); // Brown for the parent (before colon)
    doc.text(invoiceDateParts[0] + ":", pageWidth - Math.max(invoiceNoWidth, invoiceDateWidth, deliveryDateWidth) - rightMargin, 170);

    doc.setTextColor("#556B2F"); // Olive Green for the child (after colon)
    doc.setFont("helvetica", "normal");
    doc.text(invoiceDateParts[1], pageWidth - Math.max(invoiceNoWidth, invoiceDateWidth, deliveryDateWidth) - rightMargin + doc.getTextWidth(invoiceDateParts[0] + ":"), 170);

    doc.setTextColor("#8d5c51"); // Brown for the parent (before colon)
    doc.text(deliveryDateParts[0] + ":", pageWidth - Math.max(invoiceNoWidth, invoiceDateWidth, deliveryDateWidth) - rightMargin, 190);

    doc.setTextColor("#556B2F"); // Olive Green for the child (after colon)
    doc.setFont("helvetica", "normal");
    doc.text(deliveryDateParts[1], pageWidth - Math.max(invoiceNoWidth, invoiceDateWidth, deliveryDateWidth) - rightMargin + doc.getTextWidth(deliveryDateParts[0] + ":"), 190);
  };
  addHeader();

  // Add Customer Details
  const addCustomerDetails = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor("#8B4513");

    doc.text("Invoice To:", 20, 220);

    doc.setTextColor("#708238");
    doc.text(`${order.name}`, 100, 220);

    doc.setTextColor("#8B4513");
    doc.text("Phone:", 20, 240);
    doc.setTextColor("#708238");
    doc.text(`${order.phone}`, 100, 240);

    doc.setTextColor("#8B4513");
    doc.text("Email:", 20, 260);
    doc.setTextColor("#708238");
    doc.text(`${order.email}`, 100, 260);

    doc.setTextColor("#8B4513");
    doc.text("Address:", 20, 280);
    doc.setTextColor("#708238");
    doc.text(`${order.address}`, 100, 280);
  };
  addCustomerDetails();

  // Add Order Table
  const addOrderTable = () => {
    let yOffset = 320;
    
    // Table Header
    doc.setFont("helvetica", "bold");
    doc.setFillColor("#f4ebb4"); // Olive green color for the header background
    doc.setDrawColor("#8b4513"); // Olive brown for the border
    doc.rect(20, yOffset, pageWidth - 40, 20, "F");
    doc.setTextColor("#8d5c51"); // Dark olive green for the text
    doc.text("No.", 30, yOffset + 15);
    doc.text("Description", 80, yOffset + 15);
    doc.text("Quantity", pageWidth - 170, yOffset + 15, { align: "right" });
    doc.text("Amount", pageWidth - 50, yOffset + 15, { align: "right" });

    // Table Content
    yOffset += 30;
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#6b8e23"); // Olive green color for the content text
    order.items.forEach((item, index) => {
      doc.text(`${index + 1}`, 30, yOffset);
      doc.text(item.productName, 80, yOffset);
      doc.text(`${item.quantity}`, pageWidth - 170, yOffset, { align: "right" });
      
      // Use money formatting from new version
      doc.text(
        formatMoney(item.quantity * item.price), 
        pageWidth - 50, 
        yOffset, 
        { align: "right" }
      );
      
      yOffset += 20;
    });

    // Total Section
    yOffset += 10;
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#8b4513"); // Olive brown color for total section text
    
    // Calculate totals
    const discountAmount = order.discount ? order.totalAmount * (order.discount / 100) : 0;
    const finalAmount = order.totalAmount - discountAmount + order.deliveryCharge;

    doc.text(`Delivery Charge: ${formatMoney(order.deliveryCharge)}`, 20, yOffset);
    yOffset += 20;

    if (order.discount) {
      doc.text(`Discount (${order.discount}%): ${formatMoney(-discountAmount)}`, 20, yOffset);
      yOffset += 20;
    }

    doc.text(`Total Amount: ${formatMoney(finalAmount)}`, 20, yOffset);
  };
  addOrderTable();

  // Footer
  const addFooter = () => {
    const footerText = "Thank you for shopping with Ruhana's Fashion! Payment must be made immediately.";
    const footerY = pageHeight - 50;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor("#ceba98");
    doc.text(footerText, pageWidth / 2, footerY, { align: "center" });

    // Draw the line
    doc.setDrawColor("#8d5c51");
    doc.setLineWidth(2);
    doc.line(20, footerY + 10, pageWidth - 20, footerY + 10);

    // Add the copyright text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#ceba98");
    doc.text("@copyright 2024 reserved by Ruhana's Fashion", pageWidth / 2, footerY + 25, { align: "center" });
  };
  addFooter();

  // Save PDF with order ID in filename (from new version)
  doc.save(`ruhana-invoice-${order._id.slice(-8)}.pdf`);
};

  if (!expectedDelivery) {
    return (
      <div className="min-h-screen bg-[#EFE2B2] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-[#97A276] mb-8 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[#F5C9C6]"></div>
          </div>
          <div className="h-10 bg-[#9E5F57] rounded-xl w-80 mb-6"></div>
          <div className="h-4 bg-[#97A276] rounded w-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFE2B2]">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border-4 border-[#F5C9C6] transform transition-all duration-500 hover:shadow-2xl">
          {/* Floral accents */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#F5C9C6] opacity-70"></div>
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-[#F5C9C6] opacity-40"></div>
          <div className="absolute top-1/4 left-0 w-24 h-48 bg-[#97A276] opacity-10 -rotate-45"></div>
          
          <div className="relative z-10 p-8 md:p-12">
            <div className="text-center mb-10">
              <div 
                ref={checkRef}
                className={`inline-flex items-center justify-center p-4 rounded-full mb-6 ${
                  isAnimating ? 'animate-bounce scale-125' : ''
                } transition-all duration-700`}
                style={{ 
                  background: 'radial-gradient(circle, #97A276, #EFE2B2)',
                  boxShadow: '0 10px 25px rgba(151, 162, 118, 0.5)'
                }}
              >
                <CheckCircleIcon 
                  className={`w-24 h-24 ${
                    order.paymentMethod === "COD" ? "text-[#567A4B]" : "text-[#9E5F57]"
                  } transition-all duration-1000 ${
                    isAnimating ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
                  }`} 
                />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#814B4A]">
                {order.paymentMethod === "COD" ? "Order Confirmed!" : "Payment Successful!"}
                <span className="ml-3">🎉</span>
              </h1>
              
              <p className="text-xl text-[#9E5F57] max-w-2xl mx-auto">
                Your invoice has been downloaded automatically. Thank you for choosing Ruhana Fashion!
              </p>
            </div>

            {/* Order summary card */}
            <div className="mb-10 p-8 rounded-2xl border-2 border-[#97A276] bg-gradient-to-br from-[#EFE2B2]/30 to-[#F5C9C6]/20 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 mb-8 md:mb-0 md:pr-8 md:border-r border-[#97A276]/30">
                  <h2 className="text-2xl font-bold mb-6 text-[#814B4A] flex items-center">
                    <TruckIcon className="w-8 h-8 mr-2 text-[#9E5F57]" />
                    Order Summary
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between pb-3 border-b border-[#97A276]/20">
                      <span className="text-[#9E5F57] font-medium">Order ID:</span>
                      <span className="font-medium text-[#567A4B]">{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-[#97A276]/20">
                      <span className="text-[#9E5F57] font-medium">Payment Method:</span>
                      <span className="font-medium text-[#567A4B] capitalize">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-[#97A276]/20">
                      <span className="text-[#9E5F57] font-medium">Delivery Date:</span>
                      <span className="font-medium text-[#567A4B]">{expectedDelivery.toDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9E5F57] font-medium">Items:</span>
                      <span className="font-medium text-[#567A4B]">{order.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 md:pl-8">
                  <h2 className="text-2xl font-bold mb-6 text-[#814B4A] flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mr-2 text-[#9E5F57]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment Details
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between pb-3 border-b border-[#97A276]/20">
                      <span className="text-[#9E5F57] font-medium">Subtotal:</span>
                      <span className="font-medium text-[#567A4B]">Tk. {order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-[#97A276]/20">
                      <span className="text-[#9E5F57] font-medium">Delivery:</span>
                      <span className="font-medium text-[#567A4B]">Tk. {order.deliveryCharge.toFixed(2)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between pb-3 border-b border-[#97A276]/20">
                        <span className="text-[#9E5F57] font-medium">Discount:</span>
                        <span className="font-medium text-[#567A4B]">-Tk. {(order.totalAmount * (order.discount / 100)).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2">
                      <span className="text-lg font-bold text-[#814B4A]">Total:</span>
                      <span className="text-xl font-bold text-[#567A4B]">
                        Tk. {(order.totalAmount + order.deliveryCharge - (order.discount ? order.totalAmount * (order.discount / 100) : 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order items preview - FIXED IMAGE DISPLAY */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6 text-[#814B4A]">Your Items</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.items.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center p-4 bg-[#F5C9C6]/20 rounded-xl border border-[#97A276]/30">
                    {/* Use ImageWithFallback component here */}
                    <ImageWithFallback 
                      src={item.productImage} 
                      alt={item.productName} 
                      className="w-16 h-16 object-cover rounded-xl mr-4"
                    />
                    <div>
                      <h3 className="font-medium text-[#814B4A]">{item.productName}</h3>
                      <p className="text-sm text-[#9E5F57]">Qty: {item.quantity} | Tk. {item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                className="flex items-center justify-center gap-3 py-5 px-10 bg-[#9E5F57] hover:bg-[#814B4A] text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.03] shadow-lg hover:shadow-xl"
                onClick={() => {
                  localStorage.removeItem("orderSuccess");
                  navigate("/my-profile");
                }}
              >
                Track Your Order
                <TruckIcon className="w-6 h-6" />
              </button>
              
              <button
                className="flex items-center justify-center gap-3 py-5 px-10 bg-[#97A276] hover:bg-[#567A4B] text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.03] shadow-lg hover:shadow-xl"
                onClick={() => generateInvoice(order, expectedDelivery)}
              >
                Download Invoice
                <ArrowDownTrayIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Success;