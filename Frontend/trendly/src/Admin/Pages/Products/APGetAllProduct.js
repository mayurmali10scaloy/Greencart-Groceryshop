import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
// import AddProductModal from "./AddProduct";
import "../../../Assets/style/APGetAllProduct.css";
import api from "../../../Api/axios";

const APGetAllProduct = () => {
  const [products, setProducts] = useState([]);
  // const [showAddModal, setShowAddModal] = useState(false);

  const [actionMsg, setActionMsg] = useState("");
  const [actionType, setActionType] = useState("");

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const nav = useNavigate();
  const location = useLocation();

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      let data = [];
      if (res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (Array.isArray(res.data)) {
        data = res.data;
      }
      setProducts(data);
    } catch (err) {
      console.error("FETCH PRODUCTS ERROR:", err);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // Filter Logic
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.productName?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term) ||
      p.brand?.toLowerCase().includes(term)
    );
  });

  // Pagination Logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  useEffect(() => {
    if (location.state?.msg && location.state?.type) {
      setActionMsg(location.state.msg);
      setActionType(location.state.type);
      setTimeout(() => setActionMsg(""), 4000);
      nav(location.pathname, { replace: true });
    }
  }, [location, nav]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/delete/${id}`);
      fetchProducts();
      setActionType("delete");
      setActionMsg("Product Deleted successfully!");
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      console.error("DELETE PRODUCT ERROR:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to delete product";
      alert("Delete Error: " + errorMsg);
    }
  };

  return (
    <>
      {/* TOAST */}
      {actionMsg && (
        <div className={`ap-toast ${actionType}`}>
          <i className={`fa-solid ${actionType === "delete" ? "fa-trash-can" : "fa-circle-check"}`}></i>
          {actionMsg}
        </div>
      )}

      <div className="ap-product-page">

        {/* PAGE HEADER */}
        <div className="ap-page-header">
          <h2 className="ap-page-title">Products list</h2>

          {/* Search Bar */}
          <div className="ap-srch">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              placeholder="Search by name, category, or brand..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // reset to page 1 on new search
              }}
            />
            <button
              className="serch-btn"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
            >
              <i className="fa-solid fa-x"></i>
            </button>
          </div>


          <div className="ap-header-actions">

            <Link className="ap-add-btn" to={"/AdminPanel/AddProduct"} style={{ textDecoration: "none" }}>
              <i className="fa-solid fa-plus"></i>
              Add Product
            </Link>

          </div>
        </div>

        {/* PRODUCT TABLE */}
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>Product Details     <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Description         <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Category            <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Brand               <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Price               <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Discount            <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Final Price         <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Quantity            <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Stock               <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Rating              <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Status              <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!currentProducts || currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="12">
                    <div className="ap-empty">
                      <div className="ap-empty-icon">
                        <i className="fa-solid fa-box-open"></i>
                      </div>
                      <div className="ap-empty-text">No products found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => (
                  <tr key={product._id}>


                    {/* Product Details: Image + Name + PID */}
                    <td>
                      <div className="ap-product-cell">
                        <img
                          src={
                            product.productImg
                              ? `http://localhost:5005/uploads/products/${product.productImg}`
                              : product.image
                                ? product.image.replace("localhost:5000", "localhost:5005")
                                : ""
                          }
                          alt={product.productName}
                          className="ap-product-img"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Crect width='44' height='44' rx='4' fill='%23f3f4f8'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='%23c7c9d9'%3E%F0%9F%93%A6%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="ap-product-info">
                          <span className="ap-product-name">{product.productName}</span>
                          {/* <span className="ap-product-id">PID {product._id}</span> */}
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td>
                      <span className="ap-description">
                        {product.description || <span className="ap-null">—</span>}
                      </span>
                    </td>

                    {/* Category */}
                    <td>{product.category}</td>

                    {/* Brand */}
                    <td>{product.brand || <span className="ap-null">—</span>}</td>

                    {/* Original Price */}
                    <td>
                      <div className="ap-price-main">₹{product.price}</div>
                    </td>

                    {/* Discount */}
                    <td>
                      {product.discountPercent > 0 ? (
                        <div className="ap-discount-cell">
                          <div className="ap-price-discount">{product.discountPercent}% off</div>
                          <div className="ap-discount-amt">-₹{product.discountPrice || 0}</div>
                        </div>
                      ) : (
                        <span className="ap-null">—</span>
                      )}
                    </td>

                    {/* Final Price */}
                    <td>
                      <div className="ap-price-final">₹{product.finalPrice || product.price}</div>
                    </td>

                    {/* Quantity */}
                    <td>
                      <div className="ap-stock-qty">{product.quantity}</div>
                    </td>

                    {/* Stock */}
                    <td>
                      <div className="ap-stock-qty">{product.stock}</div>
                    </td>

                    {/* Rating */}
                    <td>
                      <div className="ap-rating">
                        <i className="fa-solid fa-star"></i>
                        <span>{product.ratings ?? 0}</span>
                        <span style={{ opacity: 0.4, fontWeight: 400 }}>/5</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`ap-pill ${product.isActive ? 'active' : 'inactive'}`}>
                        {product.isActive ? 'Active' : 'Closed'}
                      </span>
                    </td>

                    {/* Action */}
                    <td>
                      <div className="ap-action-wrap">
                        <Link to={`/AdminPanel/EditProduct/${product._id}`}>
                          <span
                            className="ap-action-link"
                          >

                            <i className="fa-solid fa-pen-to-square"></i>
                          </span></Link>
                        <span
                          className="ap-action-link delete"
                          onClick={() => handleDelete(product._id)}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </span>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="ap-pagination">
            <button
              className="ap-pg-btn"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              <i className="fa-solid fa-arrow-left"></i>
              Previous
            </button>
            <div className="ap-pg-pages">
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <span
                    key={pageNum}
                    className={`ap-pg-num ${currentPage === pageNum ? "active" : ""}`}
                    onClick={() => paginate(pageNum)}
                  >
                    {pageNum}
                  </span>
                );
              })}
            </div>
            <button
              className="ap-pg-btn"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default APGetAllProduct;