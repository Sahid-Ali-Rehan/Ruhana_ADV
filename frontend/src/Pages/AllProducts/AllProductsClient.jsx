import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../../Components/Navigations/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AllProductsClient = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [wishlist, setWishlist] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
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

  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const categoryFromUrl = urlParams.get('category');
  const subCategoryFromUrl = urlParams.get('subcategory');
  const navigate = useNavigate();
  const filterRef = useRef(null);
  const maxPriceRef = useRef(10000);

  useEffect(() => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      category: categoryFromUrl || '',
      subCategory: subCategoryFromUrl || '',
    }));
  }, [categoryFromUrl, subCategoryFromUrl]);

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
  
  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(storedWishlist);
  }, []);

  return (
    <div className="bg-[#F8F4EA] min-h-screen">
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .product-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 5px 15px rgba(158, 95, 87, 0.1);
        }
        .product-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 15px 30px rgba(158, 95, 87, 0.2);
          border-color: #9E5F57;
        }
        .product-card:hover .product-image {
          transform: scale(1.05);
        }
        .product-card:hover .view-button {
          background: linear-gradient(to right, #814B4A, #9E5F57);
          transform: scale(1.03);
        }
        .price-range-track {
          height: 4px;
          background: #E1D7C6;
          border-radius: 2px;
        }
        .price-range-thumb {
          width: 18px;
          height: 18px;
          background: #9E5F57;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
      
      <Navbar />
      
      {/* Main Content with Perfect Spacing */}
      <div className="pt-24 pb-10 max-w-7xl mx-auto px-4"> {/* 100px top spacing */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Premium Filter Panel */}
          <div 
            ref={filterRef}
            className={`md:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-[#9E5F57]/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#814B4A', fontFamily: 'Cormorant Garamond, serif' }}>
                  Filter Products
                </h2>
                <button 
                  onClick={() => setShowFilters(false)} 
                  className="md:hidden text-[#9E5F57] hover:text-[#814B4A] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-5">
                {/* Combined Search */}
                <div>
                  <label className="block text-lg mb-2" style={{ color: '#567A4B' }}>Search Products</label>
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by name or code"
                    className="w-full p-3 rounded-xl bg-[#F8F4EA] border border-[#9E5F57]/30 focus:border-[#814B4A] focus:outline-none focus:ring-2 focus:ring-[#9E5F57]/50 transition-all"
                  />
                </div>
                
                {/* Price Range Filter */}
                <div>
                  <label className="block text-lg mb-2" style={{ color: '#567A4B' }}>
                    Price Range: ৳{filters.priceRange[0]} - ৳{filters.priceRange[1]}
                  </label>
                  <div className="relative py-4">
                    <div className="price-range-track absolute top-1/2 left-0 right-0 transform -translate-y-1/2"></div>
                    <div className="flex justify-between">
                      <input
                        type="range"
                        min="0"
                        max={maxPriceRef.current}
                        value={filters.priceRange[0]}
                        onChange={(e) => handlePriceChange(e, 0)}
                        className="absolute w-full -top-1 h-2 opacity-0 cursor-pointer"
                      />
                      <input
                        type="range"
                        min="0"
                        max={maxPriceRef.current}
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceChange(e, 1)}
                        className="absolute w-full -top-1 h-2 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-between mt-4">
                      <span className="text-sm text-[#9E5F57]">৳0</span>
                      <span className="text-sm text-[#9E5F57]">৳{maxPriceRef.current}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-lg mb-2" style={{ color: '#567A4B' }}>Category</label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full p-3 rounded-xl bg-[#F8F4EA] border border-[#9E5F57]/30 focus:border-[#814B4A] focus:outline-none focus:ring-2 focus:ring-[#9E5F57]/50 transition-all"
                  >
                    <option value="">All Categories</option>
                    {getUniqueValues('category').map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-lg mb-2" style={{ color: '#567A4B' }}>Sub-Category</label>
                  <select
                    name="subCategory"
                    value={filters.subCategory}
                    onChange={handleFilterChange}
                    className="w-full p-3 rounded-xl bg-[#F8F4EA] border border-[#9E5F57]/30 focus:border-[#814B4A] focus:outline-none focus:ring-2 focus:ring-[#9E5F57]/50 transition-all"
                  >
                    <option value="">All Sub-Categories</option>
                    {getUniqueValues('subCategory').map((subCategory) => (
                      <option key={subCategory} value={subCategory}>
                        {subCategory}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-lg mb-2" style={{ color: '#567A4B' }}>Color</label>
                  <div className="flex flex-wrap gap-2">
                    {getUniqueValues('availableColors').map((color) => (
                      <button
                        key={color}
                        onClick={() => setFilters(prev => ({...prev, color: prev.color === color ? '' : color}))}
                        className={`px-3 py-2 rounded-full text-sm transition-all ${
                          filters.color === color 
                            ? 'bg-[#9E5F57] text-[#EFE2B2] shadow-md' 
                            : 'bg-[#F8F4EA] text-[#814B4A] hover:bg-[#9E5F57]/20'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-lg mb-2" style={{ color: '#567A4B' }}>Size</label>
                  <div className="flex flex-wrap gap-2">
                    {getUniqueValues('availableSizes').map((size) => (
                      <button
                        key={size}
                        onClick={() => setFilters(prev => ({...prev, size: prev.size === size ? '' : size}))}
                        className={`px-3 py-2 rounded-full text-sm transition-all ${
                          filters.size === size 
                            ? 'bg-[#9E5F57] text-[#EFE2B2] shadow-md' 
                            : 'bg-[#F8F4EA] text-[#814B4A] hover:bg-[#9E5F57]/20'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-lg mb-2" style={{ color: '#567A4B' }}>Sort By</label>
                  <select
                    name="sort"
                    value={filters.sort}
                    onChange={handleFilterChange}
                    className="w-full p-3 rounded-xl bg-[#F8F4EA] border border-[#9E5F57]/30 focus:border-[#814B4A] focus:outline-none focus:ring-2 focus:ring-[#9E5F57]/50 transition-all"
                  >
                    <option value="low-to-high">Price: Low to High</option>
                    <option value="high-to-low">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={() => setFilters({
                      search: '',
                      category: '',
                      subCategory: '',
                      color: '',
                      size: '',
                      sort: 'low-to-high',
                      minPrice: 0,
                      maxPrice: maxPriceRef.current,
                      priceRange: [0, maxPriceRef.current]
                    })}
                    className="w-full py-3 px-4 rounded-full text-lg font-medium bg-gradient-to-r from-[#97A276] to-[#567A4B] text-[#EFE2B2] hover:shadow-xl transform hover:scale-[1.02] transition-all"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#9E5F57]"></div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold" style={{ color: '#814B4A', fontFamily: 'Cormorant Garamond, serif' }}>
                    {filters.category || 'All'} Products
                    {filters.subCategory && `: ${filters.subCategory}`}
                  </h1>
                  <button 
                    onClick={() => setShowFilters(true)}
                    className="md:hidden bg-gradient-to-r from-[#9E5F57] to-[#814B4A] text-[#EFE2B2] py-2 px-4 rounded-full flex items-center gap-2 shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                  </button>
                </div>
                
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20 animate-fadeIn">
                    <div className="mb-8">
                      <svg className="mx-auto h-24 w-24 text-[#9E5F57]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold mb-2" style={{ color: '#814B4A' }}>
                      No products found
                    </p>
                    <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: '#567A4B' }}>
                      We couldn't find any products matching your filters. Try adjusting your search criteria.
                    </p>
                    <button
                      onClick={() => setFilters({
                        search: '',
                        category: '',
                        subCategory: '',
                        color: '',
                        size: '',
                        sort: 'low-to-high',
                        minPrice: 0,
                        maxPrice: maxPriceRef.current,
                        priceRange: [0, maxPriceRef.current]
                      })}
                      className="py-3 px-6 rounded-full text-lg font-medium bg-gradient-to-r from-[#9E5F57] to-[#814B4A] text-[#EFE2B2] hover:shadow-xl transform hover:scale-[1.02] transition-all"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map((product) => {
                        const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
                        const isInWishlist = wishlist.some(item => item._id === product._id);

                        return (
                          <div
                            key={product._id}
                            className="product-card bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col h-full border border-[#9E5F57]/20"
                          >
                            <div className="relative h-72 overflow-hidden flex-shrink-0">
                              <img
                                src={product.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                                alt={product.productName}
                                className="w-full h-full object-cover transition-all duration-500 product-image"
                              />
                              {product.images[1] && (
                                <img
                                  src={product.images[1]}
                                  alt={product.productName}
                                  className="absolute inset-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition-opacity duration-500"
                                />
                              )}
                              {product.stock === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-xl font-bold tracking-wider">
                                  Out of Stock
                                </div>
                              )}
                              <div className="absolute top-4 right-4 z-10">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWishlist(product);
                                  }}
                                  className="p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-300 shadow-md"
                                >
                                  <FontAwesomeIcon
                                    icon={isInWishlist ? solidHeart : regularHeart}
                                    className={`text-xl ${isInWishlist ? 'text-red-500 animate-pulse' : 'text-gray-600'} transition-colors`}
                                  />
                                </button>
                              </div>
                              {product.discount > 0 && (
                                <div className="absolute top-4 left-4 bg-[#9E5F57] text-[#EFE2B2] font-bold py-1 px-3 rounded-full text-sm z-10">
                                  {product.discount}% OFF
                                </div>
                              )}
                            </div>
                            
                            <div 
                              className="p-5 flex flex-col flex-grow"
                              style={{ backgroundColor: '#F5EBE0' }}
                            >
                              <div className="flex justify-between items-start mb-3 flex-grow">
                                <div>
                                  <h3 
                                    className="text-xl font-semibold mb-1"
                                    style={{ 
                                      color: '#814B4A', 
                                      fontFamily: 'Cormorant Garamond, serif'
                                    }}
                                  >
                                    {product.productName}
                                  </h3>
                                  <p className="text-sm mb-3" style={{ color: '#567A4B' }}>
                                    Code: {product.productCode}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0 ml-2">
                                  <p className="text-lg font-bold" style={{ color: '#9E5F57' }}>
                                    ৳{discountedPrice.toFixed(2)}
                                  </p>
                                  {product.discount > 0 && (
                                    <span className="text-sm line-through opacity-80" style={{ color: '#97A276' }}>
                                      ৳{product.price.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mt-auto">
                                <button
                                  className={`view-button w-full py-3 px-4 rounded-full text-lg font-medium transition-all duration-300 ${
                                    product.stock === 0 
                                      ? 'bg-[#97A276] cursor-not-allowed' 
                                      : 'bg-gradient-to-r from-[#9E5F57] to-[#814B4A] hover:from-[#814B4A] hover:to-[#9E5F57]'
                                  }`}
                                  style={{ color: '#EFE2B2' }}
                                  disabled={product.stock === 0}
                                  onClick={() => handleViewDetails(product._id)}
                                >
                                  {product.stock === 0 ? 'Out of Stock' : 'View Details'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Premium Pagination */}
                    <div className="flex justify-center mt-10 space-x-4">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
                          currentPage === 1 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-[#9E5F57] to-[#814B4A] text-[#EFE2B2] hover:shadow-xl hover:scale-105'
                        }`}
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center">
                        <span className="mx-4 text-[#814B4A] font-medium">Page {currentPage}</span>
                      </div>
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
                          filteredProducts.length < perPage 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-[#567A4B] to-[#97A276] text-[#EFE2B2] hover:shadow-xl hover:scale-105'
                        }`}
                        disabled={filteredProducts.length < perPage}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProductsClient;