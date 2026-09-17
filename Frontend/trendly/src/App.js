import './App.css';
import Layout from './Layouts/Layout';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ContactUs from './Pages/ContactUs/ContactUs';
import Home from './Pages/Home/Home';
import GetAllProduct from './Pages/AllProducts/UserGetAllProduct';

import Cart from './Pages/AddToCart/Cart';
import MyOrders from './Pages/OrderHistory/MyOrders';
import Login from './Auth/Login';
import Register from './Auth/Registration';
import AdminLayout from './Admin/Layouts/APLayout';
import APGetAllProduct from './Admin/Pages/Products/APGetAllProduct';
import Dashboard from './Admin/Pages/Dashboard/Dashboard';
import APGetAllUser from './Admin/Pages/Users/APGetAllUser';
import AddUser from './Admin/Pages/Users/AddUser';
import EditUser from './Admin/Pages/Users/EditUser';
import APGetAllOrder from './Admin/Pages/Orders/APGetAllOrder';
import ProtectedRoute from './Auth/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddProduct from './Admin/Pages/Products/AddProduct';
import EditProduct from './Admin/Pages/Products/EditProduct';


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route index element={<Login />} />

          {/* Protected User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route path="/Home" element={<Home />} />
              <Route path="/products" element={<GetAllProduct />} />
              <Route path="/search" element={<GetAllProduct />} />
              <Route path="/contactUs" element={<ContactUs />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/my-orders" element={<MyOrders />} />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/AdminPanel" element={<AdminLayout />}>
              <Route path="Dashboard" element={<Dashboard />} />
              <Route path="Products" element={<APGetAllProduct />} />
              <Route path="Users" element={<APGetAllUser />} />
              <Route path="Order" element={<APGetAllOrder />} />
              <Route path="AddProduct" element={<AddProduct />} />
              <Route path="EditProduct/:id" element={<EditProduct />} />
              <Route path="AddUser" element={<AddUser />} />
              <Route path="EditUser/:id" element={<EditUser />} />
            </Route>
          </Route>
        </Routes>


      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={2000} />

    </>
  );
}

export default App;
