import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../../Assets/style/MyOrders.css';
import api from '../../Api/axios';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const nav = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                nav('/login');
                return;
            }

            try {
                const decoded = jwtDecode(token);
                const userid = decoded.id || decoded.uid;

                const res = await api.get(`/order/${userid}`);
                const data = res.data;

                if (data.success) {
                    setOrders(data.data);
                } else {
                    setError(data.error || data.message || "Failed to load orders");
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
                const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to load orders. Please try again later.";
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [nav]);

    const getStatusIndex = (status) => {
        const statuses = ["pending", "processing", "shipped", "delivered"];
        return statuses.indexOf(status?.toLowerCase());
    };

    const renderStatusTracker = (status) => {
        if (status?.toLowerCase() === "cancelled") {
            return (
                <div className="order-status-tracker cancelled" style={{ padding: '1rem 1.5rem', background: '#fff1f2', borderRadius: '0.5rem', margin: '1rem 1.5rem', border: '1px solid #fecaca' }}>
                    <div className="status-label-cancelled" style={{ color: '#be123c', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        This order has been cancelled
                    </div>
                </div>
            );
        }

        const steps = ["Pending", "Processing", "Shipped", "Delivered"];
        const currentIndex = getStatusIndex(status);

        return (
            <div className="order-status-tracker">
                <div className="status-steps">
                    {/* Progress bar fill line */}
                    {currentIndex > 0 && (
                        <div
                            className="progress-bar-fill"
                            style={{ width: `calc(${(currentIndex / (steps.length - 1)) * 100}% - 80px)` }}
                        />
                    )}

                    {steps.map((step, index) => {
                        let stepClass = "step";
                        if (index < currentIndex) stepClass += " completed";
                        if (index === currentIndex) stepClass += " active";

                        return (
                            <div key={step} className={stepClass}>
                                <div className="step-icon">
                                    {index < currentIndex ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                                <span className="step-label">{step}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="my-orders-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="loading-spinner">Loading your order history...</div>
        </div>
    );

    if (error) return (
        <div className="my-orders-container">
            <div className="error-alert" style={{ padding: '2rem', background: '#fff1f2', borderRadius: '1rem', textAlign: 'center', color: '#be123c' }}>
                <h3>Oops!</h3>
                <p>{error}</p>
                <button className="btn" onClick={() => window.location.reload()} style={{ marginTop: '1rem', background: '#be123c', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>Try Again</button>
            </div>
        </div>
    );

    return (
        <div className="my-orders-container">
            <h1 className="my-orders-title">My Order History</h1>

            {orders.length === 0 ? (
                <div className="no-orders text-center">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: '1.5rem' }}>
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                    <h2>You haven't placed any orders yet.</h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>Discover our fresh products and start shopping today!</p>
                    <button
                        onClick={() => nav('/products')}
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '0.75rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)' }}
                    >
                        Browse Products
                    </button>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <div className="order-info">
                                    <h3>Order #{order._id}</h3>
                                    <p className="order-date">Placed on {new Date(order.createdAt || order.orderDate).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                </div>
                                <div className="order-total-top">
                                    <span className="order-total-label">Total Amount</span>
                                    <span className="order-total-value">₹{order.finalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            {renderStatusTracker(order.status)}

                            <div className="order-items-list">
                                <h4 className="items-title">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#10b981' }}>
                                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
                                    </svg>
                                    Order Items ({order.items.length})
                                </h4>
                                <div className="items-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="item-row" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9' }}>
                                            <div className="item-img">
                                                <img
                                                    src={
                                                        item.productImg
                                                            ? `http://localhost:5005/uploads/products/${item.productImg}`
                                                            : (item.image
                                                                ? item.image.replace("localhost:5000", "localhost:5005")
                                                                : "https://via.placeholder.com/150")
                                                    }
                                                    alt={item.productName}
                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                                                />
                                            </div>
                                            <div className="item-details">
                                                <div className="item-name">{item.productName}</div>
                                                <div className="item-brand">{item.brand || 'Fresh Product'}</div>
                                                <div className="item-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                                                    <div className="item-qty" style={{ fontSize: '0.875rem', color: '#64748b' }}>Qty: {item.quantity}</div>
                                                    <div className="item-price" style={{ fontWeight: '700', color: '#0f172a' }}>₹{(item.finalPrice * item.quantity).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
