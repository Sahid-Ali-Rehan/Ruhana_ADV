import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  FaTwitter, FaYoutube, FaInstagram, FaTiktok, FaFacebookF, FaWhatsapp,
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaCcVisa, FaCcMastercard, 
  FaCcAmex, FaCcPaypal, FaCcApplePay
} from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);
  const columnsRef = useRef([]);
  const mapRef = useRef(null);
  const paymentRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    // GSAP animations setup
    if (columnsRef.current.length > 0) {
      columnsRef.current.forEach((col, i) => {
        gsap.from(col, {
          opacity: 0,
          y: 50,
          duration: 0.8,
          delay: i * 0.15,
          scrollTrigger: {
            trigger: col,
            start: "top bottom-=100",
            toggleActions: "play none none none"
          }
        });
      });
    }

    gsap.from(mapRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 1.2,
      scrollTrigger: {
        trigger: mapRef.current,
        start: "top bottom-=150",
        toggleActions: "play none none none"
      }
    });

    gsap.from(paymentRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      scrollTrigger: {
        trigger: paymentRef.current,
        start: "top bottom-=120",
        toggleActions: "play none none none"
      }
    });

    gsap.from(logoRef.current, {
      opacity: 0,
      scale: 0.8,
      rotation: -10,
      duration: 1,
      delay: 0.3,
      ease: "elastic.out(1, 0.8)",
      scrollTrigger: {
        trigger: logoRef.current,
        start: "top bottom-=100",
        toggleActions: "play none none none"
      }
    });

    // Hover animations for social icons
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
      icon.addEventListener('mouseenter', () => {
        gsap.to(icon, {
          y: -8,
          scale: 1.1,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      icon.addEventListener('mouseleave', () => {
        gsap.to(icon, {
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "bounce.out"
        });
      });
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <footer 
      className="bg-white text-black border-t border-gray-200 relative overflow-hidden"
      ref={footerRef}
    >
      {/* Luxury gold accent elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black to-transparent opacity-20"></div>
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 py-24">
          {/* About Us with Logo */}
          <div 
            className="relative" 
            ref={el => columnsRef.current[0] = el}
          >
            <div className="mb-8" ref={logoRef}>
              <img 
                src="/Images/logo.png" 
                alt="Jonab's Fashion" 
                className="w-32 h-32 object-contain opacity-90"
              />
            </div>
            <div className="w-24 h-px bg-black mb-8"></div>
            <p className="text-lg leading-relaxed mb-8 opacity-80 tracking-wide max-w-xs">
              Premium, Original Products You Can Trust
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/thejonabbd/" 
                className="social-icon p-4 border border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors duration-500"
                aria-label="Facebook"
              >
                <FaFacebookF size={20} />
              </a>
              <a 
                href="https://wa.me/8801994830798" 
                className="social-icon p-4 border border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors duration-500"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div 
            ref={el => columnsRef.current[1] = el}
          >
            <h3 className="text-3xl font-bold mb-8 tracking-wider uppercase" style={{ letterSpacing: '0.2em' }}>
              Quick Links
            </h3>
            <div className="w-24 h-px bg-black mb-8"></div>
            <ul className="space-y-6">
              {[
                { name: "Home", href: "/" },
                { name: "Terms & Conditions", href: "/Policy/TC.pdf" },
                { name: "Privacy Policy", href: "/Policy/TC.pdf" },
                { name: "All Products", href: "/products" },
                { name: "Custom Orders", href: "/custom" },
                { name: "Exclusive Collection", href: "/exclusive" }
              ].map((item, index) => (
                <li key={index} className="flex items-center group">
                  <div className="mr-3 opacity-70 transition-transform duration-300 group-hover:translate-x-1">
                    <IoIosArrowForward />
                  </div>
                  <a 
                    href={item.href} 
                    target={item.name.includes("Terms") || item.name.includes("Privacy") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="text-lg opacity-80 hover:opacity-100 transition-all duration-300 tracking-wider relative inline-block"
                  >
                    <span className="relative">
                      {item.name}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-500 group-hover:w-full"></span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Outlet Sections */}
          <div 
            ref={el => columnsRef.current[2] = el}
          >
            <h3 className="text-3xl font-bold mb-8 tracking-wider uppercase" style={{ letterSpacing: '0.2em' }}>
              Our Outlets
            </h3>
            <div className="w-24 h-px bg-black mb-8"></div>
            <ul className="space-y-8">
              {[
                "Aziz Supermarket, Shop 78, Ground Floor, Shahabag Dhaka.",
                "Center Point, Shop No 26,27 Shopping Mall, Mouchak",
                "Tokeo Square, Level 2, Shop no 356, Mohammadpur.",
                "Alauddin Tower, Shop no 409, 3rd floor Uttara 3."
              ].map((outlet, index) => (
                <li key={index} className="flex items-start">
                  <div className="mt-1 mr-4 opacity-70">
                    <FaMapMarkerAlt size={18} />
                  </div>
                  <p className="text-lg opacity-80 tracking-wide leading-relaxed">
                    {outlet}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social Media */}
          <div 
            ref={el => columnsRef.current[3] = el}
          >
            <h3 className="text-3xl font-bold mb-8 tracking-wider uppercase" style={{ letterSpacing: '0.2em' }}>
              Contact
            </h3>
            <div className="w-24 h-px bg-black mb-8"></div>
            <ul className="space-y-8 mb-12">
              <li className="flex items-center">
                <div className="mr-4 opacity-70">
                  <FaWhatsapp size={18} />
                </div>
                <p className="text-lg opacity-80 tracking-wide">+880 1994-830798</p>
              </li>
              <li className="flex items-center">
                <div className="mr-4 opacity-70">
                  <FaPhoneAlt size={16} />
                </div>
                <p className="text-lg opacity-80 tracking-wide">01687706095</p>
              </li>
              <li className="flex items-center">
                <div className="mr-4 opacity-70">
                  <FaEnvelope size={16} />
                </div>
                <p className="text-lg opacity-80 tracking-wide">jonabbd04@gmail.com</p>
              </li>
            </ul>

            <h3 className="text-3xl font-bold mb-8 tracking-wider uppercase mt-16" style={{ letterSpacing: '0.2em' }}>
              Connect
            </h3>
            <div className="w-24 h-px bg-black mb-8"></div>
            <p className="text-lg opacity-80 mb-8 tracking-wide italic">
              Exclusive collections and updates:
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: <FaYoutube size={24} />, href: "https://www.youtube.com/@JonabBd-v5q", label: "YouTube" },
                { icon: <FaInstagram size={24} />, href: "https://www.instagram.com/jonab._.bd/", label: "Instagram" },
                { icon: <FaTiktok size={24} />, href: "https://www.tiktok.com/@jonabbd", label: "TikTok" },
                { icon: <FaTwitter size={24} />, href: "https://x.com/JonabBd", label: "Twitter" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="social-icon flex items-center justify-center p-5 border border-black rounded-full hover:bg-black hover:text-white transition-colors duration-500"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Google Maps Section */}
        <div 
          className="relative w-full h-[500px] mb-24 overflow-hidden border-2 border-black"
          ref={mapRef}
        >
          <div className="absolute inset-0 border-[16px] border-white z-10 pointer-events-none"></div>
          <iframe
            className="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1263.0195838516104!2d90.39240927183072!3d23.738685696661257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b9a704d3d7e5%3A0x781623f8127962bf!2sAziz%20Super%20Market!5e1!3m2!1sen!2sbd!4v1753612543895!5m2!1sen!2sbd"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          <div className="absolute top-6 right-6 bg-white py-3 px-6 border border-black flex items-center shadow-lg">
            <FaMapMarkerAlt className="mr-2" />
            <span className="font-medium tracking-widest text-sm">OUR ATELIER</span>
          </div>
        </div>

        {/* Payment Options */}
        <div 
          className="flex flex-col items-center mb-16 py-8 border-y border-gray-300"
          ref={paymentRef}
        >
          <h4 className="text-xl font-medium mb-6 tracking-widest">SECURE PAYMENT OPTIONS</h4>
          <div className="flex flex-wrap justify-center gap-8">
            <FaCcVisa className="text-4xl opacity-80 hover:opacity-100 transition-opacity duration-300" />
            <FaCcMastercard className="text-4xl opacity-80 hover:opacity-100 transition-opacity duration-300" />
            <FaCcAmex className="text-4xl opacity-80 hover:opacity-100 transition-opacity duration-300" />
            <FaCcPaypal className="text-4xl opacity-80 hover:opacity-100 transition-opacity duration-300" />
            <FaCcApplePay className="text-4xl opacity-80 hover:opacity-100 transition-opacity duration-300" />
          </div>
          <p className="mt-6 text-sm opacity-70">All transactions are 256-bit encrypted</p>
        </div>

        {/* Footer Bottom */}
        <div className="py-12 border-t border-gray-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="text-lg opacity-80 tracking-widest">
                <span>&copy; {new Date().getFullYear()}</span> Jonab'S Fashion | ELEVATING STYLE
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="opacity-80 tracking-widest">CRAFTED WITH EXCELLENCE BY</span>
              <a
                href="https://www.instagram.com/saastudio.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:opacity-100 opacity-80 transition-opacity duration-300 tracking-wider group"
              >
                <div className="bg-black text-white p-2 rounded-full mr-2 group-hover:rotate-12 transition-transform">
                  <FaInstagram className="text-white" />
                </div>
                <span className="border-b border-transparent group-hover:border-black">@SaaStudio</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;