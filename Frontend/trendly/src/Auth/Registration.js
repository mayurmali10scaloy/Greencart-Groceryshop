import React, { useState } from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import api from "../Api/axios";
import { toast } from "react-toastify";

const Register = () => {

  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    mobileno: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    // Basic client-side validation for mobile number
    // if (!/^[6-9]\d{9}$/.test(formData.mobileno)) {
    //   toast.error("❌ Invalid mobile number format");
    //   return;
    // }

    try {

      const res = await api.post("/auth/register", formData);

      const data = res.data;

      toast.success("✅ User registration successfully");

      // clear form
      setFormData({
        username: "",
        email: "",
        password: "",
        mobileno: ""
      });

      setTimeout(() => {
        nav("/login");
      }, 100);

    } catch (error) {

      console.error("REGISTER ERROR:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "❌ Server error";
      toast.error(errorMsg);

    }

  };

  return (
    <>
      <div className="auth-wrapper">
        <div className="auth-card">

          <h2 className="auth-title">Sign Up</h2>
          <p className="auth-subtitle">Create your account</p>

          <form onSubmit={handleSubmit}>

            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="login"
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="login"
            />

            <label>Password</label>

            <div className="password-box">

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="login"
              />

              <span
                className="eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </span>

            </div>

            <label>Mobile No</label>
            <input
              type="text"
              name="mobileno"
              value={formData.mobileno}
              onChange={handleChange}
              required
              className="login"
            />

            <button className="auth-btn" type="submit">
              Sign up
            </button>

            <p className="switch-text">
              Already have an account? <Link to="/login">Log in</Link>
            </p>

          </form>

        </div>
      </div>
    </>
  );
};

export default Register;