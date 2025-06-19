import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiUser, FiPackage, FiTruck, FiCheckCircle, FiClock } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);


const MyProfile = () => {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  
  const formRef = useRef(null);
  const detailsRef = useRef(null);
  const statusRef = useRef(null);
  const deleteRef = useRef(null);

  useEffect(() => {
    // Fetch user profile data
// Update the fetchProfile function inside useEffect
const fetchProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      toast.error("No authentication token found");
      return;
    }

    // Decode the token to get user ID
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const userId = decodedToken?.id;

    if (!userId) {
      toast.error("Invalid token format");
      return;
    }

    const response = await axios.get(
      `https://original-collections.onrender.com/api/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Correctly access the user data from response
    setProfileData(response.data.user);

  } catch (error) {
    toast.error("Failed to load profile data");
    console.error("Profile fetch error:", error);
  }
};
    fetchProfile();

    // Initial animations
    gsap.fromTo(
      ".profile-section",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.3,
        scrollTrigger: {
          trigger: ".profile-container",
          start: "top center",
        },
      }
    );

    gsap.fromTo(
      formRef.current,
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        scrollTrigger: {
          trigger: formRef.current,
          start: "top 80%",
        },
      }
    );
  }, []);

  const animateOrderSections = () => {
    gsap.fromTo(
      [detailsRef.current, statusRef.current, deleteRef.current],
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
      }
    );
  };

  const handleTrackOrder = async () => {
    if (!orderId.trim()) {
      toast.error("Please enter an order ID");
      return;
    }
  
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://original-collections.onrender.com/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Order data received:", response.data);  // Debugging line to inspect response data
      if (response.data) {
        setOrder(response.data);
        setTimeout(animateOrderSections, 100);
      }
    } catch (error) {
      toast.error("Order not found. Please check your Order ID");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusProgress = () => {
    const statusOrder = ["Pending", "Confirm", "Shipped", "Delivered"];
    const currentIndex = statusOrder.indexOf(order?.status || "");
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };


  // Add this function inside the MyProfile component
const handleCancelRequest = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    const response = await axios.put(
      `https://original-collections.onrender.com/api/orders/request-cancel/${order._id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data) {
      toast.success("Cancellation request sent to admin");
      setOrder({ ...order, status: "CancellationRequested" });
    }
  } catch (error) {
    toast.error("Failed to request cancellation");
    console.error(error);
  }
};



  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 profile-container">
      <div className="max-w-6xl mx-auto">
        {/* User Profile Section */}
        {profileData && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 mb-12 border border-blue-100 profile-section">
            <div className="flex items-center gap-6 mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <FiUser className="text-4xl text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">{profileData.fullname}</h2>
                <p className="text-gray-600 mt-1">{profileData.email}</p>
                <p className="text-gray-600">{profileData.phonenumber}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-center">
  {/* <div className="bg-white p-4 rounded-xl border border-blue-100">
    <p className="text-sm text-gray-500 mb-1">Total Orders</p>
    <p className="text-2xl font-bold text-gray-800">
      {profileData.orders?.length || 0}
    </p>
  </div> */}
  <div className="bg-white p-4 rounded-xl border border-blue-100">
    <p className="text-sm text-gray-500 mb-1">Member Since</p>
    <p className="text-2xl font-bold text-gray-800">
      {new Date(profileData.createdAt).getFullYear()}
    </p>
  </div>
  <div className="bg-white p-4 rounded-xl border border-blue-100">
    <p className="text-sm text-gray-500 mb-1">Account Status</p>
    <p className="text-2xl font-bold text-green-600">
      {profileData.isActive ? 'Active' : 'Inactive'}
    </p>
  </div>
</div>
          </div>
        )}

        {/* Order Tracking Section */}
        <div className="profile-section">
          <div ref={formRef} className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiPackage className="text-primary" /> Track Your Order
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Your Order ID"
                className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all placeholder-gray-400"
              />
              <button
                onClick={handleTrackOrder}
                disabled={loading}
                className="px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark disabled:bg-gray-400 transition-all flex items-center gap-2 justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <FiTruck className="text-xl" /> Track Order
                  </>
                )}
              </button>
            </div>
          </div>

          {order && (
            <div className="space-y-8">
              {/* Order Details */}
              <div ref={detailsRef} className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiPackage className="text-primary" /> Order Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="w-24 font-semibold text-gray-600">Order ID:</span>
                      <span className="font-mono text-primary/80">{order._id}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-24 font-semibold text-gray-600">Address:</span>
                      <span>{order.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-24 font-semibold text-gray-600">Jela:</span>
                      <span>{order.jela}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="w-24 font-semibold text-gray-600">Payment:</span>
                      <span className="capitalize">{order.paymentMethod}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-24 font-semibold text-gray-600">Upazela:</span>
                      <span>{order.upazela}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-24 font-semibold text-gray-600">Total:</span>
                      <span className="text-primary font-bold">TK. {order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div ref={statusRef} className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiClock className="text-primary" /> Order Status
                </h3>
                <div className="relative pt-8">
                  <div className="absolute h-2 bg-gray-100 w-full top-8 left-0 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-500"
                      style={{ width: `${getStatusProgress()}%` }}
                    />
                  </div>
                  <div className="flex justify-between">
                    {["Pending", "Confirm", "Shipped", "Delivered"].map((status) => (
                      <div key={status} className="flex flex-col items-center relative">
                        <div
                          className={`w-10 h-10 rounded-full mb-2 flex items-center justify-center transition-all ${
                            order.status === status
                              ? "bg-primary text-white shadow-lg"
                              : "bg-white border-4 border-gray-200 text-gray-400"
                          }`}
                        >
                          {order.status === status ? (
                            <FiCheckCircle className="text-xl" />
                          ) : (
                            ["Pending", "Confirm", "Shipped", "Delivered"].indexOf(status) + 1
                          )}
                        </div>
                        <span className={`text-sm font-medium ${order.status === status ? "text-primary" : "text-gray-500"}`}>
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tracking Information */}
<div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
    <FiTruck className="text-primary" /> Live Tracking Information
  </h3>
  <p className="text-gray-600">
    Your order tracking link will be sent via SMS to {profileData?.phonenumber} once the shipment is on its way. Please check your messages for real-time updates.
  </p>
</div>

              {/* ... rest of the order sections with similar styling improvements ... */}

              {/* Cancellation Section */}
             
{order && !["Shipped", "Delivered", "CancellationRequested"].includes(order.status) && (
  <div ref={deleteRef} className="bg-white rounded-2xl shadow-lg p-8 border border-red-100 text-center">
    <h3 className="text-xl font-bold text-red-600 mb-4">Need to Cancel Order?</h3>
    <p className="text-gray-600 mb-6">
      You can request cancellation before shipping. Contact support for immediate assistance.
    </p>
    <button
      onClick={handleCancelRequest}
      className="px-6 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-400"
    >
      Request Cancellation
    </button>
  </div>
)}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );

};

export default MyProfile;
