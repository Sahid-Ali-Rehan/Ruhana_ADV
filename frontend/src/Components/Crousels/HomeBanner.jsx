import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HomeBanner = () => {
  const videoRef = useRef(null);
  const textContainerRef = useRef(null);
  const jonabRef = useRef(null);
  const fashionsRef = useRef(null);
  const dividerRef = useRef(null);
  const containerRef = useRef(null);
  const [showPlayButton, setShowPlayButton] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    // Function to attempt video playback
    const playVideo = () => {
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Show play button if autoplay fails
          setShowPlayButton(true);
        });
      }
    };

    // Set up video event listeners
    const handleLoadedMetadata = () => {
      playVideo();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // Try playing immediately if metadata already loaded
    if (video.readyState >= 1) {
      playVideo();
    }

    // Video scale and corner animation
    gsap.to(video, {
      scale: 0.9,
      borderRadius: "24px",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom 30%",
        scrub: 1.5,
        pin: true,
        anticipatePin: 1
      }
    });

    // Text animations
    const tl = gsap.timeline({
      defaults: { duration: 2, ease: "expo.out" },
      scrollTrigger: {
        trigger: textContainerRef.current,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    tl.fromTo(
      jonabRef.current,
      { opacity: 0, y: 60, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)" }
    );

    tl.fromTo(
      dividerRef.current,
      { opacity: 0, width: 0 },
      { opacity: 1, width: "160px" },
      "-=1.5"
    );

    tl.fromTo(
      fashionsRef.current,
      { opacity: 0, y: 60, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)" },
      "-=1.5"
    );

    // Floating animation for text
    gsap.to([jonabRef.current, fashionsRef.current], {
      y: 15,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Cleanup
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handlePlayClick = () => {
    videoRef.current.play()
      .then(() => setShowPlayButton(false))
      .catch(e => console.error("Playback failed:", e));
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-screen overflow-hidden flex items-center justify-center bg-black"
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src="/Videos/Jonab.mp4"
        loop
        muted
        playsInline
        preload="auto"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />

      {/* Play Button Overlay - Only shows if autoplay blocked */}
      {showPlayButton && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 cursor-pointer"
          onClick={handlePlayClick}
        >
          <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-12 h-12 ml-2">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Text Container */}
      <div
        ref={textContainerRef}
        className="absolute flex flex-col items-center z-20 px-4"
      >
        <span
          ref={jonabRef}
          className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-light tracking-tight opacity-0"
          style={{
            color: "#fff",
            fontFamily: "EB Garamond, serif",
            fontWeight: 400,
            letterSpacing: "-0.03em",
            textShadow: "0 2px 10px rgba(0,0,0,0.4)"
          }}
        >
          Jonab's
        </span>

        <div
          ref={dividerRef}
          className="h-px bg-gradient-to-r from-transparent via-white to-transparent my-6 opacity-0"
          style={{ width: "0px" }}
        />

        <span
          ref={fashionsRef}
          className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-thin tracking-widest opacity-0 text-center"
          style={{
            color: "#fff",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 200,
            letterSpacing: "0.4em",
            paddingLeft: "0.4em",
            textShadow: "0 2px 10px rgba(0,0,0,0.4)"
          }}
        >
          FASHIONS
        </span>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
        <span className="text-white text-sm mb-2 font-light tracking-widest opacity-80">
          SCROLL
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
      </div>
    </div>
  );
};

export default HomeBanner;