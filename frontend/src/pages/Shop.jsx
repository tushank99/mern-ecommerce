import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetFilteredProductsQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";

import {
  setCategories,
  setProducts,
  setChecked,
} from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import ProductCard from "./Products/ProductCard";

const Shop = () => {
  const dispatch = useDispatch();
  const { categories, products, checked, radio } = useSelector(
    (state) => state.shop
  );

  const categoriesQuery = useFetchCategoriesQuery();
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
  });

  const filteredProductsQuery = useGetFilteredProductsQuery({
    checked,
    radio,
  });

  useEffect(() => {
    if (!categoriesQuery.isLoading) {
      dispatch(setCategories(categoriesQuery.data));
    }
  }, [categoriesQuery.data, categoriesQuery.isLoading, dispatch]);

  useEffect(() => {
    if (!filteredProductsQuery.isLoading && filteredProductsQuery.data) {
      let filteredProducts = [...filteredProductsQuery.data];

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.brand.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
      }

      // Filter by brand
      if (selectedBrand) {
        filteredProducts = filteredProducts.filter(
          (product) => product.brand === selectedBrand
        );
      }

      // Filter by price range
      if (minPrice !== "") {
        filteredProducts = filteredProducts.filter(
          (product) => product.price >= parseFloat(minPrice)
        );
      }
      if (maxPrice !== "") {
        filteredProducts = filteredProducts.filter(
          (product) => product.price <= parseFloat(maxPrice)
        );
      }

      // Sort products
      switch (sortBy) {
        case "price-low":
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case "price-high":
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case "rating":
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case "name":
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "newest":
        default:
          // Keep original order (newest first from API)
          break;
      }

      dispatch(setProducts(filteredProducts));
    }
  }, [
    checked,
    radio,
    filteredProductsQuery.data,
    filteredProductsQuery.isLoading,
    dispatch,
    selectedBrand,
    minPrice,
    maxPrice,
    searchQuery,
    sortBy,
  ]);

  const handleBrandClick = (brand) => {
    setSelectedBrand(brand === selectedBrand ? "" : brand);
  };

  const handleCheck = (value, id) => {
    const updatedChecked = value
      ? [...checked, id]
      : checked.filter((c) => c !== id);
    dispatch(setChecked(updatedChecked));
  };

  const uniqueBrands = [
    ...Array.from(
      new Set(
        filteredProductsQuery.data
          ?.map((product) => product.brand)
          .filter((brand) => brand !== undefined)
      )
    ),
  ];

  const handleReset = () => {
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
    setSortBy("newest");
    dispatch(setChecked([]));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const activeFiltersCount =
    checked.length + (selectedBrand ? 1 : 0) + (minPrice || maxPrice ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="ml-[5%] min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-6 px-6 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Shop</h1>
              <p className="text-gray-400 mt-1">
                {products?.length || 0} products found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for products, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name">Name: A-Z</option>
              </select>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 bg-pink-600 text-white px-4 py-3 rounded-xl hover:bg-pink-500 transition-colors"
              >
                <FaFilter />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-white text-pink-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside
            className={`
              ${showFilters ? "fixed inset-0 z-50 bg-gray-900 overflow-y-auto p-4" : "hidden"}
              lg:block lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0
              lg:w-72 lg:flex-shrink-0
            `}
          >
            <div className="bg-gray-800 rounded-xl p-5 lg:sticky lg:top-4 border border-gray-700">
              {/* Mobile Close Button */}
              <div className="flex justify-between items-center lg:hidden mb-4 pb-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Categories Section */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection("categories")}
                  className="flex justify-between items-center w-full text-left mb-3"
                >
                  <h3 className="text-lg font-semibold text-white">
                    Categories
                  </h3>
                  {expandedSections.categories ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </button>
                <div
                  className={`space-y-2 transition-all duration-300 ${
                    expandedSections.categories
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  {categories?.map((c) => (
                    <label
                      key={c._id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        checked.includes(c._id)
                          ? "bg-pink-600/20 border border-pink-500"
                          : "bg-gray-700/50 border border-transparent hover:bg-gray-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked.includes(c._id)}
                        onChange={(e) => handleCheck(e.target.checked, c._id)}
                        className="w-4 h-4 text-pink-600 bg-gray-600 border-gray-500 rounded focus:ring-pink-500 focus:ring-2"
                      />
                      <span className="text-gray-200 text-sm font-medium">
                        {c.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands Section */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection("brands")}
                  className="flex justify-between items-center w-full text-left mb-3"
                >
                  <h3 className="text-lg font-semibold text-white">Brands</h3>
                  {expandedSections.brands ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </button>
                <div
                  className={`space-y-2 transition-all duration-300 ${
                    expandedSections.brands
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  {uniqueBrands?.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleBrandClick(brand)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                        selectedBrand === brand
                          ? "bg-pink-600/20 border border-pink-500"
                          : "bg-gray-700/50 border border-transparent hover:bg-gray-700"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedBrand === brand
                            ? "border-pink-500"
                            : "border-gray-500"
                        }`}
                      >
                        {selectedBrand === brand && (
                          <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                        )}
                      </div>
                      <span className="text-gray-200 text-sm font-medium">
                        {brand}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Section */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection("price")}
                  className="flex justify-between items-center w-full text-left mb-3"
                >
                  <h3 className="text-lg font-semibold text-white">
                    Price Range
                  </h3>
                  {expandedSections.price ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </button>
                <div
                  className={`transition-all duration-300 ${
                    expandedSections.price
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-gray-400 text-xs mb-1 block">
                        Min
                      </label>
                      <input
                        type="number"
                        placeholder="₹0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-gray-400 text-xs mb-1 block">
                        Max
                      </label>
                      <input
                        type="number"
                        placeholder="₹999"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {activeFiltersCount > 0 && (
                <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                  <p className="text-gray-300 text-sm mb-2">
                    <span className="font-semibold">{activeFiltersCount}</span>{" "}
                    filter{activeFiltersCount > 1 ? "s" : ""} applied
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {checked.map((id) => {
                      const cat = categories?.find((c) => c._id === id);
                      return cat ? (
                        <span
                          key={id}
                          className="bg-pink-600/30 text-pink-300 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        >
                          {cat.name}
                          <button
                            onClick={() => handleCheck(false, id)}
                            className="hover:text-white"
                          >
                            <FaTimes size={10} />
                          </button>
                        </span>
                      ) : null;
                    })}
                    {selectedBrand && (
                      <span className="bg-purple-600/30 text-purple-300 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        {selectedBrand}
                        <button
                          onClick={() => setSelectedBrand("")}
                          className="hover:text-white"
                        >
                          <FaTimes size={10} />
                        </button>
                      </span>
                    )}
                    {(minPrice || maxPrice) && (
                      <span className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        ₹{minPrice || "0"} - ₹{maxPrice || "∞"}
                        <button
                          onClick={() => {
                            setMinPrice("");
                            setMaxPrice("");
                          }}
                          className="hover:text-white"
                        >
                          <FaTimes size={10} />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <FaTimes size={14} />
                Reset All Filters
              </button>

              {/* Mobile Apply Button */}
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden w-full py-3 mt-3 bg-pink-600 hover:bg-pink-500 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Apply Filters ({products?.length} products)
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {filteredProductsQuery.isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader />
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-400 mb-4">
                  Try adjusting your filters to find what you&apos;re looking for.
                </p>
                <button
                  onClick={handleReset}
                  className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products?.map((p) => (
                  <div
                    key={p._id}
                    className="transform hover:scale-[1.02] transition-transform duration-300"
                  >
                    <ProductCard p={p} />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;
