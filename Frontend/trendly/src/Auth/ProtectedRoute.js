import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // No token, redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Check if the token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      return <Navigate to="/login" replace />;
    }

    // Check for role-based access if allowedRoles is provided
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      // User doesn't have the required role, redirect to Home or a Forbidden page
      return <Navigate to="/Home" replace />;
    }

    // Token is valid and role matches
    return <Outlet />;

  } catch (error) {
    // Malformed token, redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
