import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/axios";
import { toast } from "react-toastify";

const GetProductHome = () => {
  const [products, setProducts] = useState([]);
  const [loadingPid, setLoadingPid] = useState(null);
  const navigate = useNavigate();

  // ── Fetch all products
  useEffect(() => {
    api
      .get("/products")
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) {
          setProducts(res.data.data);
        } else if (Array.isArray(res.data)) {
          setProducts(res.data);
        }
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // ── Add to cart
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

  // Define the specific categories to show on the Home page
  const allowedCategories = ["Dairy", "Grains", "Snacks", "Vegetables"];

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const cat = product.category || "Uncategorized";
    // Show only the requested categories
    if (allowedCategories.includes(cat)) {
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
    }
    return acc;
  }, {});

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .scroll-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 10;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #374151;
          transition: all 0.2s;
        }
        .scroll-btn:hover {
          background: #f9fafb;
          color: #111827;
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }
        .product-card {
          flex: 0 0 240px;
          background: #fff;
          border-radius: 16px;
          border: 1.5px solid #e5e7eb;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          display: flex;
          flex-direction: column;
          position: relative;
          cursor: default;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.12);
        }
      `}</style>

      {/* ── Products Section ── */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "40px auto",
          padding: "0 24px 60px",
        }}
      >
        {Object.entries(productsByCategory).map(([category, catProducts]) => (
          <CategoryRow
            key={category}
            category={category}
            products={catProducts}
            addToCart={addToCart}
            loadingPid={loadingPid}
            navigate={navigate}
          />
        ))}

        {products.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "#6b7280",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
            <h3 style={{ color: "#374151", marginBottom: "8px" }}>
              Loading products...
            </h3>
          </div>
        )}
      </div>
    </>
  );
};

const CategoryRow = ({
  category,
  products,
  addToCart,
  loadingPid,
  navigate,
}) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 800;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div style={{ marginBottom: "50px" }}>
      {/* Category Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "800",
            color: "#111827",
            textTransform: "capitalize",
          }}
        >
          {category}
        </h2>
        <button
          onClick={() => navigate("/products")}
          style={{
            background: "linear-gradient(135deg, #22c55e, #15803d)",
            border: "none",
            color: "#fff",
            padding: "9px 20px",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 16px rgba(21,128,61,0.3)",
          }}
        >
          View All <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      {/* Slider Container */}
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="scroll-btn"
          style={{ left: "-22px" }}
        >
          <i
            className="fa-solid fa-chevron-left"
            style={{ fontSize: "16px" }}
          ></i>
        </button>

        {/* Scrollable Row */}
        <div
          ref={scrollRef}
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: "20px",
            overflowX: "auto",
            scrollBehavior: "smooth",
            padding: "10px 4px",
            width: "100%",
          }}
        >
          {products.map((product) => {
            const isLoading = loadingPid === product.pid;
            const discount =
              product.discountPercent > 0 ? product.discountPercent : null;

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
                          ? product.image.replace(
                              "localhost:5000",
                              "localhost:5005",
                            )
                          : "https://placehold.co/400x400?text=No+Image"
                    }
                    alt={product.productName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      transition: "transform 0.35s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.transform = "scale(1.04)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.transform = "scale(1)")
                    }
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
                    {product.ratings !== null &&
                    product.ratings !== undefined ? (
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
                        if (!isLoading)
                          e.currentTarget.style.transform = "scale(1.05)";
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

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="scroll-btn"
          style={{ right: "-22px" }}
        >
          <i
            className="fa-solid fa-chevron-right"
            style={{ fontSize: "16px" }}
          ></i>
        </button>
      </div>
    </div>
  );
};

export default GetProductHome;
