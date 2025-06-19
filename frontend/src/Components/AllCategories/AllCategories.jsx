import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaMobileAlt, FaPlug, FaLaptop, FaBatteryFull, FaApple, FaHeadphonesAlt, FaTools } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

const categories = [
  { name: "মোবাইল ফোন চারজার", items: 120, icon: <FaPlug size={30} />, link: "/products?category=Adapters" },
  { name: "ল্যাপটপ চারজার", items: 80, icon: <FaLaptop size={30} />, link: "/products?category=Adapters" },
  { name: "এয়ার ফোন / হেড ফোন", items: 200, icon: <FaHeadphonesAlt size={30} />, link: "/products?category=Headphones" },
  { name: "পাওয়ার ব্যাংক", items: 100, icon: <FaBatteryFull size={30} />, link: "/products?category=PowerBank" },
  { name: "স্মার্ট ওয়াচ", items: 60, icon: <FaApple size={30} />, link: "/products?category=SmartWatch" },
  { name: "মোবাইল গ্যাজেট", items: 90, icon: <FaTools size={30} />, link: "/products?category=MobileGadgets" },
  { name: "মোবাইল ফোন", items: 150, icon: <FaMobileAlt size={30} />, link: "/products?category=SmartPhones" },
  { name: "গেমিং অ্যাক্সেসরিজ", items: 110, icon: <FaTools size={30} />, link: "/products?category=GamingAccessories" },
];

const AllCategories = () => {
  const [counts, setCounts] = useState(categories.map(() => 0));
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const bgCircleRef = useRef(null);

  useEffect(() => {
    const incrementCounts = () => {
      setCounts((prev) =>
        prev.map((count, index) => (count < categories[index].items ? count + 1 : count))
      );
    };
    const interval = setInterval(incrementCounts, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    gsap.from(headingRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: headingRef.current,
        start: "top 80%",
        end: "top 50%",
        toggleActions: "play none none none",
      },
    });

    // Category card animations on scroll
    categories.forEach((_, index) => {
      gsap.fromTo(
        `.category-item-${index}`,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 1,
          scrollTrigger: {
            trigger: `.category-item-${index}`,
            start: "top 80%",
            end: "top 50%",
            toggleActions: "play none none none",
            scrub: true, // Scrubs the animation, making it reverse smoothly
          },
        }
      );
    });

    gsap.to(bgCircleRef.current, {
      rotate: 360,
      scale: 1.1,
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: "linear",
    });
  }, []);

  return (
    <section id="categories-section" className="py-16 relative overflow-hidden" ref={sectionRef}>
      <div
        ref={bgCircleRef}
        className="bg-circle absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-400 to-sky-400 rounded-full opacity-30 blur-3xl"
      ></div>

      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="star absolute bg-white rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            opacity: Math.random() * 0.7 + 0.3,
            animation: `twinkle ${Math.random() * 1.5 + 0.5}s infinite alternate`,
          }}
        ></div>
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12" ref={headingRef}>
          <h2 className="text-4xl font-extrabold mb-4 text-orange-500">*আমাদের ক্যাটাগরি দেখুন*</h2>
          <p className="text-lg text-sky-600">জনপ্রিয় ক্যাটাগরিগুলো ব্রাউজ করুন</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <motion.a
              key={index}
              href={category.link}
              className={`category-item-${index} category-item flex flex-col items-center justify-center p-6 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 bg-white text-black border border-gray-200 cursor-pointer`}
            >
              <div className="mb-4 p-4 rounded-full bg-orange-500 text-white">{category.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-sky-600">{category.name}</h3>
              <p className="text-gray-600">{counts[index]}+ প্রোডাক্ট</p>
            </motion.a>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0.3; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </section>
  );
};

export default AllCategories;
