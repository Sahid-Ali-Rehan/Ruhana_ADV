import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { HiMenu } from "react-icons/hi"; // For menu
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faHeart } from "@fortawesome/free-solid-svg-icons";

// Dropdown Items as JSON
const categories = {
    mens: [
      { name: "Smartphones", link: "/category/smartphones" },
      { name: "Feature Phones", link: "/category/featured-phones" },
      { name: "Mobile Accessories", link: "/category/mobile-accessories" },
      { name: "Refurbished Phones", link: "/category/refurbished-phones" },
    ],
    womens: [
      { name: "Fast Charging Adapters", link: "/category/Adapters" },
      { name: "Wireless Chargers", link: "/category/wireless-chargers" },
      { name: "USB-C Chargers", link: "/category/usb-c" },
      { name: "Multi-port Chargers", link: "/category/multi-port-chargers" }, // New category added
    ],
    kids: [
      { name: "USB-C Laptop Chargers", link: "/category/laptop-chargers" },
      { name: "AC Power Adapters", link: "/category/ac-power-adapters" },
      { name: "Universal Laptop Chargers", link: "/category/universal-laptorp-chargers" }, // New category added
    ],
    accessories: [
      { name: "Fitness Trackers", link: "/category/fitness-tracker" },
      { name: "Luxury Smart Watches", link: "/category/luxury-smart-watches" },
      { name: "Budget Smart Watches", link: "/category/budget-smart-watches" },
    ],
    footwear: [
      { name: "High Capacity Power Banks", link: "/category/high-capacity-powerbanks" },
      { name: "Portable Power Banks", link: "/category/portable-powerbanks" },
      { name: "Solar Power Banks", link: "/category/solar-powerbanks" },
    ],
  };
  

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMensDropdownOpen, setIsMensDropdownOpen] = useState(false);
  const [isWomensDropdownOpen, setIsWomensDropdownOpen] = useState(false);
  const [isKidsDropdownOpen, setIsKidsDropdownOpen] = useState(false);
  const [isAccessoriesDropdownOpen, setIsAccessoriesDropdownOpen] = useState(false);
  const [isFootwearDropdownOpen, setIsFootwearDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  // Fetch the logged-in user data and check if the token exists in localStorage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          const userId = decodedToken?.id;

          if (userId) {
            const response = await axios.get(`https://original-collections.onrender.com/api/users/${userId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.data.user) {
              setUser(response.data.user);
              setIsLoggedIn(true);
            } else {
              setIsLoggedIn(false);
            }
          } else {
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoggedIn(false);
      }
    };

    fetchUser();
  }, []);


  const handleClick = () => {
    navigate('/products');
  };

  const handleRoute = () => {
    navigate('/my-profile');
  };

  return (
    <nav className="p-3 backdrop-blur-md  shadow-lg z-50 sticky top-0">

      <div className="max-w-screen-xl mx-auto flex justify-between items-center lg:flex-row flex-row-reverse">

        {/* Logo */}
<div className="flex items-center space-x-2 order-last lg:order-none">
  <Link to="/">
    <img src="/Images/Navlogo.png" alt="Logo" className="h-16 object-contain cursor-pointer" />
  </Link>
</div>

        {/* Desktop Menu */}
        <div className="relative hidden lg:flex items-center space-x-6">
          {/* Mobile Phone Items Dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => setIsMensDropdownOpen(true)}
            onMouseLeave={() => setIsMensDropdownOpen(false)}
          >
            <button className="text-primary hover:text-[#F9A02B] transition duration-200 text-md font-semibold">
              Mobile Phones
            </button>
            <div
  className={`absolute left-0 mt-2 space-y-2 bg-white shadow-lg w-48 border transition-all duration-500 ease-in-out ${isMensDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"} z-50`}
>

              {categories.mens.map((item) => (
               <Link
               to={`/products?category=SmartPhones&subcategory=${item.name}`}
               key={item.name}
               className="block px-5 py-3 text-[#F68C1F] hover:bg-[#56C5DC] hover:text-white border-b hover:border-[#56C5DC] transition duration-200"
             >
               {item.name}
             </Link>
             
              ))}
            </div>
          </div>

          {/* Mobile CHarging Adapter Items Dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => setIsWomensDropdownOpen(true)}
            onMouseLeave={() => setIsWomensDropdownOpen(false)}
          >
            <button className="text-primary hover:text-[#F9A02B] transition duration-200 text-md font-semibold">
              Mobile Charging Adapter
            </button>
            <div
              className={`absolute left-0 mt-2 space-y-2 bg-white shadow-lg w-48 border  transition-all duration-500 ease-in-out ${isWomensDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
              {categories.womens.map((item) => (
                  <Link
                  to={`/products?category=Adapters&subcategory=${item.name}`}
                  key={item.name}
                  className="block px-5 py-3 text-[#F68C1F] hover:bg-[#56C5DC] hover:text-white border-b hover:border-[#a0926c] transition duration-200"
                >
                  {item.name}
                </Link>
                
              ))}
            </div>
          </div>

          {/* Laptop Charging Adapter Items Dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => setIsKidsDropdownOpen(true)}
            onMouseLeave={() => setIsKidsDropdownOpen(false)}
          >
            <button className="text-primary hover:text-[#F9A02B] transition duration-200 text-md font-semibold">
            Laptop Charging Adapter
            </button>
            <div
              className={`absolute left-0 mt-2 space-y-2 bg-white shadow-lg w-48 border  transition-all duration-500 ease-in-out ${isKidsDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
              {categories.kids.map((item) => (
                  <Link
                  to={`/products?category=Adapters&subcategory=${item.name}`}
                  key={item.name}
                  className="block px-5 py-3 text-[#F68C1F] hover:bg-[#56C5DC] hover:text-white border-b hover:border-[#a0926c] transition duration-200"
                >
                  {item.name}
                </Link>
                
              ))}
            </div>
          </div>


         {/* Smart Watch Items Dropdown */}
         <div
            className="relative group"
            onMouseEnter={() => setIsAccessoriesDropdownOpen(true)}
            onMouseLeave={() => setIsAccessoriesDropdownOpen(false)}
          >
            <button className="text-primary hover:text-[#F9A02B] transition duration-200 text-md font-semibold">
            Smart Watch
            </button>
            <div
              className={`absolute left-0 mt-2 space-y-2 bg-white shadow-lg w-48 border  transition-all duration-500 ease-in-out ${isAccessoriesDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
              {categories.accessories.map((item) => (
                  <Link
                  to={`/products?category=Watches&subcategory=${item.name}`}
                  key={item.name}
                  className="block px-5 py-3 text-[#F68C1F] hover:bg-[#56C5DC] hover:text-white border-b hover:border-[#a0926c] transition duration-200"
                >
                  {item.name}
                </Link>
                
              ))}
            </div>
          </div>

          {/* Power Bank Items Dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => setIsFootwearDropdownOpen(true)}
            onMouseLeave={() => setIsFootwearDropdownOpen(false)}
          >
            <button className="text-primary hover:text-[#F9A02B] transition duration-200 text-md font-semibold">
              Power Bank
            </button>
            <div
              className={`absolute left-0 mt-2 space-y-2 bg-white shadow-lg w-48 border  transition-all duration-500 ease-in-out ${isFootwearDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
              {categories.footwear.map((item) => (
                  <Link
                  to={`/products?category=PowerBanks&subcategory=${item.name}`}
                  key={item.name}
                  className="block px-5 py-3 text-[#F68C1F] hover:bg-[#56C5DC] hover:text-white border-b hover:border-[#a0926c] transition duration-200"
                >
                  {item.name}
                </Link>
                
              ))}
            </div>
          </div>

          <button onClick={handleClick} className="text-primary hover:text-[#F9A02B] transition duration-200 text-md font-semibold">
              All Products
            </button>


        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <button
            className="text-[#8d5c51] text-3xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <HiMenu />
          </button>
        </div>

        {/* Cart and Avatar/ Login */}
        <div className="flex items-center space-x-4">

          
        
  {/* Wishlist */}
  {isLoggedIn && (
    <Link to="/wish-list" className="flex items-center">
      <FontAwesomeIcon
        icon={faHeart}
        className="w-6 h-6 text-primary hover:text-red-500 transition-all duration-200"
      />
    </Link>
  )}
  
  {/* Cart */}
  <Link to="/cart" className="flex items-center">
    <FontAwesomeIcon
      icon={faShoppingCart}
      className="w-6 h-6 text-primary hover:text-[#F9A02B] transition-all duration-200"
    />
  </Link>
          {/* Avatar or Login/Signup */}
          {isLoggedIn ? (
            <span 
            onClick={handleRoute} 
            className="w-7 h-7 flex items-center justify-center text-white bg-[#F9A02B] rounded-full text-md cursor-pointer"
          >
            {user?.fullname?.[0]}
          </span>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-primary hover:text-[#F9A02B] transition duration-200 text-sm font-semibold"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-primary hover:text-[#F9A02B] transition duration-200 text-sm font-semibold"
              >
                Sign Up
              </Link>
            </div>
          )}

          
        </div>
      </div>

     {/* Mobile Menu */}
{isMenuOpen && (
  <div className="lg:hidden bg-white px-6 py-4 space-y-4 mt-4 border-t">
    {/* Mobile Phones */}
    <div className="space-y-2">
      <button
        className="w-full text-left text-lg text-primary  font-semibold"
        onClick={() => setIsMensDropdownOpen(!isMensDropdownOpen)}
      >
        Mobile Phones
      </button>
      {isMensDropdownOpen && (
        <div className="space-y-2">
          {categories.mens.map((item) => (
              <Link
              to={`/products?category=SmartPhones&subcategory=${item.name}`}
              key={item.name}
              className="block px-5 py-3 text-[#56C5DC] hover:bg-[#56C5DC] hover:text-white border-b hover:border-[#a0926c] transition duration-200"
            >
              {item.name}
            </Link>
            
          ))}
        </div>
      )}
    </div>

    {/* Mobile Charging Adapter Items */}
    <div className="space-y-2">
      <button
        className="w-full text-left text-lg text-primary font-semibold"
        onClick={() => setIsWomensDropdownOpen(!isWomensDropdownOpen)}
      >
        Mobile Charging Adapter
      </button>
      {isWomensDropdownOpen && (
        <div className="space-y-2">
          {categories.womens.map((item) => (
              <Link
              to={`/products?category=Adapters&subcategory=${item.name}`}
              key={item.name}
              className="block px-5 py-3 text-[#56C5DC] hover:bg-[#56C5DC] hover:text-white border-b hover:border-[#a0926c] transition duration-200"
            >
              {item.name}
            </Link>
            
          ))}
        </div>
      )}
    </div>

    {/* laptop Charging Adapter Items */}
    <div className="space-y-2">
      <button
        className="w-full text-left text-lg text-primary font-semibold"
        onClick={() => setIsKidsDropdownOpen(!isKidsDropdownOpen)}
      >
        Laptop Charging Adapter
      </button>
      {isKidsDropdownOpen && (
        <div className="space-y-2">
          {categories.kids.map((item) => (
              <Link
              to={`/products?category=Adapters&subcategory=${item.name}`}
              key={item.name}
              className="block px-5 py-3 text-[#56C5DC] hover:bg-[#56C5DC] hover:text-white border-b hover:border-[#a0926c] transition duration-200"
            >
              {item.name}
            </Link>
            
          ))}
        </div>
      )}
    </div>

    {/* Smart Watches Items */}
    <div className="space-y-2">
      <button
        className="w-full text-left text-lg text-primary font-semibold"
        onClick={() => setIsAccessoriesDropdownOpen(!isAccessoriesDropdownOpen)}
      >
        Smart Watch
      </button>
      {isAccessoriesDropdownOpen && (
        <div className="space-y-2">
          {categories.accessories.map((item) => (
             <Link
             to={`/products?category=Watches&subcategory=${item.name}`}
             key={item.name}
             className="block px-5 py-3 text-[#56C5DC] hover:bg-[#56C5DC] hover:text-white border-b hover:border-[#a0926c] transition duration-200"
           >
             {item.name}
           </Link>
           
          ))}
        </div>
      )}
    </div>

    {/* Power Bank Items */}
    <div className="space-y-2">
      <button
        className="w-full text-left text-lg text-primary font-semibold"
        onClick={() => setIsFootwearDropdownOpen(!isFootwearDropdownOpen)}
      >
        Power Bank
      </button>
      {isFootwearDropdownOpen && (
        <div className="space-y-2">
          {categories.footwear.map((item) => (
              <Link
              to={`/products?category=PowerBanks&subcategory=${item.name}`}
              key={item.name}
              className="block px-5 py-3 text-[#56C5DC] hover:bg-[#56C5DC] hover:text-white border-b hover:border-[#a0926c] transition duration-200"
            >
              {item.name}
            </Link>
            
          ))}
        </div>
      )}
    </div>

    <button onClick={handleClick} className="text-primary hover:text-[#F9A02B] transition duration-200 text-md font-semibold">
              All Products
            </button>
  </div>
)}

    </nav>
  );
};

export default Navbar;
