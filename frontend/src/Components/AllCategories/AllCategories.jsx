import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Premium SVG icons
const CrystalVaseIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 3L5 21M19 21L12 3M12 3L5 21M12 3L19 21" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 13H16" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const BronzeSculptureIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="5" r="2" strokeWidth="1.5"/>
    <path d="M12 7V12M12 12L9 19M12 12L15 19" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const PorcelainIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 3C15 3 17 5 17 8C17 11 15 13 12 13C9 13 7 11 7 8C7 5 9 3 12 3Z" strokeWidth="1.5"/>
    <path d="M17 8L19 21H5L7 8" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const WallArtIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5"/>
    <path d="M8 12L11 15L16 9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BowlIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4 12C4 7.58172 7.58172 4 12 4" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CenterpieceIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="10" r="3" strokeWidth="1.5"/>
    <path d="M12 13V21M8 18H16" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ModernSculptureIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="6" y="3" width="12" height="18" rx="1" strokeWidth="1.5"/>
    <path d="M9 7H15M9 11H15M9 15H15" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const VintageIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 8V12L14 14" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="9" strokeWidth="1.5"/>
  </svg>
);

const categories = [
  { name: "Crystal Vases", items: 45, icon: <CrystalVaseIcon />, link: "/crystal-vases" },
  { name: "Bronze Sculptures", items: 32, icon: <BronzeSculptureIcon />, link: "/bronze-sculptures" },
  { name: "Porcelain Figurines", items: 28, icon: <PorcelainIcon />, link: "/porcelain-figurines" },
  { name: "Artisan Wall Art", items: 60, icon: <WallArtIcon />, link: "/wall-art" },
  { name: "Decorative Bowls", items: 40, icon: <BowlIcon />, link: "/decorative-bowls" },
  { name: "Handcrafted Centerpieces", items: 55, icon: <CenterpieceIcon />, link: "/centerpieces" },
  { name: "Modern Sculptures", items: 38, icon: <ModernSculptureIcon />, link: "/modern-sculptures" },
  { name: "Vintage Collectibles", items: 25, icon: <VintageIcon />, link: "/vintage-collectibles" },
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
            Curated Collections
          </h2>
          <div className="w-24 h-1 bg-[#9E5F57] mx-auto mb-8"></div>
          <p className="text-xl max-w-2xl mx-auto tracking-wide" style={{ color: '#567A4B' }}>
            Discover our premium selection of artisanal showpieces
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
                {counts[index]} Masterpieces
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