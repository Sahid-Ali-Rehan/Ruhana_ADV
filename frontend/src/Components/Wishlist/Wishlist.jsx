import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faTrashCan, faArrowRight, faShoppingBag, faPlus } from '@fortawesome/free-solid-svg-icons';

gsap.registerPlugin(ScrollTrigger);

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef(null);
  const navigate = useNavigate();
  const floatingBtnRef = useRef(null);

  useEffect(() => {
    // Load wishlist from localStorage
    const loadWishlist = () => {
      try {
        const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        setWishlist(storedWishlist);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading wishlist:', error);
        setIsLoading(false);
      }
    };

    loadWishlist();

    // Set up event listener for storage changes
    const handleStorageChange = () => {
      loadWishlist();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (isLoading || wishlist.length === 0) return;

    // Floating button animation
    if (floatingBtnRef.current) {
      gsap.to(floatingBtnRef.current, {
        y: 10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }

    // GSAP Animations for product cards
    if (sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll('.product-card');
      
      cards.forEach(card => {
        gsap.from(card, {
          opacity: 0,
          y: 50,
          duration: 0.8,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        });

        // Clean up previous event listeners
        const image = card.querySelector('.product-image');
        const viewButton = card.querySelector('.view-button');
        
        if (image) {
          card.addEventListener('mouseenter', () => {
            gsap.to(image, {
              scale: 1.05,
              duration: 0.4,
              ease: "power2.out"
            });
          });
          
          card.addEventListener('mouseleave', () => {
            gsap.to(image, {
              scale: 1,
              duration: 0.4,
              ease: "power2.out"
            });
          });
        }
        
        if (viewButton) {
          card.addEventListener('mouseenter', () => {
            gsap.to(viewButton, {
              backgroundColor: '#814B4A',
              duration: 0.3
            });
          });
          
          card.addEventListener('mouseleave', () => {
            gsap.to(viewButton, {
              backgroundColor: '#9E5F57',
              duration: 0.3
            });
          });
        }
      });
    }
  }, [isLoading, wishlist]);

  const handleRemoveFromWishlist = (productId) => {
    try {
      const updatedWishlist = wishlist.filter(item => item._id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      
      // Animation for removal
      const removedItem = document.getElementById(`product-${productId}`);
      if (removedItem) {
        gsap.to(removedItem, {
          opacity: 0,
          height: 0,
          padding: 0,
          margin: 0,
          duration: 0.5,
          onComplete: () => {
            setWishlist(updatedWishlist);
            
            // Force reflow to reset animation targets
            gsap.set(removedItem, { clearProps: "all" });
          }
        });
      } else {
        setWishlist(updatedWishlist);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleQuickAdd = (productId) => {
    // Animation for quick add
    const item = document.getElementById(`product-${productId}`);
    if (item) {
      gsap.fromTo(item.querySelector('.quick-add-badge'),
        { scale: 0, opacity: 0 },
        { scale: 1.2, opacity: 1, duration: 0.3, yoyo: true, repeat: 1 }
      );
    }
    
    // Implement your actual quick add logic here
    console.log('Quick add product:', productId);
  };

  const calculateDiscountedPrice = (price, discount) => {
    return discount ? price - (price * discount) / 100 : price;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EFE2B2' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#9E5F57]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#EFE2B2' }}>
      {/* Floral decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 right-10 w-40 h-40 rounded-full" style={{ backgroundColor: '#F5C9C6', opacity: 0.15 }}></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 rounded-full" style={{ backgroundColor: '#F5C9C6', opacity: 0.15 }}></div>
        <div className="absolute top-1/3 left-1/4 w-24 h-24 rounded-full" style={{ backgroundColor: '#97A276', opacity: 0.1 }}></div>
      </div>

      {/* Floating action button */}
      {wishlist.length > 0 && (
        <button 
          ref={floatingBtnRef}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 py-3 px-5 rounded-full text-lg font-medium shadow-xl transition-all"
          style={{ 
            backgroundColor: '#9E5F57',
            color: '#EFE2B2',
            fontFamily: 'Cormorant Garamond, serif'
          }}
          onClick={() => navigate('/products')}
        >
          <FontAwesomeIcon icon={faShoppingBag} />
          Shop More
        </button>
      )}

      <div className="container mx-auto p-4 relative z-10" ref={sectionRef}>
        <div className="text-center py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#814B4A', fontFamily: 'Cormorant Garamond, serif' }}>
            My Wishlist
          </h1>
          <div className="w-24 h-1 mx-auto mb-6" style={{ backgroundColor: '#97A276' }}></div>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#567A4B' }}>
            Your curated collection of favorite products
          </p>
        </div>
        
        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-6 rounded-full mb-6" style={{ backgroundColor: '#F5C9C6' }}>
              <FontAwesomeIcon 
                icon={solidHeart} 
                className="text-6xl" 
                style={{ color: '#9E5F57' }} 
              />
            </div>
            <p className="text-2xl font-bold mb-4" style={{ color: '#814B4A' }}>
              Your wishlist is empty
            </p>
            <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: '#567A4B' }}>
              Start adding products to your wishlist to save them for later
            </p>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 py-3 px-6 rounded-full text-lg font-medium transition-all"
              style={{ 
                backgroundColor: '#9E5F57',
                color: '#EFE2B2',
              }}
            >
              Browse Products
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4 md:p-8">
              {wishlist.map((product) => {
                const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
                
                return (
                  <div
                    key={product._id}
                    id={`product-${product._id}`}
                    className="product-card bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col h-full relative border-2 border-transparent transition-all duration-300"
                    style={{ borderColor: '#F5C9C6' }}
                  >
                    {/* Ribbon for discount */}
                    {product.discount > 0 && (
                      <div className="absolute top-4 left-0 py-1 px-6 font-bold z-10 shadow-md"
                        style={{ 
                          backgroundColor: '#9E5F57',
                          color: '#EFE2B2',
                          clipPath: 'polygon(0 0, 100% 0, 90% 50%, 100% 100%, 0 100%)'
                        }}
                      >
                        {product.discount}% OFF
                      </div>
                    )}
                    
                    {/* Quick add badge - appears on hover */}
                    <div className="quick-add-badge absolute top-4 right-14 z-10 opacity-0 transition-opacity">
                      <button 
                        className="p-2 rounded-full bg-white shadow-md hover:bg-[#567A4B] hover:text-white transition-all"
                        onClick={() => handleQuickAdd(product._id)}
                        title="Quick Add to Cart"
                      >
                        <FontAwesomeIcon icon={faPlus} className="text-sm" />
                      </button>
                    </div>
                    
                    {/* Remove button */}
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={() => handleRemoveFromWishlist(product._id)}
                        className="p-2 rounded-full bg-white shadow-md hover:bg-red-500 hover:text-white transition-all"
                        title="Remove from Wishlist"
                      >
                        <FontAwesomeIcon icon={faTrashCan} className="text-lg" />
                      </button>
                    </div>
                    
                    {/* Product image */}
                    <div className="relative h-72 overflow-hidden">
                      {product.images && product.images[0] ? (
                        <>
                          <img
                            src={product.images[0]}
                            alt={product.productName}
                            className="w-full h-full object-cover transition-all duration-500 product-image"
                          />
                          {product.images[1] && (
                            <img
                              src={product.images[1]}
                              alt={product.productName}
                              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            />
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-xl font-bold tracking-wider">
                          Out of Stock
                        </div>
                      )}
                    </div>
                    
                    {/* Product info */}
                    <div className="p-5 flex flex-col flex-grow" style={{ backgroundColor: '#F8F4EA' }}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-semibold mb-1" style={{ color: '#814B4A', fontFamily: 'Cormorant Garamond, serif' }}>
                            {product.productName || 'Unnamed Product'}
                          </h3>
                          <p className="text-sm mb-1" style={{ color: '#567A4B' }}>
                            Code: {product.productCode || 'N/A'}
                          </p>
                          {product.availableColors && product.availableColors.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {product.availableColors.slice(0, 3).map((color, index) => (
                                <span 
                                  key={index} 
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color }}
                                  title={`Color ${index + 1}`}
                                ></span>
                              ))}
                              {product.availableColors.length > 3 && (
                                <span className="text-xs" style={{ color: '#97A276' }}>
                                  +{product.availableColors.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
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
                      
                      <div className="mt-auto pt-4">
                        <button
                          className={`view-button w-full py-3 px-4 rounded-full text-lg font-medium transition-all duration-300 ${
                            product.stock === 0 
                              ? 'bg-gray-300 cursor-not-allowed' 
                              : 'bg-[#9E5F57] hover:bg-[#814B4A]'
                          }`}
                          style={{ color: '#EFE2B2' }}
                          disabled={product.stock === 0}
                          onClick={() => navigate(`/products/single/${product._id}`)}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Stats section */}
            <div className="max-w-4xl mx-auto mt-12 mb-8 p-6 rounded-2xl" style={{ backgroundColor: '#F5C9C6', border: '2px dashed #9E5F57' }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4">
                  <div className="text-3xl font-bold" style={{ color: '#814B4A' }}>{wishlist.length}</div>
                  <div className="text-sm" style={{ color: '#567A4B' }}>Items Saved</div>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold" style={{ color: '#814B4A' }}>
                    ৳{wishlist.reduce((acc, product) => {
                      const discountedPrice = product.discount 
                        ? calculateDiscountedPrice(product.price, product.discount)
                        : product.price;
                      return acc + discountedPrice;
                    }, 0).toFixed(2)}
                  </div>
                  <div className="text-sm" style={{ color: '#567A4B' }}>Total Value</div>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold" style={{ color: '#814B4A' }}>
                    ৳{wishlist.reduce((acc, product) => {
                      return product.discount ? acc + (product.price * product.discount) / 100 : acc;
                    }, 0).toFixed(2)}
                  </div>
                  <div className="text-sm" style={{ color: '#567A4B' }}>Potential Savings</div>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold" style={{ color: '#814B4A' }}>
                    {[...new Set(wishlist.map(p => p.category))].length}
                  </div>
                  <div className="text-sm" style={{ color: '#567A4B' }}>Categories</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;