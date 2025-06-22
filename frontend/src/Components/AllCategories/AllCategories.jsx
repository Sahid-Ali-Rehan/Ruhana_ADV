import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Updated SVG icons for the new categories
const MatirFuldaniIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 3L5 21M19 21L12 3M12 3L5 21M12 3L19 21" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 13H16" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="8" r="2" strokeWidth="1.5"/>
  </svg>
);

const CandleIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M9 21H15M12 3V20M12 3C10.3431 3 9 4.34315 9 6C9 7.65685 10.3431 9 12 9C13.6569 9 15 7.65685 15 6C15 4.34315 13.6569 3 12 3Z" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 9V12" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const WalmartIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 7H21V17H3V7Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 12H17" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 17V20" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M17 17V20" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const MirrorBottleIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 3L15 8L12 13L9 8L12 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 8L7 21" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 8L17 21" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 13V17" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ToteBagIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M4 7H20V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V7Z" strokeWidth="1.5"/>
    <path d="M8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7" strokeWidth="1.5"/>
    <path d="M8 11H16" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TShirtIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M6 3H18L20 8H4L6 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 8H20V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V8Z" strokeWidth="1.5"/>
    <path d="M10 12H14" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Related categories
const HomeDecorIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" strokeWidth="1.5"/>
    <path d="M9 21V12H15V21" strokeWidth="1.5"/>
  </svg>
);

const AccessoriesIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="3" strokeWidth="1.5"/>
    <path d="M7 13C7 10.2386 9.23858 8 12 8C14.7614 8 17 10.2386 17 13" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 13V16" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M17 13V16" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const categories = [
  { name: "Matir Fuldani", items: 42, icon: <MatirFuldaniIcon />, link: "/matir-fuldani" },
  { name: "Premium Candles", items: 36, icon: <CandleIcon />, link: "/candles" },
  { name: "Walmart Collection", items: 58, icon: <WalmartIcon />, link: "/walmart" },
  { name: "Mirror Bottle Art", items: 27, icon: <MirrorBottleIcon />, link: "/mirror-bottle" },
  { name: "Tote Bags", items: 45, icon: <ToteBagIcon />, link: "/tote-bags" },
  { name: "T-Shirts", items: 63, icon: <TShirtIcon />, link: "/t-shirts" },
  { name: "Home Decor", items: 51, icon: <HomeDecorIcon />, link: "/home-decor" },
  { name: "Fashion Accessories", items: 39, icon: <AccessoriesIcon />, link: "/accessories" },
];

gsap.registerPlugin(ScrollTrigger);

const AllCategories = () => {
  const [counts, setCounts] = useState(categories.map(() => 0));
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);

  useEffect(() => {
    // Animate decorative blobs
    gsap.to(blob1Ref.current, {
      x: 30,
      y: -30,
      duration: 25,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsap.to(blob2Ref.current, {
      x: -40,
      y: 40,
      duration: 30,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    const incrementCounts = () => {
      setCounts((prev) =>
        prev.map((count, index) => (count < categories[index].items ? count + 1 : count))
      );
    };
    
    const interval = setInterval(incrementCounts, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Heading animation
    gsap.from(headingRef.current, {
      opacity: 0,
      y: 50,
      duration: 1.2,
      ease: "expo.out",
      scrollTrigger: {
        trigger: headingRef.current,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  }, []);

  return (
    <section 
      id="categories-section" 
      className="py-24 relative overflow-hidden" 
      ref={sectionRef}
      style={{ backgroundColor: '#EFE2B2' }}
    >
      {/* Decorative elements */}
      <div ref={blob1Ref} className="absolute top-0 left-0 w-60 h-60 rounded-full bg-[#9E5F57] opacity-15 blur-[100px]"></div>
      <div ref={blob2Ref} className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#567A4B] opacity-15 blur-[120px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20" ref={headingRef}>
          <h2 className="text-4xl font-bold mb-6" style={{ color: '#814B4A', fontFamily: 'Cormorant Garamond, serif' }}>
            Our Collections
          </h2>
          <div className="w-24 h-1 bg-[#9E5F57] mx-auto mb-8"></div>
          <p className="text-xl max-w-2xl mx-auto tracking-wide" style={{ color: '#567A4B' }}>
            Discover our premium selection of artisanal products
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="flex flex-col items-center justify-center p-10 rounded-2xl transition-all duration-500 cursor-pointer overflow-hidden relative group"
              style={{
                backgroundColor: '#F5EBE0',
                border: '1px solid rgba(158, 95, 87, 0.2)',
                boxShadow: '0 15px 40px rgba(129, 75, 74, 0.08)',
              }}
              whileHover={{ 
                y: -15,
                boxShadow: '0 25px 50px rgba(129, 75, 74, 0.15)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#9E5F57]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div 
                className="mb-6 p-4 rounded-full transition-all duration-500 group-hover:scale-110"
                style={{ 
                  backgroundColor: '#9E5F57',
                  color: '#EFE2B2',
                }}
              >
                {category.icon}
              </div>
              
              <h3 
                className="text-xl font-medium mb-3 text-center tracking-wide"
                style={{ color: '#814B4A', fontFamily: 'Cormorant Garamond, serif' }}
              >
                {category.name}
              </h3>
              
              <p className="text-sm uppercase tracking-wider" style={{ color: '#567A4B' }}>
                {counts[index]} Unique Items
              </p>
              
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#9E5F57] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllCategories;