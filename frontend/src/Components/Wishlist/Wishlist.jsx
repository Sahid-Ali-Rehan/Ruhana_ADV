// Wishlist.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';

gsap.registerPlugin(ScrollTrigger);

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(storedWishlist);

    // GSAP Animations
    if (sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll('.product-card');
      
      cards.forEach(card => {
        gsap.from(card, {
          opacity: 0,
          y: 50,
          duration: 0.8,
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        });

        card.addEventListener('mouseenter', () => {
          gsap.to(card, { scale: 1.05, duration: 0.3 });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, { scale: 1, duration: 0.3 });
        });
      });
    }
  }, []);

  const handleRemoveFromWishlist = (productId) => {
    const updatedWishlist = wishlist.filter(item => item._id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    setWishlist(updatedWishlist);
  };

  return (
    <div className="container mx-auto p-4" ref={sectionRef}>
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="text-center">
          <p className="text-xl text-secondary">Your wishlist is empty</p>
          <Link to="/products" className="text-blue-500 hover:underline">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
          {wishlist.map((product) => {
            const discountedPrice = product.discount
              ? product.price - (product.price * product.discount) / 100
              : product.price;

            return (
              <div
                key={product._id}
                className="product-card bg-white shadow-md overflow-hidden transform transition-transform duration-200"
                style={{ height: '440px' }}
              >
                <div className="relative group">
                  <img
                    src={product.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.productName}
                    className="w-full h-40 object-cover group-hover:opacity-0 transition-opacity duration-300"
                    style={{ height: '300px' }}
                  />
                  <img
                    src={product.images[1] || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={product.productName}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ height: '300px' }}
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-bold">
                      Out of Stock
                    </div>
                  )}
                </div>
                <div className="p-4 bg-[#d7f4fa]">
                  <h3 className="text-md font-semibold text-primary truncate">
                    {product.productName}
                  </h3>
                  <p className="text-sm font-bold text-[#56C5DC] mt-1">
                    ৳{discountedPrice.toFixed(2)}{' '}
                    <span className="line-through text-[#70D5E3] text-xs">
                      ৳{product.price.toFixed(2)}
                    </span>
                  </p>
                  <p className="text-xs text-muted mt-1 truncate">
                    Code: {product.productCode}
                  </p>
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      className="p-2 hover:text-red-700 transition-all"
                    >
                      <FontAwesomeIcon
                        icon={solidHeart}
                        className="text-xl text-red-500"
                      />
                    </button>
                  </div>
                  <button
                    className={`mt-3 w-full py-1.5 px-3 text-sm font-medium ${
                      product.stock === 0
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-[#F68C1F] text-white hover:bg-[#56C5DC]'
                    }`}
                    disabled={product.stock === 0}
                    onClick={() => navigate(`/products/single/${product._id}`)}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'View Details'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;