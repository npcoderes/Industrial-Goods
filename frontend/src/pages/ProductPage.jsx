import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaShoppingCart, FaBolt, FaSearch } from 'react-icons/fa';
import { addToCart } from '../slices/cartSlice';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const ProductPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/admin/getCategories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data.categories.filter((category) => category.Active));
      } catch (error) {
        setError('Error fetching categories');
        console.error('Error fetching categories:', error);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/admin/getProducts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
      } catch (error) {
        setError('Error fetching products');
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchProducts();
  }, [token]);

  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(product =>
        product.Name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.CategoryID == selectedCategory);
    }

    // Apply sorting
    switch (sortOrder) {
      case 'price-asc':
        result.sort((a, b) => a.Price - b.Price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.Price - a.Price);
        break;
      case 'name':
        result.sort((a, b) => a.Name.localeCompare(b.Name));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, searchQuery, selectedCategory, sortOrder]);

  // Pagination calculation
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0B101B] text-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-semibold text-center">Our Products</h1>
        </div>
      </header>



      {/* Search and Filters Section */}
      <div className="bg-white shadow-sm mb-6">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <select className="select select-info w-full max-w-xs"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.CategoryID} value={category.CategoryID}>
                    {category.CategoryName}
                  </option>
                ))}
              </select>


              <select className="select select-info w-full max-w-xs"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}>

                <option value="default" selected>Sort by</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse bg-white rounded-lg p-4 h-80">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-xl mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <div
                  key={product.ProductID}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="relative">
                    <img
                      src={product.Image}
                      alt={product.Name}
                      className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.Stock < 5 && (
                      <span className="absolute top-4 right-4 bg-red-500/90 text-white px-3 py-1 text-sm rounded-full backdrop-blur-sm">
                        Low Stock
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 line-clamp-2 min-h-[3.5rem]">
                      {product.Name}
                    </h2>

                    <p className="text-gray-600 line-clamp-2 text-sm min-h-[2.5rem]">
                      {product.Description.slice(0, 100)}...
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          ₹{product.Price}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${product.Stock > 10 ? 'bg-green-500' :
                          product.Stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></span>
                        <span className="text-sm text-gray-600">{product.Stock} in stock</span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        className={`flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${product.Stock === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-md'
                          }`}
                        onClick={() => dispatch(addToCart(product))}
                        disabled={product.Stock === 0}
                      >
                        <FaShoppingCart className="text-sm" />
                        {product.Stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>

                      <button
                        className="px-4 py-2.5 rounded-lg border-2 border-gray-200 hover:border-blue-600 text-gray-700 hover:text-blue-600 transition-colors duration-300"
                        onClick={() => navigate(`/products/${product.ProductID}`)}
                      >
                        <FaBolt />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-lg ${currentPage === index + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ProductPage;
