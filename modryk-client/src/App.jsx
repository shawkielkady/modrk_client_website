import { useEffect } from "react";
import { useDispatch } from "react-redux";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Header from "./shared components/header";
import Footer from "./shared components/Footer";
import BottomNavBar from "./shared components/BottomNavBar";
import { fetchMasterData } from "./data/general/generalSlice";
import HomePage from "./pages/HomePage";
import Orders from "./pages/Orders";
import CartPage from "./pages/CartPage";
import About from "./pages/About";
import TermsPage from "./pages/TermsPage";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import OtpPage from "./pages/OtpPage";
import MyProfilePage from "./pages/MyProfile";
import ChangePassword from "./pages/ChangePassword";
import LivePage from "./pages/Live";
import ConfirmOrder from "./pages/ConfirmOrder";
import TrackingOrder from "./pages/TrackingOrder";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMasterData());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/my-profile" element={<MyProfilePage />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/live/:id" element={<LivePage />} />
          <Route path="/confirm-order/" element={<ConfirmOrder />} />
          <Route path="/tracking-order" element={<TrackingOrder />} />
          <Route path="/tracking-order/:id" element={<TrackingOrder />} />
        </Routes>
      </div>
      <Footer />
      <BottomNavBar />
    </div>
  );
}

export default App;
