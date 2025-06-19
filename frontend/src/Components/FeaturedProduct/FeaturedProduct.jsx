import React, { useEffect, useRef } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const FeaturedProduct = () => {
  const imageRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const priceRef = useRef(null);
  const discountRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Animation for the image
    gsap.from(imageRef.current, {
      opacity: 0,
      x: -100,
      duration: 1,
      scrollTrigger: {
        trigger: imageRef.current,
        start: "top 80%",
        end: "top 50%",
        scrub: 1,
      },
    });

    // Animation for the title
    gsap.from(titleRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: titleRef.current,
        start: "top 80%",
        end: "top 50%",
        scrub: 1,
      },
    });

    // Animation for the description
    gsap.from(descriptionRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      delay: 0.2, // Slight delay for staggered effect
      scrollTrigger: {
        trigger: descriptionRef.current,
        start: "top 80%",
        end: "top 50%",
        scrub: 1,
      },
    });

    // Animation for the price
    gsap.from(priceRef.current, {
      opacity: 0,
      x: -50,
      duration: 1,
      delay: 0.4, // Slight delay for staggered effect
      scrollTrigger: {
        trigger: priceRef.current,
        start: "top 80%",
        end: "top 50%",
        scrub: 1,
      },
    });

    // Animation for the discounted price
    gsap.from(discountRef.current, {
      opacity: 0,
      x: 50,
      duration: 1,
      delay: 0.4, // Slight delay for staggered effect
      scrollTrigger: {
        trigger: discountRef.current,
        start: "top 80%",
        end: "top 50%",
        scrub: 1,
      },
    });

    // Animation for the button
    gsap.from(buttonRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 1,
      delay: 0.6, // Slight delay for staggered effect
      scrollTrigger: {
        trigger: buttonRef.current,
        start: "top 80%",
        end: "top 50%",
        scrub: 1,
      },
    });
  }, []);

  return (
    <section
      className="py-16"
      style={{ backgroundColor: "#FFFFFF" }} // White background
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8">
          {/* Product Image */}
          <div className="flex justify-center" ref={imageRef}>
            <img
              src="/Featured/Featured.png" // Product image URL
              alt="বিশেষ পণ্য"
              className="rounded-lg shadow-lg"
              style={{
                border: "4px solid #F68C1F", // Border color
                backgroundColor: "#F4EBB4", // Background color
              }}
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <h2
              ref={titleRef}
              className="text-3xl font-bold mb-4"
              style={{ color: "#F68C1F" }} // Title color
            >
              অপ্পো সুপারভুক চার্জার ৬৫ওয়াট
            </h2>
            <p
              ref={descriptionRef}
              className="text-md mb-6"
              style={{ color: "#56c5dc" }} // Subtitle color
            >
              অপ্পো সুপারভুক ৬৫ওয়াট চার্জারের সাথে দ্রুত চার্জিং অভিজ্ঞতা নিন। এটি উন্নত নিরাপত্তা বৈশিষ্ট্য সহ ডিজাইন করা হয়েছে, যা অতিরিক্ত চার্জিং, অতিরিক্ত গরম হওয়া এবং শর্ট সার্কিট থেকে সুরক্ষা প্রদান করে। কমপ্যাক্ট ডিজাইনের কারণে এটি বহন করাও সহজ। অপ্পো স্মার্টফোন এবং বিভিন্ন ইউএসবি টাইপ-সি ডিভাইসের সাথে সামঞ্জস্যপূর্ণ।
            </p>
            <div className="flex items-center mb-6">
              <p
                ref={priceRef}
                className="text-3xl font-bold mr-4"
                style={{ color: "#F68C1F" }} // Price color
              >
                ৳১২৯৯.০০
              </p>
              <span
                ref={discountRef}
                className="text-sm line-through"
                style={{ color: "#56c5dc" }} // Discounted price color
              >
                ৳১৫৪৯.০০
              </span>
            </div>
            {/* Add to Cart Button */}
            <button
              ref={buttonRef}
              className="flex items-center px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
              style={{
                backgroundColor: "#F68C1F", // Button background color
                color: "#fff", // Button text color
                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)", // Button shadow
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#56c5dc") // Hover effect
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#F68C1F")
              }
            >
              <FaShoppingCart className="mr-2" />
              পণ্য দেখুন
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProduct;