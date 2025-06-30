import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const FeaturedProduct = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const sectionRef = useRef(null);
  
  const productImages = [
    "/Featured/0.jpg",
    "/Featured/1.jpg",
    "/Featured/2.jpg",
    "/Featured/3.jpg",
    "/Featured/4.jpg"
  ];

  useEffect(() => {
    // GSAP animations for scroll-triggered effects
    gsap.utils.toArray(".gsap-animate").forEach(element => {
      gsap.from(element, {
        scrollTrigger: {
          trigger: element,
          start: "top 90%",
          toggleActions: "play none none none"
        },
        opacity: 0,
        y: 60,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.2
      });
    });

    // Clean up ScrollTrigger instances
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="min-h-screen bg-white py-20 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Minimalist header with GSAP animation */}
        <div className="text-center mb-24 overflow-hidden">
          <div className="overflow-hidden">
            <h1 className="gsap-animate text-5xl md:text-7xl font-light tracking-tight text-black">
              AIR MAX 270
            </h1>
          </div>
          
          <div className="overflow-hidden mt-2">
            <p className="gsap-animate text-gray-600 text-xl">
              Modern Design ∙ Timeless Comfort
            </p>
          </div>
        </div>

        {/* Main product showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image gallery */}
          <div className="relative">
            {/* Floating main image */}
            <div className="gsap-animate aspect-square bg-gray-50 overflow-hidden">
              <motion.img
                key={activeImage}
                src={productImages[activeImage]}
                alt="Featured product"
                className="w-full h-full object-contain p-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Thumbnail grid with hover animations */}
            <div className="grid grid-cols-5 gap-4 mt-12">
              {productImages.map((img, index) => (
                <div 
                  key={index}
                  className="relative overflow-hidden"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <motion.button
                    className={`w-full h-full ${index === activeImage ? "bg-black" : "bg-gray-100"}`}
                    whileHover={{ 
                      y: -10,
                      backgroundColor: index === activeImage ? "#000" : "#f5f5f5"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveImage(index)}
                  >
                    <div className="aspect-square relative">
                      <img 
                        src={img} 
                        alt={`Product view ${index}`} 
                        className="w-full h-full object-cover"
                      />
                      <motion.div 
                        className="absolute inset-0 bg-black"
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: hoveredIndex === index && index !== activeImage ? 0.1 : 0
                        }}
                      />
                    </div>
                  </motion.button>
                  
                  {/* Explore button with your exact animation */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: hoveredIndex === index ? 1 : 0,
                      y: hoveredIndex === index ? 0 : 10
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <Link to="/products">
                      <button 
                        className="bg-transparent text-white border border-white px-6 py-2 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 flex items-center"
                      >
                        Explore
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 ml-2" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M14 5l7 7m0 0l-7 7m7-7H3" 
                          />
                        </svg>
                      </button>
                    </Link>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Minimalist details */}
          <div className="text-center lg:text-left">
            <div className="gsap-animate">
              {/* Divider */}
              <div className="h-px bg-black mx-auto lg:mx-0 mb-12 w-24"></div>
              
              {/* Description */}
              <p className="text-2xl text-gray-700 max-w-lg mx-auto lg:mx-0 mb-12">
                Precision-engineered for both aesthetic appeal and uncompromised comfort.
              </p>
              
              <div className="h-px bg-black w-24 mx-auto lg:mx-0 mb-12"></div>
              
              {/* Technical highlights */}
              <div className="mt-16 space-y-6">
                <h3 className="text-sm uppercase tracking-widest text-gray-500">
                  Technical Details
                </h3>
                
                <ul className="space-y-4 text-gray-700">
                  {[
                    "Max Air unit for responsive cushioning",
                    "Breathable engineered mesh upper",
                    "Lightweight foam midsole",
                    "Rubber outsole for durable traction"
                  ].map((item, index) => (
                    <li 
                      key={index}
                      className="flex items-start gsap-animate"
                    >
                      <span className="mr-3">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Rectangular "Explore Product" button */}
              <div className="mt-16 gsap-animate">
                <Link to="/products">
                  <motion.button
                    className="px-12 py-5 bg-black text-white font-medium tracking-wider text-lg flex items-center justify-center mx-auto lg:mx-0"
                    whileHover={{
                      backgroundColor: "#333",
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ 
                      scale: 0.98,
                      backgroundColor: "#000" 
                    }}
                  >
                    EXPLORE PRODUCT
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 ml-3" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M14 5l7 7m0 0l-7 7m7-7H3" 
                      />
                    </svg>
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProduct;