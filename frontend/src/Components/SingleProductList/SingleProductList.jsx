import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navigations/Navbar";
import Footer from "../Footer/Footer";
import { motion, AnimatePresence } from "framer-motion";
import RelatedProduct from "../RelatedProduct/RelatedProduct";
import ReactStars from 'react-rating-stars-component';
import ReactPlayer from 'react-player'; 
import Loading from '../Loading/Loading';
import { FaStar, FaStarHalfAlt, FaRegStar, FaWhatsapp, FaShoppingCart, FaShippingFast, FaExchangeAlt, FaLock, FaExpand, FaHeart, FaShare, FaMinus, FaPlus } from 'react-icons/fa';
import { TbZoomInArea } from 'react-icons/tb';

const SingleProductList = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: "", rating: 0, comment: "" });
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://ruhana-adv.onrender.com/api/products/single/${id}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        setProduct(data);
        setMainImage(data.images[0]);
        setIsLoading(false);
      } catch (err) {
        console.error(err.message);
        setIsLoading(false);
        toast.error("Failed to load product details");
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`https://ruhana-adv.onrender.com/api/reviews/${id}`);
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [id]);

  // Enhanced image zoom functionality
  const handleMouseMove = (e) => {
    if (!product || !product.images) return;
    
    const container = e.currentTarget;
    const { left, top, width, height } = container.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
    setShowZoom(true);
  };

  // Review handling
  const handleRatingChange = (newRating) => {
    setNewReview((prev) => ({ ...prev, rating: newRating }));
  };

  const handleAddReview = async () => {
    if (!newReview.name || !newReview.rating || !newReview.comment) {
      toast.error("All fields are required.");
      return;
    }

    try {
      const response = await fetch(`https://ruhana-adv.onrender.com/api/reviews/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newReview, productId: id }),
      });

      if (!response.ok) throw new Error("Error adding review");

      const data = await response.json();
      setReviews((prev) => [...prev, data.review]);
      setNewReview({ name: "", rating: 0, comment: "" });
      toast.success("Review added successfully!");
      setReviewModalOpen(false);
    } catch (error) {
      toast.error("Failed to add review.");
    }
  };

  const toggleReviewModal = () => setReviewModalOpen((prev) => !prev);
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites!");
  };

  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setImageModalOpen(true);
  };

  const navigateImages = (direction) => {
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.productName,
        text: 'Check out this amazing product!',
        url: window.location.href,
      })
      .then(() => toast.success('Product shared successfully!'))
      .catch((error) => toast.error('Error sharing product'));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Product selection and cart handling
  const selectedSizePrice = product?.availableSizes?.find(sizeObj => sizeObj.size === selectedSize)?.sizePrice || product?.price || 0;
  const discountedPrice = selectedSizePrice * (1 - (product?.discount || 0) / 100);

  const handleSizeSelection = (size) => {
    setSelectedSize(size);
  };

  const handleColorSelection = (color) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (amount) => {
    if (amount > (product?.stock || 0)) {
      toast.error("Not enough stock available");
    } else {
      setQuantity(amount);
    }
  };

  const addToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select both size and color.");
      return;
    }

    const selectedSizePrice = product.availableSizes?.find(
      (sizeObj) => sizeObj.size === selectedSize
    )?.sizePrice;

    if (!selectedSizePrice) {
      toast.error("Invalid size selected.");
      return;
    }

    const existingCartItems = JSON.parse(localStorage.getItem('cart_guest')) || [];
    const existingItem = existingCartItems.find(
      (item) =>
        item._id === product._id &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (existingItem) {
      const updatedQuantity = existingItem.quantity + quantity;
      if (updatedQuantity > product.stock) {
        toast.error(`Cannot add more than ${product.stock} items to the cart.`);
        return;
      }
      existingItem.quantity = updatedQuantity;
      localStorage.setItem('cart_guest', JSON.stringify(existingCartItems));
      toast.info("Product quantity increased in the cart!");
    } else {
      if (product.stock < quantity) {
        toast.error("Not enough stock available!");
        return;
      }
      const cartItem = {
        ...product,
        price: selectedSizePrice,
        quantity,
        selectedSize,
        selectedColor,
      };
      existingCartItems.push(cartItem);
      localStorage.setItem('cart_guest', JSON.stringify(existingCartItems));
      toast.success("Product added to the cart!");
    }
  };

  const handleOrderNow = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select both size and color before proceeding.");
      return;
    }
  
    addToCart();
    window.location.href = "/checkout";
  };
  
  const handleOrderOnWhatsApp = () => {
    const phoneNumber = "+8801714394330";
    const productName = product.productName;
    const currentURL = window.location.href;
    const message = `Hello, I am interested in purchasing: *${productName}*. Here is the link: ${currentURL}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
    window.open(whatsappURL, "_blank");
  };

  // Calculate average rating
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
    : null;

  if (isLoading || !product) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />
      
      {/* Floating action buttons */}
      <motion.div 
        className="fixed right-6 top-1/3 z-30 flex flex-col space-y-4"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center bg-white border border-gray-200"
          onClick={toggleFavorite}
        >
          <FaHeart className={isFavorite ? "text-red-500" : "text-gray-400"} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center bg-white border border-gray-200"
          onClick={shareProduct}
        >
          <FaShare className="text-gray-600" />
        </motion.button>
      </motion.div>
      
      {/* Main content */}
      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl shadow-xl overflow-hidden border border-gray-100 bg-white"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-8">
            {/* Product Images */}
            <motion.div 
              className="space-y-6"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div 
                className="relative overflow-hidden rounded-2xl border border-gray-200 group"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
              >
                <motion.img
                  src={mainImage}
                  alt={product.productName}
                  className="w-full h-auto max-h-[500px] object-contain transition-all duration-300 cursor-zoom-in"
                  style={{
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    transform: showZoom ? "scale(2)" : "scale(1)"
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                
                {showZoom && (
                  <motion.div 
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white bg-opacity-80 flex items-center justify-center pointer-events-none shadow-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <TbZoomInArea className="text-gray-700 text-xl" />
                  </motion.div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white bg-opacity-80 flex items-center justify-center shadow-sm"
                  onClick={() => openImageModal(product.images.indexOf(mainImage))}
                >
                  <FaExpand className="text-gray-700" />
                </motion.button>
              </div>
              
              <div className="flex space-x-3 overflow-x-auto py-2 custom-scrollbar">
                {product.images.map((img, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 relative"
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition-all"
                      style={{ 
                        borderColor: idx === product.images.indexOf(mainImage) ? "#3b82f6" : "transparent",
                        filter: idx !== product.images.indexOf(mainImage) ? "brightness(95%)" : "none"
                      }}
                      onClick={() => setMainImage(img)}
                    />
                  </motion.div>
                ))}
              </div>
              
              {/* Product Video */}
              {product.videoUrl && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6"
                >
                  <h3 className="text-xl font-semibold mb-3 text-gray-700">Product Video</h3>
                  <div className="rounded-2xl overflow-hidden shadow border border-gray-200">
                    <ReactPlayer
                      url={product.videoUrl}
                      controls
                      width="100%"
                      height="300px"
                      light={product.images[0]}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Product Details */}
            <motion.div 
              className="space-y-6"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{product.productName}</h1>
                <p className="text-lg mt-1 text-gray-600">Product Code: {product.productCode}</p>
              </div>
              
              {/* Ratings */}
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex space-x-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <span key={index}>
                        {averageRating >= ratingValue ? (
                          <FaStar className="text-xl" />
                        ) : averageRating >= ratingValue - 0.5 ? (
                          <FaStarHalfAlt className="text-xl" />
                        ) : (
                          <FaRegStar className="text-xl" />
                        )}
                      </span>
                    );
                  })}
                </div>
                <p className="ml-2 text-lg font-semibold text-gray-700">
                  {averageRating} <span className="text-gray-500">({totalReviews} Reviews)</span>
                </p>
              </motion.div>
              
              {/* Pricing */}
              <motion.div 
                className="p-4 rounded-xl border border-gray-200 bg-gray-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-gray-900">
                    ৳ {discountedPrice.toFixed(2)}
                  </p>
                  {product.discount > 0 && (
                    <>
                      <span className="line-through ml-2 text-xl text-gray-500">৳ {selectedSizePrice.toFixed(2)}</span>
                      <motion.span 
                        className="ml-3 px-2 py-1 rounded-full text-sm font-bold bg-red-100 text-red-600"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {product.discount}% OFF
                      </motion.span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-gray-600">
                  You Save: ৳ {(selectedSizePrice - discountedPrice).toFixed(2)}
                </p>
              </motion.div>
              
              {/* Size Selection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-xl font-semibold mb-3 text-gray-700">Select Size</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.availableSizes.map((sizeObj) => (
                    <motion.button
                      key={sizeObj.size}
                      className={`px-4 py-3 rounded-xl text-center transition-all font-medium border ${
                        selectedSize === sizeObj.size
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-transparent border-gray-300 text-gray-700 hover:border-gray-500"
                      }`}
                      onClick={() => handleSizeSelection(sizeObj.size)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {sizeObj.size} - ৳ {sizeObj.sizePrice.toFixed(2)}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
              
              {/* Color Selection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-xl font-semibold mb-3 text-gray-700">Select Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.availableColors.map((color) => (
                    <motion.button
                      key={color}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color ? "scale-110 ring-2 ring-offset-2 ring-blue-500" : ""
                      }`}
                      style={{ 
                        backgroundColor: color,
                        borderColor: selectedColor === color ? "#3b82f6" : "#e5e7eb"
                      }}
                      onClick={() => handleColorSelection(color)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    ></motion.button>
                  ))}
                </div>
              </motion.div>
              
              {/* Quantity */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-xl font-semibold mb-3 text-gray-700">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <motion.button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow border border-gray-300 bg-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaMinus className="text-gray-600" />
                  </motion.button>
                  <span className="text-2xl font-bold w-12 text-center text-gray-900">{quantity}</span>
                  <motion.button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow border border-gray-300 bg-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPlus className="text-gray-600" />
                  </motion.button>
                </div>
              </motion.div>
              
              {/* Action Buttons */}
              <motion.div 
                className="space-y-4 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.button
                    onClick={addToCart}
                    className="py-4 text-lg font-bold rounded-xl flex items-center justify-center space-x-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaShoppingCart className="text-xl" />
                    <span>Add to Cart</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={handleOrderNow}
                    className="py-4 text-lg font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Order Now
                  </motion.button>
                </div>
                
                <motion.button
                  onClick={handleOrderOnWhatsApp}
                  className="w-full py-4 text-lg font-semibold rounded-xl flex items-center justify-center space-x-2 bg-green-600 text-white hover:bg-green-700"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaWhatsapp className="text-2xl" />
                  <span>Order on WhatsApp</span>
                </motion.button>
              </motion.div>
              
              {/* Product Features */}
              <motion.div 
                className="grid grid-cols-2 gap-4 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <motion.div 
                  className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 bg-gray-50"
                  whileHover={{ y: -5 }}
                >
                  <FaShippingFast className="text-xl text-blue-600" />
                  <span className="text-sm text-gray-700">Free Shipping</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 bg-gray-50"
                  whileHover={{ y: -5 }}
                >
                  <FaExchangeAlt className="text-xl text-blue-600" />
                  <span className="text-sm text-gray-700">Easy Returns</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 bg-gray-50"
                  whileHover={{ y: -5 }}
                >
                  <FaLock className="text-xl text-blue-600" />
                  <span className="text-sm text-gray-700">Secure Payment</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 bg-gray-50"
                  whileHover={{ y: -5 }}
                >
                  <FaStar className="text-xl text-blue-600" />
                  <span className="text-sm text-gray-700">Authentic Products</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Tabs Section */}
          <motion.div 
            className="px-6 sm:px-8 py-6 border-t border-gray-200 bg-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="flex space-x-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-4 py-3 text-lg font-medium ${activeTab === "description" ? "border-b-2 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                style={{ borderColor: activeTab === "description" ? "#3b82f6" : "transparent" }}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("sizeChart")}
                className={`px-4 py-3 text-lg font-medium ${activeTab === "sizeChart" ? "border-b-2 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                style={{ borderColor: activeTab === "sizeChart" ? "#3b82f6" : "transparent" }}
              >
                Size Chart
              </button>
            </div>

            <div className="py-6">
              <AnimatePresence mode="wait">
                {activeTab === "description" && (
                  <motion.div
                    key="description"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="leading-relaxed text-gray-700"
                  >
                    <p>{product.description}</p>
                  </motion.div>
                )}
                
                {activeTab === "sizeChart" && (
                  <motion.div
                    key="sizeChart"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-center">
                      <img
                        src={product.sizeChart}
                        alt="Size Chart"
                        className="max-w-full max-h-[500px] object-contain rounded-lg border border-gray-200"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          
          {/* Reviews Section */}
          <motion.div 
            className="px-6 sm:px-8 py-8 border-t border-gray-200 bg-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
              <motion.button
                onClick={toggleReviewModal}
                className="px-6 py-3 rounded-full font-medium bg-blue-600 text-white hover:bg-blue-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Write a Review
              </motion.button>
            </div>
            
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 rounded-xl border border-gray-200 bg-white"
                  >
                    <div className="flex justify-between">
                      <p className="font-bold text-lg text-gray-900">{review.name}</p>
                      <div className="flex space-x-1 text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>
                            {review.rating > i ? (
                              <FaStar />
                            ) : (
                              <FaRegStar />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-gray-600">{review.comment}</p>
                    <p className="mt-3 text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg text-gray-500">No reviews yet. Be the first to review!</p>
              </div>
            )}
          </motion.div>
        </motion.div>
        
        {/* Related Products */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">Related Products</h2>
          <RelatedProduct category={product.category} currentProductId={product._id} />
        </motion.div>
      </div>
      
      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
            onClick={() => setReviewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl shadow-xl w-full max-w-md p-6 bg-white border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                <button 
                  onClick={() => setReviewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-700">Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-gray-700">Your Rating</label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(star)}
                        className="text-2xl mr-1 focus:outline-none text-yellow-400"
                      >
                        {star <= newReview.rating ? (
                          <FaStar />
                        ) : (
                          <FaRegStar />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-gray-700">Your Review</label>
                  <textarea
                    placeholder="Share your experience with this product"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 h-32"
                  ></textarea>
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <motion.button
                    onClick={handleAddReview}
                    className="flex-1 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Submit Review
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setReviewModalOpen(false)}
                    className="flex-1 py-3 rounded-lg font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Image Modal */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white bg-opacity-95 z-50 flex items-center justify-center p-4"
            onClick={() => setImageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl w-full max-h-[90vh]"
            >
              <button 
                className="absolute top-4 right-4 text-gray-700 text-3xl z-10 hover:text-gray-900"
                onClick={() => setImageModalOpen(false)}
              >
                &times;
              </button>
              
              <motion.img
                key={currentImageIndex}
                src={product.images[currentImageIndex]}
                alt={`Product view ${currentImageIndex + 1}`}
                className="w-full h-full object-contain max-h-[80vh]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
              
              <button 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 bg-white bg-opacity-80 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-100 shadow-md"
                onClick={(e) => { e.stopPropagation(); navigateImages('prev'); }}
              >
                &lt;
              </button>
              
              <button 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-700 bg-white bg-opacity-80 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-100 shadow-md"
                onClick={(e) => { e.stopPropagation(); navigateImages('next'); }}
              >
                &gt;
              </button>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="flex space-x-2">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-3 h-3 rounded-full ${idx === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
      <ToastContainer 
        position="bottom-right" 
        toastStyle={{ backgroundColor: "white", color: "#1f2937", border: "1px solid #e5e7eb" }} 
      />
    </div>
  );
};

export default SingleProductList;