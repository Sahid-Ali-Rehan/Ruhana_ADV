import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import { FaArrowRight, FaHome } from "react-icons/fa";

const NotFoundPage = () => {
  const containerRef = useRef(null);
  const numberRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const buttonRef = useRef(null);
  const decorRef = useRef(null);

  useEffect(() => {
    gsap.set([numberRef.current, titleRef.current, textRef.current, buttonRef.current], { opacity: 0, y: 30 });
    gsap.set(decorRef.current.children, { scale: 0, rotation: 45 });

    const timeline = gsap.timeline();

    timeline
      .to(containerRef.current, {
        duration: 0.5,
        backgroundColor: "#ffffff",
        ease: "power2.out",
      })
      .fromTo(
        numberRef.current,
        { y: 100, scale: 1.5 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 1.2, 
          ease: "elastic.out(1, 0.8)",
          onComplete: () => {
            // Create floating particles
            for (let i = 0; i < 20; i++) {
              const particle = document.createElement("div");
              particle.className = "absolute w-1 h-1 bg-black rounded-full";
              particle.style.left = `${Math.random() * 100}%`;
              particle.style.top = `${Math.random() * 100}%`;
              decorRef.current.appendChild(particle);
              
              gsap.to(particle, {
                x: gsap.utils.random(-50, 50),
                y: gsap.utils.random(-50, 50),
                opacity: gsap.utils.random(0.2, 0.8),
                scale: gsap.utils.random(0.5, 2),
                duration: gsap.utils.random(3, 6),
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
              });
            }
          }
        },
        0.5
      )
      .to(
        titleRef.current,
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.8"
      )
      .to(
        textRef.current,
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.7"
      )
      .to(
        buttonRef.current,
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      )
      .to(
        decorRef.current.children,
        { 
          scale: 1, 
          rotation: 0, 
          duration: 1.5, 
          stagger: 0.1,
          ease: "elastic.out(1, 0.8)" 
        },
        "-=0.5"
      );

    // Continuous rotation for decorative elements
    gsap.to(decorRef.current.children, {
      rotation: 360,
      duration: 120,
      repeat: -1,
      ease: "none"
    });

    return () => {
      timeline.kill();
      gsap.killTweensOf([numberRef.current, titleRef.current, textRef.current, buttonRef.current]);
    };
  }, []);

  const handleHover = () => {
    gsap.to(buttonRef.current, {
      scale: 1.05,
      duration: 0.3,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
      ease: "power2.out"
    });
  };

  const handleHoverEnd = () => {
    gsap.to(buttonRef.current, {
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      duration: 0.4,
      ease: "elastic.out(1, 0.8)"
    });
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden"
    >
      {/* Decorative Elements */}
      <div ref={decorRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 border-2 border-black border-dashed rounded-full opacity-10"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 border border-black rounded-full opacity-5"></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 border border-black rounded-full opacity-5"></div>
        <div className="absolute bottom-1/3 right-1/3 w-16 h-16 border-2 border-black border-dashed rounded-full opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-black rounded-full opacity-5"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 py-16 max-w-4xl">
        <div className="flex justify-center mb-2">
          <h1 
            ref={numberRef} 
            className="text-[15rem] md:text-[20rem] font-bold tracking-tighter leading-none opacity-100"
            style={{
              background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: "0 10px 30px rgba(0,0,0,0.05)",
              fontFamily: "'Bebas Neue', sans-serif"
            }}
          >
            404
          </h1>
        </div>
        
        <div ref={titleRef} className="mb-6">
          <h2 className="text-5xl md:text-6xl font-light tracking-widest uppercase mb-6">
            Page Not Found
          </h2>
          <div className="w-32 h-0.5 bg-black mx-auto"></div>
        </div>
        
        <p 
          ref={textRef} 
          className="text-xl md:text-2xl opacity-80 mb-16 max-w-2xl mx-auto leading-relaxed tracking-wide"
        >
          The page you're looking for has been moved or doesn't exist. 
          Return to our luxurious collection of premium showpieces.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link 
            to="/"
            ref={buttonRef}
            onMouseEnter={handleHover}
            onMouseLeave={handleHoverEnd}
            className="bg-black text-white py-5 px-12 text-xl font-medium tracking-widest uppercase flex items-center justify-center gap-4 transition-all duration-500 transform hover:gap-6"
            style={{ letterSpacing: '0.2em' }}
          >
            Return Home
            <FaArrowRight className="transition-all duration-500" />
          </Link>
          
          <Link 
            to="/products"
            className="bg-transparent border-2 border-black text-black py-5 px-12 text-xl font-medium tracking-widest uppercase flex items-center justify-center gap-4 hover:bg-black hover:text-white transition-all duration-500"
            style={{ letterSpacing: '0.2em' }}
          >
            Browse Products
            <FaArrowRight className="transition-all duration-500" />
          </Link>
        </div>
      </div>

      {/* Floating particles will be generated by GSAP */}
    </div>
  );
};

export default NotFoundPage;