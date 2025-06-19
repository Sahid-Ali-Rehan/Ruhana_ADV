import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "../Navigations/Navbar";
import Footer from "../Footer/Footer";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Always use guest cart without user check
    const storedCart = JSON.parse(localStorage.getItem('cart_guest')) || [];
    
    const updatedCart = storedCart.map(item => ({
      ...item,
      productId: item.productId || item._id,
    }));
    
    setCartItems(updatedCart);
    const total = updatedCart.reduce((acc, item) => 
      acc + item.quantity * item.price * (1 - item.discount / 100), 0
    );
    setTotalPrice(total);
  }, []); // Remove navigate from dependencies

 const handleQuantityChange = (item, amount) => {
  const updatedCartItems = cartItems.map((cartItem) => {
    if (cartItem._id === item._id && 
        cartItem.selectedSize === item.selectedSize && 
        cartItem.selectedColor === item.selectedColor) {
      
      const newQuantity = cartItem.quantity + amount;
      
      // Stock validation
      if (newQuantity > cartItem.stock) {
        toast.error(`Cannot exceed available stock of ${cartItem.stock}`);
        return cartItem; // Return unchanged item
      }
      if (newQuantity <= 0) {
        toast.error("Quantity cannot be less than 1");
        return cartItem; // Return unchanged item
      }
      
      return { ...cartItem, quantity: newQuantity };
    }
    return cartItem;
  });

  setCartItems(updatedCartItems);
  localStorage.setItem('cart_guest', JSON.stringify(updatedCartItems));
  
  const total = updatedCartItems.reduce((acc, item) => 
    acc + item.quantity * item.price * (1 - item.discount / 100), 0
  );
  setTotalPrice(total);
};

const handleRemoveItem = (item) => {
  const updatedCartItems = cartItems.filter((cartItem) => 
    !(cartItem._id === item._id && 
    cartItem.selectedSize === item.selectedSize && 
    cartItem.selectedColor === item.selectedColor)
  );

  setCartItems(updatedCartItems);
  localStorage.setItem('cart_guest', JSON.stringify(updatedCartItems));
  
  const total = updatedCartItems.reduce((acc, item) => 
    acc + item.quantity * item.price * (1 - item.discount / 100), 0
  );
  setTotalPrice(total);
  toast.success("Item removed from cart");
};

  if (cartItems.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="text-center my-10">
          <h2 className="text-xl text-primary font-bold">Your Cart is Empty</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className=" bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mt-14 mb-14 mx-auto bg-white shadow-lg p-4 md:p-10">
        <h2 className="text-2xl font-bold text-primary mb-6">Your Shopping Cart</h2>

        <div className="space-y-6">
          {cartItems.map((item) => (
            <div key={item._id + item.selectedSize + item.selectedColor} className="flex justify-between items-center">
              <div className="flex items-center">
                <img src={item.images[0]} alt={item.productName} className="w-20 h-20 object-cover rounded-lg" />
                <div className="ml-4">
                  <p className="font-semibold text-primary">{item.productName}</p>
                  <p className="text-sm text-secondary">Size: {item.selectedSize}</p>
                  <p className="text-sm text-secondary">Color: {item.selectedColor}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(item, -1)}
                    className="px-2 py-1 bg-primary text-white rounded"
                  >
                    -
                  </button>
                  <span className="text-lg text-secondary font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item, 1)}
                    className="px-2 py-1 bg-primary text-white rounded"
                  >
                    +
                  </button>
                </div>
                <p className="text-lg font-semibold text-secondary">
                  Tk. {(item.quantity * item.price * (1 - item.discount / 100)).toFixed(2)}
                </p>
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <p className="text-lg font-semibold text-primary">Total: Tk. {totalPrice.toFixed(2)}</p>
          <button
      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition"
      onClick={() => navigate("/checkout")}
    >
      Checkout
    </button>
        </div>
      </div>
      <ToastContainer />
      <Footer />
    </div>
  );
};

export default Cart;
