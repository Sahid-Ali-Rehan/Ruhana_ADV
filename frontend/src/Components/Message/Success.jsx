import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import confetti from 'canvas-confetti';
import Navbar from "../Navigations/Navbar";
import Footer from "../Footer/Footer";
import Loading from '../Loading/Loading';
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const Success = () => {
  const navigate = useNavigate();
  const order = JSON.parse(localStorage.getItem("orderSuccess"));
  const [expectedDelivery, setExpectedDelivery] = useState(null);

  useEffect(() => {
    if (order) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 7);
      setExpectedDelivery(currentDate);
      generateInvoice(order, currentDate);

      if (order.paymentMethod === "Stripe") {
        const count = 200;
        const defaults = { origin: { y: 0.7 }, zIndex: 2000 };

        const fire = (particleRatio, opts) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
          });
        };

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      }
    } else {
      navigate("/");
    }
  }, []);

const generateInvoice = (order, deliveryDate) => {
    const doc = new jsPDF("portrait", "px", "a4");
  
    // Page Dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
  
    // Set Background Color
    doc.setFillColor("#D7F4FA");
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  
    // Add Images
    const addImages = () => {
      const topRightImage = "Invoice/T-Logo.png";
      const centerImage = "Invoice/Center.png";
  
      doc.addImage(topRightImage, "PNG", pageWidth - 100, 20, 80, 80); // Top-right logo
      doc.addImage(centerImage, "PNG", (pageWidth - 300) / 2, (pageHeight - 300) / 2, 300, 300); // Central decoration
    };
    addImages();
  
    // Add Header
    const addHeader = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor("#F68C1F"); // Heading color
      doc.text(`INVOICE`, pageWidth / 2, 120, { align: "center" });
  
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
  
      // Text contents
      const invoiceNo = `Order Id: ${order._id}`;
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
      doc.setTextColor("#F68C1F"); // Heading color
      doc.text(invoiceNoParts[0] + ":", pageWidth - Math.max(invoiceNoWidth, invoiceDateWidth, deliveryDateWidth) - rightMargin, 150);
  
      doc.setTextColor("#56C5DC"); // Sub-medium text color
      doc.setFont("helvetica", "normal");
      doc.text(invoiceNoParts[1], pageWidth - Math.max(invoiceNoWidth, invoiceDateWidth, deliveryDateWidth) - rightMargin + doc.getTextWidth(invoiceNoParts[0] + ":"), 150);
  
      doc.setTextColor("#F68C1F"); // Heading color
      doc.text(invoiceDateParts[0] + ":", pageWidth - Math.max(invoiceNoWidth, invoiceDateWidth, deliveryDateWidth) - rightMargin, 170);
  
      doc.setTextColor("#56C5DC"); // Sub-medium text color
      doc.setFont("helvetica", "normal");
      doc.text(invoiceDateParts[1], pageWidth - Math.max(invoiceNoWidth, invoiceDateWidth, deliveryDateWidth) - rightMargin + doc.getTextWidth(invoiceDateParts[0] + ":"), 170);
  
      doc.setTextColor("#F68C1F"); // Heading color
      doc.text(deliveryDateParts[0] + ":", pageWidth - Math.max(invoiceNoWidth, invoiceDateWidth, deliveryDateWidth) - rightMargin, 190);
  
      doc.setTextColor("#56C5DC"); // Sub-medium text color
      doc.setFont("helvetica", "normal");
      doc.text(deliveryDateParts[1], pageWidth - Math.max(invoiceNoWidth, invoiceDateWidth, deliveryDateWidth) - rightMargin + doc.getTextWidth(deliveryDateParts[0] + ":"), 190);
    };
    addHeader();
  
    // Add Customer Details
    const addCustomerDetails = () => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#F68C1F");
  
      doc.text("Invoice To:", 20, 220);
  
      doc.setTextColor("#7D835F"); // Baby text color
      doc.text(`${order.name}`, 100, 220);
  
      doc.setTextColor("#F68C1F"); // Heading color
      doc.text("Phone:", 20, 240);
      doc.setTextColor("#7D835F"); // Baby text color
      doc.text(`${order.phone}`, 100, 240);
  
      doc.setTextColor("#F68C1F"); // Heading color
      doc.text("Address:", 20, 260);
      doc.setTextColor("#7D835F"); // Baby text color
      doc.text(`${order.address}`, 100, 260);
    };
    addCustomerDetails();
  
    // Add Order Table
const addOrderTable = () => {
  let yOffset = 320;

// Table Header
doc.setFont("helvetica", "bold");
doc.setDrawColor("#F68C1F"); // Heading color for the border
doc.rect(20, yOffset, pageWidth - 40, 20, "D"); // Only draw border, no fill
doc.setTextColor("#F68C1F"); // Heading color for the text
doc.text("No.", 30, yOffset + 15);
doc.text("Description", 80, yOffset + 15);
doc.text("Quantity", pageWidth - 170, yOffset + 15, { align: "right" });
doc.text("Amount", pageWidth - 50, yOffset + 15, { align: "right" });

  // Table Content
  yOffset += 30;
  order.items.forEach((item, index) => {
    // For product names with special characters
    doc.setFont("times", "normal"); // Switch to Times font
    doc.text(item.productName, 80, yOffset);
    
    // Reset font for other columns
    doc.setFont("helvetica", "normal");
    doc.text(`${index + 1}`, 30, yOffset);
    doc.text(`${item.quantity}`, pageWidth - 170, yOffset, { align: "right" });
    doc.text(`Tk. ${item.quantity * item.price}`, pageWidth - 50, yOffset, { align: "right" });
    
    yOffset += 20;
  });

  // Total Section
  yOffset += 10;
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#F68C1F"); // Heading color for total section text
  doc.text(`Delivery Charge: Tk. ${order.deliveryCharge}`, 20, yOffset);
  yOffset += 20;

  // Calculate the discount if applicable
  const discountAmount = order.discount ? order.totalAmount * (order.discount / 100) : 0;
  const finalAmount = order.totalAmount - discountAmount;

  // Total Amount after discount
  doc.text(`Total Amount (after discount): Tk. ${finalAmount}`, 20, yOffset);
};
    addOrderTable();


    // Add Order Display Button Section
const addOrderDisplayButton = () => {
  let yOffset = pageHeight - 100; // Position above footer
  const buttonWidth = 150;
  const buttonHeight = 25;
  const buttonX = (pageWidth - buttonWidth) / 2;

  // Button Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor("#F68C1F");
  doc.textWithLink("Track Order", pageWidth / 2, yOffset + 15, {
    url: "https://original-collections.onrender.com/my-profile",
    align: "center",
  });

  // Underline Effect (Hover Simulation)
  doc.setDrawColor("#F68C1F");
  doc.line(pageWidth / 2 - 40, yOffset + 18, pageWidth / 2 + 40, yOffset + 18);
};

addOrderDisplayButton();

  
    // Footer
    const addFooter = () => {
      const footerText = "Thank you for shopping with Original Collections! Payment must be made immediately.";
      const footerY = pageHeight - 50;
  
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor("#7D835F"); // Baby text color for footer
      doc.text(footerText, pageWidth / 2, footerY, { align: "center" });
  
      // Draw the line
      doc.setDrawColor("#F68C1F"); // Heading color for the line
      doc.setLineWidth(2);
      doc.line(20, footerY + 10, pageWidth - 20, footerY + 10);
  
      // Add the copyright text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor("#7D835F"); // Baby text color for copyright text
      doc.text("@copyright 2025 reserved by Original Collections", pageWidth / 2, footerY + 25, { align: "center" });
    };
    addFooter();
  
    // Save PDF
    doc.save("invoice.pdf");
  };


  if (!expectedDelivery) return <Loading />;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
        <div className="text-center mb-8">
          {order.paymentMethod === "COD" ? (
            <div className="animate-bounce">
              <CheckCircleIcon className="h-32 w-32 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-green-600 mb-4">
                Order Confirmed!
              </h2>
            </div>
          ) : (
            <h2 className="text-3xl font-bold text-blue-600 mb-4">
              Payment Successful! 🎉
            </h2>
          )}
          <p className="text-lg text-gray-600 mb-6">
            Your invoice has been downloaded successfully
          </p>
        </div>

        <div className="border border-emerald-100 p-6 rounded-xl bg-gradient-to-br from-green-50 to-blue-50 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h3>
          <div className="space-y-3">
            <p className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{order.name}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Expected Delivery:</span>
              <span className="font-medium">{expectedDelivery.toDateString()}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-blue-600">Tk. {order.totalAmount}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium capitalize">{order.paymentMethod}</span>
            </p>
          </div>
        </div>

        <button
          className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          onClick={() => {
            localStorage.removeItem("orderSuccess");
            navigate("/my-profile");
          }}
        >
          Track Your Order
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Success;

