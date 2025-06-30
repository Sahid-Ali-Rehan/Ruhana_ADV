import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
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

    // Title animation
    gsap.from(titleRef.current, {
      opacity: 0,
      y: 80,
      duration: 1.8,
      ease: "expo.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // Subtitle animation
    gsap.from(subtitleRef.current, {
      opacity: 0,
      y: 50,
      duration: 1.5,
      ease: "expo.out",
      delay: 0.3,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // Card animations with staggered entrance
    cardsRef.current.forEach((card, index) => {
      gsap.from(card, {
        opacity: 0,
        y: 120,
        scale: 0.95,
        duration: 1.5,
        delay: index * 0.1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none none"
        }
      });

      // Card hover animations
      const img = card.querySelector('.product-image');
      const details = card.querySelector('.product-details');
      const button = card.querySelector('.view-button');
      
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { 
          y: -15, 
          duration: 0.4,
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
        });
        gsap.to(img, { scale: 1.03, duration: 0.4 });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, { 
          y: 0, 
          duration: 0.4,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
        });
        gsap.to(img, { scale: 1, duration: 0.4 });
      });
    });

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
        style: { backgroundColor: '#000', color: '#fff' }
      });
    } else {
      toast.success(`${product.productName} added to wishlist`, { 
        position: 'bottom-right',
        theme: 'colored',
        style: { backgroundColor: '#000', color: '#fff' }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-xl tracking-widest">LOADING...</div>
      </div>
    );
  }

  return (
    <section 
      ref={sectionRef}
      className="relative py-32 overflow-hidden bg-white"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-24">
          <h2 
            ref={titleRef}
            className="text-5xl md:text-6xl font-bold mb-6 tracking-tighter"
            style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
          >
            ESSENTIAL SELECTIONS
          </h2>
          <div ref={subtitleRef} className="w-32 h-0.5 bg-black mx-auto mb-8"></div>
          <p 
            className="text-xl md:text-2xl max-w-2xl mx-auto tracking-widest uppercase"
            style={{ letterSpacing: '0.3em' }}
          >
            CURATED EXCELLENCE
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {products.map((product, index) => {
              const discountedPrice = product.discount 
                ? product.price - (product.price * product.discount) / 100 
                : product.price;
              
              const isInWishlist = wishlist.some(item => item._id === product._id);

              return (
                <div
                  key={product._id}
                  ref={el => cardsRef.current[index] = el}
                  className="product-card bg-white overflow-hidden flex flex-col border border-gray-200"
                  style={{ 
                    height: "520px",
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div className="relative h-72 overflow-hidden flex-shrink-0 group">
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                      alt={product.name}
                      className="product-image w-full h-full object-cover transition-all duration-500"
                    />
                    {product.images[1] && (
                      <img
                        src={product.images[1]}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      />
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 text-white text-sm font-bold tracking-widest p-4 text-center">
                        CURRENTLY UNAVAILABLE
                      </div>
                    )}
                    <div className="absolute top-4 right-4 z-10">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWishlist(product);
                        }}
                        className="p-3 bg-white hover:bg-black transition-all duration-300"
                        style={{ boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                      >
                        <FontAwesomeIcon
                          icon={isInWishlist ? solidHeart : regularHeart}
                          className={`text-lg ${isInWishlist ? 'text-black' : 'text-gray-400'}`}
                        />
                      </button>
                    </div>
                    
                    {/* View Details Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-30">
                      <button
                        onClick={() => handleViewDetails(product._id)}
                        className="px-8 py-3 bg-white text-black text-sm tracking-widest uppercase border border-black hover:bg-black hover:text-white transition-all duration-300"
                        style={{ letterSpacing: '0.2em' }}
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                  
                  <div 
                    className="product-details p-6 flex flex-col flex-grow border-t border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-4 flex-grow">
                      <h3 
                        className="text-xl font-medium tracking-wide uppercase"
                        style={{ 
                          letterSpacing: '0.1em',
                          maxWidth: '70%'
                        }}
                      >
                        {product.productName}
                      </h3>
                      <div className="flex flex-col items-end flex-shrink-0 ml-2">
                        <p className="text-lg font-medium tracking-tight">
                          ৳{discountedPrice.toFixed(2)}
                        </p>
                        {product.discount > 0 && (
                          <span className="text-sm line-through opacity-50">
                            ৳{product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <p className="text-xs tracking-widest uppercase opacity-70" style={{ letterSpacing: '0.2em' }}>
                          {product.productCode}
                        </p>
                        
                        <button
                          className={`view-button py-3 px-6 text-sm tracking-widest uppercase ${
                            product.stock === 0 
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                              : 'bg-black text-white hover:bg-white hover:text-black border border-black'
                          }`}
                          style={{ letterSpacing: '0.2em' }}
                          disabled={product.stock === 0}
                          onClick={() => handleViewDetails(product._id)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32">
            <p className="text-xl tracking-widest" style={{ letterSpacing: '0.2em' }}>
              NO SELECTIONS CURRENTLY AVAILABLE
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellers;