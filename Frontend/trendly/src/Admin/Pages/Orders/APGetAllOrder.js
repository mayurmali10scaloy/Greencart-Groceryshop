import React, { useState, useEffect } from "react";
import "../../../Assets/style/APGetAllProduct.css";
import api from "../../../Api/axios";

const APGetAllOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortConfig, setSortConfig] = useState(null);

  const toggleRow = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await api.delete(`/order/delete/${orderId}`);
      if (res.data && res.data.success) {
        fetchOrders();
      } else {
        alert("Failed to delete order");
      }
    } catch (err) {
      console.error("Delete order error:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to delete order";
      alert(errorMsg);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/order");
      let data = [];
      if (res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (Array.isArray(res.data)) {
        data = res.data;
      }
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };

  // Filter Logic
  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      o._id?.toLowerCase().includes(term) ||
      o.username?.toLowerCase().includes(term) ||
      o.email?.toLowerCase().includes(term) ||
      o.paymentMethod?.toLowerCase().includes(term)
    );
  });

  // Sort Logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;

    if (key === 'onumber') {
      const aVal = a._id ? a._id.toString() : "";
      const bVal = b._id ? b._id.toString() : "";
      return direction === "asc" ? aVal.localeCompare(bVal, undefined, { numeric: true }) : bVal.localeCompare(aVal, undefined, { numeric: true });
    }

    if (key === 'finalPrice') {
      return direction === "asc" ? a.finalPrice - b.finalPrice : b.finalPrice - a.finalPrice;
    }

    if (key === 'status') {
      const sA = a.status.toLowerCase();
      const sB = b.status.toLowerCase();
      if (sA < sB) return direction === "asc" ? -1 : 1;
      if (sA > sB) return direction === "asc" ? 1 : -1;
      return 0;
    }

    return 0;
  });

  // Pagination Logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Helper for status colors
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending": return "#f59e0b"; // Orange
      case "processing": return "#3b82f6"; // Blue
      case "shipped": return "#8b5cf6"; // Purple
      case "delivered": return "#10b981"; // Green
      case "cancelled": return "#ef4444"; // Red
      default: return "#6b7280";
    }
  };

  return (
    <div className="ap-product-page">
      {/* PAGE HEADER */}
      <div className="ap-page-header">
        <h2 className="ap-page-title">Orders Management</h2>

        {/* Search Bar */}
        <div className="ap-srch">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            placeholder="Search by Order ID, Customer, or Payment..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
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
      </div>

      {/* TABLE */}
      <div className="ap-table-wrap">
        <table className="ap-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}></th>
              <th onClick={() => handleSort('onumber')} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                Order ID
                <i
                  className={`fa-solid ${sortConfig?.key === "onumber" ? (sortConfig.direction === "asc" ? "fa-arrow-up" : "fa-arrow-down") : "fa-sort"}`}
                  style={{ color: "white", marginLeft: "8px", fontSize: "12px", opacity: sortConfig?.key === "onumber" ? 1 : 0.6 }}
                ></i>
              </th>
              <th>Customer</th>
              <th>Items</th>
              <th onClick={() => handleSort('finalPrice')} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                Total Amount
                <i
                  className={`fa-solid ${sortConfig?.key === "finalPrice" ? (sortConfig.direction === "asc" ? "fa-arrow-up" : "fa-arrow-down") : "fa-sort"}`}
                  style={{ color: "white", marginLeft: "8px", fontSize: "12px", opacity: sortConfig?.key === "finalPrice" ? 1 : 0.6 }}
                ></i>
              </th>
              <th>Payment</th>
              <th onClick={() => handleSort('status')} style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                Status
                <i
                  className={`fa-solid ${sortConfig?.key === "status" ? (sortConfig.direction === "asc" ? "fa-arrow-up" : "fa-arrow-down") : "fa-sort"}`}
                  style={{ color: "white", marginLeft: "8px", fontSize: "12px", opacity: sortConfig?.key === "status" ? 1 : 0.6 }}
                ></i>
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "24px", color: "#6366f1" }}></i>
                  <p style={{ marginTop: "10px", color: "#64748b" }}>Loading Orders...</p>
                </td>
              </tr>
            ) : currentOrders.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <div className="ap-empty">
                    <div className="ap-empty-icon">
                      <i className="fa-solid fa-box-open"></i>
                    </div>
                    <div className="ap-empty-text">No orders found</div>
                  </div>
                </td>
              </tr>
            ) : (
              currentOrders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr className={expandedRow === order._id ? "ap-row-active" : ""}>
                    {/* Expand Icon */}
                    <td style={{ cursor: "pointer", textAlign: "center" }} onClick={() => toggleRow(order._id)}>
                      <i className={`fa-solid fa-chevron-${expandedRow === order._id ? "up" : "down"}`} style={{ color: "#64748b", padding: "8px", transition: "all 0.3s ease" }}></i>
                    </td>

                    {/* Order ID */}
                    <td>
                      <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "14px" }}>#{order._id}</span>
                    </td>

                    {/* Customer Info */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={
                            order.profileImage
                              ? (order.profileImage.startsWith("http")
                                ? order.profileImage
                                : `http://localhost:5005/uploads/users/${order.profileImage}`)
                              : "https://placehold.co/40x40?text=U"
                          }
                          alt="avatar"
                          style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "1px solid #e2e8f0" }}
                          onError={(e) => e.target.src = "https://placehold.co/40x40?text=U"}
                        />
                        <div>
                          <div style={{ fontWeight: 500, color: "#1e293b" }}>{order.username}</div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{order.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Items */}
                    <td>
                      <div className="ap-stock-qty">{order.totalItems}</div>
                    </td>

                    {/* Total Amount */}
                    <td>
                      <div className="ap-price-final">₹{order.finalPrice}</div>
                    </td>

                    {/* Payment */}
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontWeight: 500, fontSize: "13px", color: "#1e293b" }}>
                          {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod.toUpperCase()}
                        </span>
                        <span style={{
                          fontSize: "11px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          width: "fit-content",
                          backgroundColor: order.paymentStatus === "Completed" ? "#dcfce7" : "#fef9c3",
                          color: order.paymentStatus === "Completed" ? "#166534" : "#854d0e",
                          fontWeight: 600
                        }}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <select
                        value={order.status}
                        onChange={async (e) => {
                          const statusVal = e.target.value;
                          try {
                            const res = await api.put(`/order/update/${order._id}`, { status: statusVal });
                            if (res.data && res.data.success) {
                              fetchOrders();
                            } else {
                              alert("Failed to update status");
                            }
                          } catch (err) {
                            console.error("Update status error:", err);
                            const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to update status";
                            alert(errorMsg);
                          }
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: `1px solid ${getStatusColor(order.status)}`,
                          backgroundColor: `${getStatusColor(order.status)}10`,
                          color: getStatusColor(order.status),
                          fontSize: "13px",
                          fontWeight: 600,
                          outline: "none",
                          cursor: "pointer",
                          textTransform: "capitalize",
                        }}
                      >
                        <option value="pending" style={{ color: getStatusColor("pending"), backgroundColor: "#fff" }}>Pending</option>
                        <option value="processing" style={{ color: getStatusColor("processing"), backgroundColor: "#fff" }}>Processing</option>
                        <option value="shipped" style={{ color: getStatusColor("shipped"), backgroundColor: "#fff" }}>Shipped</option>
                        <option value="delivered" style={{ color: getStatusColor("delivered"), backgroundColor: "#fff" }}>Delivered</option>
                        <option value="cancelled" style={{ color: getStatusColor("cancelled"), backgroundColor: "#fff" }}>Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="ap-action-wrap">
                        <span
                          className="ap-action-link delete"
                          onClick={() => handleDeleteOrder(order._id)}
                          title="Delete Order"
                          style={{ cursor: "pointer" }}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </span>
                      </div>
                    </td>

                  </tr>

                  {/* EXPANDABLE DETAILS ROW */}
                  {expandedRow === order._id && (
                    <tr className="ap-expanded-row">
                      <td colSpan="8" style={{ padding: "0" }}>
                        <div style={{ padding: "24px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                          <h4 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#1e293b", borderBottom: "1px solid #cbd5e1", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <i className="fa-solid fa-receipt" style={{ color: "#6366f1" }}></i>
                            Full Order Details - <span style={{ color: "#6366f1" }}>#{order._id}</span>
                            <span style={{ fontSize: "14px", color: "#64748b", marginLeft: "auto", fontWeight: "normal", display: "flex", alignItems: "center", gap: "6px" }}>
                              <i className="fa-solid fa-calendar-days"></i>
                              Ordered on: {new Date(order.createdAt).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </span>
                          </h4>

                          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                            {/* Shipping Details */}
                            <div style={{ flex: "1", minWidth: "250px", backgroundColor: "#ffffff", padding: "20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                              <h5 style={{ margin: "0 0 16px 0", fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <i className="fa-solid fa-truck-fast"></i> Shipping Details
                              </h5>
                              <div style={{ fontSize: "14px", color: "#334155", lineHeight: "1.6" }}>
                                <p style={{ margin: "0 0 6px 0", fontWeight: 600, color: "#1e293b", fontSize: "15px" }}>{order.username}</p>
                                <p style={{ margin: "0 0 4px 0" }}>{order.shippingAddress?.address}</p>
                                <p style={{ margin: "0 0 16px 0" }}>{order.shippingAddress?.city} - <span style={{ fontWeight: 500 }}>{order.shippingAddress?.pincode}</span></p>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                                  <div style={{ backgroundColor: "#f1f5f9", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <i className="fa-solid fa-phone" style={{ color: "#64748b", fontSize: "13px" }}></i>
                                  </div>
                                  <span style={{ fontWeight: 500, color: "#0f172a" }}>+91 {order.shippingAddress?.mobileno || order.mobileno}</span>
                                </div>
                              </div>
                            </div>

                            {/* Ordered Items */}
                            <div style={{ flex: "2", minWidth: "350px", backgroundColor: "#ffffff", padding: "20px", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                              <h5 style={{ margin: "0 0 16px 0", fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <i className="fa-solid fa-box-open"></i> Ordered Items ({order.items?.length})
                              </h5>
                              <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "300px", overflowY: "auto", paddingRight: "8px" }}>
                                {order.items?.map((item, idx) => (
                                  <div key={idx} style={{ display: "flex", gap: "20px", alignItems: "center", borderBottom: idx !== order.items.length - 1 ? "1px solid #f1f5f9" : "none", paddingBottom: idx !== order.items.length - 1 ? "16px" : "0" }}>
                                    <img
                                      src={
                                        item.productImg
                                          ? `http://localhost:5005/uploads/products/${item.productImg}`
                                          : (item.image || "https://placehold.co/100x100?text=Image")
                                      }
                                      alt={item.productName}
                                      style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}
                                      onError={(e) => e.target.src = "https://placehold.co/100x100?text=Image"}
                                    />
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: "15px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>{item.productName}</div>
                                      <div style={{ fontSize: "13px", color: "#64748b" }}>Brand: {item.brand || "N/A"}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                      <div style={{ fontSize: "15px", fontWeight: 600, color: "#1e293b" }}>₹{item.finalPrice}</div>
                                      <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>Qty: <span style={{ fontWeight: 600, color: "#334155" }}>{item.quantity}</span></div>
                                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#3b82f6", marginTop: "8px" }}>Total: ₹{item.itemTotal}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="ap-pagination">
          <button className="ap-pg-btn" onClick={prevPage} disabled={currentPage === 1}>
            <i className="fa-solid fa-arrow-left"></i> Previous
          </button>
          <div className="ap-pg-pages">
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              return (
                <span key={pageNum} className={`ap-pg-num ${currentPage === pageNum ? "active" : ""}`} onClick={() => paginate(pageNum)}>
                  {pageNum}
                </span>
              );
            })}
          </div>
          <button className="ap-pg-btn" onClick={nextPage} disabled={currentPage === totalPages}>
            Next <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default APGetAllOrder;
