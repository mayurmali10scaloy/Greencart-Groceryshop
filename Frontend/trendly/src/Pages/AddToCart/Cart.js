import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../Assets/style/Cart.css";
import api from "../../Api/axios";
import { toast } from "react-toastify";

/* ── Quantity stepper ── */
const QtyBtn = ({ value, onDecrease, onIncrease }) => (
  <div className="gc-qty">
    <button className="gc-qty-btn" onClick={onDecrease} aria-label="Decrease">−</button>
    <span className="gc-qty-val">{value}</span>
    <button className="gc-qty-btn" onClick={onIncrease} aria-label="Increase">+</button>
  </div>
);

/* ── Empty Cart ── */
const EmptyCart = () => (
  <div className="gc-cart-empty">
    <div className="gc-empty-icon-wrap">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#f0fdf4" />
        <path d="M25 30h5l6 30h28l6-20H38" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="42" cy="68" r="3.5" fill="#22c55e" />
        <circle cx="62" cy="68" r="3.5" fill="#22c55e" />
        <path d="M50 44v8M46 48h8" stroke="#bbf7d0" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
    <h3>Your cart is empty</h3>
    <p>Looks like you haven't added anything yet.<br />Let's fix that!</p>
    <Link to="/home" className="gc-empty-shop-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      Start Shopping
    </Link>
  </div>
);

/* ── Cart Item Row ── */
const CartItem = ({ item, uid, onRemove, onQtyChange, removing }) => {
  const price = (item.finalPrice !== undefined && item.finalPrice !== null) ? item.finalPrice : (item.price || 0);
  const qty = item.quantity || 1;
  const lineTotal = (price * qty).toFixed(2);

  const itemImg = item.productImg
    ? `http://localhost:5005/uploads/products/${item.productImg}`
    : (item.image || "https://placehold.co/200x200?text=No+Image");

  return (
    <div className={`gc-cart-item${removing ? " removing" : ""}`}>
      {/* Image */}
      <div className="gc-ci-img-wrap">
        <img
          src={itemImg}
          alt={item.productName}
          className="gc-ci-img"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="gc-ci-info">
        {item.brand && <span className="gc-ci-brand">{item.brand}</span>}
        <h3 className="gc-ci-name">{item.productName}</h3>
        <p className="gc-ci-unit-price">₹{price} / each</p>
      </div>

      {/* Qty stepper */}
      <div className="gc-ci-controls">
        <QtyBtn
          value={qty}
          onDecrease={() => onQtyChange(item.product?._id || item.product, qty - 1)}
          onIncrease={() => onQtyChange(item.product?._id || item.product, qty + 1)}
        />
        <p className="gc-ci-line-total">₹{lineTotal}</p>
      </div>

      {/* Remove */}
      <button
        className="gc-ci-remove"
        onClick={() => onRemove(item.product?._id || item.product)}
        aria-label={`Remove ${item.productName}`}
        title="Remove item"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
        </svg>
      </button>
    </div>
  );
};

/* ════════════════════════════════════════════
   MAIN CART PAGE
   ════════════════════════════════════════════ */
function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingPid, setRemPid] = useState(null);
  const [payMethod, setPayMethod] = useState("cod");
  const [uid, setUid] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    pincode: ""
  });

  // ── Load cart from API
  const loadCart = useCallback(async () => {
    try {
      const res = await api.get("/cart/mycart");
      const cartData = res.data.data;
      if (cartData && Array.isArray(cartData.items)) {
        setItems(cartData.items);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error("Load cart error:", e);
      if (e.response?.status === 401) {
        setUid(null);
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Get uid from JWT once, load cart
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUid(decoded.id);
      } catch (e) {
        console.error("Invalid token:", e);
      }
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (uid) {
      loadCart();
    }
  }, [uid, loadCart]);

  // ── Remove item: DELETE /cart/remove/:productId
  const removeItem = async (pid) => {
    setRemPid(pid);
    setTimeout(async () => {
      try {
        await api.delete(`/cart/remove/${pid}`);
        loadCart();
        toast.success("Product removed from cart");
      } catch (e) {
        console.error("Remove error:", e);
        if (e.response?.status === 401) {
          setUid(null);
        }
        const errorMsg = e.response?.data?.message || e.response?.data?.error || "Failed to remove product";
        toast.error(errorMsg);
      } finally {
        setRemPid(null);
      }
    }, 350);
  };

  // ── Real-time quantity sync with database
  const handleQtyChange = async (pid, newQty) => {
    if (newQty < 1) return;
    const currentItem = items.find((item) => (item.product?._id || item.product) === pid);
    if (!currentItem) return;
    const currentQty = currentItem.quantity || 1;

    try {
      if (newQty > currentQty) {
        await api.put(`/cart/increase/${pid}`);
      } else if (newQty < currentQty) {
        await api.put(`/cart/decrease/${pid}`);
      }
      loadCart();
    } catch (e) {
      console.error("Update quantity error:", e);
      if (e.response?.status === 401) {
        setUid(null);
      }
      const errorMsg = e.response?.data?.message || e.response?.data?.error || "Quantity update failed";
      toast.error(errorMsg);
    }
  };

  const handlePlaceOrder = async () => {
    if (!uid || items.length === 0) return;

    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.pincode) {
      toast.warning("Please fill in all shipping details.");
      return;
    }

    try {
      await api.post("/order/add", {
        shippingAddress: shippingAddress,
        paymentMethod: payMethod === "card" ? "Card" : payMethod.toUpperCase()
      });

      setItems([]); // Clear local UI cart
      toast.success("Order Placed Successfully!");
    } catch (err) {
      console.error("Place order err:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to place order. Please try again later.";
      toast.error(errorMsg);
    }
  };

  /* ── Calculations ── */
  const subtotal = items.reduce((a, i) => {
    const itemPrice = (i.finalPrice !== undefined && i.finalPrice !== null) ? i.finalPrice : (i.price || 0);
    return a + itemPrice * (i.quantity || 1);
  }, 0);
  const discount = 0;
  const shipping = (subtotal > 499 || subtotal === 0) ? 0 : 49;
  const total = subtotal === 0 ? 0 : (subtotal - discount + shipping);

  const PAY_OPTIONS = [
    { id: "cod", icon: "💵", label: "Cash on Delivery" },
    { id: "upi", icon: "📲", label: "UPI / GPay / PhonePe" },
    { id: "card", icon: "💳", label: "Credit / Debit Card" },
  ];

  return (
    <div className="gc-cart-page">
      {/* ── Page title ── */}
      <div className="gc-cart-hero">
        <div className="gc-cart-hero-inner">
          <h1>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.97-1.67L23 6H6" />
            </svg>
            My Cart
          </h1>
          <span className="gc-cart-count">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      {loading ? (
        /* Skeleton */
        <div className="gc-cart-wrap">
          <div className="gc-cart-left">
            {[1, 2, 3].map((i) => (
              <div key={i} className="gc-sk-row">
                <div className="gc-sk-img" />
                <div className="gc-sk-lines">
                  <div className="gc-sk-ln w60" />
                  <div className="gc-sk-ln w80" />
                  <div className="gc-sk-ln w40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !uid ? (
        /* Not logged in */
        <div className="gc-cart-empty">
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔐</div>
          <h3>Please login to view your cart</h3>
          <p>You need to be logged in to access your cart.</p>
          <Link to="/login" className="gc-empty-shop-btn">Login Now</Link>
        </div>
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="gc-cart-wrap">

          {/* ══ LEFT — ITEMS ══ */}
          <div className="gc-cart-left">

            {/* Free shipping progress */}
            {subtotal < 499 && (
              <div className="gc-free-ship-banner">
                <span>🚚</span>
                <div style={{ flex: 1 }}>
                  <p>Add <strong>₹{(499 - subtotal).toFixed(0)}</strong> more for <strong>FREE delivery</strong></p>
                  <div className="gc-ship-track">
                    <div className="gc-ship-fill" style={{ width: `${Math.min((subtotal / 499) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            )}
            {subtotal >= 499 && (
              <div className="gc-free-ship-banner achieved">
                <span>🎉</span>
                <p>You've unlocked <strong>FREE delivery!</strong></p>
              </div>
            )}

            {/* Item list */}
            <div className="gc-items-list">
              {items.map((item) => (
                <CartItem
                  key={item.product?._id || item.product || item._id}
                  item={item}
                  uid={uid}
                  onRemove={removeItem}
                  onQtyChange={handleQtyChange}
                  removing={removingPid === (item.product?._id || item.product)}
                />
              ))}
            </div>

            {/* Continue shopping */}
            <Link to="/home" className="gc-continue-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Continue Shopping
            </Link>
          </div>

          {/* ══ RIGHT — SUMMARY ══ */}
          <div className="gc-cart-right">

            {/* Price summary */}
            <div className="gc-summary-card">
              <p className="gc-summary-title">Order Summary</p>
              <div className="gc-summary-rows">
                <div className="gc-sum-row">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="gc-sum-row">
                  <span>Delivery charges</span>
                  <span className={shipping === 0 ? "free" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
              </div>

              <div className="gc-sum-divider" />

              <div className="gc-sum-total">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Details */}
            <div className="gc-summary-card">
              <p className="gc-summary-label">📍 Shipping Details</p>
              <div className="gc-shipping-form">

                <div className="gc-ship-input-group">
                  <div className="gc-ship-input-icon">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <input
                    type="text"
                    placeholder="Street Address, Area"
                    className="gc-ship-input"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  />
                </div>

                <div className="gc-ship-row">
                  <div className="gc-ship-input-group">
                    <div className="gc-ship-input-icon">
                      <i className="fa-solid fa-city"></i>
                    </div>
                    <input
                      type="text"
                      placeholder="City"
                      className="gc-ship-input"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    />
                  </div>

                  <div className="gc-ship-input-group">
                    <div className="gc-ship-input-icon">
                      <i className="fa-solid fa-map-pin"></i>
                    </div>
                    <input
                      type="text"
                      placeholder="Pincode"
                      className="gc-ship-input"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Payment method */}
            <div className="gc-summary-card">
              <p className="gc-summary-label">💳 Payment Method</p>
              <div className="gc-pay-options">
                {PAY_OPTIONS.map(({ id, icon, label }) => (
                  <label key={id} className={`gc-pay-opt${payMethod === id ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      value={id}
                      checked={payMethod === id}
                      onChange={() => setPayMethod(id)}
                      className="gc-pay-radio"
                    />
                    <span className="gc-pay-icon">{icon}</span>
                    <span className="gc-pay-label">{label}</span>
                    <span className={`gc-pay-check${payMethod === id ? " show" : ""}`}>✓</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Place order */}
            <button className="gc-place-order-btn" onClick={handlePlaceOrder}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Place Order · ₹{total.toFixed(2)}
            </button>

            {/* Secure badge */}
            <div className="gc-secure-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              100% Secure Checkout
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default CartPage;