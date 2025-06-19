import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const componentRef = useRef(null);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "https://original-collections.onrender.com/api/orders/all-orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(response.data);
      } catch (err) {
        toast.error("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      const response = await axios.put(
        `https://original-collections.onrender.com/api/orders/update-status/${orderId}`,
        { status }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: response.data.status } : order
        )
      );
      toast.success("Order status updated successfully");
    } catch (error) {
      toast.error("Error updating order status");
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


  // Add this function inside the AllOrders component
const handleApproveCancellation = async (orderId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(
      `https://original-collections.onrender.com/api/orders/cancel/${orderId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success("Order cancelled and deleted");
    setOrders(orders.filter(order => order._id !== orderId));
  } catch (error) {
    toast.error("Failed to approve cancellation");
    console.error(error);
  }
};


useEffect(() => {
  if (orders.length > 0) {
    gsap.utils.toArray("tbody tr").forEach((row) => {
      gsap.from(row, {
        opacity: 0,
        x: -50,
        duration: 0.5,
        scrollTrigger: {
          trigger: row,
          start: "top center+=100",
          toggleActions: "play none none reverse"
        }
      });
    });
  }
}, [orders]);




  return (
    <div className="min-h-screen p-8 bg-[#D7F4FA]" ref={componentRef}>
      <h1 className="text-3xl font-bold mb-6 text-primary">All Orders</h1>
      
      {loading ? (
        <p className="text-center text-secondary">Loading orders...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-xl">
          <table className="w-full bg-white">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-4 text-left min-w-[180px]">Order ID</th>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Items</th>
                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200">
              {orders.length > 0 ? orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-700">{order._id.slice(-8)}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{order.name || "No name"}</span>
                      <span className="text-sm text-gray-500">{order.phone}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {order.items?.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.productName} ({item.quantity})
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 font-medium">৳{order.totalAmount}</td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className="px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirm">Confirm</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg text-primary hover:bg-gray-100"
                        aria-label="View details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleDownload(order)}
                        className="p-2 rounded-lg text-green-600 hover:bg-gray-100"
                        aria-label="Download Excel"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>

                      {order.status === "CancellationRequested" && (
                        <button
                          onClick={() => handleApproveCancellation(order._id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-gray-100"
                          aria-label="Approve cancellation"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                <p><strong>Name:</strong> {selectedOrder.name}</p>
                <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                <p><strong>Address:</strong> {selectedOrder.address}</p>
              </div>
              <div>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                <p><strong>Jela:</strong> {selectedOrder.jela}</p>
                <p><strong>Upazela:</strong> {selectedOrder.upazela}</p>
                <p><strong>Total:</strong> ৳{selectedOrder.totalAmount}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Items</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-500">{item.selectedSize}, {item.selectedColor}</p>
                    </div>
                    <div className="text-right">
                      <p>Qty: {item.quantity}</p>
                      <p className="text-primary">৳{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;