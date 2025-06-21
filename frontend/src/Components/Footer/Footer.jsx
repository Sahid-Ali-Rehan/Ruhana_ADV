import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FaFacebookF, FaFacebookMessenger, FaWhatsapp, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

const Footer = () => {
  const footerRef = useRef(null);
  const curvedBgRef = useRef(null);
  const columnsRef = useRef([]);
  const mapRef = useRef(null);
  const bottomRef = useRef(null);
  
  // Create static particles array
  const particles = Array.from({ length: 30 }, (_, i) => {
    const size = Math.random() * 10 + 5;
    const colors = ['#9E5F57', '#567A4B', '#814B4A'];
    return {
      size,
      color: colors[i % 3],
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1
    };
  });

  useEffect(() => {
    // Curved background animation
    gsap.fromTo(curvedBgRef.current, 
      { y: -50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1,
        duration: 1.5,
        ease: "expo.out"
      }
    );

    // Columns animation
    columnsRef.current.forEach((col, index) => {
      gsap.fromTo(col, 
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          delay: index * 0.15,
          ease: "expo.out"
        }
      );
    });

    // Map animation
    gsap.fromTo(mapRef.current, 
      { y: 50, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.2,
        delay: 0.6,
        ease: "expo.out"
      }
    );

    // Bottom section animation
    gsap.fromTo(bottomRef.current, 
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        delay: 0.8,
        ease: "expo.out"
      }
    );

    // Social icon hover animations
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
      icon.addEventListener('mouseenter', () => {
        gsap.to(icon, {
          y: -10,
          scale: 1.2,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      icon.addEventListener('mouseleave', () => {
        gsap.to(icon, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });

  }, []);

  return (
    <footer 
      ref={footerRef}
      className="bg-[#EFE2B2] text-[#814B4A] pt-40 pb-16 px-4 md:px-12 relative overflow-hidden"
    >
      {/* Floating particles */}
      <div className="footer-particles absolute inset-0 z-0">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="floating-particle absolute rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: particle.color,
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              opacity: particle.opacity,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>
      
      {/* Decorative blobs */}
      <div className="absolute -top-40 left-0 w-[800px] h-[800px] rounded-full bg-[#9E5F57] opacity-10 blur-[120px] z-0"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-[#567A4B] opacity-10 blur-[100px] z-0"></div>
      
      {/* Curved Top Corners */}
      <div 
        ref={curvedBgRef}
        className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-[#9E5F57] to-[#9E5F57]/10 rounded-b-[50%] z-0"
      ></div>

      <div className="relative z-10">
        {/* Main Content of the Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 mb-24">
          {/* Column 1: About Us */}
          <div 
            ref={el => columnsRef.current[0] = el}
          >
            <h3 className="text-3xl font-bold mb-8 pb-4 border-b-2 border-[#9E5F57] inline-block" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              About Us
            </h3>
            <p className="text-lg leading-relaxed mb-8" style={{ color: '#567A4B' }}>
              Shop with Confidence: Premium, Original Showpieces You Can Trust! 
            </p>
            <div className="flex space-x-6">
              <a 
                href="https://www.facebook.com/originalcollections" 
                className="social-icon bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                aria-label="Facebook"
              >
                <FaFacebookF size={24} style={{ color: '#814B4A' }} />
              </a>
              <a 
                href="https://wa.me/8801789313805" 
                className="social-icon bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={24} style={{ color: '#814B4A' }} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div 
            ref={el => columnsRef.current[1] = el}
          >
            <h3 className="text-3xl font-bold mb-8 pb-4 border-b-2 border-[#9E5F57] inline-block" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Quick Links
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center group">
                <IoIosArrowForward className="mr-2 text-[#9E5F57] group-hover:translate-x-1 transition-transform" />
                <a 
                  href="/" 
                  className="text-lg hover:text-[#567A4B] transition-all duration-300 group-hover:pl-2"
                >
                  Home
                </a>
              </li>
              <li className="flex items-center group">
                <IoIosArrowForward className="mr-2 text-[#9E5F57] group-hover:translate-x-1 transition-transform" />
                <a 
                  href="/Policy/TC.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg hover:text-[#567A4B] transition-all duration-300 group-hover:pl-2"
                >
                  Terms & Conditions
                </a>
              </li>
              <li className="flex items-center group">
                <IoIosArrowForward className="mr-2 text-[#9E5F57] group-hover:translate-x-1 transition-transform" />
                <a 
                  href="/Policy/TC.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg hover:text-[#567A4B] transition-all duration-300 group-hover:pl-2"
                >
                  Privacy Policy
                </a>
              </li>
              <li className="flex items-center group">
                <IoIosArrowForward className="mr-2 text-[#9E5F57] group-hover:translate-x-1 transition-transform" />
                <a 
                  href="/products" 
                  className="text-lg hover:text-[#567A4B] transition-all duration-300 group-hover:pl-2"
                >
                  All Products
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div 
            ref={el => columnsRef.current[2] = el}
          >
            <h3 className="text-3xl font-bold mb-8 pb-4 border-b-2 border-[#9E5F57] inline-block" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Contact Info
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-[#9E5F57]" size={20} />
                <p className="text-lg" style={{ color: '#567A4B' }}>
                  Section 12, Block C, Line No: 6, House No 13, Pallabi Thana Mirpur Dhaka 1216
                </p>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt className="mr-3 text-[#9E5F57]" />
                <p className="text-lg" style={{ color: '#567A4B' }}>(+880) 1789313805</p>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-3 text-[#9E5F57]" />
                <p className="text-lg" style={{ color: '#567A4B' }}>Originalcollections772@gmail.com</p>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Media */}
          <div 
            ref={el => columnsRef.current[3] = el}
          >
            <h3 className="text-3xl font-bold mb-8 pb-4 border-b-2 border-[#9E5F57] inline-block" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Follow Us
            </h3>
            <p className="text-lg mb-8" style={{ color: '#567A4B' }}>
              Connect with us for exclusive collections and updates:
            </p>
            <div className="flex space-x-6">
              <a
                href="https://www.facebook.com/originalcollections"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon bg-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                aria-label="Facebook"
              >
                <FaFacebookF size={28} style={{ color: '#814B4A' }} />
              </a>
              <a
                href="https://www.messenger.com/t/210831205441089"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon bg-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                aria-label="Messenger"
              >
                <FaFacebookMessenger size={28} style={{ color: '#814B4A' }} />
              </a>
              <a
                href="https://wa.me/8801789313805"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon bg-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={28} style={{ color: '#814B4A' }} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon bg-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                aria-label="Instagram"
              >
                <FaInstagram size={28} style={{ color: '#814B4A' }} />
              </a>
            </div>
          </div>
        </div>

        {/* Google Maps Section */}
        <div 
          ref={mapRef}
          className="relative w-full h-[450px] bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ border: '2px solid #9E5F57' }}
        >
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <iframe
              className="w-full h-full"
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3524.808249764628!2d90.40774357533991!3d23.878302578583416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjPCsDUyJzQxLjkiTiA5MMKwMjQnMzcuMiJF!5e1!3m2!1sen!2sbd!4v1738493201186!5m2!1sen!2sbd"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="absolute top-4 right-4 bg-white py-2 px-4 rounded-full shadow-lg flex items-center">
            <FaMapMarkerAlt className="text-[#9E5F57] mr-2" />
            <span className="font-medium" style={{ color: '#814B4A' }}>Our Location</span>
          </div>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div 
        ref={bottomRef}
        className="bg-gradient-to-r from-[#9E5F57] to-[#814B4A] py-8 rounded-2xl shadow-xl mt-24 relative z-10"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Copyright */}
            <div className="mb-4 md:mb-0">
              <p className="text-lg text-[#EFE2B2] text-center md:text-left">
                <span className="opacity-80">&copy; {new Date().getFullYear()}</span> Original Collections. All Rights Reserved.
              </p>
            </div>

            {/* Developer Credit */}
            <div className="flex items-center space-x-2 group">
              <span className="text-[#EFE2B2] opacity-80">Crafted with</span>
              <div className="w-6 h-6 relative">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-30"></div>
                <div className="absolute inset-1 bg-red-500 rounded-full"></div>
              </div>
              <span className="text-[#EFE2B2] opacity-80">by</span>
              <a
                href="https://www.instagram.com/ur_rehu/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-[#EFE2B2] hover:text-white transition-colors duration-300"
              >
                <FaInstagram className="mr-1 transform group-hover:scale-110 transition-transform" />
                <span className="font-medium">@ur_rehu</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;