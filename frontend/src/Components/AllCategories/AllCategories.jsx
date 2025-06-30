import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AllCategories = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const gridRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Men's fashion categories with image URLs
  const categories = [
    { 
      name: "Premium T-Shirts", 
      items: 42, 
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
      link: "/t-shirts" 
    },
    { 
      name: "Designer Jackets", 
      items: 36, 
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
      link: "/jackets" 
    },
    { 
      name: "Luxury Watches", 
      items: 58, 
      image: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
      link: "/watches" 
    },
    { 
      name: "Tailored Suits", 
      items: 27, 
      image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
      link: "/suits" 
    },
    { 
      name: "Denim Collection", 
      items: 45, 
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
      link: "/denim" 
    },
    { 
      name: "Footwear", 
      items: 63, 
      image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
      link: "/footwear" 
    },
    { 
      name: "Accessories", 
      items: 51, 
      image: "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
      link: "/accessories" 
    },
    { 
      name: "Sportswear", 
      items: 39, 
      image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
      link: "/sportswear" 
    },
  ];

  useEffect(() => {
    // GSAP animations for entrance effects
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

    gsap.from(".category-item", {
      opacity: 0,
      y: 80,
      stagger: 0.1,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: gridRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    // Parallax effect for images
    gsap.utils.toArray(".category-image").forEach((image, i) => {
      gsap.fromTo(image, 
        { y: -30 },
        {
          y: 30,
          scrollTrigger: {
            trigger: image,
            scrub: 1,
            start: "top bottom",
            end: "bottom top"
          }
        }
      );
    });

    // Background animation
    gsap.to(sectionRef.current, {
      backgroundPosition: "0% 100%",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="categories-section" 
      className="py-32 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #000 0%, #111 50%, #000 100%)`,
        backgroundSize: "400% 400%"
      }}
    >
      {/* Animated gradient elements */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/5 to-transparent z-0"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white/5 to-transparent z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-24" ref={headingRef}>
          <motion.h2 
            className="text-6xl font-bold mb-6 tracking-tighter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ 
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 800,
              background: "linear-gradient(to right, #fff 30%, #aaa 70%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            ESSENTIAL COLLECTIONS
          </motion.h2>
          <motion.div 
            className="w-32 h-0.5 bg-white mx-auto mb-8"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          ></motion.div>
          <motion.p 
            className="text-xl max-w-2xl mx-auto tracking-widest uppercase text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Curated Men's Fashion Categories
          </motion.p>
        </div>
        
        <div 
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {categories.map((category, index) => (
            <motion.div
              key={index}
              className="category-item relative overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              <div className="relative h-[400px] overflow-hidden">
                {/* Image container */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.img
                    src={category.image}
                    alt={category.name}
                    className="category-image w-full h-full object-cover"
                    initial={{ scale: 1.1 }}
                    animate={{ 
                      scale: hoveredIndex === index ? 1.05 : 1.1
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
                
                {/* Overlay */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/0"
                  initial={{ opacity: 0.7 }}
                  animate={{ 
                    opacity: hoveredIndex === index ? 0.4 : 0.7 
                  }}
                  transition={{ duration: 0.4 }}
                />
                
                {/* Text content */}
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <motion.h3 
                    className="text-2xl font-bold mb-1 tracking-wider"
                    initial={{ y: 0 }}
                    animate={{ 
                      y: hoveredIndex === index ? -10 : 0
                    }}
                    transition={{ duration: 0.4 }}
                    style={{ 
                      color: '#fff',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      fontWeight: 600,
                      textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                    }}
                  >
                    {category.name}
                  </motion.h3>
                  
                  <motion.div
                    className="overflow-hidden"
                    initial={{ height: 0 }}
                    animate={{ 
                      height: hoveredIndex === index ? 'auto' : 0 
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="text-gray-300 text-sm tracking-wider">
                      {category.items} premium items
                    </p>
                  </motion.div>
                  
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: hoveredIndex === index ? 1 : 0,
                      y: hoveredIndex === index ? 0 : 10
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <button 
                      className="text-white border border-white px-6 py-2 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300"
                    >
                      Explore
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllCategories;