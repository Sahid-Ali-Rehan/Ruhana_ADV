// Checkout.jsx
import React, { useState, useEffect } from "react";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navigations/Navbar";
import Footer from "../Footer/Footer";
import { LockClosedIcon, CreditCardIcon, ShoppingBagIcon, ShieldCheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const stripePromise = loadStripe("pk_test_51RSv6HQu2XY94ocpyNXlGLygbvTCIBSFrODrGTvAtAxnQQM0bFDNpC36pJ4EH9cb1GJEKSHigVz6xVWZFeHMZJSV001CPevlli");

const FloatingInput = ({ label, name, type = 'text', required = false, textarea = false, value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative mb-6 group">
      {textarea ? (
        <textarea
          className="peer h-24 w-full rounded-xl border-2 border-gray-200 px-6 py-4 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 bg-transparent transition-all duration-300"
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
          className="peer h-14 w-full rounded-xl border-2 border-gray-200 px-6 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 bg-transparent transition-all duration-300"
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
      <label className={`absolute left-4 transition-all duration-300 px-2 bg-white ${
        isFocused || value ? 'top-0 text-sm text-blue-600 -translate-y-1/2' : 'top-1/2 text-gray-400 -translate-y-1/2'
      }`}>
        {label}
      </label>
    </div>
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
      
      // Add Stripe initialization check
      if (!stripe || !elements) {
        throw new Error("Payment system not ready. Please try again.");
      }

      const paymentIntentResponse = await fetch("https://original-collections.onrender.com/api/orders/create-payment-intent", {
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

    const response = await fetch("https://original-collections.onrender.com/api/orders/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    if (!response.ok) throw new Error("Order submission failed");
    
    // Add this code to save the order data
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 relative">
      <Navbar />

      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="bg-white p-8 rounded-2xl shadow-xl text-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800">Processing Payment...</h3>
              <p className="text-gray-600 mt-2">Please wait while we process your order</p>
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
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white rounded-3xl p-8 w-full max-w-md relative"
        >
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>

              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CreditCardIcon className="w-8 h-8 text-blue-600" />
                Card Payment
              </h3>

              <div className="space-y-6">
                <CardElement
              options={{
                hidePostalCode: true,
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1a1a1a',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    '::placeholder': { 
                      color: '#a0aec0',
                      fontWeight: '400'
                    },
                    iconColor: '#4f46e5'
                  },
                  invalid: { 
                    color: '#dc2626',
                    iconColor: '#dc2626'
                  }
                }
              }}
              className="p-4 border-2 border-gray-200 rounded-xl"
            />

                <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePayment}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center"
              disabled={processing}
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Shipping Details */}
          <div className="lg:w-7/12 bg-white rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <LockClosedIcon className="w-7 h-7 text-blue-600" />
                  Shipping Details
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <FloatingInput label="Full Name" name="name" required value={userDetails.name} onChange={handleInputChange} />
                  <FloatingInput label="Phone Number" name="phone" type="tel" required value={userDetails.phone} onChange={handleInputChange} />
                  <FloatingInput label="District" name="jela" required value={userDetails.jela} onChange={handleInputChange} />
                  <FloatingInput label="Upazila" name="upazela" required value={userDetails.upazela} onChange={handleInputChange} />
                  <div className="md:col-span-2">
                    <FloatingInput label="Full Address" name="address" textarea required value={userDetails.address} onChange={handleInputChange} />
                  </div>
                  <FloatingInput label="Postal Code" name="postalCode" value={userDetails.postalCode} onChange={handleInputChange} />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <CreditCardIcon className="w-7 h-7 text-blue-600" />
                  Payment Method
                </h2>
                <select
                  className="w-full rounded-xl border-2 border-gray-200 px-6 py-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  value={userDetails.paymentMethod}
                  onChange={handleInputChange}
                  name="paymentMethod"
                >
                  <option value="COD">Cash on Delivery</option>
                  <option value="Stripe">Credit/Debit Card</option>
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                disabled={processing}
              >
                {userDetails.paymentMethod === "COD" ? (
                  `Confirm Order (৳${totalPrice.toFixed(2)})`
                ) : (
                  "Proceed to Payment"
                )}
              </motion.button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-5/12">
            <div className="sticky top-8 bg-white rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <ShoppingBagIcon className="w-7 h-7 text-blue-600" />
                Order Summary
              </h2>
              
              <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto">
                {cartItems.map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl"
                  >
                    <img 
                      src={item.images[0]} 
                      alt={item.productName}
                      className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-sm" 
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.productName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.selectedColor} / {item.selectedSize}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium bg-blue-100 px-2 py-1 rounded">
                            Qty: {item.quantity}
                          </span>
                        </div>
                        <span className="text-blue-600 font-bold">
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-4 border-t pt-6">
                <div className="flex justify-between text-lg">
                  <span>Subtotal:</span>
                  <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Delivery:</span>
                  <span className="font-semibold">৳{deliveryCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-blue-600 pt-4">
                  <span>Total:</span>
                  <span>৳{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-green-50 rounded-xl flex items-center gap-3">
                <ShieldCheckIcon className="w-8 h-8 text-green-600" />
                <span className="text-green-700 font-medium">Secure SSL Encryption • 256-bit Security</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <Footer />
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000}
        toastStyle={{
          borderRadius: '12px',
          background: '#fff',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}
      />
    </div>
  );
};

const Checkout = () => {
  // Simplified cart check
  const cartItems = JSON.parse(localStorage.getItem('cart_guest')) || [];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <Navbar />
        <div className="flex h-96 items-center justify-center">
          <h2 className="text-2xl font-bold text-gray-500">Your cart is empty</h2>
        </div>
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