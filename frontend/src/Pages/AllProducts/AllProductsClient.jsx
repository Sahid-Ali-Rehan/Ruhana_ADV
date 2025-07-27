import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaFilter, FaTimes, FaSearch, FaArrowDown } from 'react-icons/fa';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from "../../Components/Loading/Loading";
import Navbar from "../../Components/Navigations/Navbar";
import Footer from "../../Components/Footer/Footer";

// Enhanced normalization function
const normalizeCategory = (category) => {
  if (!category) return '';
  return category.toLowerCase().replace(/\s+/g, '-');
};

const AllProductsClient = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(20);
  const [wishlist, setWishlist] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subCategory: '',
    color: '',
    size: '',
    sort: 'low-to-high',
    minPrice: 0,
    maxPrice: 10000,
    priceRange: [0, 10000]
  });
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const filterRef = useRef(null);
  const maxPriceRef = useRef(10000);
  const loadMoreRef = useRef(null);

  // Fix: Scroll to top on initial render and when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Color mapping for swatches
  const colorMap = {
    "White": "#FFFFFF",
    "Black": "#000000",
    "Red": "#FF0000",
    "Blue": "#0000FF",
    "Green": "#008000",
    "Yellow": "#FFFF00",
    "Purple": "#800080",
    "Pink": "#FFC0CB",
    "Orange": "#FFA500",
    "Gray": "#808080",
    "Brown": "#A52A2A",
    "Beige": "#F5F5DC",
    "Navy": "#000080",
    "Maroon": "#800000",
    "Turquoise": "#40E0D0",
    "Gold": "#FFD700",
    "Silver": "#C0C0C0",
    "Lavender": "#E6E6FA",
    "Teal": "#008080",
    "Olive": "#808000",
    "Magenta": "#FF00FF",
    "Cyan": "#00FFFF",
    "Coral": "#FF7F50",
    "Indigo": "#4B0082",
    "Violet": "#EE82EE"
  };

  // Get initial category from navigation state
  useEffect(() => {
    if (location.state?.selectedCategory) {
      setFilters(prev => ({
        ...prev,
        category: location.state.selectedCategory
      }));
    }
  }, [location]);

  // Initialize wishlist
  useEffect(() => {
    try {
      const storedWishlist = JSON.parse(localStorage.getItem('wishlist'));
      if (Array.isArray(storedWishlist)) {
        setWishlist(storedWishlist);
      } else {
        setWishlist([]);
      }
    } catch (e) {
      setWishlist([]);
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('https://ruhana-adv.onrender.com/api/products/fetch-products');
        
        // Find max price for price range
        const prices = data.map(p => p.price);
        const maxPrice = Math.max(...prices, 10000);
        maxPriceRef.current = maxPrice;
        
        setProducts(data);
        setFilters(prev => ({
          ...prev,
          minPrice: 0,
          maxPrice: maxPrice,
          priceRange: [0, maxPrice]
        }));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
        toast.error('Failed to load products. Please try again later.', {
          position: 'bottom-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    };
    
    fetchProducts();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    
    // Reset visible products when filters change
    setVisibleProducts(20);
    setHasMoreProducts(true);
  };

  const handlePriceChange = (e, index) => {
    const newPriceRange = [...filters.priceRange];
    newPriceRange[index] = parseInt(e.target.value);
    setFilters(prev => ({
      ...prev,
      priceRange: newPriceRange,
      minPrice: newPriceRange[0],
      maxPrice: newPriceRange[1]
    }));
    
    // Reset visible products when price changes
    setVisibleProducts(20);
    setHasMoreProducts(true);
  };

  // Handle availableSizes array of objects
  const getUniqueValues = (field) => {
    if (field === 'availableSizes') {
      const sizes = products.flatMap(product => 
        product.availableSizes ? product.availableSizes.map(size => size.size) : []
      );
      return [...new Set(sizes)].filter(Boolean);
    }
    
    const values = products.flatMap(product => 
      Array.isArray(product[field]) ? product[field] : [product[field]]
    );
    return [...new Set(values)].filter(val => val !== null && val !== undefined && val !== '');
  };

  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * (discount / 100));
  };

  const applyFilters = useCallback(() => {
    let result = [...products];

    // Combined search for both name and code
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter((product) => {
        const productName = product.productName?.toLowerCase() || '';
        const productCode = product.productCode?.toLowerCase() || '';
        return productName.includes(searchTerm) || productCode.includes(searchTerm);
      });
    }

    // Case-insensitive category filtering
    if (filters.category) {
      result = result.filter((product) => 
        normalizeCategory(product.category) === filters.category
      );
    }

    if (filters.subCategory) {
      result = result.filter((product) => 
        normalizeCategory(product.subCategory) === filters.subCategory
      );
    }

    if (filters.color) {
      result = result.filter((product) => product.availableColors.includes(filters.color));
    }

    if (filters.size) {
      result = result.filter((product) => 
        product.availableSizes && 
        product.availableSizes.some(sizeObj => sizeObj.size === filters.size)
      );
    }

    // Price range filter
    result = result.filter(product => 
      product.price >= filters.priceRange[0] && 
      product.price <= filters.priceRange[1]
    );

    if (filters.sort === 'low-to-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'high-to-low') {
      result.sort((a, b) => b.price - a.price);
    } else if (filters.sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(result);
    setHasMoreProducts(result.length > visibleProducts);
  }, [filters, products, visibleProducts]);

  useEffect(() => {
    applyFilters();
  }, [filters, products, applyFilters]);

  const handleViewDetails = (productId) => {
    navigate(`/products/single/${productId}`);
  };

  const handleWishlist = (product) => {
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const exists = storedWishlist.some(item => item._id === product._id);
    const updatedWishlist = exists
      ? storedWishlist.filter(item => item._id !== product._id)
      : [...storedWishlist, product];
  
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    setWishlist(updatedWishlist);
  
    if (exists) {
      toast.error(`${product.productName} removed from wishlist`, { 
        position: 'bottom-right',
        theme: 'colored',
        style: { backgroundColor: '#9E5F57', color: '#EFE2B2' }
      });
    } else {
      toast.success(`${product.productName} added to wishlist`, { 
        position: 'bottom-right',
        theme: 'colored',
        style: { backgroundColor: '#567A4B', color: '#EFE2B2' }
      });
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      subCategory: '',
      color: '',
      size: '',
      sort: 'low-to-high',
      minPrice: 0,
      maxPrice: maxPriceRef.current,
      priceRange: [0, maxPriceRef.current]
    });
    
    // Reset visible products
    setVisibleProducts(20);
    setHasMoreProducts(true);
  };

  // Price formatting
  const formatPrice = (price) => {
    return `৳${price.toFixed(2)}`;
  };

  // Handle image hover
  const handleMouseEnter = (productId) => {
    setHoveredProduct(productId);
  };

  const handleMouseLeave = () => {
    setHoveredProduct(null);
  };

  // Load more products
  const loadMoreProducts = () => {
    setIsLoadingMore(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const newVisibleCount = visibleProducts + 20;
      setVisibleProducts(newVisibleCount);
      setHasMoreProducts(filteredProducts.length > newVisibleCount);
      setIsLoadingMore(false);
    }, 600);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <div className="flex-grow pt-24 pb-16">
        {/* Hero Section with Parallax Effect */}
        <div className="relative h-96 overflow-hidden mb-16">
          <div 
            className="absolute inset-0 bg-cover bg-center transform scale-110"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1523381294911-8d3cead13475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
              backgroundAttachment: 'fixed'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h1 
                  className="text-4xl md:text-5xl font-bold tracking-tight mb-6 animate-fade-in"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  CURATED COLLECTION
                </h1>
                <div className="w-24 h-0.5 bg-white mx-auto mb-6"></div>
                <p 
                  className="text-lg max-w-3xl mx-auto tracking-wider"
                >
                  Discover premium showpieces that redefine elegance and craftsmanship
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Top Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 w-full md:w-80 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-black text-sm transition-all duration-300 hover:shadow-md"
                value={filters.search}
                onChange={(e) => handleFilterChange(e)}
                name="search"
              />
            </div>
            
            {/* Filter Toggle Button */}
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-2 text-xs tracking-widest uppercase px-4 py-2 border border-black rounded-md hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <FaFilter className="text-xs" />
                <span>{isFilterOpen ? "Hide Filters" : "Show Filters"}</span>
              </button>
              
              <button
                className="text-xs uppercase border-b border-black pb-1 transition-all duration-300 hover:text-gray-600"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {isFilterOpen && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
            <div className="bg-white border border-gray-200 rounded-lg p-6 grid grid-cols-1 md:grid-cols-4 gap-6 shadow-lg animate-slide-down">
              {/* Category Filter */}
              <div>
                <h3 className="font-medium text-sm uppercase tracking-wider mb-3">Category</h3>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm transition-all duration-300 hover:shadow-md"
                >
                  <option value="">All Categories</option>
                  {getUniqueValues('category').map((category) => (
                    <option key={category} value={normalizeCategory(category)}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Price Filter */}
              <div>
                <h3 className="font-medium text-sm uppercase tracking-wider mb-3">Price Range</h3>
                <div className="mb-2 text-sm text-gray-600">
                  <span>{formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}</span>
                </div>
                <div className="relative py-4">
                  <div className="relative h-2 bg-gray-200 rounded-full">
                    <div 
                      className="absolute h-2 bg-black rounded-full transition-all duration-300"
                      style={{
                        left: `${(filters.priceRange[0] / maxPriceRef.current) * 100}%`,
                        width: `${((filters.priceRange[1] - filters.priceRange[0]) / maxPriceRef.current) * 100}%`
                      }}
                    ></div>
                    
                    <input
                      type="range"
                      min="0"
                      max={maxPriceRef.current}
                      value={filters.priceRange[0]}
                      onChange={(e) => handlePriceChange(e, 0)}
                      className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max={maxPriceRef.current}
                      value={filters.priceRange[1]}
                      onChange={(e) => handlePriceChange(e, 1)}
                      className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="block text-xs mb-1 text-gray-600">Min Price</label>
                      <input
                        type="number"
                        min="0"
                        max={filters.priceRange[1]}
                        value={filters.priceRange[0]}
                        onChange={(e) => handlePriceChange(e, 0)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm transition-all duration-300 hover:shadow-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-gray-600">Max Price</label>
                      <input
                        type="number"
                        min={filters.priceRange[0]}
                        max={maxPriceRef.current}
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceChange(e, 1)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm transition-all duration-300 hover:shadow-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Color Filter */}
              <div>
                <h3 className="font-medium text-sm uppercase tracking-wider mb-3">Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {getUniqueValues('availableColors').map((color) => {
                    const hexColor = colorMap[color] || '#CCCCCC';
                    return (
                      <div 
                        key={color}
                        className={`w-6 h-6 rounded-full border border-gray-300 cursor-pointer transition-all duration-300 transform hover:scale-125 ${
                          filters.color === color ? 'ring-2 ring-black ring-offset-1' : ''
                        }`}
                        style={{ backgroundColor: hexColor }}
                        onClick={() => setFilters(prev => ({...prev, color: prev.color === color ? '' : color}))}
                        title={color}
                      />
                    );
                  })}
                </div>
              </div>
              
              {/* Sort Options */}
              <div>
                <h3 className="font-medium text-sm uppercase tracking-wider mb-3">Sort By</h3>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm transition-all duration-300 hover:shadow-md"
                >
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{Math.min(visibleProducts, filteredProducts.length)}</span> of <span className="font-medium">{filteredProducts.length}</span> products
            </p>
            
            {/* Mobile Filter Toggle */}
            <button
              className="md:hidden flex items-center gap-1 text-xs uppercase px-3 py-1.5 border border-black rounded-md transition-all duration-300 transform hover:scale-105"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <FaFilter size={12} />
              <span>Filters</span>
            </button>
          </div>
          
          {/* Mobile Filters Panel */}
          {mobileFiltersOpen && (
            <div className="md:hidden bg-white border border-gray-200 p-5 mb-6 rounded-lg shadow-lg animate-slide-down">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">FILTERS</h2>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <FaTimes className="text-gray-600" />
                </button>
              </div>
              
              {/* Category Filter */}
              <div className="mb-5">
                <h3 className="font-medium mb-2 text-sm">Categories</h3>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Categories</option>
                  {getUniqueValues('category').map((category) => (
                    <option key={category} value={normalizeCategory(category)}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Price Filter */}
              <div className="mb-5">
                <h3 className="font-medium mb-2 text-sm">Price Range</h3>
                <div className="mb-2 text-sm text-gray-600">
                  <span>{formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}</span>
                </div>
                <div className="relative py-4">
                  <div className="relative h-2 bg-gray-200 rounded-full">
                    <div 
                      className="absolute h-2 bg-black rounded-full"
                      style={{
                        left: `${(filters.priceRange[0] / maxPriceRef.current) * 100}%`,
                        width: `${((filters.priceRange[1] - filters.priceRange[0]) / maxPriceRef.current) * 100}%`
                      }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs mb-1 text-gray-600">Min Price</label>
                      <input
                        type="number"
                        min="0"
                        max={filters.priceRange[1]}
                        value={filters.priceRange[0]}
                        onChange={(e) => handlePriceChange(e, 0)}
                        className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1 text-gray-600">Max Price</label>
                      <input
                        type="number"
                        min={filters.priceRange[0]}
                        max={maxPriceRef.current}
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceChange(e, 1)}
                        className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Color Filter */}
              <div className="mb-5">
                <h3 className="font-medium mb-2 text-sm">Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {getUniqueValues('availableColors').map((color) => {
                    const hexColor = colorMap[color] || '#CCCCCC';
                    return (
                      <div 
                        key={color}
                        className={`w-6 h-6 rounded-full border border-gray-300 cursor-pointer ${
                          filters.color === color ? 'ring-2 ring-black' : ''
                        }`}
                        style={{ backgroundColor: hexColor }}
                        onClick={() => setFilters(prev => ({...prev, color: prev.color === color ? '' : color}))}
                        title={color}
                      />
                    );
                  })}
                </div>
              </div>
              
              {/* Sort Options */}
              <div className="mb-5">
                <h3 className="font-medium mb-2 text-sm">Sort By</h3>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
              
              <div className="mt-5">
                <button
                  onClick={resetFilters}
                  className="w-full py-2.5 bg-black text-white text-sm rounded-md transition-all duration-300 transform hover:scale-105"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
          
          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.slice(0, visibleProducts).map((product) => {
                  const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
                  const isInWishlist = wishlist.some(item => item._id === product._id);
                  
                  const imageToShow = 
                    hoveredProduct === product._id && product.images?.[1] 
                      ? product.images[1] 
                      : product.images?.[0] || "https://via.placeholder.com/300x300?text=No+Image";
                  
                  return (
                    <div 
                      key={product._id} 
                      className="relative flex flex-col h-full border border-gray-200 rounded-sm transition-all duration-500 hover:shadow-xl hover:scale-[1.02] overflow-hidden group cursor-pointer"
                      onMouseEnter={() => handleMouseEnter(product._id)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleViewDetails(product._id)}
                    >
                      {/* Discount Badge */}
                      {product.discount > 0 && (
                        <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-black text-white font-medium py-1 px-2 md:px-3 rounded-full text-xs z-20 animate-pulse">
                          {product.discount}% OFF
                        </div>
                      )}
                      
                      {/* Product Image */}
                      <div className="relative overflow-hidden aspect-square">
                        <img
                          src={imageToShow}
                          alt={product.productName}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        
                        {/* Wishlist Button */}
                        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWishlist(product);
                            }}
                            className="p-1.5 md:p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100 transition-all duration-300 transform hover:scale-110"
                          >
                            <FontAwesomeIcon
                              icon={isInWishlist ? solidHeart : regularHeart}
                              className={`text-base md:text-lg ${isInWishlist ? 'text-red-500' : 'text-gray-600'}`}
                            />
                          </button>
                        </div>
                        
                        {/* Out of Stock Overlay */}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 text-white text-sm font-medium tracking-wider z-30">
                            Out of Stock
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex flex-col flex-grow p-3 md:p-4 bg-white">
                        <div className="flex justify-between items-start mb-2 min-h-[40px]">
                          <h3 className="font-medium uppercase tracking-wide text-xs md:text-sm overflow-hidden line-clamp-2 group-hover:underline">
                            {product.productName}
                          </h3>
                          <div className="flex flex-col items-end min-w-[70px]">
                            <p className="font-semibold text-xs md:text-sm whitespace-nowrap">
                              {formatPrice(discountedPrice)}
                            </p>
                            {product.discount > 0 && (
                              <span className="text-xs line-through text-gray-500 whitespace-nowrap">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2 truncate">
                          Code: {product.productCode}
                        </p>
                        
                        <div className="text-xs mb-3 flex flex-wrap items-center min-h-[28px]">
                          <span className="bg-gray-100 px-2 py-1 rounded-full mb-1 mr-1 transition-all duration-300 hover:bg-gray-200">
                            {product.category}
                          </span>
                          <span className="text-gray-400 mr-1">/</span>
                          <span className="bg-gray-100 px-2 py-1 rounded-full mb-1 transition-all duration-300 hover:bg-gray-200">
                            {product.subCategory}
                          </span>
                        </div>
                        
                        <button 
                          className={`mt-auto w-full py-2 flex items-center justify-center gap-1 uppercase text-xs transition-colors duration-300 transform hover:scale-[1.02] ${
                            product.stock === 0 
                              ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                              : 'bg-black text-white hover:bg-gray-800'
                          }`}
                          disabled={product.stock === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(product._id);
                          }}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Infinite Scrolling Load More */}
              <div className="flex justify-center mt-10">
                {hasMoreProducts ? (
                  <button
                    ref={loadMoreRef}
                    onClick={loadMoreProducts}
                    disabled={isLoadingMore}
                    className={`px-8 py-3 rounded-full text-lg font-medium transition-all duration-500 transform hover:scale-105 ${
                      isLoadingMore 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Load More <FaArrowDown className="animate-bounce" />
                      </span>
                    )}
                  </button>
                ) : (
                  visibleProducts > 20 && (
                    <p className="text-center py-6 text-gray-600 italic animate-fade-in">
                      You've reached the end of products
                    </p>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <p className="text-lg mb-4">No products match your filters</p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-black text-white tracking-wider text-sm rounded-md transition-all duration-300 transform hover:scale-105"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .animate-slide-down {
          animation: slideDown 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AllProductsClient;