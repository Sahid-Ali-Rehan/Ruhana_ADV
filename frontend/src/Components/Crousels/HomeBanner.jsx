import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HomeBanner = () => {
  const videoRef = useRef(null);
  const originalTextRef = useRef(null);
  const collectionTextRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768; // Detect mobile devices

    // Scale video on scroll (only for larger screens)
    if (!isMobile) {
      gsap.to(videoRef.current, {
        scale: 0.85, // Adjusted scale
        borderRadius: "30px", // Rounder corners
        scrollTrigger: {
          trigger: videoRef.current,
          start: "top top",
          end: "+=400",
          scrub: 1,
        },
      });
    }
    

    // Animation trigger settings (adjusted for mobile)
    const triggerSettings = {
      start: isMobile ? "top 80%" : "top 60%", // Delayed for mobile
      toggleActions: "play none none reverse",
    };

    // "Original" from left to right
    gsap.fromTo(
      originalTextRef.current,
      { opacity: 0, x: "-100%" },
      { opacity: 1, x: "0%", duration: 1.5, scrollTrigger: { trigger: originalTextRef.current, ...triggerSettings } }
    );

    // "Collection" from right to left
    gsap.fromTo(
      collectionTextRef.current,
      { opacity: 0, x: "100%" },
      { opacity: 1, x: "0%", duration: 1.5, scrollTrigger: { trigger: collectionTextRef.current, ...triggerSettings } }
    );
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* Video */}
      <video
        ref={videoRef}
        src="/Videos/Original-Collections.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      ></video>

      {/* Gradient Text */}
      <div className="absolute flex gap-2 sm:gap-4 text-3xl sm:text-4xl md:text-5xl font-bold">
        <span
          ref={originalTextRef}
          className="opacity-0 bg-gradient-to-r from-[#56C5DC] to-[#F68C1F] text-transparent bg-clip-text"
        >
          Original
        </span>
        <span
          ref={collectionTextRef}
          className="opacity-0 bg-gradient-to-r from-[#F68C1F] to-[#56C5DC] text-transparent bg-clip-text"
        >
          Collections
        </span>
      </div>
    </div>
  );
};

export default HomeBanner;
