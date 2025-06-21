import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiUser, FiPackage, FiTruck, FiCheckCircle, FiClock, FiChevronRight, FiX } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

const MyProfile = () => {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showFloral, setShowFloral] = useState(true);
  
  const formRef = useRef(null);
  const detailsRef = useRef(null);
  const statusRef = useRef(null);
  const deleteRef = useRef(null);
  const floralRef = useRef(null);
  const containerRef = useRef(null);
  const tabsRef = useRef([]);

  // Floral animation config
  const floralPaths = [
    "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
    "M12 2c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6z",
    "M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"
  ];

  useEffect(() => {
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          toast.error("No authentication token found");
          return;
        }

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken?.id;

        if (!userId) {
          toast.error("Invalid token format");
          return;
        }

        const response = await axios.get(
          `https://ruhana-adv.onrender.com/api/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProfileData(response.data.user);

      } catch (error) {
        toast.error("Failed to load profile data");
        console.error("Profile fetch error:", error);
      }
    };
    
    fetchProfile();

    // Initial animations
    gsap.fromTo(".profile-section", 
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

    gsap.fromTo(formRef.current, 
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

    // Animate floral elements
    if (showFloral && floralRef.current) {
      gsap.fromTo(floralRef.current.children, 
        { 
          scale: 0, 
          opacity: 0,
          transformOrigin: "center" 
        },
        {
          scale: 1,
          opacity: 1,
          duration: 1.5,
          stagger: 0.2,
          ease: "elastic.out(1, 0.8)"
        }
      );
    }

    // Tab animation
    gsap.fromTo(tabsRef.current, 
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: "back.out(1.7)"
      }
    );

  }, [showFloral]);

  const animateOrderSections = () => {
    gsap.fromTo([detailsRef.current, statusRef.current, deleteRef.current], 
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
        `https://ruhana-adv.onrender.com/api/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data) {
        setOrder(response.data);
        setTimeout(animateOrderSections, 100);
        
        // Confetti effect animation
        gsap.to(".confetti", {
          y: -50,
          opacity: 0,
          duration: 1.5,
          stagger: 0.05,
          onComplete: () => {
            gsap.set(".confetti", { clearProps: "all" });
          }
        });
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

  const handleCancelRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await axios.put(
        `https://ruhana-adv.onrender.com/api/orders/request-cancel/${order._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        toast.success("Cancellation request sent to admin");
        setOrder({ ...order, status: "CancellationRequested" });
        
        // Animation for cancellation
        gsap.fromTo(deleteRef.current, 
          { backgroundColor: "#F5C9C6", scale: 1.05 },
          {
            backgroundColor: "#EFE2B2",
            scale: 1,
            duration: 1.5,
            ease: "elastic.out(1, 0.8)"
          }
        );
      }
    } catch (error) {
      toast.error("Failed to request cancellation");
      console.error(error);
    }
  };

  const toggleFloral = () => {
    if (showFloral) {
      gsap.to(floralRef.current.children, {
        scale: 0,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        onComplete: () => setShowFloral(false)
      });
    } else {
      setShowFloral(true);
    }
  };

  return (
    <div 
      className="min-h-screen px-4 py-12 profile-container" 
      style={{ backgroundColor: "#EFE2B2" }}
      ref={containerRef}
    >
      {/* Floral Elements */}
      {showFloral && (
        <div ref={floralRef} className="fixed inset-0 pointer-events-none z-0">
          {[...Array(12)].map((_, i) => (
            <svg
              key={i}
              className="absolute confetti"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${20 + Math.random() * 30}px`,
                fill: "#F5C9C6",
                opacity: 0.7
              }}
              viewBox="0 0 24 24"
            >
              <path d={floralPaths[i % floralPaths.length]} />
            </svg>
          ))}
        </div>
      )}

      {/* Floral Toggle */}
      <button
        onClick={toggleFloral}
        className="fixed top-4 left-4 z-10 p-2 rounded-full shadow-md"
        style={{ backgroundColor: "#9E5F57" }}
      >
        {showFloral ? (
          <FiX className="text-white text-xl" />
        ) : (
          <svg className="w-5 h-5" fill="#F5C9C6" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          </svg>
        )}
      </button>

      {/* Logout Button - SIMPLIFIED REDIRECT */}
      <a 
        href="/logout"
        className="fixed top-4 right-4 z-10 px-4 py-2 rounded-full shadow-md flex items-center gap-2 transition-all hover:scale-105"
        style={{ 
          backgroundColor: "#9E5F57", 
          color: "#EFE2B2"
        }}
      >
        Logout
      </a>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Tab Navigation */}
        <div className="flex mb-8 border-b" style={{ borderColor: "#97A276" }}>
          {["profile", "orders", "settings"].map((tab, i) => (
            <button
              key={tab}
              ref={el => tabsRef.current[i] = el}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium rounded-t-lg transition-all ${
                activeTab === tab 
                  ? "text-white" 
                  : "text-gray-700 hover:text-gray-900"
              }`}
              style={{
                backgroundColor: activeTab === tab ? "#9E5F57" : "transparent",
                marginBottom: "-1px"
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* User Profile Section */}
        {activeTab === "profile" && profileData && (
          <div 
            className="rounded-2xl shadow-lg p-8 mb-12 profile-section relative overflow-hidden"
            style={{ backgroundColor: "#F5C9C6" }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              <div 
                className="p-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: "rgba(151, 162, 118, 0.2)" }}
              >
                <FiUser 
                  className="text-4xl" 
                  style={{ color: "#814B4A" }} 
                />
              </div>
              <div className="text-center md:text-left">
                <h2 
                  className="text-3xl font-bold mb-2"
                  style={{ color: "#814B4A" }}
                >
                  {profileData.fullname}
                </h2>
                <p 
                  className="text-lg mb-1"
                  style={{ color: "#9E5F57" }}
                >
                  {profileData.email}
                </p>
                <p 
                  className="text-lg"
                  style={{ color: "#9E5F57" }}
                >
                  {profileData.phonenumber}
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-center mt-8">
              <div 
                className="p-6 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
                style={{ backgroundColor: "rgba(239, 226, 178, 0.7)" }}
              >
                <p 
                  className="text-sm mb-1"
                  style={{ color: "#567A4B" }}
                >
                  Member Since
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: "#814B4A" }}
                >
                  {new Date(profileData.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div 
                className="p-6 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
                style={{ backgroundColor: "rgba(239, 226, 178, 0.7)" }}
              >
                <p 
                  className="text-sm mb-1"
                  style={{ color: "#567A4B" }}
                >
                  Account Status
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: "#567A4B" }}
                >
                  {profileData.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            
            {/* Animated Divider */}
            <div className="flex items-center my-8">
              <div 
                className="h-1 rounded-full flex-grow"
                style={{ backgroundColor: "#97A276" }}
              ></div>
              <div 
                className="mx-4 text-sm italic"
                style={{ color: "#814B4A" }}
              >
                Premium Member
              </div>
              <div 
                className="h-1 rounded-full flex-grow"
                style={{ backgroundColor: "#97A276" }}
              ></div>
            </div>
            
            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { 
                  title: "Edit Profile", 
                  action: () => toast.info("Edit profile feature coming soon!") 
                },
                { 
                  title: "Order History", 
                  action: () => setActiveTab("orders") 
                },
                { 
                  title: "Security Settings", 
                  action: () => setActiveTab("settings") 
                }
              ].map((item, i) => (
                <div 
                  key={i}
                  className="p-5 rounded-xl cursor-pointer transition-all hover:scale-[1.02] group"
                  style={{ backgroundColor: "rgba(151, 162, 118, 0.2)" }}
                  onClick={item.action}
                >
                  <div className="flex justify-between items-center">
                    <span 
                      className="font-medium"
                      style={{ color: "#814B4A" }}
                    >
                      {item.title}
                    </span>
                    <FiChevronRight 
                      className="transition-transform group-hover:translate-x-1"
                      style={{ color: "#9E5F57" }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Tracking Section */}
        {activeTab === "orders" && (
          <div className="profile-section">
            <div 
              ref={formRef} 
              className="rounded-2xl shadow-lg p-8 mb-12 relative overflow-hidden"
              style={{ backgroundColor: "rgba(245, 201, 198, 0.85)" }}
            >
              <h2 
                className="text-2xl font-bold mb-6 flex items-center gap-2"
                style={{ color: "#814B4A" }}
              >
                <FiPackage style={{ color: "#9E5F57" }} /> Track Your Order
              </h2>
              
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter Your Order ID"
                  className="flex-1 px-6 py-4 rounded-xl focus:ring-4 transition-all placeholder-gray-500"
                  style={{ 
                    backgroundColor: "#EFE2B2",
                    border: "2px solid #97A276",
                    color: "#814B4A",
                    focusBorderColor: "#567A4B",
                    focusRingColor: "rgba(86, 122, 75, 0.2)"
                  }}
                />
                
                <button
                  onClick={handleTrackOrder}
                  disabled={loading}
                  className="px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 justify-center disabled:opacity-70"
                  style={{ 
                    backgroundColor: "#9E5F57",
                    color: "#EFE2B2",
                    hoverBackgroundColor: "#567A4B"
                  }}
                >
                  {loading ? (
                    <>
                      <svg 
                        className="animate-spin h-5 w-5" 
                        style={{ color: "#EFE2B2" }}
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        ></circle>
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
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
                <div 
                  ref={detailsRef} 
                  className="rounded-2xl shadow-lg p-8"
                  style={{ backgroundColor: "rgba(239, 226, 178, 0.9)" }}
                >
                  <h3 
                    className="text-xl font-bold mb-6 flex items-center gap-2"
                    style={{ color: "#814B4A" }}
                  >
                    <FiPackage style={{ color: "#9E5F57" }} /> Order Details
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-24 font-semibold"
                          style={{ color: "#567A4B" }}
                        >
                          Order ID:
                        </span>
                        <span 
                          className="font-mono"
                          style={{ color: "#9E5F57" }}
                        >
                          {order._id}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-24 font-semibold"
                          style={{ color: "#567A4B" }}
                        >
                          Address:
                        </span>
                        <span style={{ color: "#814B4A" }}>{order.address}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-24 font-semibold"
                          style={{ color: "#567A4B" }}
                        >
                          Jela:
                        </span>
                        <span style={{ color: "#814B4A" }}>{order.jela}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-24 font-semibold"
                          style={{ color: "#567A4B" }}
                        >
                          Payment:
                        </span>
                        <span 
                          className="capitalize"
                          style={{ color: "#814B4A" }}
                        >
                          {order.paymentMethod}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-24 font-semibold"
                          style={{ color: "#567A4B" }}
                        >
                          Upazela:
                        </span>
                        <span style={{ color: "#814B4A" }}>{order.upazela}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-24 font-semibold"
                          style={{ color: "#567A4B" }}
                        >
                          Total:
                        </span>
                        <span 
                          className="font-bold"
                          style={{ color: "#9E5F57" }}
                        >
                          TK. {order.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div 
                  ref={statusRef} 
                  className="rounded-2xl shadow-lg p-8"
                  style={{ backgroundColor: "rgba(239, 226, 178, 0.9)" }}
                >
                  <h3 
                    className="text-xl font-bold mb-6 flex items-center gap-2"
                    style={{ color: "#814B4A" }}
                  >
                    <FiClock style={{ color: "#9E5F57" }} /> Order Status
                  </h3>
                  
                  <div className="relative pt-8">
                    <div 
                      className="absolute h-2 w-full top-8 left-0 rounded-full"
                      style={{ backgroundColor: "#97A276" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${getStatusProgress()}%`,
                          background: "linear-gradient(90deg, #9E5F57, #567A4B)"
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      {["Pending", "Confirm", "Shipped", "Delivered"].map((status) => (
                        <div key={status} className="flex flex-col items-center relative">
                          <div
                            className={`w-10 h-10 rounded-full mb-2 flex items-center justify-center transition-all ${
                              order.status === status
                                ? "shadow-lg"
                                : "border-4"
                            }`}
                            style={{
                              backgroundColor: order.status === status ? "#9E5F57" : "#EFE2B2",
                              borderColor: "#97A276",
                              color: order.status === status ? "#EFE2B2" : "#814B4A"
                            }}
                          >
                            {order.status === status ? (
                              <FiCheckCircle className="text-xl" />
                            ) : (
                              ["Pending", "Confirm", "Shipped", "Delivered"].indexOf(status) + 1
                            )}
                          </div>
                          <span 
                            className={`text-sm font-medium ${
                              order.status === status ? "font-bold" : ""
                            }`}
                            style={{ 
                              color: order.status === status ? "#9E5F57" : "#814B4A" 
                            }}
                          >
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tracking Information */}
                <div 
                  className="rounded-2xl shadow-lg p-8"
                  style={{ backgroundColor: "rgba(239, 226, 178, 0.9)" }}
                >
                  <h3 
                    className="text-xl font-bold mb-4 flex items-center gap-2"
                    style={{ color: "#814B4A" }}
                  >
                    <FiTruck style={{ color: "#9E5F57" }} /> Live Tracking Information
                  </h3>
                  
                  <p 
                    className="text-lg"
                    style={{ color: "#814B4A" }}
                  >
                    Your order tracking link will be sent via SMS to {profileData?.phonenumber} once the shipment is on its way. Please check your messages for real-time updates.
                  </p>
                  
                  {/* Fake Tracking Map */}
                  <div 
                    className="mt-6 h-48 rounded-xl overflow-hidden relative bg-gradient-to-br from-[#97A276] to-[#9E5F57]"
                    onClick={() => toast.info("Live tracking will activate once your order ships!")}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="animate-pulse w-8 h-8 rounded-full"
                        style={{ backgroundColor: "#F5C9C6" }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Cancellation Section */}
                {order && !["Shipped", "Delivered", "CancellationRequested"].includes(order.status) && (
                  <div 
                    ref={deleteRef} 
                    className="rounded-2xl shadow-lg p-8 text-center"
                    style={{ backgroundColor: "rgba(245, 201, 198, 0.9)" }}
                  >
                    <h3 
                      className="text-xl font-bold mb-4"
                      style={{ color: "#814B4A" }}
                    >
                      Need to Cancel Order?
                    </h3>
                    
                    <p 
                      className="text-lg mb-6"
                      style={{ color: "#814B4A" }}
                    >
                      You can request cancellation before shipping. Contact support for immediate assistance.
                    </p>
                    
                    <button
                      onClick={handleCancelRequest}
                      className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                      style={{ 
                        backgroundColor: "#9E5F57",
                        color: "#EFE2B2",
                        hoverBackgroundColor: "#567A4B"
                      }}
                    >
                      Request Cancellation
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div 
            className="rounded-2xl shadow-lg p-8 profile-section"
            style={{ backgroundColor: "rgba(245, 201, 198, 0.85)" }}
          >
            <h2 
              className="text-2xl font-bold mb-8"
              style={{ color: "#814B4A" }}
            >
              Account Settings
            </h2>
            
            <div className="space-y-6">
              {[
                { 
                  title: "Change Password", 
                  description: "Update your account password regularly",
                  action: () => toast.info("Password change feature coming soon!")
                },
                { 
                  title: "Notification Preferences", 
                  description: "Manage your email and SMS notifications",
                  action: () => toast.info("Notification settings coming soon!")
                },
                { 
                  title: "Privacy Settings", 
                  description: "Control your data privacy and visibility",
                  action: () => toast.info("Privacy controls coming soon!")
                }
              ].map((item, i) => (
                <div 
                  key={i}
                  className="p-6 rounded-xl transition-all hover:scale-[1.02] cursor-pointer flex justify-between items-start"
                  style={{ backgroundColor: "rgba(239, 226, 178, 0.7)" }}
                  onClick={item.action}
                >
                  <div>
                    <h3 
                      className="text-xl font-medium mb-2"
                      style={{ color: "#814B4A" }}
                    >
                      {item.title}
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: "#9E5F57" }}
                    >
                      {item.description}
                    </p>
                  </div>
                  <FiChevronRight 
                    className="text-2xl mt-1 transition-transform hover:translate-x-1"
                    style={{ color: "#9E5F57" }} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;