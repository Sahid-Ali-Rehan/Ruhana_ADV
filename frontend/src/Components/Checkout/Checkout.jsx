import React, { useState, useEffect } from "react";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navigations/Navbar";
import Footer from "../Footer/Footer";
import { LockClosedIcon, CreditCardIcon, ShoppingBagIcon, XMarkIcon, TruckIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const stripePromise = loadStripe("pk_test_51RSv6HQu2XY94ocpyNXlGLygbvTCIBSFrODrGTvAtAxnQQM0bFDNpC36pJ4EH9cb1GJEKSHigVz6xVWZFeHMZJSV001CPevlli");

const FloatingInput = ({ label, name, type = 'text', required = false, textarea = false, value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      className="relative mb-8 group"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      {textarea ? (
        <textarea
          className="peer h-24 w-full rounded-xl border border-gray-300 px-6 py-4 focus:outline-none bg-transparent transition-all duration-300 shadow-sm"
          style={{ 
            borderColor: isFocused ? '#000' : '#e5e7eb',
            color: '#000',
            backgroundColor: 'transparent'
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
          className="peer h-14 w-full rounded-xl border border-gray-300 px-6 py-2 focus:outline-none bg-transparent transition-all duration-300 shadow-sm"
          style={{ 
            borderColor: isFocused ? '#000' : '#e5e7eb',
            color: '#000',
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
            ? 'top-0 text-xs -translate-y-1/2 tracking-wider' 
            : 'top-1/2 -translate-y-1/2'
        }`}
        style={{ 
          backgroundColor: '#fff',
          color: isFocused ? '#000' : '#9ca3af',
          letterSpacing: '0.05em'
        }}
        animate={{ 
          y: isFocused || value ? -10 : 0,
          scale: isFocused || value ? 0.9 : 1
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
    <div className="min-h-screen relative bg-white">
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
              className="p-8 rounded-2xl shadow-xl text-center bg-white"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-16 w-16 rounded-full border-t-2 border-b-2 border-black mx-auto mb-6"
              ></motion.div>
              <h3 className="text-2xl font-light tracking-tight mb-4 text-gray-900">Processing Payment</h3>
              <p className="text-lg text-gray-600">Your order is being securely processed</p>
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
              className="w-full max-w-md relative rounded-2xl p-8 shadow-2xl bg-white border border-gray-200"
            >
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:scale-110 transition-transform bg-gray-100"
              >
                <XMarkIcon className="w-6 h-6 text-gray-800" />
              </button>

              <motion.h3 
                className="text-2xl font-light tracking-tight mb-6 flex items-center gap-2 text-gray-900"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <CreditCardIcon className="w-8 h-8 text-gray-800" />
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
                          color: '#000',
                          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                          '::placeholder': { 
                            color: '#9ca3af',
                            fontWeight: '400'
                          },
                          iconColor: '#000'
                        },
                        invalid: { 
                          color: '#dc2626',
                          iconColor: '#dc2626'
                        }
                      }
                    }}
                    className="p-4 border border-gray-300 rounded-xl"
                  />
                </motion.div>

                <motion.button
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayment}
                  className="w-full py-4 rounded-xl font-medium text-lg bg-black text-white shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_0_0_rgba(0,0,0,0.2)] active:shadow-[0_2px_0_0_rgba(0,0,0,0.2)] transition-all duration-200 flex items-center justify-center"
                  disabled={processing}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
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
              className="lg:w-7/12 rounded-2xl p-8 bg-white border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
              layout
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <form onSubmit={handleSubmit} className="space-y-10">
                <motion.div layout>
                  <motion.h2 
                    className="text-2xl font-light tracking-tight mb-8 flex items-center gap-3 pb-4 border-b border-gray-100"
                    layout
                  >
                    <LockClosedIcon className="w-7 h-7 text-gray-800" />
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
                    className="text-2xl font-light tracking-tight mb-8 flex items-center gap-3 pb-4 border-b border-gray-100"
                    layout
                  >
                    <CreditCardIcon className="w-7 h-7 text-gray-800" />
                    Payment Method
                  </motion.h2>
                  <select
                    className="w-full rounded-xl border border-gray-300 px-6 py-4 focus:outline-none transition-all shadow-sm bg-white"
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
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-5 rounded-xl font-medium text-lg bg-black text-white shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_0_0_rgba(0,0,0,0.2)] active:shadow-[0_2px_0_0_rgba(0,0,0,0.2)] transition-all duration-200 relative overflow-hidden"
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
                    className="absolute inset-0 bg-gray-800 opacity-0"
                    animate={{ 
                      opacity: processing ? 0.4 : 0 
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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <motion.div 
                className="sticky top-8 rounded-2xl p-8 bg-white border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden"
                layout
              >
                <motion.h2 
                  className="text-2xl font-light tracking-tight mb-8 flex items-center gap-3 pb-4 border-b border-gray-100"
                  layout
                >
                  <ShoppingBagIcon className="w-7 h-7 text-gray-800" />
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
                        className="flex gap-4 items-start p-5 rounded-xl relative overflow-hidden border border-gray-100"
                        layout
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-10"></div>
                        <motion.img 
                          src={item.images[0]} 
                          alt={item.productName}
                          className="w-20 h-20 rounded-lg object-cover border border-gray-200 shadow-sm flex-shrink-0"
                          whileHover={{ rotate: 2 }}
                          transition={{ type: "spring" }}
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.productName}</h3>
                          <p className="text-sm mt-1 text-gray-600">
                            {item.selectedColor} / {item.selectedSize}
                          </p>
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium px-2 py-1 rounded border border-gray-200 bg-gray-50 text-gray-800">
                                Qty: {item.quantity}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">
                              ৳{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <motion.div 
                  className="space-y-4 border-t border-gray-100 pt-6 pb-4"
                  layout
                >
                  <div className="flex justify-between text-base text-gray-800">
                    <span>Subtotal:</span>
                    <span className="font-medium">৳{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base text-gray-800">
                    <span>Delivery:</span>
                    <span className="font-medium">৳{deliveryCharge.toFixed(2)}</span>
                  </div>
                  <motion.div 
                    className="flex justify-between text-lg font-medium pt-4 pb-2 border-t border-gray-100"
                    layout
                  >
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">৳{totalPrice.toFixed(2)}</span>
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="mt-8 p-4 rounded-xl flex items-center gap-3 relative overflow-hidden border border-gray-100"
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring" }}
                  layout
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-10"></div>
                  <TruckIcon className="w-8 h-8 flex-shrink-0 text-gray-800" />
                  <div>
                    <p className="font-medium text-gray-900">Free Delivery</p>
                    <p className="text-sm mt-1 text-gray-600">All orders delivered within 3-7 days</p>
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
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
          backgroundColor: '#fff',
          color: '#000',
          border: '1px solid #e5e7eb'
        }}
      />
    </div>
  );
};

const Checkout = () => {
  const cartItems = JSON.parse(localStorage.getItem('cart_guest')) || [];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
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
            <ShoppingBagIcon className="w-24 h-24 mx-auto text-gray-800" />
          </motion.div>
          <h2 className="text-3xl font-light tracking-tight text-center mb-4 text-gray-900">Your Cart is Empty</h2>
          <p className="text-xl text-center max-w-md mb-8 text-gray-600">
            Looks like you haven't added anything to your cart yet
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-lg font-medium tracking-wide border border-gray-900 bg-white text-gray-900 shadow-[0_0_0_0_#000] hover:shadow-[4px_4px_0_0_#000] transition-all duration-300"
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