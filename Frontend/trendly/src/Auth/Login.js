import { useState } from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../Api/axios";
import { toast } from "react-toastify";

const Login = () => {

  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();

  const [formData, setFormData] = useState({
    loginId: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const res = await api.post("/auth/login", {
        username: formData.loginId,
        email: formData.loginId,
        password: formData.password,
      });

      const data = res.data;

      // save token
      localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("username", data.user.username || "");
        localStorage.setItem("email", data.user.email || "");
      }

      // decode token
      const decoded = jwtDecode(data.token);

      toast.success("Login successful");

      setTimeout(() => {

        if (decoded.role === "admin") {
          nav("/AdminPanel/Dashboard");
        } else {
          nav("/Home");
        }

      }, 100);

    } catch (error) {

      console.error(error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Invalid credentials";
      toast.error(errorMsg);
    }

  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <h2 className="auth-title">Log In</h2>

        <p className="auth-subtitle">
          Welcome! Please enter your details
        </p>

        <form onSubmit={handleSubmit}>

          <label>Email / Username</label>

          <input
            type="text"
            name="loginId"
            value={formData.loginId}
            onChange={handleChange}
            required
            className="login"
          />

          <label>Password</label>

          <div className="password-box">

            <input
              className="login"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <span
              className="eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i
                className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"
                  }`}
              ></i>
            </span>

          </div>

          <a href="forgetpassword" className="forgot">
            forgot password ?
          </a>

          <button className="auth-btn" type="submit">
            Log in
          </button>

          <p className="switch-text">
            Don’t have an account? <Link to="/register">Sign up</Link>
          </p>

        </form>

      </div>
    </div>
  );
};

export default Login;