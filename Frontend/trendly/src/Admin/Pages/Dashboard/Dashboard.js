import React, { useState, useEffect } from "react";
import "../../../Assets/style/Dashboard.css";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          fetch("http://localhost:5005/users"),
          fetch("http://localhost:5005/products"),
          fetch("http://localhost:5005/orders"),
        ]);

        const usersData = await usersRes.json();
        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();

        const usersList = usersData.data || [];
        const productsList = productsData || [];
        const ordersList = ordersData.data || [];

        // Calculate Revenue (only from delivered/completed orders usually, but we'll sum all finalPrices for now or just completed ones)
        const revenue = ordersList.reduce((acc, order) => acc + (order.finalPrice || 0), 0);

        setStats({
          totalUsers: usersList.length,
          totalProducts: productsList.length,
          totalOrders: ordersList.length,
          totalRevenue: revenue,
        });

        // Set recent 5 orders
        setRecentOrders(ordersList.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "status-pending";
      case "Processing": return "status-processing";
      case "Shipped": return "status-shipped";
      case "Delivered": return "status-delivered";
      case "Cancelled": return "status-cancelled";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="dash-loading">
        <i className="fa-solid fa-spinner fa-spin"></i>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dash-container">
      {/* HEADER */}
      <div className="dash-header">
        <div>
          <h2 className="dash-title">Dashboard Overview</h2>
          <p className="dash-subtitle">Welcome back! Here is what's happening today.</p>
        </div>
        <div className="dash-date">
          <i className="fa-regular fa-calendar"></i>
          {new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="dash-stats-grid">
        <div className="dash-card">
          <div className="dash-card-info">
            <p>Total Revenue</p>
            <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="dash-card-icon bg-green">
            <i className="fa-solid fa-indian-rupee-sign"></i>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-info">
            <p>Total Products</p>
            <h3>{stats.totalProducts}</h3>
          </div>
          <div className="dash-card-icon bg-blue">
            <i className="fa-solid fa-box-open"></i>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-info">
            <p>Total Orders</p>
            <h3>{stats.totalOrders}</h3>
          </div>
          <div className="dash-card-icon bg-purple">
            <i className="fa-solid fa-cart-shopping"></i>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-info">
            <p>Total Users</p>
            <h3>{stats.totalUsers}</h3>
          </div>
          <div className="dash-card-icon bg-orange">
            <i className="fa-solid fa-users"></i>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h3>Recent Orders</h3>
          <Link to="/AdminPanel/Order" className="dash-view-all">View All Orders <i className="fa-solid fa-arrow-right"></i></Link>
        </div>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="dash-empty">No recent orders found.</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td><strong>#{order.oid}</strong></td>
                    <td>
                      <div className="dash-user-cell">
                        <img
                          src={order.profileImage?.replace("localhost:5000", "localhost:5005") || "https://placehold.co/40x40?text=U"}
                          alt="avatar"
                          onError={(e) => e.target.src = "https://placehold.co/40x40?text=U"}
                        />
                        <span>{order.username}</span>
                      </div>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td><strong>₹{order.finalPrice}</strong></td>
                    <td>
                      <span className={`dash-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK LINKS */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h3>Quick Links</h3>
        </div>
        <div className="dash-links-grid">
          <Link to="/AdminPanel/AddProduct" className="dash-link-card">
            <div className="dash-link-icon"><i className="fa-solid fa-plus"></i></div>
            <span>Add New Product</span>
          </Link>
          <Link to="/AdminPanel/Products" className="dash-link-card">
            <div className="dash-link-icon"><i className="fa-solid fa-boxes-stacked"></i></div>
            <span>Manage Products</span>
          </Link>
          <Link to="/AdminPanel/AddUser" className="dash-link-card">
            <div className="dash-link-icon"><i className="fa-solid fa-user-plus"></i></div>
            <span>Add New User</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
