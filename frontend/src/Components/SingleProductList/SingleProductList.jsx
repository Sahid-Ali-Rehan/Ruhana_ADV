import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navigations/Navbar";
import Footer from "../Footer/Footer";
import { motion, AnimatePresence } from "framer-motion";
import RelatedProduct from "../RelatedProduct/RelatedProduct";
import ReactStars from "react-rating-stars-component";
import ReactPlayer from 'react-player'; 
import Loading from '../Loading/Loading';
import { FaStar, FaStarHalfAlt, FaRegStar, FaWhatsapp, FaShoppingCart, FaShippingFast, FaExchangeAlt, FaLock } from 'react-icons/fa';

// Color palette constants
const COLORS = {
  parchment: "#EFE2B2",
  terracotta: "#9E5F57",
  moss: "#567A4B",
  rust: "#814B4A",
  sage: "#97A276",
  blush: "#F5C9C6"
};

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

  // Image zoom functionality
  const imageRef = useRef(null);
  const handleZoom = (e) => {
    const image = imageRef.current;
    const { left, top, width, height } = image.getBoundingClientRect();
    const offsetX = e.clientX - left;
    const offsetY = e.clientY - top;
    const percentX = offsetX / width;
    const percentY = offsetY / height;
    
    image.style.transformOrigin = `${percentX * 100}% ${percentY * 100}%`;
    image.style.transform = `scale(2.5)`;
  };

  const resetZoom = () => {
    const image = imageRef.current;
    image.style.transform = "scale(1)";
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
    const phoneNumber = "+8801789313805";
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
    <div className="min-h-screen" style={{ backgroundColor: COLORS.parchment }}>
      <Navbar />
      
      {/* Added top spacing as requested */}
      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl shadow-xl overflow-hidden" style={{ backgroundColor: COLORS.parchment }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-8">
            {/* Product Images */}
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl border-4" style={{ borderColor: COLORS.sage, backgroundColor: COLORS.parchment }}>
                <motion.img
                  src={mainImage}
                  alt={product.productName}
                  ref={imageRef}
                  className="w-full h-auto max-h-[500px] object-contain transition-transform duration-300"
                  onMouseMove={handleZoom}
                  onMouseLeave={resetZoom}
                  style={{ cursor: "zoom-in" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="flex space-x-3 overflow-x-auto py-2">
                {product.images.map((img, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0"
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-xl cursor-pointer border-2 border-transparent hover:border-blue-400 transition-all"
                      style={{ borderColor: COLORS.terracotta }}
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
                  <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.rust }}>Product Video</h3>
                  <div className="rounded-2xl overflow-hidden shadow-lg">
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
            </div>

            {/* Product Details */}
            <motion.div 
              className="space-y-6"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div>
                <h1 className="text-3xl md:text-4xl font-bold" style={{ color: COLORS.rust }}>{product.productName}</h1>
                <p className="text-lg mt-1" style={{ color: COLORS.terracotta }}>Product Code: {product.productCode}</p>
              </div>
              
              {/* Ratings */}
              {averageRating && (
                <div className="flex items-center">
                  <div className="flex space-x-1" style={{ color: COLORS.terracotta }}>
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
                  <p className="ml-2 text-lg font-semibold" style={{ color: COLORS.rust }}>
                    {averageRating} <span className="text-gray-500">({totalReviews} Reviews)</span>
                  </p>
                </div>
              )}
              
              {/* Pricing */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.blush }}>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold" style={{ color: COLORS.moss }}>
                    ৳ {discountedPrice.toFixed(2)}
                  </p>
                  {product.discount > 0 && (
                    <>
                      <span className="line-through ml-2 text-xl" style={{ color: COLORS.rust }}>৳ {selectedSizePrice.toFixed(2)}</span>
                      <span className="ml-3 px-2 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: COLORS.terracotta, color: COLORS.parchment }}>
                        {product.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-1" style={{ color: COLORS.moss }}>
                  You Save: ৳ {(selectedSizePrice - discountedPrice).toFixed(2)}
                </p>
              </div>
              
              {/* Size Selection */}
              <div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.rust }}>Select Size</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.availableSizes.map((sizeObj) => (
                    <motion.button
                      key={sizeObj.size}
                      className={`px-4 py-3 rounded-xl text-center transition-all font-medium ${
                        selectedSize === sizeObj.size
                          ? "text-white shadow-lg"
                          : "hover:bg-opacity-80"
                      }`}
                      style={{ 
                        backgroundColor: selectedSize === sizeObj.size ? COLORS.terracotta : COLORS.sage,
                        color: selectedSize === sizeObj.size ? COLORS.parchment : COLORS.rust
                      }}
                      onClick={() => handleSizeSelection(sizeObj.size)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {sizeObj.size} - ৳ {sizeObj.sizePrice.toFixed(2)}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Color Selection */}
              <div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.rust }}>Select Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.availableColors.map((color) => (
                    <motion.button
                      key={color}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color ? "scale-110" : ""
                      }`}
                      style={{ 
                        backgroundColor: color,
                        borderColor: selectedColor === color ? COLORS.rust : COLORS.sage
                      }}
                      onClick={() => handleColorSelection(color)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    ></motion.button>
                  ))}
                </div>
              </div>
              
              {/* Quantity */}
              <div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.rust }}>Quantity</h3>
                <div className="flex items-center space-x-4">
                  <motion.button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                    style={{ backgroundColor: COLORS.terracotta, color: COLORS.parchment }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-xl">-</span>
                  </motion.button>
                  <span className="text-2xl font-bold w-12 text-center" style={{ color: COLORS.rust }}>{quantity}</span>
                  <motion.button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                    style={{ backgroundColor: COLORS.moss, color: COLORS.parchment }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-xl">+</span>
                  </motion.button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.button
                    onClick={addToCart}
                    className="py-4 text-lg font-bold rounded-xl flex items-center justify-center space-x-2"
                    style={{ backgroundColor: COLORS.terracotta, color: COLORS.parchment }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaShoppingCart className="text-xl" />
                    <span>Add to Cart</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={handleOrderNow}
                    className="py-4 text-lg font-bold rounded-xl"
                    style={{ backgroundColor: COLORS.rust, color: COLORS.parchment }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Order Now
                  </motion.button>
                </div>
                
                <motion.button
                  onClick={handleOrderOnWhatsApp}
                  className="w-full py-4 text-lg font-semibold rounded-xl flex items-center justify-center space-x-2"
                  style={{ backgroundColor: COLORS.moss, color: COLORS.parchment }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaWhatsapp className="text-2xl" />
                  <span>Order on WhatsApp</span>
                </motion.button>
              </div>
              
              {/* Product Features */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ backgroundColor: COLORS.blush }}>
                  <FaShippingFast className="text-xl" style={{ color: COLORS.rust }} />
                  <span className="text-sm" style={{ color: COLORS.rust }}>Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ backgroundColor: COLORS.blush }}>
                  <FaExchangeAlt className="text-xl" style={{ color: COLORS.rust }} />
                  <span className="text-sm" style={{ color: COLORS.rust }}>Easy Returns</span>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ backgroundColor: COLORS.blush }}>
                  <FaLock className="text-xl" style={{ color: COLORS.rust }} />
                  <span className="text-sm" style={{ color: COLORS.rust }}>Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ backgroundColor: COLORS.blush }}>
                  <FaStar className="text-xl" style={{ color: COLORS.rust }} />
                  <span className="text-sm" style={{ color: COLORS.rust }}>Authentic Products</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Tabs Section */}
          <div className="px-6 sm:px-8 py-6" style={{ backgroundColor: COLORS.parchment }}>
            <div className="flex space-x-4 border-b" style={{ borderColor: COLORS.sage }}>
              <button
                onClick={() => setActiveTab("description")}
                className={`px-4 py-3 text-lg font-medium ${activeTab === "description" ? "border-b-2" : "text-gray-500"}`}
                style={{ 
                  color: activeTab === "description" ? COLORS.rust : COLORS.terracotta,
                  borderColor: activeTab === "description" ? COLORS.rust : "transparent"
                }}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("sizeChart")}
                className={`px-4 py-3 text-lg font-medium ${activeTab === "sizeChart" ? "border-b-2" : "text-gray-500"}`}
                style={{ 
                  color: activeTab === "sizeChart" ? COLORS.rust : COLORS.terracotta,
                  borderColor: activeTab === "sizeChart" ? COLORS.rust : "transparent"
                }}
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
                    className="leading-relaxed"
                    style={{ color: COLORS.rust }}
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
                        className="max-w-full max-h-[500px] object-contain rounded-lg shadow-md"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Reviews Section */}
          <div className="px-6 sm:px-8 py-8" style={{ backgroundColor: COLORS.blush }}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold" style={{ color: COLORS.rust }}>Customer Reviews</h2>
              <motion.button
                onClick={toggleReviewModal}
                className="px-6 py-3 rounded-full font-medium"
                style={{ backgroundColor: COLORS.terracotta, color: COLORS.parchment }}
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
                    className="p-6 rounded-xl shadow-sm"
                    style={{ backgroundColor: COLORS.parchment, borderColor: COLORS.sage }}
                  >
                    <div className="flex justify-between">
                      <p className="font-bold text-lg" style={{ color: COLORS.rust }}>{review.name}</p>
                      <div className="flex space-x-1" style={{ color: COLORS.terracotta }}>
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
                    <p className="mt-3" style={{ color: COLORS.terracotta }}>{review.comment}</p>
                    <p className="mt-3 text-sm" style={{ color: COLORS.sage }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg" style={{ color: COLORS.terracotta }}>No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-10" style={{ color: COLORS.rust }}>Related Products</h2>
          <RelatedProduct category={product.category} currentProductId={product._id} />
        </div>
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
              className="rounded-2xl shadow-xl w-full max-w-md p-6"
              style={{ backgroundColor: COLORS.parchment }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ color: COLORS.rust }}>Write a Review</h3>
                <button 
                  onClick={() => setReviewModalOpen(false)}
                  style={{ color: COLORS.rust }}
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2" style={{ color: COLORS.rust }}>Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ 
                      borderColor: COLORS.sage,
                      focusRingColor: COLORS.terracotta
                    }}
                  />
                </div>
                
                <div>
                  <label className="block mb-2" style={{ color: COLORS.rust }}>Your Rating</label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(star)}
                        className="text-2xl mr-1 focus:outline-none"
                        style={{ color: COLORS.terracotta }}
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
                  <label className="block mb-2" style={{ color: COLORS.rust }}>Your Review</label>
                  <textarea
                    placeholder="Share your experience with this product"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent h-32"
                    style={{ borderColor: COLORS.sage }}
                  ></textarea>
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <motion.button
                    onClick={handleAddReview}
                    className="flex-1 py-3 rounded-lg font-medium"
                    style={{ backgroundColor: COLORS.terracotta, color: COLORS.parchment }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Submit Review
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setReviewModalOpen(false)}
                    className="flex-1 py-3 rounded-lg font-medium"
                    style={{ backgroundColor: COLORS.sage, color: COLORS.parchment }}
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
      
      <Footer />
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default SingleProductList;