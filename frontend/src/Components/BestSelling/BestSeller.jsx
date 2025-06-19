import React, { useState, useEffect, useRef} from "react";
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading/Loading';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  const sectionRef = useRef(null); // Reference for the section
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all products from your API
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://ruhana-adv.onrender.com/api/products/fetch-products");
        const data = await response.json();
        const bestSellers = data.filter((product) => product.isBestSeller === true);
        setProducts(bestSellers);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // GSAP animations
    if (sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll(".product-card");

      cards.forEach((card, index) => {
        gsap.from(card, {
          opacity: 0,
          y: 50,
          duration: 0.8,
          scrollTrigger: {
            trigger: card,
            start: "top 80%", // Animation starts when the top of the card hits 80% of the viewport
            end: "bottom 20%", // Animation ends when the bottom of the card hits 20% of the viewport
            toggleActions: "play none none reverse", // Play on enter, reverse on leave
          },
        });

        // Add a hover effect
        gsap.to(card, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
          paused: true,
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            end: "bottom 20%",
          },
        });

        card.addEventListener("mouseenter", () => {
          gsap.to(card, { scale: 1.05, duration: 0.3 });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, { scale: 1, duration: 0.3 });
        });
      });

      // Add shapes or decorative elements
      const shapes = gsap.timeline({ repeat: -1, yoyo: true });
      shapes.to(".shape-1", { x: 50, y: -50, duration: 3, ease: "power1.inOut" });
      shapes.to(".shape-2", { x: -50, y: 50, duration: 3, ease: "power1.inOut" }, "-=3");
    }
  }, [products]); // Re-run animations when products are loaded

  const handleViewDetails = (productId) => {
    navigate(`/products/single/${productId}`);
  };

 // BestSellers.js (updated wishlist handling)
 const handleWishlist = (product) => {
  const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  const exists = storedWishlist.some(item => item._id === product._id);
  const updatedWishlist = exists
    ? storedWishlist.filter(item => item._id !== product._id)
    : [...storedWishlist, product];

  localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  setWishlist(updatedWishlist);

  // Show toast notifications
  if (exists) {
    toast.error(`${product.productName} removed from wishlist`, { position: 'bottom-right' });
  } else {
    toast.success(`${product.productName} added to wishlist`, { position: 'bottom-right' });
  }
};


// Update the initial wishlist state
useEffect(() => {
  const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  setWishlist(storedWishlist);
}, []);

  
  
 

  if (loading) {
    return <Loading />;
  }

  return (
    <div ref={sectionRef}>
      {/* Heading for Best Sellers */}
      <h2 className="text-3xl font-bold text-center text-primary mt-10 mb-6">
        Best Sellers
      </h2>

      {/* Decorative shapes */}
      <div className="shape-1 absolute w-20 h-20 bg-[#56C5DC] rounded-full opacity-30 top-20 left-10"></div>
      <div className="shape-2 absolute w-20 h-20 bg-[#F68C1F] rounded-full opacity-30 bottom-20 right-10"></div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
          {products.map((product) => {
            const discountedPrice = product.discount ? product.price - (product.price * product.discount) / 100 : product.price;

            return (
              <div
                key={product._id}
                className="product-card bg-white shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-200"
                style={{ height: "440px" }}
              >
                <div className="relative group">
                  <img
                    src={product.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.name}
                    className="w-full h-40 object-cover group-hover:opacity-0 transition-opacity duration-300"
                    style={{ height: "300px" }}
                  />
                  <img
                    src={product.images[1] || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ height: "300px" }}
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-bold">
                      Out of Stock
                    </div>
                  )}
                </div>
                <div className="p-4 bg-[#d7f4fa]">
                  <h3 className="text-md font-semibold text-primary truncate">{product.productName}</h3>
                  <p className="text-sm font-bold text-[#56C5DC] mt-1">
                    ৳{discountedPrice.toFixed(2)}{' '}
                    <span className="line-through text-[#70D5E3] text-xs">৳{product.price.toFixed(2)}</span>
                  </p>
                  <p className="text-xs text-muted mt-1 truncate">Code: {product.productCode}</p>
                  <div className="absolute top-2 right-2">
  <button 
    onClick={(e) => {
      e.stopPropagation();
      handleWishlist(product);
    }}
    className="p-2 hover:text-red-500 transition-all"
  >
    <FontAwesomeIcon
      icon={wishlist.some(item => item._id === product._id) ? solidHeart : regularHeart}
      className={`text-xl ${wishlist.some(item => item._id === product._id) ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}
    />
  </button>
</div>
                  <button
                    className={`mt-3 w-full py-1.5 px-3 text-sm font-medium ${product.stock === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#F68C1F] text-white hover:bg-[#56C5DC]'}`}
                    disabled={product.stock === 0}
                    onClick={() => handleViewDetails(product._id)}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'View Details'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>No Best Seller products available.</div>
      )}
    </div>
  );
};

export default BestSellers;