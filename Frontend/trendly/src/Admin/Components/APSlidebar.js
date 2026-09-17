import { NavLink } from "react-router-dom";
import "../../Assets/style/APSidebar.css";

function APSidebar({ open }) {
  return (
    <aside className={`ap-sb ${open ? "" : "closed"}`}>

      <div className="ap-brand">
        <div className="ap-brand-icon">
          <i className="fa-solid fa-user"></i>
        </div>
        {open && <h2>Admin Panel</h2>}
      </div>

      <nav className="ap-nav">

        <span className="ap-group-lbl">MAIN</span>

        <NavLink to="/AdminPanel/Dashboard"
          className={({ isActive }) => isActive ? "ap-item active" : "ap-item"}>
          <span className="icon"><i className="fa-solid fa-house"></i></span>
          {open && <span>Dashboard</span>}
        </NavLink>

        <NavLink to="/AdminPanel/Products"
          className={({ isActive }) => isActive ? "ap-item active" : "ap-item"}>
          <span className="icon"><i className="fa-solid fa-box"></i></span>
          {open && <span>Products</span>}
        </NavLink>

        <NavLink to="/AdminPanel/Users"
          className={({ isActive }) => isActive ? "ap-item active" : "ap-item"}>
          <span className="icon"><i className="fa-solid fa-users"></i></span>
          {open && <span>Users</span>}
        </NavLink>

        <NavLink to="/AdminPanel/Order"
          className={({ isActive }) => isActive ? "ap-item active" : "ap-item"}>
          <span className="icon"><i className="fa-solid fa-chart-line"></i></span>
          {open && <span>Orders</span>}
        </NavLink>

      </nav>

    </aside>
  );
}

export default APSidebar;