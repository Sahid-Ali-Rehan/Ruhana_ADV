import React, { useState, useEffect, useRef } from 'react';
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

const AllProductsClient = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
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

  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const categoryFromUrl = urlParams.get('category');
  const subCategoryFromUrl = urlParams.get('subcategory');
  const navigate = useNavigate();
  const filterRef = useRef(null);
  const maxPriceRef = useRef(10000);

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

  useEffect(() => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      category: categoryFromUrl || '',
      subCategory: subCategoryFromUrl || '',
    }));
  }, [categoryFromUrl, subCategoryFromUrl]);

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

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('https://ruhana-adv.onrender.com/api/products/fetch-products', {
          params: {
            search: filters.search,
            category: filters.category,
            subCategory: filters.subCategory,
            color: filters.color,
            size: filters.size,
            sort: filters.sort,
            page: currentPage,
            perPage,
          },
        });
        
        // Find max price for price range
        const prices = data.map(p => p.price);
        const maxPrice = Math.max(...prices, 10000);
        maxPriceRef.current = maxPrice;
        
        setProducts(data);
        setFilteredProducts(data);
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
          theme: 'colored',
          style: { backgroundColor: '#9E5F57', color: '#EFE2B2' }
        });
      }
    };
    fetchProducts();
  }, [filters.category, filters.subCategory, filters.color, filters.size, filters.sort, currentPage, perPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
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

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * (discount / 100));
  };

  const applyFilters = () => {
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

    if (filters.category) {
      result = result.filter((product) => product.category === filters.category);
    }

    if (filters.subCategory) {
      result = result.filter((product) => product.subCategory === filters.subCategory);
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
  };

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <div className="flex-grow pt-24 pb-16">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              CURATED COLLECTION
            </h1>
            <div className="w-24 h-0.5 bg-black mx-auto mb-6"></div>
            <p 
              className="text-lg max-w-3xl mx-auto tracking-wider text-gray-600"
            >
              Discover premium showpieces that redefine elegance and craftsmanship
            </p>
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
                className="pl-10 pr-4 py-2 w-full md:w-80 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-black text-sm"
                value={filters.search}
                onChange={(e) => handleFilterChange(e)}
                name="search"
              />
            </div>
            
            {/* Filter Toggle Button */}
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-2 text-xs tracking-widest uppercase px-4 py-2 border border-black rounded-md hover:bg-black hover:text-white transition-all"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <FaFilter className="text-xs" />
                <span>{isFilterOpen ? "Hide Filters" : "Show Filters"}</span>
              </button>
              
              <button
                className="text-xs uppercase border-b border-black pb-1"
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
            <div className="bg-white border border-gray-200 rounded-lg p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <h3 className="font-medium text-sm uppercase tracking-wider mb-3">Category</h3>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                >
                  <option value="">All Categories</option>
                  {getUniqueValues('category').map((category) => (
                    <option key={category} value={category}>
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
                      className="absolute h-2 bg-black rounded-full"
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
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
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
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
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
                        className={`w-6 h-6 rounded-full border border-gray-300 cursor-pointer transition-all ${
                          filters.color === color ? 'ring-2 ring-black ring-offset-1' : 'hover:scale-110'
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
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
              Showing <span className="font-medium">{filteredProducts.length}</span> products
            </p>
            
            {/* Mobile Filter Toggle */}
            <button
              className="md:hidden flex items-center gap-1 text-xs uppercase px-3 py-1.5 border border-black rounded-md"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <FaFilter size={12} />
              <span>Filters</span>
            </button>
          </div>
          
          {/* Mobile Filters Panel */}
          {mobileFiltersOpen && (
            <div className="md:hidden bg-white border border-gray-200 p-5 mb-6 rounded-lg">
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
                    <option key={category} value={category}>
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
                  className="w-full py-2.5 bg-black text-white text-sm rounded-md"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
          
          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
                  const isInWishlist = wishlist.some(item => item._id === product._id);
                  
                  // Determine which image to show based on hover state
                  const imageToShow = 
                    hoveredProduct === product._id && product.images?.[1] 
                      ? product.images[1] 
                      : product.images?.[0] || "https://via.placeholder.com/300x300?text=No+Image";
                  
                  return (
                    <div 
                      key={product._id} 
                      className="relative overflow-hidden border border-gray-200 rounded-sm transition-all hover:shadow-lg"
                      onMouseEnter={() => handleMouseEnter(product._id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Discount Badge */}
                      {product.discount > 0 && (
                        <div className="absolute top-4 left-4 bg-black text-white font-medium py-1 px-3 rounded-full text-xs z-20">
                          {product.discount}% OFF
                        </div>
                      )}
                      
                      {/* Product Image */}
                      <div className="relative overflow-hidden aspect-square">
                        <img
                          src={imageToShow}
                          alt={product.productName}
                          className="w-full h-full object-cover transition-opacity duration-300"
                        />
                        
                        {/* Wishlist Button */}
                        <div className="absolute top-4 right-4 z-20">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWishlist(product);
                            }}
                            className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100 transition-all"
                          >
                            <FontAwesomeIcon
                              icon={isInWishlist ? solidHeart : regularHeart}
                              className={`text-lg ${isInWishlist ? 'text-black' : 'text-gray-600'}`}
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
                      <div className="p-4 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium uppercase tracking-wide text-sm">{product.productName}</h3>
                          <div className="flex flex-col items-end">
                            <p className="font-semibold text-sm">
                              {formatPrice(discountedPrice)}
                            </p>
                            {product.discount > 0 && (
                              <span className="text-xs line-through text-gray-500">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-3 truncate">
                          Code: {product.productCode}
                        </p>
                        
                        {/* Category Path */}
                        <div className="text-xs mb-3 flex items-center">
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            {product.category}
                          </span>
                          <span className="mx-2 text-gray-400">/</span>
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            {product.subCategory}
                          </span>
                        </div>
                        
                        {/* View Details Button */}
                        <button 
                          className={`w-full py-2 flex items-center justify-center gap-1 uppercase text-xs transition-colors ${
                            product.stock === 0 
                              ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                              : 'bg-black text-white hover:bg-gray-800'
                          }`}
                          disabled={product.stock === 0}
                          onClick={() => handleViewDetails(product._id)}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination */}
              <div className="flex justify-center mt-10 space-x-4">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
                    currentPage === 1 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  Previous
                </button>
                
                <div className="flex items-center">
                  <span className="mx-4 text-gray-700 font-medium">Page {currentPage}</span>
                </div>
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
                    filteredProducts.length < perPage 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                  disabled={filteredProducts.length < perPage}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg mb-4">No products match your filters</p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-black text-white tracking-wider text-sm rounded-md"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AllProductsClient;