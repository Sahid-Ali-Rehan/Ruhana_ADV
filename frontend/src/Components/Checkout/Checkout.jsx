import React, { useState, useEffect } from "react";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navigations/Navbar";
import Footer from "../Footer/Footer";
import { LockClosedIcon, CreditCardIcon, ShoppingBagIcon, ShieldCheckIcon, XMarkIcon, TruckIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

// Color palette constants
const COLORS = {
  parchment: "#EFE2B2",
  terracotta: "#9E5F57",
  moss: "#567A4B",
  rust: "#814B4A",
  sage: "#97A276",
  blush: "#F5C9C6"
};

const stripePromise = loadStripe("pk_test_51RSv6HQu2XY94ocpyNXlGLygbvTCIBSFrODrGTvAtAxnQQM0bFDNpC36pJ4EH9cb1GJEKSHigVz6xVWZFeHMZJSV001CPevlli");

const FloatingInput = ({ label, name, type = 'text', required = false, textarea = false, value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      className="relative mb-8 group"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {textarea ? (
        <textarea
          className="peer h-24 w-full rounded-xl border-2 px-6 py-4 focus:outline-none bg-transparent transition-all duration-300 shadow-sm"
          style={{ 
            borderColor: isFocused ? COLORS.terracotta : COLORS.sage,
            color: COLORS.rust,
            backgroundColor: `${COLORS.parchment}80`
          }}
          placeholder=" "
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          rows="4"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      ) : (
        <input
          className="peer h-14 w-full rounded-xl border-2 px-6 py-2 focus:outline-none bg-transparent transition-all duration-300 shadow-sm"
          style={{ 
            borderColor: isFocused ? COLORS.terracotta : COLORS.sage,
            color: COLORS.rust,
            backgroundColor: `${COLORS.parchment}80`
          }}
          type={type}
          placeholder=" "
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      )}
      <motion.label 
        className={`absolute left-4 transition-all duration-300 px-2 ${
          isFocused || value 
            ? 'top-0 text-sm -translate-y-1/2' 
            : 'top-1/2 -translate-y-1/2'
        }`}
        style={{ 
          backgroundColor: COLORS.parchment,
          color: isFocused ? COLORS.terracotta : COLORS.rust 
        }}
        animate={{ 
          y: isFocused || value ? -10 : 0,
          scale: isFocused || value ? 0.95 : 1
        }}
      >
        {label}
      </motion.label>
    </motion.div>
  );
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: "",
    phone: "",
    jela: "",
    upazela: "",
    address: "",
    postalCode: "",
    paymentMethod: "COD",
  });

  const cartItems = JSON.parse(localStorage.getItem('cart_guest')) || [];
  const deliveryCharge = 120;
  const subtotal = cartItems.reduce((acc, item) => acc + item.quantity * item.price * (1 - item.discount / 100), 0);
  const totalPrice = subtotal + deliveryCharge;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (userDetails.paymentMethod === "Stripe") {
      setShowPaymentModal(true);
      return;
    }

    submitOrder();
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      if (!stripe || !elements) {
        throw new Error("Payment system not ready. Please try again.");
      }

      const paymentIntentResponse = await fetch("https://ruhana-adv.onrender.com/api/orders/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice })
      });

      const paymentData = await paymentIntentResponse.json();
      if (!paymentIntentResponse.ok) {
        throw new Error(paymentData.error || "Payment initialization failed");
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.clientSecret, 
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: userDetails.name,
              phone: userDetails.phone,
              address: {
                city: userDetails.jela,
                line1: userDetails.address,
                postal_code: userDetails.postalCode
              }
            }
          }
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      await submitOrder(paymentIntent.id);
      setShowPaymentModal(false);
    } catch (error) {
      toast.error(error.message || "Payment failed");
      setProcessing(false);
    }
  };

  const submitOrder = async (paymentIntentId = null) => {
    try {
      setProcessing(true);
      
      const orderItems = cartItems.map(item => ({
        productId: item._id,
        productName: item.productName,
        productImage: item.images[0],
        productDescription: item.productDescription,
        productCode: item.productCode,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      }));

      const order = {
        items: orderItems,
        deliveryCharge,
        totalAmount: totalPrice,
        status: "Pending",
        estimatedDeliveryDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        ...userDetails,
        paymentIntentId
      };

      const response = await fetch("https://ruhana-adv.onrender.com/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!response.ok) throw new Error("Order submission failed");
      
      const data = await response.json();
      localStorage.setItem('orderSuccess', JSON.stringify(data.order));

      localStorage.removeItem('cart_guest');
      toast.success("Order placed successfully!");
      navigate("/success");

    } catch (error) {
      toast.error(error.message || "Checkout failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: COLORS.parchment }}>
      <Navbar />
      
      {/* Space below navbar */}
      <div className="h-16"></div>

      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="p-8 rounded-2xl shadow-xl text-center"
              style={{ backgroundColor: COLORS.parchment }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-16 w-16 rounded-full border-t-4 mx-auto mb-6"
                style={{ borderColor: COLORS.terracotta }}
              ></motion.div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: COLORS.rust }}>Processing Payment</h3>
              <p className="text-lg" style={{ color: COLORS.terracotta }}>Your order is being securely processed</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="w-full max-w-md relative rounded-2xl p-8 shadow-2xl"
              style={{ backgroundColor: COLORS.parchment }}
            >
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:scale-110 transition-transform"
                style={{ backgroundColor: COLORS.blush }}
              >
                <XMarkIcon className="w-6 h-6" style={{ color: COLORS.rust }} />
              </button>

              <motion.h3 
                className="text-2xl font-bold mb-6 flex items-center gap-2"
                style={{ color: COLORS.rust }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <CreditCardIcon className="w-8 h-8" style={{ color: COLORS.terracotta }} />
                Secure Payment
              </motion.h3>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <CardElement
                    options={{
                      hidePostalCode: true,
                      style: {
                        base: {
                          fontSize: '16px',
                          color: COLORS.rust,
                          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                          '::placeholder': { 
                            color: COLORS.terracotta,
                            fontWeight: '400'
                          },
                          iconColor: COLORS.terracotta
                        },
                        invalid: { 
                          color: '#dc2626',
                          iconColor: '#dc2626'
                        }
                      }
                    }}
                    className="p-4 border-2 rounded-xl"
                    style={{ borderColor: COLORS.sage }}
                  />
                </motion.div>

                <motion.button
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: `0 10px 25px -5px ${COLORS.terracotta}40`
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayment}
                  className="w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center"
                  disabled={processing}
                  style={{ 
                    backgroundColor: COLORS.terracotta, 
                    color: COLORS.parchment 
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.parchment }} />
                      Processing...
                    </div>
                  ) : (
                    `Pay ৳${totalPrice.toFixed(2)}`
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12"
      >
        <LayoutGroup>
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Shipping Details */}
            <motion.div 
              className="lg:w-7/12 rounded-3xl p-8 shadow-xl"
              style={{ 
                backgroundColor: `${COLORS.parchment}cc`, 
                border: `1px solid ${COLORS.sage}80`,
                backdropFilter: 'blur(10px)'
              }}
              layout
              transition={{ type: "spring", damping: 20 }}
            >
              <form onSubmit={handleSubmit} className="space-y-10">
                <motion.div layout>
                  <motion.h2 
                    className="text-2xl font-bold mb-8 flex items-center gap-3 pb-2 border-b"
                    style={{ 
                      color: COLORS.rust,
                      borderColor: COLORS.sage
                    }}
                    layout
                  >
                    <LockClosedIcon className="w-7 h-7" style={{ color: COLORS.terracotta }} />
                    Shipping Information
                  </motion.h2>
                  <div className="grid gap-8 md:grid-cols-2">
                    <FloatingInput label="Full Name" name="name" required value={userDetails.name} onChange={handleInputChange} />
                    <FloatingInput label="Phone Number" name="phone" type="tel" required value={userDetails.phone} onChange={handleInputChange} />
                    <FloatingInput label="District" name="jela" required value={userDetails.jela} onChange={handleInputChange} />
                    <FloatingInput label="Upazila" name="upazela" required value={userDetails.upazela} onChange={handleInputChange} />
                    <div className="md:col-span-2">
                      <FloatingInput label="Full Address" name="address" textarea required value={userDetails.address} onChange={handleInputChange} />
                    </div>
                    <FloatingInput label="Postal Code" name="postalCode" value={userDetails.postalCode} onChange={handleInputChange} />
                  </div>
                </motion.div>

                <motion.div layout>
                  <motion.h2 
                    className="text-2xl font-bold mb-8 flex items-center gap-3 pb-2 border-b"
                    style={{ 
                      color: COLORS.rust,
                      borderColor: COLORS.sage
                    }}
                    layout
                  >
                    <CreditCardIcon className="w-7 h-7" style={{ color: COLORS.terracotta }} />
                    Payment Method
                  </motion.h2>
                  <select
                    className="w-full rounded-xl border-2 px-6 py-4 focus:ring-4 transition-all shadow-sm"
                    style={{ 
                      borderColor: COLORS.sage,
                      color: COLORS.rust,
                      backgroundColor: `${COLORS.parchment}80`
                    }}
                    value={userDetails.paymentMethod}
                    onChange={handleInputChange}
                    name="paymentMethod"
                  >
                    <option value="COD">Cash on Delivery</option>
                    <option value="Stripe">Credit/Debit Card</option>
                  </select>
                </motion.div>

                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: `0 10px 25px -5px ${COLORS.terracotta}40`
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
                  style={{ 
                    backgroundColor: COLORS.terracotta, 
                    color: COLORS.parchment 
                  }}
                  disabled={processing}
                  layout
                >
                  <span className="relative z-10">
                    {userDetails.paymentMethod === "COD" ? (
                      `Confirm Order (৳${totalPrice.toFixed(2)})`
                    ) : (
                      "Proceed to Payment"
                    )}
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-black opacity-0"
                    animate={{ 
                      opacity: processing ? 0.2 : 0 
                    }}
                    transition={{ duration: 0.3 }}
                  ></motion.div>
                </motion.button>
              </form>
            </motion.div>

            {/* Order Summary */}
            <motion.div 
              className="lg:w-5/12"
              layout
              transition={{ type: "spring", damping: 20 }}
            >
              <motion.div 
                className="sticky top-8 rounded-3xl p-8 shadow-xl overflow-hidden"
                style={{ 
                  backgroundColor: `${COLORS.parchment}cc`, 
                  border: `1px solid ${COLORS.sage}80`,
                  backdropFilter: 'blur(10px)'
                }}
                layout
              >
                <motion.h2 
                  className="text-2xl font-bold mb-8 flex items-center gap-3 pb-2 border-b"
                  style={{ 
                    color: COLORS.rust,
                    borderColor: COLORS.sage
                  }}
                  layout
                >
                  <ShoppingBagIcon className="w-7 h-7" style={{ color: COLORS.terracotta }} />
                  Order Summary
                </motion.h2>
                
                <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-2">
                  <AnimatePresence>
                    {cartItems.map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-4 items-start p-5 rounded-xl relative overflow-hidden"
                        style={{ backgroundColor: COLORS.blush }}
                        layout
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-10"></div>
                        <motion.img 
                          src={item.images[0]} 
                          alt={item.productName}
                          className="w-20 h-20 rounded-lg object-cover border-2 shadow-sm flex-shrink-0"
                          style={{ borderColor: COLORS.parchment }}
                          whileHover={{ rotate: 2 }}
                          transition={{ type: "spring" }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold" style={{ color: COLORS.rust }}>{item.productName}</h3>
                          <p className="text-sm mt-1" style={{ color: COLORS.terracotta }}>
                            {item.selectedColor} / {item.selectedSize}
                          </p>
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium px-2 py-1 rounded" style={{ backgroundColor: COLORS.sage, color: COLORS.parchment }}>
                                Qty: {item.quantity}
                              </span>
                            </div>
                            <span className="font-bold" style={{ color: COLORS.rust }}>
                              ৳{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <motion.div 
                  className="space-y-4 border-t pt-6 pb-4"
                  style={{ borderColor: COLORS.sage }}
                  layout
                >
                  <div className="flex justify-between text-lg" style={{ color: COLORS.rust }}>
                    <span>Subtotal:</span>
                    <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg" style={{ color: COLORS.rust }}>
                    <span>Delivery:</span>
                    <span className="font-semibold">৳{deliveryCharge.toFixed(2)}</span>
                  </div>
                  <motion.div 
                    className="flex justify-between text-xl font-bold pt-4 pb-2 border-t"
                    style={{ 
                      color: COLORS.terracotta,
                      borderColor: COLORS.sage
                    }}
                    layout
                  >
                    <span>Total:</span>
                    <span>৳{totalPrice.toFixed(2)}</span>
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="mt-8 p-4 rounded-xl flex items-center gap-3 relative overflow-hidden"
                  style={{ backgroundColor: COLORS.blush }}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring" }}
                  layout
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-10"></div>
                  <TruckIcon className="w-8 h-8 flex-shrink-0" style={{ color: COLORS.rust }} />
                  <div>
                    <p className="font-bold" style={{ color: COLORS.rust }}>Free Delivery</p>
                    <p className="text-sm mt-1" style={{ color: COLORS.terracotta }}>All orders delivered within 3-7 days</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </LayoutGroup>
      </motion.div>

      <Footer />
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000}
        toastStyle={{
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          backgroundColor: COLORS.parchment,
          color: COLORS.rust,
          border: `2px solid ${COLORS.sage}`
        }}
      />
    </div>
  );
};

const Checkout = () => {
  const cartItems = JSON.parse(localStorage.getItem('cart_guest')) || [];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: COLORS.parchment }}>
        <Navbar />
        <div className="h-16"></div>
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-8"
          >
            <ShoppingBagIcon className="w-24 h-24 mx-auto" style={{ color: COLORS.terracotta }} />
          </motion.div>
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: COLORS.rust }}>Your Cart is Empty</h2>
          <p className="text-xl text-center max-w-md mb-8" style={{ color: COLORS.terracotta }}>
            Looks like you haven't added anything to your cart yet
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-full font-bold"
            style={{ 
              backgroundColor: COLORS.terracotta,
              color: COLORS.parchment
            }}
            onClick={() => window.location.href = "/products"}
          >
            Browse Products
          </motion.button>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;