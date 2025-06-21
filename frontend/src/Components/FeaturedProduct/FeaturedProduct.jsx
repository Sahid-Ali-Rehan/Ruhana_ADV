import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaShoppingCart, FaStar } from "react-icons/fa";

const FeaturedProduct = () => {
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);

  useEffect(() => {
    // Animate decorative blobs
    const animateBlobs = () => {
      if (blob1Ref.current && blob2Ref.current) {
        const animate = (element, x, y, duration) => {
          element.animate(
            [
              { transform: 'translate(0, 0)' },
              { transform: `translate(${x}px, ${y}px)` },
              { transform: 'translate(0, 0)' }
            ],
            {
              duration: duration * 1000,
              iterations: Infinity,
              easing: 'ease-in-out'
            }
          );
        };

        animate(blob1Ref.current, 30, -30, 25);
        animate(blob2Ref.current, -40, 40, 30);
      }
    };

    animateBlobs();
  }, []);

  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ backgroundColor: '#EFE2B2' }}
    >
      {/* Decorative elements */}
      <div ref={blob1Ref} className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#9E5F57] opacity-10 blur-[100px]"></div>
      <div ref={blob2Ref} className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#567A4B] opacity-10 blur-[120px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div 
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              style={{
                border: '2px solid #9E5F57',
                backgroundColor: '#F5EBE0',
                boxShadow: '0 30px 60px rgba(129, 75, 74, 0.25)'
              }}
            >
              <img
                src="/Featured/Featured.png"
                alt="Premium Crystal Vase"
                className="w-full max-w-lg object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#814B4A]/20 to-transparent"></div>
            </div>
          </motion.div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="text-4xl font-bold mb-8"
              style={{ color: "#814B4A", fontFamily: 'Cormorant Garamond, serif' }}
            >
              Crystal Elegance Vase
            </motion.h2>
            
            {/* Star rating */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center mb-8"
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={i} 
                    className="text-2xl mr-1" 
                    style={{ color: '#9E5F57' }} 
                  />
                ))}
              </div>
              <span className="ml-4 text-lg" style={{ color: '#567A4B' }}>128 Reviews</span>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              className="text-xl mb-10 leading-relaxed tracking-wide"
              style={{ color: "#567A4B" }}
            >
              Handcrafted by master artisans, this crystal vase features intricate cuts that capture and reflect light beautifully. Perfect for displaying floral arrangements or as a standalone decorative piece.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex items-center mb-12"
            >
              <p
                className="text-4xl font-bold mr-6"
                style={{ color: "#9E5F57" }}
              >
                $129.99
              </p>
              <span
                className="text-xl line-through opacity-80"
                style={{ color: "#97A276" }}
              >
                $149.99
              </span>
            </motion.div>
            
            {/* Add to Collection Button - Guaranteed to appear */}
            <motion.button
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
              className="flex items-center justify-center px-10 py-5 rounded-full text-xl font-medium transition-all duration-500 group w-full max-w-md"
              style={{
                backgroundColor: "#814B4A",
                color: "#EFE2B2",
                boxShadow: "0 15px 40px rgba(129, 75, 74, 0.35)"
              }}
            >
              <FaShoppingCart className="mr-4 transition-transform duration-500 group-hover:translate-x-2" />
              <span className="tracking-wider group-hover:tracking-widest transition-all duration-500">
                Add to Collection
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProduct;