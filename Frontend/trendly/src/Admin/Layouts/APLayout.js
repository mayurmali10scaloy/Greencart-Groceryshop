import { useState } from "react";
import APSidebar from "../Components/APSlidebar";
import APHeader from "../Components/APHeader";
import "../../Assets/style/APLayout.css";
import { Outlet } from "react-router-dom";

function AdminPanel() {
  const [open, setOpen] = useState(true);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <>
      {/* Sidebar */}
      <APSidebar open={open} />

      {/* Header */}
      <APHeader open={open} toggle={toggleSidebar} />

      {/* Main Content */}
      <div className={`ap-shell ${open ? "" : "full"}`}>
        <Outlet />
      </div>
    </>
  );
}

export default AdminPanel;