import { useState, useEffect, useRef } from "react";
import "../../Assets/style/APHeader.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function APHeader({ open, toggle }) {
  const nav = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState({
    username: "Admin",
    role: "Manager",
    profileImage: null
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Decode token to get dynamic user info
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const savedUsername = localStorage.getItem("username");
        setUser({
          username: savedUsername || decoded.username || "Admin",
          role: decoded.role || "Manager",
          profileImage: decoded.profileImage || null
        });
      } catch (err) {
        console.error("Invalid token", err);
      }
    }

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstLetter = user.username.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    nav("/login");
  };

  return (
    <header className={`ap-hd ${open ? "" : "wide"}`}>

      {/* Toggle Button */}
      <button className="ap-tog" onClick={toggle}>
        <i className={`fa-solid ${open ? "fa-bars" : "fa-bars-staggered"}`}></i>
      </button>

      {/* Right Section */}
      <div className="ap-hr" ref={dropdownRef}>

        {/* Notification */}
        {/* <button className="ap-hbtn">
          <i className="fa-regular fa-bell"></i>
          <span className="cnt">3</span>
        </button> */}

        {/* Messages */}
        {/* <button className="ap-hbtn">
          <i className="fa-regular fa-envelope"></i>
        </button> */}

        <div className="ap-divider"></div>

        {/* Profile Chip */}
        <div className={`ap-chip ${showProfile ? "active" : ""}`} onClick={() => setShowProfile(!showProfile)}>
          <div className="avatar">
            {user.profileImage ? (
              <img src={user.profileImage} alt="profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              firstLetter
            )}
          </div>
          <div className="ap-chip-info">
            <span className="ap-chip-name" style={{ textTransform: 'capitalize' }}>{user.username}</span>
            <span className="ap-chip-role" style={{ textTransform: 'capitalize' }}>{user.role}</span>
          </div>
          <span className="arrow"><i className="fa-solid fa-chevron-down"></i></span>
        </div>

        {/* Dropdown Menu */}
        <div className={`ap-profile-dropdown ${showProfile ? "show" : ""}`}>
          <button className="dropdown-item">
            <i className="fa-regular fa-user"></i>
            <span>My Profile</span>
          </button>
          {/* <button className="dropdown-item">
            <i className="fa-solid fa-gear"></i>
            <span>Settings</span>
          </button>
          <button className="dropdown-item">
            <i className="fa-solid fa-shield-halved"></i>
            <span>Security</span>
          </button> */}

          <button onClick={handleLogout} className="dropdown-item logout">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>

      </div>

    </header>
  );
}

export default APHeader;