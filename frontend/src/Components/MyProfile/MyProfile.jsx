import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiUser, FiPackage, FiTruck, FiCheckCircle, FiClock, FiChevronRight, FiLogOut } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

const MyProfile = () => {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  
  const formRef = useRef(null);
  const detailsRef = useRef(null);
  const statusRef = useRef(null);
  const deleteRef = useRef(null);
  const containerRef = useRef(null);
  const tabsRef = useRef([]);

  // Premium animation config
  const geometricPatterns = [
    "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
    "M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2V9H3V7h18v2z"
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

    // Premium animations
    gsap.fromTo(".profile-section", 
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.3,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ".profile-container",
          start: "top center",
        },
      }
    );

    if (formRef.current) {
      gsap.fromTo(formRef.current, 
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 80%",
          },
        }
      );
    }

    // Animate geometric elements
    gsap.fromTo(".geometric-element", 
      { 
        scale: 0, 
        opacity: 0,
        transformOrigin: "center" 
      },
      {
        scale: 1,
        opacity: 0.15,
        duration: 1.8,
        stagger: 0.15,
        ease: "expo.out",
        delay: 0.4
      }
    );

    // Tab animation
    if (tabsRef.current.length > 0) {
      gsap.fromTo(tabsRef.current, 
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)"
        }
      );
    }

    // Create subtle parallax effect for background elements
    gsap.to(".geometric-element", {
      y: (i) => i * 15,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    });

  }, []);

  const animateOrderSections = () => {
    const sections = [];
    if (detailsRef.current) sections.push(detailsRef.current);
    if (statusRef.current) sections.push(statusRef.current);
    if (deleteRef.current) sections.push(deleteRef.current);
    
    if (sections.length > 0) {
      gsap.fromTo(sections, 
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
        }
      );
    }
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
        
        // Premium animation effect
        gsap.to(".premium-highlight", {
          keyframes: [
            { scale: 1.1, duration: 0.3 },
            { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.8)" }
          ],
          stagger: 0.1
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
    if (!order?.status) return 0;
    
    const statusOrder = ["Pending", "Confirm", "Shipped", "Delivered"];
    const currentIndex = statusOrder.indexOf(order.status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  };

  const handleCancelRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !order?._id) {
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
        
        // Premium animation
        if (deleteRef.current) {
          gsap.fromTo(deleteRef.current, 
            { boxShadow: "0 0 0 0px rgba(0,0,0,0.4)" },
            {
              boxShadow: "0 0 0 8px rgba(0,0,0,0)",
              duration: 1,
              ease: "power2.out",
              repeat: 1,
              yoyo: true
            }
          );
        }
      }
    } catch (error) {
      toast.error("Failed to request cancellation");
      console.error(error);
    }
  };

  return (
    <div 
      className="min-h-screen px-4 py-12 profile-container relative overflow-hidden" 
      style={{ 
        backgroundColor: "#FFFFFF",
      }}
      ref={containerRef}
    >
      {/* Add Google Fonts via style tag */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Playfair+Display:wght@500;700&display=swap');
        
        body {
          font-family: 'Montserrat', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', serif;
        }
      `}</style>

      {/* Premium Geometric Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
        {[...Array(15)].map((_, i) => (
          <svg
            key={i}
            className="absolute geometric-element"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${80 + Math.random() * 120}px`,
              fill: "none",
              stroke: "#000000",
              strokeWidth: "0.5px",
              opacity: 0
            }}
            viewBox="0 0 24 24"
          >
            <path d={geometricPatterns[i % geometricPatterns.length]} />
          </svg>
        ))}
      </div>

      {/* Premium Watermark */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.02] pointer-events-none">
        <h1 className="text-[20rem] font-bold tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>
          PREMIUM
        </h1>
      </div>

      {/* Logout Button */}
      <a 
        href="/logout"
        className="fixed top-6 right-6 z-30 px-5 py-2.5 rounded-full flex items-center gap-2 transition-all group"
        style={{ 
          backgroundColor: "#000000",
          color: "#FFFFFF",
          fontWeight: 500
        }}
      >
        <span>Logout</span>
        <FiLogOut className="transition-transform group-hover:translate-x-0.5" />
      </a>

      <div className="max-w-6xl mx-auto relative z-10 pt-4">
        {/* Premium Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight" style={{ 
            letterSpacing: "-0.03em"
          }}>
            Your Exclusive Profile
          </h1>
          <div className="h-0.5 w-24 bg-black mx-auto"></div>
        </div>

        {/* Tab Navigation - Premium Style */}
        <div className="flex justify-center mb-16">
          <div className="flex rounded-full border border-black overflow-hidden">
            {["profile", "orders", "settings"].map((tab, i) => (
              <button
                key={tab}
                ref={el => tabsRef.current[i] = el}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 font-medium transition-all duration-300 ${
                  activeTab === tab 
                    ? "text-white bg-black" 
                    : "text-black bg-transparent hover:bg-gray-100"
                }`}
                style={{
                  fontWeight: 500,
                  letterSpacing: "0.03em"
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* User Profile Section - Premium */}
        {activeTab === "profile" && profileData && (
          <div 
            className="rounded-2xl border border-black mb-24 profile-section relative overflow-hidden"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
          >
            <div className="absolute inset-0 z-0">
              <div className="absolute top-0 right-0 w-64 h-64 border-t border-r border-black opacity-10"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 border-b border-l border-black opacity-10"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-8 p-10">
                <div 
                  className="w-32 h-32 rounded-full flex items-center justify-center border-2 border-black"
                >
                  <FiUser 
                    className="text-5xl text-black" 
                  />
                </div>
                <div className="text-center md:text-left">
                  <h2 
                    className="text-4xl font-bold mb-3"
                  >
                    {profileData.fullname}
                  </h2>
                  <div className="space-y-1">
                    <p 
                      className="text-lg mb-1 flex items-center justify-center md:justify-start gap-2"
                    >
                      <span className="bg-black text-white px-2 py-0.5 text-xs tracking-widest">EMAIL</span>
                      <span className="text-gray-700">{profileData.email}</span>
                    </p>
                    <p 
                      className="text-lg flex items-center justify-center md:justify-start gap-2"
                    >
                      <span className="bg-black text-white px-2 py-0.5 text-xs tracking-widest">PHONE</span>
                      <span className="text-gray-700">{profileData.phonenumber}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 p-8 border-t border-black border-opacity-10">
                <div 
                  className="p-8 rounded-xl border border-black border-opacity-10 transition-all hover:border-opacity-30 cursor-pointer"
                >
                  <p 
                    className="text-sm mb-1 tracking-widest text-gray-500"
                  >
                    MEMBER SINCE
                  </p>
                  <p 
                    className="text-2xl font-bold"
                  >
                    {new Date(profileData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                
                <div 
                  className="p-8 rounded-xl border border-black border-opacity-10 transition-all hover:border-opacity-30 cursor-pointer"
                >
                  <p 
                    className="text-sm mb-1 tracking-widest text-gray-500"
                  >
                    ACCOUNT STATUS
                  </p>
                  <p 
                    className="text-2xl font-bold flex items-center gap-2"
                  >
                    <span className={`w-3 h-3 rounded-full ${profileData.isActive ? 'bg-green-600' : 'bg-red-600'}`}></span>
                    {profileData.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              
              {/* Premium Divider */}
              <div className="flex items-center py-8 px-10 border-y border-black border-opacity-10">
                <div className="h-px bg-black bg-opacity-10 flex-grow"></div>
                <div 
                  className="mx-4 text-sm italic tracking-widest text-gray-500"
                >
                  PREMIUM MEMBER
                </div>
                <div className="h-px bg-black bg-opacity-10 flex-grow"></div>
              </div>
              
              {/* Action Cards - Premium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-10 pt-0">
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
                    className="p-6 rounded-xl cursor-pointer transition-all hover:bg-gray-50 group border border-black border-opacity-0 hover:border-opacity-10"
                    onClick={item.action}
                  >
                    <div className="flex justify-between items-center">
                      <span 
                        className="font-medium text-lg"
                      >
                        {item.title}
                      </span>
                      <FiChevronRight 
                        className="transition-transform group-hover:translate-x-2 text-xl"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Order Tracking Section - Premium */}
        {activeTab === "orders" && (
          <div className="profile-section">
            <div 
              ref={formRef} 
              className="rounded-2xl border border-black p-10 mb-16 relative"
            >
              <h2 
                className="text-3xl font-bold mb-8 flex items-center gap-3"
              >
                <FiPackage className="text-2xl" /> Track Your Order
              </h2>
              
              <div className="flex flex-col md:flex-row gap-4 max-w-3xl">
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter Your Order ID"
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-black focus:outline-none transition-all placeholder-gray-500 text-lg"
                />
                
                <button
                  onClick={handleTrackOrder}
                  disabled={loading}
                  className="px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 justify-center disabled:opacity-70 text-lg border-2 border-black bg-black text-white hover:bg-gray-900"
                >
                  {loading ? (
                    <>
                      <svg 
                        className="animate-spin h-5 w-5" 
                        style={{ color: "#FFFFFF" }}
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
              <div className="space-y-10">
                {/* Order Details - Premium */}
                <div 
                  ref={detailsRef} 
                  className="rounded-2xl border border-black p-10"
                >
                  <h3 
                    className="text-2xl font-bold mb-8 flex items-center gap-3"
                  >
                    <FiPackage className="text-2xl" /> Order Details
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-8 text-lg">
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <span 
                          className="font-semibold min-w-[120px] flex items-center gap-2"
                        >
                          <span className="bg-black h-px w-6"></span>
                          Order ID:
                        </span>
                        <span 
                          className="font-mono break-all"
                        >
                          {order._id}
                        </span>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <span 
                          className="font-semibold min-w-[120px] flex items-center gap-2"
                        >
                          <span className="bg-black h-px w-6"></span>
                          Address:
                        </span>
                        <span>{order.address}</span>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <span 
                          className="font-semibold min-w-[120px] flex items-center gap-2"
                        >
                          <span className="bg-black h-px w-6"></span>
                          Jela:
                        </span>
                        <span>{order.jela}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <span 
                          className="font-semibold min-w-[120px] flex items-center gap-2"
                        >
                          <span className="bg-black h-px w-6"></span>
                          Payment:
                        </span>
                        <span 
                          className="capitalize"
                        >
                          {order.paymentMethod}
                        </span>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <span 
                          className="font-semibold min-w-[120px] flex items-center gap-2"
                        >
                          <span className="bg-black h-px w-6"></span>
                          Upazela:
                        </span>
                        <span>{order.upazela}</span>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <span 
                          className="font-semibold min-w-[120px] flex items-center gap-2"
                        >
                          <span className="bg-black h-px w-6"></span>
                          Total:
                        </span>
                        <span 
                          className="font-bold text-xl"
                        >
                          TK. {order.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Status - Premium */}
                <div 
                  ref={statusRef} 
                  className="rounded-2xl border border-black p-10"
                >
                  <h3 
                    className="text-2xl font-bold mb-8 flex items-center gap-3"
                  >
                    <FiClock className="text-2xl" /> Order Status
                  </h3>
                  
                  <div className="relative pt-8">
                    <div 
                      className="absolute h-1 w-full top-8 left-0 rounded-full bg-gray-200"
                    >
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out bg-black"
                        style={{ width: `${getStatusProgress()}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      {["Pending", "Confirm", "Shipped", "Delivered"].map((status) => (
                        <div key={status} className="flex flex-col items-center relative">
                          <div
                            className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center transition-all border-2 ${
                              order.status === status
                                ? "border-black bg-black text-white"
                                : "border-gray-300 bg-white text-gray-400"
                            }`}
                          >
                            {order.status === status ? (
                              <FiCheckCircle className="text-xl" />
                            ) : (
                              <span className="text-sm font-bold">{["Pending", "Confirm", "Shipped", "Delivered"].indexOf(status) + 1}</span>
                            )}
                          </div>
                          <span 
                            className={`text-sm font-medium ${
                              order.status === status ? "font-bold text-black" : "text-gray-500"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tracking Information - Premium */}
                <div 
                  className="rounded-2xl border border-black p-10"
                >
                  <h3 
                    className="text-2xl font-bold mb-6 flex items-center gap-3"
                  >
                    <FiTruck className="text-2xl" /> Live Tracking Information
                  </h3>
                  
                  <p 
                    className="text-lg mb-8 max-w-3xl"
                  >
                    Your order tracking link will be sent via SMS to {profileData?.phonenumber} once the shipment is on its way. Please check your messages for real-time updates.
                  </p>
                  
                  {/* Premium Tracking Map */}
                  <div 
                    className="mt-6 h-96 rounded-xl overflow-hidden relative border border-black"
                    onClick={() => toast.info("Live tracking will activate once your order ships!")}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="text-center">
                        <div className="mb-4">
                          <div className="inline-block animate-pulse w-16 h-16 rounded-full border-4 border-black border-opacity-20"></div>
                        </div>
                        <p className="text-lg font-medium">Tracking will activate when order ships</p>
                        <p className="text-gray-500 mt-2">Premium GPS tracking enabled</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation Section - Premium */}
                {order && !["Shipped", "Delivered", "CancellationRequested"].includes(order.status) && (
                  <div 
                    ref={deleteRef} 
                    className="rounded-2xl border border-black p-10 text-center"
                  >
                    <h3 
                      className="text-2xl font-bold mb-6"
                    >
                      Need to Cancel Order?
                    </h3>
                    
                    <p 
                      className="text-lg mb-8 max-w-2xl mx-auto"
                    >
                      You can request cancellation before shipping. Contact support for immediate assistance.
                    </p>
                    
                    <button
                      onClick={handleCancelRequest}
                      className="px-8 py-4 rounded-xl font-semibold transition-all border-2 border-black bg-white text-black hover:bg-black hover:text-white text-lg"
                    >
                      Request Cancellation
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab - Premium */}
        {activeTab === "settings" && (
          <div 
            className="rounded-2xl border border-black profile-section p-10"
          >
            <h2 
              className="text-3xl font-bold mb-10"
            >
              Account Settings
            </h2>
            
            <div className="space-y-6 max-w-3xl">
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
                  className="p-6 transition-all hover:bg-gray-50 cursor-pointer flex justify-between items-start border-b border-black border-opacity-10 group"
                  onClick={item.action}
                >
                  <div>
                    <h3 
                      className="text-xl font-medium mb-2 group-hover:underline"
                    >
                      {item.title}
                    </h3>
                    <p 
                      className="text-gray-600"
                    >
                      {item.description}
                    </p>
                  </div>
                  <FiChevronRight 
                    className="text-2xl mt-1 transition-transform group-hover:translate-x-2"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Premium Footer */}
      <div className="text-center py-12 text-gray-500 text-sm tracking-widest">
        PREMIUM EXPERIENCE • EXCLUSIVE MEMBER • {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default MyProfile;