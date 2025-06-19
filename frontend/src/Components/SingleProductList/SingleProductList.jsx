import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navigations/Navbar";
import Footer from "../Footer/Footer";
import { motion } from "framer-motion"; // Adding framer-motion for animations
import RelatedProduct from "../RelatedProduct/RelatedProduct";
import ReactStars from "react-rating-stars-component";
import ReactPlayer from 'react-player'; 
import Loading from '../Loading/Loading';
import { FaStar, FaStarHalfAlt, FaRegStar, FaWhatsapp } from 'react-icons/fa';


const SingleProductList = () => {
  const { id } = useParams(); // Get the product ID from URL
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(""); // State for selected size
  const [selectedColor, setSelectedColor] = useState(""); // State for selected color
  // State for reviews and new review
const [reviews, setReviews] = useState([]);
const [newReview, setNewReview] = useState({ name: "", rating: 0, comment: "" });
const [isReviewModalOpen, setReviewModalOpen] = useState(false); // Modal state



// Fetch reviews for the product
useEffect(() => {
  const fetchReviews = async () => {
    try {
      const response = await fetch(`https://original-collections.onrender.com/api/reviews/${id}`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  fetchReviews();
}, [id]);



// Handle review submission
const handleAddReview = async () => {
  if (!newReview.name || !newReview.rating || !newReview.comment) {
    toast.error("All fields are required.");
    return;
  }

  try {
    const response = await fetch(`https://original-collections.onrender.com/api/reviews/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newReview, productId: id }),
    });

    if (!response.ok) throw new Error("Error adding review");

    const data = await response.json();
    setReviews((prev) => [...prev, data.review]); // Add new review
    setNewReview({ name: "", rating: 0, comment: "" }); // Reset form
    toast.success("Review added successfully!");
  } catch (error) {
    toast.error("Failed to add review.");
  }
};

// Render stars for review submission
const handleRatingChange = (newRating) => {
  setNewReview((prev) => ({ ...prev, rating: newRating }));
};

// Calculate average rating
const totalReviews = reviews.length;
const averageRating =
  totalReviews > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
    : null;

// Open/close review modal
const toggleReviewModal = () => setReviewModalOpen((prev) => !prev);



  const imageRef = useRef(null);

  useEffect(() => {
    if (!id) {
      console.error("Product ID is missing.");
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://original-collections.onrender.com/api/products/single/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        setProduct(data);
        setMainImage(data.images[0]);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchProduct();
  }, [id]);

  const handleZoom = (e) => {
    const image = imageRef.current;
    const { left, top, width, height } = image.getBoundingClientRect();
    const offsetX = e.clientX - left;
    const offsetY = e.clientY - top;

    const percentX = offsetX / width;
    const percentY = offsetY / height;

    const scale = 2; // Adjust zoom scale
    image.style.transformOrigin = `${percentX * 100}% ${percentY * 100}%`;
    image.style.transform = `scale(${scale})`;
  };

  const resetZoom = () => {
    const image = imageRef.current;
    image.style.transform = "scale(1)";
  };

  if (!product) {
    return <Loading/>;
  }

  const selectedSizePrice = product.availableSizes?.find(sizeObj => sizeObj.size === selectedSize)?.sizePrice || product.price;
  const discountedPrice = selectedSizePrice * (1 - product.discount / 100);

  const handleSizeSelection = (size) => {
    setSelectedSize(size);
  };

  const handleColorSelection = (color) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (amount) => {
    if (amount > product.stock) {
      toast.error("Not enough stock available");
    } else {
      setQuantity(amount);
    }
  };

  const addToCart = (product) => {
   
  
    // If size or color is not selected, show toast error
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
      // If the item exists, increase the quantity and ensure stock limit
      const updatedQuantity = existingItem.quantity + quantity;
      if (updatedQuantity > product.stock) {
        toast.error(`Cannot add more than ${product.stock} items of ${product.productName} to the cart.`);
        return;
      }
      existingItem.quantity = updatedQuantity;
     localStorage.setItem('cart_guest', JSON.stringify(existingCartItems));
      toast.info("Product quantity increased in the cart!");
    } else {
      // If the item does not exist, add to the cart with selected size, color, and quantity
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
  
    addToCart(product); // Ensure product is added to cart before checkout
    window.location.href = "/checkout"; // Redirect to checkout page
  };
  
  const handleOrderOnWhatsApp = (product) => {
    const phoneNumber = "+8801789313805"; // Your WhatsApp Number with country code
    const productName = product.productName;
    const currentURL = window.location.href; // Gets the current product page URL
  
    // WhatsApp Message Template
    const message = `Hello, I am interested in purchasing: *${productName}*. Here is the link: ${currentURL}`;
  
    // Encode Message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
    // Redirect to WhatsApp
    window.open(whatsappURL, "_blank");
  };
  

  
  return (
    <div className="bg-[#D7F4FA]">
      <Navbar />
      <div className="max-w-7xl mx-auto bg-white py-14 px-6 sm:px-12 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="relative overflow-hidden">
              <img
                src={mainImage}
                alt={product.productName}
                ref={imageRef}
                className="w-full rounded-xl object-cover transition-transform duration-300"
                onMouseMove={handleZoom}
                onMouseLeave={resetZoom}
                style={{ cursor: "zoom-in", height: "500px" }}
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-16 h-16 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all"
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
           

{/* Render video after all images if videoUrl is available */}
{product.videoUrl && (
  <div className="mt-6">
    <h3 className="text-lg font-semibold text-gray-700">Product Video</h3>
    <ReactPlayer
      url={product.videoUrl}
      controls
      width="100%"
      height="300px"
      className="rounded-xl overflow-hidden"
    />
  </div>
)}
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-primary">{product.productName}</h1>
            <p className="text-lg text-muted">Product Code: {product.productCode}</p>
           
            {averageRating && (
  <div className="mt-4 flex items-center">
    {/* Display stars */}
    <div className="flex space-x-1 text-yellow-400">
      {Array.from({ length: 5 }).map((_, index) => {
        const ratingValue = index + 1;
        return (
          <span key={index}>
            {averageRating >= ratingValue ? (
              <FaStar />
            ) : averageRating >= ratingValue - 0.5 ? (
              <FaStarHalfAlt />
            ) : (
              <FaRegStar />
            )}
          </span>
        );
      })}
    </div>
    {/* Display average rating and total reviews */}
    <p className="ml-2 text-lg font-semibold text-gray-700">
      {averageRating} ({totalReviews}) Reviews
    </p>
  </div>
)}

            <div>
              <p className="text-2xl font-bold text-[#56C5DC]">
                Tk. {discountedPrice.toFixed(2)}{" "}
                <span className="line-through text-[#70D5E3]">Tk. {selectedSizePrice}</span>
              </p>
              <p className="text-md text-[#70D5E3]">You Save: Tk. {(selectedSizePrice - discountedPrice).toFixed(2)}</p>
            </div>

            {/* Size Selection */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-primary">Select Size</h3>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {product.availableSizes.map((sizeObj) => (
                  <motion.button
                    key={sizeObj.size}
                    className={`px-4 py-2 border rounded-lg text-sm transition-all ${
                      selectedSize === sizeObj.size
                        ? "bg-primary text-white"
                        : "bg-[#56C5DC] text-white"
                    }`}
                    onClick={() => handleSizeSelection(sizeObj.size)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {sizeObj.size} - Tk. {sizeObj.sizePrice}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-primary">Select Color</h3>
              <div className="flex space-x-3 mt-3">
                {product.availableColors.map((color) => (
                  <motion.button
                    key={color}
                    className={`w-8 h-8 rounded-full border transition-all ${
                      selectedColor === color ? "border-primary" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelection(color)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.95 }}
                  ></motion.button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-primary">Quantity</h3>
              <div className="flex items-center space-x-4 mt-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                  -
                </button>
                <span className="text-lg">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="px-4 py-2 bg-secondary rounded-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
    {/* First Row: Add to Cart & Order Now */}
    <div className="flex flex-row space-x-4">
      {/* Add to Cart Button */}
      <motion.button
        onClick={() => addToCart(product)}
        className="flex-1 py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-[#56C5DC] transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Add to Cart
      </motion.button>

      {/* Order Now Button */}
      <motion.button
        onClick={handleOrderNow}
        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 text-lg font-semibold rounded-xl transition duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Order Now
      </motion.button>
    </div>

    {/* Second Row: WhatsApp Button */}
    <motion.button
      onClick={() => handleOrderOnWhatsApp(product)}
      className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-4 text-lg font-semibold rounded-xl transition duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <FaWhatsapp className="mr-2 text-2xl" /> Order on WhatsApp
    </motion.button>
  </div>

        </div>
          </div>
          

        <div className="mt-10">
          {/* Tabs */}
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-4 py-2 text-sm font-medium ${activeTab === "description" ? "bg-primary text-white" : "bg-[#56C5DC] text-black"}`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("sizeChart")}
              className={`px-4 py-2 text-sm font-medium ${activeTab === "sizeChart" ? "bg-primary text-white" : "bg-[#56C5DC] text-black"}`}
            >
              Size Chart
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "description" && (
            <div className="mt-4 text-muted">
              <p>{product.description}</p>
            </div>
          )}
          {activeTab === "sizeChart" && (
  <div className="mt-4">
    <img
      src={product.sizeChart}
      alt="Size Chart"
      className="w-full h-auto object-contain" // You can adjust these styles as per your preference
    />
  </div>
)}

        </div>


        <div className="mt-10">
  <h2 className="text-2xl text-primary font-bold mb-4">Customer Reviews</h2>
  {reviews.length > 0 ? (
    reviews.map((review, idx) => (
      <div key={idx} className="border-b pb-4 mb-4">
        <p className="font-semibold">{review.name}</p>
        <ReactStars value={review.rating} edit={false} size={20} />
        <p>{review.comment}</p>
      </div>
    ))
  ) : (
    <p>No reviews yet.</p>
  )}

  {/* <h3 className="text-xl font-semibold mt-6">Add Your Review</h3>
  <div className="space-y-4">
    <input
      type="text"
      placeholder="Your Name"
      value={newReview.name}
      onChange={(e) => setNewReview((prev) => ({ ...prev, name: e.target.value }))}
      className="w-full p-2 border rounded"
    />
    <ReactStars value={newReview.rating} onChange={handleRatingChange} size={30} />
    <textarea
      placeholder="Your Comment"
      value={newReview.comment}
      onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
      className="w-full p-2 border rounded"
    />
    <button
      onClick={handleAddReview}
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
    >
      Submit Review
    </button>
  </div> */}

<button
  className="px-4 py-2 bg-primary text-white hover:bg-[#56C5DC] hover:text-white
"
  onClick={toggleReviewModal}
>
  Give a Review
</button>

{isReviewModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
    >
      <h3 className="text-xl font-bold text-primary mb-4">Add Your Review</h3>
      <input
        type="text"
        placeholder="Your Name"
        className="w-full px-4 py-2 mb-3 border rounded-md"
        value={newReview.name}
        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
      />
      <ReactStars
        count={5}
        size={30}
        activeColor="#ffd700"
        value={newReview.rating}
        onChange={handleRatingChange}
      />
      <textarea
        placeholder="Your Comment"
        className="w-full px-4 py-2 mt-3 border rounded-md"
        value={newReview.comment}
        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
      ></textarea>
      <div className="mt-4 flex space-x-4">
        <button
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-[#F9A02B]"
          onClick={handleAddReview}
        >
          Submit
        </button>
        <button
          className="px-4 py-2 bg-[#56C5DC] text-white rounded-md hover:bg-[#70D5E3]"
          onClick={toggleReviewModal}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  </div>
)}
</div>


      </div>

       {/* Related Products */}
    <div className="bg-white max-w-7xl mx-auto px-6 sm:px-12 md:px-20">
      {/* Related Products */}
      <RelatedProduct category={product.category} currentProductId={product._id} />
    </div>

      <Footer />
      <ToastContainer />
    </div>
  );
};

export default SingleProductList;

