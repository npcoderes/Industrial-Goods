import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import { useSelector } from "react-redux";
import NotFoundPage from "./pages/NotFoundPage";
import ManageCategory from "./pages/admin/ManageCategory";
import ContactUs from "./pages/ContactUs";
import ManageProduct from "./pages/admin/ManageProduct";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import ProductDetails from "./pages/ProductDetails";
import Footer from "./components/Footer";
import PurchaseHistoryPage from "./pages/PurchaseHistoryPage ";
import AdminOrderManagement from "./pages/admin/AdminOrderManagement";
import AdminDashboard from "./pages/admin/AdminDashboard ";
import ManageUsers from "./pages/admin/ManageUsers";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ChangePassword from "./pages/ChangePassword";
import About from "./pages/About";
function App() {
  const location = useLocation();
  const {token,role}=useSelector(state=>state.auth)
  return (
   
    <>
      <div className="w-screen min-h-screen  flex flex-col font-inter">
        <Navbar />
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/products/:ProductID" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/PurchaseHistory" element={<PurchaseHistoryPage />} />
          <Route path="/about" element={<About />} />
          {
            token && <Route path="/profile" element={<Profile />} />
            
          }
          {
            role==="Admin" && <Route path="/managecategory" element={<ManageCategory />} />
          }
          {
            role==="Admin" && <Route path="/manageproduct" element={<ManageProduct />} />
          }
          {
            role==="Admin" && <Route path="/manageorder" element={<AdminOrderManagement />} />
          }
          {
            role==="Admin" && <Route path="/admin/dashboard" element={<AdminDashboard />} />
          }
          {
            role=="Admin" && <Route path="/admin/users" element={<ManageUsers />} />
          }

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/settings" element={<ChangePassword />} />


          <Route path="*" element={<NotFoundPage />} />
        </Routes>

      </div>
      <Footer />

    </>
  );
}

export default App;
