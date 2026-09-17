import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../../Assets/style/UserGetAllProduct.css";
import api from "../../Api/axios";
import { toast } from "react-toastify";

const GetAllProduct = () => {
  // Original fetched data
  const [allProducts, setAllProducts] = useState([]);

  // Search parameters synced with URL
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Sync state if query in URL changes
  useEffect(() => {
    const q = searchParams.get("query") || searchParams.get("search") || "";
    setSearchQuery(q);
  }, [searchParams]);


  // Loading & cart state
  const [loadingPid, setLoadingPid] = useState(null);

  // Filters State
  const defaultCategories = [
    "Fruits", "Vegetables", "Dairy", "Bakery", "Grains", "Pulses",
    "Oil & Ghee", "Spices", "Snacks", "Beverages", "Personal Care", "Household"
  ];
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [priceInput, setPriceInput] = useState({ min: 0, max: 10000 });
  const [maxAvailablePrice, setMaxAvailablePrice] = useState(10000);

  const [selectedRatings, setSelectedRatings] = useState([]);

  // Sort State
  const [sortOption, setSortOption] = useState("Name, A to Z");


  // Fetch all products
  useEffect(() => {
    window.scrollTo(0, 0);
    api.get("/products")
      .then((res) => {
        let data = [];
        if (res.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (Array.isArray(res.data)) {
          data = res.data;
        }
        setAllProducts(data);
        if (data && data.length > 0) {
          const maxP = Math.max(...data.map(p => p.finalPrice || p.price || 0));
          const roundedMax = Math.ceil(maxP / 100) * 100;
          // Ensuring minimum scale goes up to 10000
          const finalMax = Math.max(10000, roundedMax);
          setMaxAvailablePrice(finalMax);
          setPriceRange({ min: 0, max: finalMax });
          setPriceInput({ min: 0, max: finalMax });
        }
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const addToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Please login to add items to cart!");
      return;
    }

    try {
      const productId = product._id;
      setLoadingPid(product._id);

      await api.post("/cart/add", {
        productId,
        quantity: 1,
      });
      toast.success("Product added successfully");
    } catch (error) {
      console.error("Add to cart error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Something went wrong";
      toast.error(errorMsg);
    } finally {
      setLoadingPid(null);
    }
  };

  // ── FILTERING & SORTING LOGIC ──
  const filteredProducts = allProducts.filter(product => {
    // 0. Search Query Match
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      const nameMatch = (product.productName || "").toLowerCase().includes(query);
      const categoryMatch = (product.category || "").toLowerCase().includes(query);
      const brandMatch = (product.brand || "").toLowerCase().includes(query);
      if (!nameMatch && !categoryMatch && !brandMatch) return false;
    }

    // 1. Category Match
    if (selectedCategories.length > 0) {
      if (!selectedCategories.includes(product.category)) return false;
    }

    // 2. Price Match
    const productPrice = product.finalPrice || product.price || 0;
    if (productPrice < priceRange.min || productPrice > priceRange.max) return false;

    // 3. Rating Match
    if (selectedRatings.length > 0) {
      const pRating = Math.round(product.ratings || 0);
      if (!selectedRatings.includes(pRating)) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortOption === "Name, A to Z") {
      return (a.productName || "").localeCompare(b.productName || "");
    }
    if (sortOption === "Name, Z to A") {
      return (b.productName || "").localeCompare(a.productName || "");
    }
    if (sortOption === "Price, Low to High") {
      const priceA = a.finalPrice || a.price || 0;
      const priceB = b.finalPrice || b.price || 0;
      return priceA - priceB;
    }
    if (sortOption === "Price, High to Low") {
      const priceA = a.finalPrice || a.price || 0;
      const priceB = b.finalPrice || b.price || 0;
      return priceB - priceA;
    }
    return 0;
  });

  // ── HANDLERS ──
  const handleCategoryChange = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleRatingChange = (rating) => {
    setSelectedRatings(prev =>
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  const handlePriceDrag = (e) => {
    const val = parseInt(e.target.value);
    setPriceInput(prev => ({ ...prev, max: val }));
  };

  const handlePriceRelease = (e) => {
    const val = parseInt(e.target.value);
    setPriceRange(prev => ({ ...prev, max: val }));
  };

  return (
    <div className="gc-search-page">

      {/* Replaced header with empty top margin or breadcrumb */}
      {/* 
      <div className="gc-search-header-banner">
        <h2>All Products</h2>
        <p>Home / Products</p>
      </div> 
      */}

      <div className="gc-search-layout" style={{ marginTop: "40px" }}>

        {/* LEFT SIDEBAR */}
        <div className="gc-sidebar">

          {/* Categories */}
          <div className="gc-filter-group">
            <h4 className="gc-filter-title">
              Shop by Category
              <i className="fa-solid fa-chevron-up"></i>
            </h4>
            <div className="gc-filter-list gc-category-list">
              {defaultCategories.map(cat => (
                <label key={cat} className="gc-custom-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                  />
                  <span className="checkmark"></span>
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <hr className="gc-divider" />

          {/* Price Range */}
          <div className="gc-filter-group">
            <h4 className="gc-filter-title">Filter By Price</h4>
            <div className="gc-price-slider">
              <input
                type="range"
                min="0"
                max={maxAvailablePrice}
                step={maxAvailablePrice > 2000 ? "100" : "10"}
                value={priceInput.max}
                onChange={handlePriceDrag}
                onMouseUp={handlePriceRelease}
                onTouchEnd={handlePriceRelease}
                className="slider"
              />
              <div className="gc-price-labels">
                <span>₹0</span>
                <span>₹{priceInput.max}</span>
              </div>
            </div>
          </div>

          <hr className="gc-divider" />

          {/* Rating */}
          <div className="gc-filter-group">
            <h4 className="gc-filter-title">Filter By Rating</h4>
            <div className="gc-filter-list">
              {[5, 4, 3, 2, 1].map(star => (
                <label key={star} className="gc-custom-checkbox gc-rating-check">
                  <input
                    type="checkbox"
                    checked={selectedRatings.includes(star)}
                    onChange={() => handleRatingChange(star)}
                  />
                  <span className="checkmark"></span>
                  <div className="stars-wrapper">
                    {"★".repeat(star)}{"☆".repeat(5 - star)}
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT CONTENT */}
        <div className="gc-main-content">

          {/* Searched text on the upper left side */}
          {searchQuery.trim() && (
            <div style={{ marginBottom: "24px", textAlign: "left" }}>
              <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#111827" }}>
                Search results for: <span style={{ color: "#16a34a" }}>"{searchQuery}"</span>
              </h2>
            </div>
          )}

          {/* Top Bar */}
          <div className="gc-top-bar">
            <div className="gc-top-left">
              <i className="fa-solid fa-border-all gc-grid-icon"></i>
              <span className="gc-product-count">There are {filteredProducts.length} products.</span>
            </div>

            <div className="gc-top-right">
              <label>Sort By</label>
              <select
                className="gc-sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="Name, A to Z">Name, A to Z</option>
                <option value="Name, Z to A">Name, Z to A</option>
                <option value="Price, Low to High">Price, Low to High</option>
                <option value="Price, High to Low">Price, High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length === 0 ? (
            <div className="gc-no-results">
              <div className="gc-no-results-icon">🛒</div>
              <h3>No products found</h3>
              <p>We couldn't find anything matching your filters.</p>
              <button
                className="gc-clear-btn"
                onClick={() => {
                  setSelectedCategories([]);
                  setPriceRange({ min: 0, max: maxAvailablePrice });
                  setPriceInput({ min: 0, max: maxAvailablePrice });
                  setSelectedRatings([]);
                  setSearchParams(prev => {
                    prev.delete("query");
                    prev.delete("search");
                    return prev;
                  }, { replace: true });
                }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="gc-grid">
              {filteredProducts.map(product => {
                const isLoading = loadingPid === product.pid;
                const discount = product.discountPercent > 0 ? product.discountPercent : null;

                return (
                  <div key={product.pid || product._id} className="product-card">
                    {/* Discount Badge */}
                    {discount && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: "800",
                          padding: "3px 9px",
                          borderRadius: "20px",
                          zIndex: 2,
                          letterSpacing: "0.5px",
                        }}
                      >
                        {discount}% OFF
                      </div>
                    )}

                    {/* Product Image */}
                    <div
                      style={{
                        width: "100%",
                        height: "200px",
                        overflow: "hidden",
                        background: "#fff",
                        padding: "10px",
                      }}
                    >
                      <img
                        src={
                          product.productImg
                            ? `http://localhost:5005/uploads/products/${product.productImg}`
                            : product.image
                              ? product.image.replace("localhost:5000", "localhost:5005")
                              : "https://placehold.co/400x400?text=No+Image"
                        }
                        alt={product.productName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          transition: "transform 0.35s ease",
                        }}
                        onMouseEnter={(e) => (e.target.style.transform = "scale(1.04)")}
                        onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                      />
                    </div>

                    {/* Card Body */}
                    <div
                      style={{
                        padding: "12px 16px",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                      }}
                    >
                      {/* Product Name */}
                      <h5
                        style={{
                          margin: 0,
                          fontWeight: "700",
                          fontSize: "17px",
                          color: "#111827",
                          lineHeight: "1.3",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {product.productName}
                      </h5>

                      {/* Quantity Display */}
                      {product.quantity && (
                        <div style={{ fontSize: "13px", color: "#6b7280" }}>
                          {product.quantity}
                        </div>
                      )}

                      {/* Rating */}
                      <div
                        style={{
                          color: "#FBBF24",
                          fontSize: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginTop: "2px",
                        }}
                      >
                        {product.ratings !== null && product.ratings !== undefined ? (
                          <>
                            {"★".repeat(Math.round(product.ratings))}
                            {"☆".repeat(5 - Math.round(product.ratings))}
                            <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                              ({Number(product.ratings).toFixed(1)})
                            </span>
                          </>
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                            No ratings
                          </span>
                        )}
                      </div>

                      {/* Price Row */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "auto",
                          paddingTop: "12px",
                          borderTop: "1px solid #f3f4f6",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontWeight: "800",
                              fontSize: "20px",
                              color: "#15803d",
                            }}
                          >
                            ₹{product.finalPrice || product.price}
                          </span>
                          {product.discountPercent > 0 && (
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "#9ca3af",
                                fontSize: "12px",
                                marginLeft: "6px",
                              }}
                            >
                              ₹{product.price}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => addToCart(product)}
                          disabled={isLoading}
                          style={{
                            background: isLoading
                              ? "#9ca3af"
                              : "linear-gradient(135deg, #FF671F, #e55a17)",
                            border: "none",
                            color: "white",
                            padding: "7px 12px",
                            borderRadius: "6px",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            fontWeight: "700",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            transition: "all 0.2s ease",
                            boxShadow: isLoading
                              ? "none"
                              : "0 4px 10px rgba(255,103,31,0.25)",
                          }}
                          onMouseEnter={(e) => {
                            if (!isLoading) e.currentTarget.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          {isLoading ? (
                            <>
                              <span
                                style={{
                                  width: "12px",
                                  height: "12px",
                                  border: "2px solid #fff",
                                  borderTopColor: "transparent",
                                  borderRadius: "50%",
                                  display: "inline-block",
                                  animation: "spin 0.7s linear infinite",
                                }}
                              />{" "}
                              Adding…
                            </>
                          ) : (
                            <>
                              <i
                                className="fa-solid fa-cart-shopping"
                                style={{ fontSize: "12px" }}
                              />{" "}
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default GetAllProduct;