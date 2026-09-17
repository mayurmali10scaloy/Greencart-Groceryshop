import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../../../Assets/style/APGetAllUser.css";
import api from "../../../Api/axios";

const APGetAllUser = () => {
  const [users, setUsers] = useState([]);
  const [actionMsg, setActionMsg] = useState("");
  const [actionType, setActionType] = useState("");

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const nav = useNavigate();
  const location = useLocation();

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/");
      let data = [];
      if (res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (Array.isArray(res.data)) {
        data = res.data;
      }
      setUsers(data);
    } catch (err) {
      console.error("FETCH USERS ERROR:", err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Filter Logic
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.userName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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

  const handleDelete = async (uid) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/delete/${uid}`);
      fetchUsers();
      setActionType("delete");
      setActionMsg("User Deleted successfully!");
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      console.error("DELETE USER ERROR:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to delete user";
      alert("Delete Error: " + errorMsg);
    }
  };

  const placeholderImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Crect width='44' height='44' rx='22' fill='%23f3f4f8'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='%23c7c9d9'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";

  return (
    <>
      {/* TOAST */}
      {actionMsg && (
        <div className={`ap-toast ${actionType}`}>
          <i className={`fa-solid ${actionType === "delete" ? "fa-trash-can" : "fa-circle-check"}`}></i>
          {actionMsg}
        </div>
      )}

      <div className="ap-user-page">

        {/* PAGE HEADER */}
        <div className="ap-page-header">
          <h2 className="ap-page-title">Users list</h2>

          {/* Search Bar */}
          <div className="ap-srch">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              placeholder="Search by name, email, or role..."
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

          <div className="ap-header-actions">
            <Link className="ap-add-btn" to={"/AdminPanel/AddUser"} style={{ textDecoration: "none" }}>
              <i className="fa-solid fa-plus"></i>
              Add User
            </Link>
          </div>
        </div>

        {/* USER TABLE */}
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>User Details      <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Email             <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Mobile No         <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Address           <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>City              <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Pincode           <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Role              <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Status            <i className="fa-solid fa-chevron-down th-sort"></i></th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!currentUsers || currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <div className="ap-empty">
                      <div className="ap-empty-icon">
                        <i className="fa-solid fa-users"></i>
                      </div>
                      <div className="ap-empty-text">No users found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user._id}>
                    {/* User Details: Image + Name */}
                    <td>
                      <div className="ap-user-cell">
                        <img
                          src={
                            user.profileImage
                              ? (user.profileImage.startsWith("http")
                                ? user.profileImage
                                : `http://localhost:5005/uploads/users/${user.profileImage}`)
                              : placeholderImg
                          }
                          alt={user.userName}
                          className="ap-user-img"
                          onError={(e) => { e.target.src = placeholderImg; }}
                        />
                        <div className="ap-user-info">
                          <span className="ap-user-name">{user.userName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td>{user.email}</td>

                    {/* Mobile No */}
                    <td>{user.mobileNo}</td>

                    {/* Address */}
                    <td>{user.address || <span className="ap-null">—</span>}</td>

                    {/* City */}
                    <td>{user.city || <span className="ap-null">—</span>}</td>

                    {/* Pincode */}
                    <td>{user.pincode || <span className="ap-null">—</span>}</td>

                    {/* Role */}
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`ap-pill ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>

                    {/* Action */}
                    <td>
                      <div className="ap-action-wrap">
                        <Link to={`/AdminPanel/EditUser/${user._id}`}>
                          <span className="ap-action-link">
                            <i className="fa-solid fa-pen-to-square"></i>
                          </span>
                        </Link>
                        <span
                          className="ap-action-link delete"
                          onClick={() => handleDelete(user._id)}
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

export default APGetAllUser;
