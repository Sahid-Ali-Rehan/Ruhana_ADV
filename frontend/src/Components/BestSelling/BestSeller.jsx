import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading/Loading';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardsRef = useRef([]);
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
    // Update wishlist from localStorage
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(storedWishlist);
  }, []);

  useEffect(() => {
    if (!products.length) return;

    // Title animation - GUARANTEED to appear
    gsap.from(titleRef.current, {
      opacity: 0,
      y: 50,
      duration: 1.5,
      ease: "expo.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 85%",
        toggleActions: "play none none none",
        markers: false
      }
    });

    // Subtitle animation
    gsap.from(subtitleRef.current, {
      opacity: 0,
      y: 30,
      duration: 1.2,
      ease: "expo.out",
      delay: 0.3,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // Card animations with staggered entrance - FORCE visibility
    cardsRef.current.forEach((card, index) => {
      gsap.from(card, {
        opacity: 0,
        y: 80,
        scale: 0.9,
        duration: 1.2,
        delay: index * 0.15,
        ease: "expo.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none none",
          onEnter: () => gsap.to(card, { opacity: 1, y: 0, scale: 1 }),
          onEnterBack: () => gsap.to(card, { opacity: 1, y: 0, scale: 1 })
        }
      });

      // Card hover animations
      const img = card.querySelector('.product-image');
      const details = card.querySelector('.product-details');
      const button = card.querySelector('.view-button');
      
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { 
          y: -15, 
          duration: 0.5,
          boxShadow: '0 25px 50px rgba(129, 75, 74, 0.25)'
        });
        gsap.to(img, { scale: 1.05, duration: 0.5 });
        gsap.to(details, { backgroundColor: '#F5EBE0', duration: 0.5 });
        gsap.to(button, { 
          backgroundColor: '#814B4A', 
          color: '#EFE2B2',
          duration: 0.5 
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, { 
          y: 0, 
          duration: 0.5,
          boxShadow: '0 15px 40px rgba(129, 75, 74, 0.15)'
        });
        gsap.to(img, { scale: 1, duration: 0.5 });
        gsap.to(details, { backgroundColor: '#EFE2B2', duration: 0.5 });
        gsap.to(button, { 
          backgroundColor: '#9E5F57', 
          color: '#EFE2B2',
          duration: 0.5 
        });
      });
    });

    // Create floating particles
    const particlesContainer = document.querySelector('.particles-container');
    if (particlesContainer) {
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
          width: ${Math.random() * 10 + 5}px;
          height: ${Math.random() * 10 + 5}px;
          background: ${i % 3 === 0 ? '#9E5F57' : i % 3 === 1 ? '#567A4B' : '#814B4A'};
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          animation-duration: ${Math.random() * 15 + 15}s;
          animation-delay: ${Math.random() * 5}s;
          opacity: ${Math.random() * 0.4 + 0.1};
        `;
        particlesContainer.appendChild(particle);
      }
    }

  }, [products]);

  const handleViewDetails = (productId) => {
    navigate(`/products/single/${productId}`);
  };

  const handleWishlist = (product) => {
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const exists = storedWishlist.some(item => item._id === product._id);
    const updatedWishlist = exists
      ? storedWishlist.filter(item => item._id !== product._id)
      : [...storedWishlist, product];

    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    setWishlist(updatedWishlist);

    if (exists) {
      toast.error(`${product.productName} removed from wishlist`, { 
        position: 'bottom-right',
        theme: 'colored',
        style: { backgroundColor: '#9E5F57', color: '#EFE2B2' }
      });
    } else {
      toast.success(`${product.productName} added to wishlist`, { 
        position: 'bottom-right',
        theme: 'colored',
        style: { backgroundColor: '#567A4B', color: '#EFE2B2' }
      });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
      style={{ backgroundColor: '#EFE2B2' }}
    >
      {/* Decorative particles */}
      <div className="particles-container absolute inset-0 z-0"></div>
      
      {/* Decorative blobs */}
      <div className="absolute top-0 left-10 w-80 h-80 rounded-full bg-[#9E5F57] opacity-10 blur-[100px] z-0"></div>
      <div className="absolute bottom-0 right-10 w-60 h-60 rounded-full bg-[#567A4B] opacity-10 blur-[120px] z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 
            ref={titleRef}
            className="text-4xl md:text-5xl font-bold mb-4 opacity-100"
            style={{ color: '#814B4A', fontFamily: 'Cormorant Garamond, serif' }}
          >
            Exquisite Best Sellers
          </h2>
          <div ref={subtitleRef} className="w-24 h-1 bg-[#9E5F57] mx-auto mb-6"></div>
          <p 
            className="text-xl md:text-2xl max-w-2xl mx-auto tracking-wide opacity-100"
            style={{ color: '#567A4B' }}
          >
            Discover our most cherished collections, adored by connoisseurs worldwide
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, index) => {
              const discountedPrice = product.discount 
                ? product.price - (product.price * product.discount) / 100 
                : product.price;
              
              const isInWishlist = wishlist.some(item => item._id === product._id);

              return (
                <div
                  key={product._id}
                  ref={el => cardsRef.current[index] = el}
                  className="product-card bg-white rounded-2xl overflow-hidden transition-all duration-500 shadow-xl flex flex-col"
                  style={{ 
                    height: "480px",
                    border: '1px solid rgba(158, 95, 87, 0.2)',
                    boxShadow: '0 15px 40px rgba(129, 75, 74, 0.15)',
                    opacity: 1,
                    transform: 'translateY(0) scale(1)'
                  }}
                >
                  <div className="relative h-72 overflow-hidden flex-shrink-0">
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                      alt={product.name}
                      className="product-image w-full h-full object-cover transition-all duration-500"
                    />
                    {product.images[1] && (
                      <img
                        src={product.images[1]}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition-opacity duration-500"
                      />
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white text-lg font-bold tracking-wider">
                        Out of Stock
                      </div>
                    )}
                    <div className="absolute top-4 right-4 z-10">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWishlist(product);
                        }}
                        className="p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-300 shadow-md"
                      >
                        <FontAwesomeIcon
                          icon={isInWishlist ? solidHeart : regularHeart}
                          className={`text-xl ${isInWishlist ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}
                        />
                      </button>
                    </div>
                  </div>
                  
                  <div 
                    className="product-details p-6 transition-all duration-500 flex flex-col flex-grow"
                    style={{ backgroundColor: '#EFE2B2' }}
                  >
                    <div className="flex justify-between items-start mb-3 flex-grow-0">
                      <h3 
                        className="text-xl font-semibold tracking-wide line-clamp-2"
                        style={{ 
                          color: '#814B4A', 
                          fontFamily: 'Cormorant Garamond, serif',
                          maxHeight: '3em', // Ensures only 2 lines
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2
                        }}
                      >
                        {product.productName}
                      </h3>
                      <div className="flex flex-col items-end flex-shrink-0 ml-2">
                        <p className="text-lg font-bold" style={{ color: '#9E5F57' }}>
                          ৳{discountedPrice.toFixed(2)}
                        </p>
                        {product.discount > 0 && (
                          <span className="text-sm line-through opacity-80" style={{ color: '#97A276' }}>
                            ৳{product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <p className="text-sm mb-4 tracking-wide flex-grow-0" style={{ color: '#567A4B' }}>
                        Code: {product.productCode}
                      </p>
                      
                      <button
      className={`view-button w-full py-3 px-4 rounded-full text-lg font-medium transition-all duration-500 ${
        product.stock === 0 
          ? 'bg-[#97A276] cursor-not-allowed' 
          : 'bg-[#9E5F57] hover:bg-[#814B4A]'
      }`}
      style={{ color: '#EFE2B2' }}
      disabled={product.stock === 0}
      onClick={() => handleViewDetails(product._id)}
    >
      {product.stock === 0 ? 'Out of Stock' : 'View Details'}
    </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl" style={{ color: '#814B4A' }}>
              No best seller products available at the moment
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellers;