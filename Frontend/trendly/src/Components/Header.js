import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import "../Assets/style/Header.css";
import { jwtDecode } from "jwt-decode";
import logo from "../Assets/images/logo.png";

const Header = ({ cartCount = 0 }) => {
  const nav = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState({
    username: "Guest",
    email: "",
    profileImage: null
  });

  const dropdownRef = useRef(null);

  // Sync search input with URL search parameters
  useEffect(() => {
    const q = searchParams.get("query") || searchParams.get("search") || "";
    setSearchQuery(q);
  }, [searchParams]);

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Decode token for user info
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const savedUsername = localStorage.getItem("username");
        const savedEmail = localStorage.getItem("email");
        setUser({
          username: savedUsername || decoded.username || "User",
          email: savedEmail || decoded.email || "",
          profileImage: decoded.profileImage || null
        });
      } catch (err) {
        console.error("Invalid token", err);
      }
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Close mobile menu on route change ── */
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: "/home", label: "Home" },
    { to: "/products", label: "All Products" },
    { to: "/contactUs", label: "Contact" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    setUser({ username: "Guest", email: "", profileImage: null });
    nav("/login");
  };

  return (
    <>
      {/* ── Main header ── */}
      <header className={`gc-header${scrolled ? " scrolled" : ""}${mobileMenuOpen ? " menu-open" : ""}`}>

        {/* Glow orb (decorative) */}
        <div className="gc-glow-orb" aria-hidden="true" />

        {/* ── Logo ── */}
        <Link to="/home" className="gc-logo" aria-label="GreenCart Home">
          <div className="gc-logo-icon">
            <img src={logo} alt="GreenCart Logo" className="gc-logo-img" />
          </div>
          <div className="gc-logo-text">
            <span className="gc-logo-name">GreenCart</span>
            <span className="gc-logo-tagline">farm fresh</span>
          </div>
        </Link>

        {/* ── Nav links ── */}
        <nav className={`gc-nav${mobileMenuOpen ? " open" : ""}`} aria-label="Main navigation">
          <ul>
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`gc-nav-link${isActive(to) ? " active" : ""}`}
                >
                  {label}
                  <span className="gc-nav-underline" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile-only actions */}
          <div className="gc-mobile-actions">
            <button className="gc-mobile-auth-btn" onClick={() => nav("/login")}>Login</button>
            <button className="gc-mobile-auth-btn primary" onClick={() => nav("/signup")}>Sign Up</button>
          </div>
        </nav>

        {/* ── Search bar ── */}
        <div className={`gc-search${searchFocused ? " focused" : ""}`}>
          <div className="gc-search-inner">
            <input
              type="search"
              placeholder="Search fresh products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (searchQuery.trim()) {
                    nav(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
                  } else {
                    nav(`/products`);
                  }
                  setSearchFocused(false);
                }
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              aria-label="Search products"
            />

            <svg className="gc-search-icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true"
              onClick={() => {
                if (searchQuery.trim()) {
                  nav(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
                } else {
                  nav(`/products`);
                }
                setSearchFocused(false);
              }}
              style={{ cursor: "pointer" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>

        </div>

        {/* ── Right icons ── */}
        <div className="gc-actions">

          {/* Cart */}
          <button
            className="gc-icon-btn gc-cart-btn"
            onClick={() => nav("/cart")}
            aria-label={`Cart, ${cartCount} items`}
            data-tip="My Cart"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="gc-cart-badge" aria-hidden="true">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {/* Profile dropdown */}
          <div className="gc-profile-wrap" ref={dropdownRef}>
            <button
              className={`gc-profile-btn${dropdownOpen ? " open" : ""}`}
              onClick={() => setDropdownOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              aria-label="Account menu"
            >
              <div className="gc-profile-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="gc-profile-name">{user.username}</span>
              <svg className={`gc-chevron${dropdownOpen ? " up" : ""}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown menu */}
            <div className={`gc-dropdown${dropdownOpen ? " open" : ""}`} role="menu">
              {/* User info */}
              <div className="gc-dropdown-header">
                <div className="gc-dropdown-avatar">{user.username.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="gc-dropdown-name">{user.username}</p>
                  <p className="gc-dropdown-email">{user.email}</p>
                </div>
              </div>

              <div className="gc-dropdown-divider" />

              {[
                { icon: OrderIcon, label: "My Orders", sub: "Track purchases", path: "/my-orders" },
              ].map(({ icon: Icon, label, sub, path }) => (
                <button
                  key={path}
                  className="gc-dropdown-item"
                  onClick={() => { nav(path); setDropdownOpen(false); }}
                  role="menuitem"
                >
                  <span className="gc-di-icon"><Icon /></span>
                  <span className="gc-di-text">
                    <span className="gc-di-label">{label}</span>
                    <span className="gc-di-sub">{sub}</span>
                  </span>
                  <svg className="gc-di-arrow" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}

              <div className="gc-dropdown-divider" />

              <button
                className="gc-dropdown-item logout"
                onClick={handleLogout}
                role="menuitem"
              >
                <span className="gc-di-icon"><LogoutIcon /></span>
                <span className="gc-di-text">
                  <span className="gc-di-label">Sign Out</span>
                  <span className="gc-di-sub">See you soon!</span>
                </span>
              </button>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            className={`gc-hamburger${mobileMenuOpen ? " open" : ""}`}
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="gc-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Header;

/* ── Inline SVG icon components ── */
// const ProfileIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const OrderIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></svg>;
// const WishlistIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>;
// const ServiceIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>;
const LogoutIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;