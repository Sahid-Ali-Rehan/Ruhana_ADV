import React from "react";
import { FaFacebookF, FaFacebookMessenger, FaWhatsapp, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#fff] text-primary py-16 px-4 md:px-12 relative overflow-hidden">
      {/* Curved Top Corners */}
      <div className="absolute top-0 left-0 w-full h-40 bg-[#bdeef8] rounded-b-[50%] z-0"></div>

      <div className="relative z-10">
        {/* Main Content of the Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 mb-16">
          {/* Column 1: About Us */}
          <div>
            <h3 className="text-3xl font-semibold mb-6 text-primary">About Us</h3>
            <p className="text-lg leading-relaxed text-secondary">
            Shop with Confidence: Premium, Original Electronics You Can Trust! 
            </p>
            <div className="flex space-x-6 mt-6">
              <a href="#" className="hover:text-primary transition-all duration-300" aria-label="Facebook">
                <FaFacebookF size={24} />
              </a>
              <a href="https://imo.im/sms?+8801789313805" className="hover:text-primary transition-all duration-300" aria-label="Imo">
                <FaWhatsapp size={24} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
<div>
  <h3 className="text-3xl font-semibold mb-6 text-primary">Quick Links</h3>
  <ul>
    <li className="mb-4 hover:text-primary transition-all duration-300">
      <a href="/">Home</a>
    </li>
    <li className="mb-4 hover:text-primary transition-all duration-300">
      <a href="/Policy/TC.pdf" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
    </li>
    <li className="mb-4 hover:text-primary transition-all duration-300">
      <a href="/Policy/TC.pdf" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
    </li>
  </ul>
</div>


          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-3xl font-semibold mb-6 text-primary">Contact Info</h3>
            <p className="text-lg mb-4 text-secondary">Address: Section 12, Block C, Line No: 6, House No 13, Pallabi Thana Mirpur Dhaka 1216</p>
            <p className="text-lg mb-4 text-secondary">Phone: (+880) 1789313805</p>
            <p className="text-lg mb-4 text-secondary">Email: Originalcollections772@gmail.com</p>
          </div>

          {/* Column 4: Social Media */}
          <div>
            <h3 className="text-3xl font-semibold mb-6 text-primary">Follow Us</h3>
            <p className="text-lg mb-6 text-secondary">Connect with us on social media:</p>
            <div className="flex space-x-6 text-2xl">
              <a
                href="https://www.facebook.com/originalcollections"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-[#4267B2] transition-all duration-300"
                aria-label="Facebook"
              >
                <FaFacebookF size={32} />
              </a>
              <a
                href="https://www.messenger.com/t/210831205441089"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-[#00B2FF] transition-all duration-300"
                aria-label="Messenger"
              >
                <FaFacebookMessenger size={32} />
              </a>
              <a
                href="https://wa.me/8801789313805"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-[#25D366] transition-all duration-300"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={32} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-[#C13584] transition-all duration-300"
                aria-label="Instagram"
              >
                <FaInstagram size={32} />
              </a>
            </div>
          </div>
        </div>

        {/* Google Maps Section */}
        <div className="relative w-full h-[400px] bg-secondary rounded-xl mt-12 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <iframe
              className="w-full h-full border-0"
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3524.808249764628!2d90.40774357533991!3d23.878302578583416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjPCsDUyJzQxLjkiTiA5MMKwMjQnMzcuMiJF!5e1!3m2!1sen!2sbd!4v1738493201186!5m2!1sen!2sbd"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Footer Bottom Section */}
<div className="bg-[#56C5DC] py-6 rounded-md mt-16">
  <div className="container mx-auto px-4 md:px-12">
    <div className="flex flex-col md:flex-row items-center justify-between">
      {/* Copyright - Centered on desktop, top on mobile */}
      <div className="mb-4 md:mb-0 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
        <p className="text-lg text-white text-center">
          <span className="text-primary">&copy; 2025</span> Original Collections. All Rights Reserved.
        </p>
      </div>

      {/* Developer Credit - Right-aligned on desktop, bottom on mobile */}
      <div className="flex items-center space-x-2 group md:ml-auto">
        <span className="text-white">Developed by</span>
        <a
          href="https://www.instagram.com/ur_rehu/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center hover:text-[#C13584] transition-all duration-300"
        >
          <FaInstagram size={20} className="mr-1 transform group-hover:scale-110 transition-transform" />
          <span className="font-medium hover:underline">@ur_rehu</span>
        </a>
      </div>
    </div>
  </div>
</div>
    </footer>
  );
};

export default Footer;
