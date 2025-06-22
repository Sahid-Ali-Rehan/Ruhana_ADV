import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HomeBanner = () => {
  const videoRef = useRef(null);
  const textContainerRef = useRef(null);
  const exquisiteRef = useRef(null);
  const collectionsRef = useRef(null);
  const overlayRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);

  useEffect(() => {
    // Create floating particles with premium effects
    const createParticle = (i) => {
      const particle = document.createElement('div');
      particle.className = 'floating-particle';
      
      const colors = ['#9E5F57', '#567A4B', '#814B4A'];
      const sizes = ['w-2 h-2', 'w-3 h-3', 'w-1.5 h-1.5'];
      
      particle.className = `absolute rounded-full ${sizes[i % 3]} floating-particle`;
      particle.style.backgroundColor = colors[i % 3];
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.opacity = `${Math.random() * 0.4 + 0.1}`;
      particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      
      document.querySelector('.particles-container').appendChild(particle);
      return particle;
    };

    const particles = Array.from({ length: 20 }, (_, i) => createParticle(i));

    // Video scale animation
    gsap.to(videoRef.current, {
      scale: 0.9,
      borderRadius: "24px",
      scrollTrigger: {
        trigger: videoRef.current,
        start: "top top",
        end: "+=500",
        scrub: 1.5,
      },
    });

    // Overlay animation
    gsap.to(overlayRef.current, {
      opacity: 0.6,
      duration: 1.8,
      scrollTrigger: {
        trigger: videoRef.current,
        start: "top center",
        end: "bottom center",
        scrub: true,
      },
    });

    // Text animations with premium entrance
    const tl = gsap.timeline({
      defaults: { duration: 1.8, ease: "expo.out" },
      scrollTrigger: {
        trigger: textContainerRef.current,
        start: "top 85%",
        toggleActions: "play none none none",
      }
    });

    tl.fromTo(exquisiteRef.current, 
      { opacity: 0, y: 80, filter: "blur(10px)" },
      { opacity: 1, y: 0, filter: "blur(0px)" }
    );

    tl.fromTo(collectionsRef.current, 
      { opacity: 0, y: 80, filter: "blur(10px)" },
      { opacity: 1, y: 0, filter: "blur(0px)" },
      "-=1.2"
    );

    // Floating animation for text
    gsap.to([exquisiteRef.current, collectionsRef.current], {
      y: 15,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Animate decorative blobs
    gsap.to(blob1Ref.current, {
      x: 40,
      y: -40,
      duration: 25,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsap.to(blob2Ref.current, {
      x: -60,
      y: 50,
      duration: 30,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Cleanup
    return () => {
      particles.forEach(p => p.remove());
    };
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
        className="absolute top-0 left-0 w-full h-full object-cover z-0 scale-100"
      ></video>

      {/* Gradient overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-gradient-to-b from-[#9E5F57]/50 to-[#EFE2B2]/30 z-10"
      ></div>

      {/* Particles container */}
      <div className="particles-container absolute inset-0 z-10"></div>

      {/* Text */}
      <div 
        ref={textContainerRef}
        className="absolute flex flex-col sm:flex-row gap-4 sm:gap-6 z-20"
      >
        <span
          ref={exquisiteRef}
          className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold opacity-0 tracking-tight"
          style={{ 
            color: '#EFE2B2',
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 600,
            textShadow: '0 4px 20px rgba(129, 75, 74, 0.6)'
          }}
        >
          Ruhana's
        </span>
        <span
          ref={collectionsRef}
          className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold opacity-0 tracking-tight"
          style={{ 
            color: '#EFE2B2',
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: 600,
            textShadow: '0 4px 20px rgba(86, 122, 75, 0.6)'
          }}
        >
          Decorations
        </span>
      </div>

      {/* Decorative elements */}
      <div ref={blob1Ref} className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-[#9E5F57] opacity-15 blur-[100px] z-0"></div>
      <div ref={blob2Ref} className="absolute top-10 right-10 w-60 h-60 rounded-full bg-[#567A4B] opacity-15 blur-[120px] z-0"></div>
    </div>
  );
};

export default HomeBanner;