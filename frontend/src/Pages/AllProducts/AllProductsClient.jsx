import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../Components/Navigations/Navbar';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from '../../Components/Loading/Loading';

const AllProductsClient = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [wishlist, setWishlist] = useState([]);
  
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    productCode: '',
    category: '',
    subCategory: '',
    color: '',
    size: '',
    sort: 'low-to-high',
  });

  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const categoryFromUrl = urlParams.get('category');
  const subCategoryFromUrl = urlParams.get('subcategory');

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
        const { data } = await axios.get('https://original-collections.onrender.com/api/products/fetch-products', {
          params: {
            search: filters.search,
            productCode: filters.productCode,
            category: filters.category,
            subCategory: filters.subCategory,
            color: filters.color,
            size: filters.size,
            sort: filters.sort,
            page: currentPage,
            perPage,
          },
        });
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters, currentPage, perPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  

  const getUniqueValues = (field) => {
    const values = products.map((product) => product[field]).flat();
    return [...new Set(values)];
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * (discount / 100));
  };

  const applyFilters = () => {
    let result = [...products];

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
      result = result.filter((product) => product.availableSizes.some((size) => size.size === filters.size));
    }

    if (filters.sort === 'low-to-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'high-to-low') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

  const navigate = useNavigate();

  const handleViewDetails = (productId) => {
    navigate(`/products/single/${productId}`);
  };


   // BestSellers.js (updated wishlist handling)
   const handleWishlist = (product) => {
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const exists = storedWishlist.some(item => item._id === product._id);
    const updatedWishlist = exists
      ? storedWishlist.filter(item => item._id !== product._id)
      : [...storedWishlist, product];
  
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    setWishlist(updatedWishlist);
  
    // Show toast notifications
    if (exists) {
      toast.error(`${product.productName} removed from wishlist`, { position: 'bottom-right' });
    } else {
      toast.success(`${product.productName} added to wishlist`, { position: 'bottom-right' });
    }
  };
  
  // Update the initial wishlist state
  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(storedWishlist);
  }, []);
  

  return (
    <div className="container mx-auto bg-[#fff]">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <div className="md:w-1/4 p-4 bg-white shadow-md">
          <div className="mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full bg-primary text-white p-3 sticky shadow-md text-lg flex justify-between items-center"
            >
              ফিল্টার
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transform ${showFilters ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {showFilters && (
  <div className="bg-white shadow-md rounded-lg p-6 mt-4">
    <h2 className="text-2xl font-semibold text-primary mb-4">সার্চ করুন</h2>
    <div className="flex flex-col gap-4">
      <input
        type="text"
        name="productCode"
        value={filters.productCode}
        onChange={handleFilterChange}
        placeholder="প্রোডাক্ট কোড দ্বারা সার্চ করুন"
        className="p-3 border border-[#D7F4FA] rounded-lg w-full bg-[#D7F4FA] text-primary placeholder-primary"
      />
      <input
        type="text"
        name="search"
        value={filters.search}
        onChange={handleFilterChange}
        placeholder="নামের দ্বারা সার্চ করুন"
        className="p-3 border border-[#D7F4FA] rounded-lg w-full bg-[#D7F4FA] text-primary placeholder-primary"
      />
      <select
        name="category"
        value={filters.category}
        onChange={handleFilterChange}
        className="p-3 border border-[#D7F4FA] rounded-lg w-full bg-[#D7F4FA] text-primary placeholder-primary"
      >
        <option value="">ক্যাটাগরি নির্বাচন করুন</option>
        {getUniqueValues('category').map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <select
        name="subCategory"
        value={filters.subCategory}
        onChange={handleFilterChange}
        className="p-3 border border-[#D7F4FA] rounded-lg w-full bg-[#D7F4FA] text-primary placeholder-primary"
      >
        <option value="">সাব-ক্যাটাগরি নির্বাচন করুন</option>
        {getUniqueValues('subCategory').map((subCategory) => (
          <option key={subCategory} value={subCategory}>
            {subCategory}
          </option>
        ))}
      </select>
      <select
        name="color"
        value={filters.color}
        onChange={handleFilterChange}
        className="p-3 border border-[#D7F4FA] rounded-lg w-full bg-[#D7F4FA] text-primary placeholder-primary"
      >
        <option value="">রঙ নির্বাচন করুন</option>
        {getUniqueValues('availableColors').map((color) => (
          <option key={color} value={color}>
            {color}
          </option>
        ))}
      </select>
      <select
        name="size"
        value={filters.size}
        onChange={handleFilterChange}
        className="p-3 border border-[#D7F4FA] rounded-lg w-full bg-[#D7F4FA] text-primary placeholder-primary"
      >
        <option value="">সাইজ নির্বাচন করুন</option>
        {getUniqueValues('availableSizes').map((size) => (
          <option key={size.size} value={size.size}>
            {size.size}
          </option>
        ))}
      </select>
      <select
        name="sort"
        value={filters.sort}
        onChange={handleFilterChange}
        className="p-3 border border-[#D7F4FA] rounded-lg w-full bg-[#D7F4FA] text-primary placeholder-primary"
      >
        <option value="low-to-high">মূল্য: কম থেকে বেশি</option>
        <option value="high-to-low">মূল্য: বেশি থেকে কম</option>
      </select>
    </div>
  </div>
)}

        </div>

        <div className="md:w-3/4 p-4">
  {loading ? (
    <Loading />  // Show loading component while data is being fetched
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
  {filteredProducts.length === 0 ? (
    <p className="col-span-full text-center text-lg text-[#7b7c4d]">No products available.</p>
  ) : (
    filteredProducts.map((product) => {
      const discountedPrice = calculateDiscountedPrice(product.price, product.discount);

      return (
        <div
          key={product._id}
          className="relative bg-white shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-200"
          style={{ height: "440px" }}
        >
          <div className="relative group">
            <img
              src={product.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
              alt={product.name}
              className="w-full object-cover group-hover:opacity-0 transition-opacity duration-300"
              style={{ height: "300px" }}
            />
            <img
              src={product.images[1] || 'https://via.placeholder.com/400x300?text=No+Image+Hover'}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ height: "300px" }}
            />

            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-bold">
                Out of Stock
              </div>
            )}
          </div>

          <div className="p-4 bg-[#d7f4fa] relative h-[140px]">
            <h3 className="text-md font-semibold text-primary truncate">{product.productName}</h3>
            <p className="text-sm font-bold text-[#56C5DC] mt-1">
              ৳{discountedPrice.toFixed(2)}{' '}
              {product.discount > 0 && (
                <span className="line-through text-[#70D5E3] text-xs">৳{product.price.toFixed(2)}</span>
              )}
            </p>
            <p className="text-xs text-muted mt-1 truncate">Code: {product.productCode}</p>

            <div className="absolute top-2 right-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleWishlist(product);
                }}
                className="p-2 hover:text-red-500 transition-all"
              >
                <FontAwesomeIcon
                  icon={wishlist.some(item => item._id === product._id) ? solidHeart : regularHeart}
                  className={`text-xl ${wishlist.some(item => item._id === product._id) ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}
                />
              </button>
            </div>

            <button
              onClick={() => product.stock !== 0 && handleViewDetails(product._id)}
              disabled={product.stock === 0}
              className={`mt-3 w-full py-1.5 px-3 text-sm font-medium ${
                product.stock === 0 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-600' 
                  : 'bg-[#F68C1F] text-white hover:bg-[#56C5DC]'
              }`}
            >
              {product.stock === 0 ? 'Out of Stock' : 'View Details'}
            </button>
          </div>
        </div>
      );
    })
  )}
</div>

  )}

  {/* Pagination */}
  <div className="flex justify-center mt-8">
    <button
      onClick={() => paginate(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-4 py-2 bg-[#F9A02B] text-white  mr-2 disabled:opacity-50"
    >
      পূর্ববর্তী
    </button>
    <button
      onClick={() => paginate(currentPage + 1)}
      className="px-4 py-2 bg-[#70D5E3] text-white  disabled:opacity-50"
    >
      পরবর্তী
    </button>
  </div>
</div>

      </div>
    </div>
  );
};

export default AllProductsClient;
