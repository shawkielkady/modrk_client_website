import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  ClipboardList,
  FileText,
  House,
  KeyRound,
  LogIn,
  LogOut,
  MoreHorizontal,
  ShieldCheck,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import {
  logoutUser,
  selectAuthUser,
  selectIsAuthenticated,
} from "../data/auth/authSlice";
import { selectCart } from "../data/cart/cartSlice";
import { useToast } from "./toast";

export default function BottomNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess } = useToast();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectAuthUser);
  const cart = useSelector(selectCart);

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const currentPath = location.pathname;

  const cartItemsCount =
    cart?.cart_items?.length ||
    cart?.items_count ||
    0;

  // Active state determinations
  const isHomeActive = currentPath === "/";
  const isAboutActive = currentPath === "/about";
  const isOrdersActive =
    currentPath === "/orders" || currentPath.startsWith("/tracking-order");
  const isCartActive =
    currentPath === "/confirm-order" || currentPath === "/cart";

  const handleLogout = async () => {
    setIsMoreOpen(false);
    await dispatch(logoutUser());
    showSuccess("تم تسجيل الخروج بنجاح");
    navigate("/");
  };

  const handleNavigate = (path) => {
    setIsMoreOpen(false);
    navigate(path);
  };

  return (
    <div className="lg:hidden">
      {/* Backdrop for More Menu */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs transition-opacity animate-fadeIn"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* Slide-up "More" Menu Sheet */}
      {isMoreOpen && (
        <div
          className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 space-y-4 animate-slideUp text-right"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#E2F1F4] flex items-center justify-center text-primary font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-primary">
                  {isAuthenticated
                    ? user?.name || "حسابي"
                    : "أهلاً بك في مدرك"}
                </p>
                <p className="text-xs text-gray-500">
                  {isAuthenticated
                    ? user?.phone || "مرحباً بك"
                    : "سجل الدخول للمتابعة"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMoreOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Links */}
          <div className="space-y-1">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => handleNavigate("/my-profile")}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 text-gray-700 font-semibold text-sm transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-primary" />
                    <span>الملف الشخصي</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate("/change-password")}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 text-gray-700 font-semibold text-sm transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-4 h-4 text-primary" />
                    <span>تغيير كلمة المرور</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleNavigate("/login")}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#E2F1F4]/70 hover:bg-[#E2F1F4] text-primary font-bold text-sm transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <LogIn className="w-4 h-4 text-primary" />
                  <span>تسجيل الدخول / حساب جديد</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-primary" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNavigate("/confirm-order")}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 text-gray-700 font-semibold text-sm transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <span>سلة المشتريات</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("/terms")}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 text-gray-700 font-semibold text-sm transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>الشروط والأحكام</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-red-50 text-red-600 font-semibold text-sm transition cursor-pointer pt-2"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-red-300" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)]"
        dir="rtl"
        aria-label="التنقل السفلي"
      >
        <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between relative">
          {/* 1. الرئيسية */}
          <Link
            to="/"
            onClick={() => setIsMoreOpen(false)}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 ${
              isHomeActive
                ? "text-primary font-bold"
                : "text-gray-400 hover:text-primary font-medium"
            }`}
          >
            <House
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${
                isHomeActive ? "scale-105 stroke-[2.2]" : "stroke-[1.75]"
              }`}
            />
            <span className="text-[11px] sm:text-xs mt-1">الرئيسية</span>
          </Link>

          {/* 2. اعرف اكثر */}
          <Link
            to="/about"
            onClick={() => setIsMoreOpen(false)}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 ${
              isAboutActive
                ? "text-primary font-bold"
                : "text-gray-400 hover:text-primary font-medium"
            }`}
          >
            <FileText
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${
                isAboutActive ? "scale-105 stroke-[2.2]" : "stroke-[1.75]"
              }`}
            />
            <span className="text-[11px] sm:text-xs mt-1">اعرف اكثر</span>
          </Link>

          {/* 3. طلباتي (Floating Center Circular Button) */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <Link
              to="/orders"
              onClick={() => setIsMoreOpen(false)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary hover:bg-[#154554] active:scale-95 text-white flex flex-col items-center justify-center border-4 border-white shadow-lg shadow-primary/30 transition-all duration-200 cursor-pointer -translate-y-4 ${
                isOrdersActive ? "ring-4 ring-secondary/40 scale-105" : ""
              }`}
              aria-label="طلباتي"
            >
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2]" />
              <span className="text-[10px] sm:text-[11px] font-bold text-white leading-tight mt-0.5">
                طلباتي
              </span>
            </Link>
          </div>

          {/* 4. السلة */}
          <Link
            to="/confirm-order"
            onClick={() => setIsMoreOpen(false)}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 relative ${
              isCartActive
                ? "text-primary font-bold"
                : "text-gray-400 hover:text-primary font-medium"
            }`}
          >
            <div className="relative">
              <ShoppingCart
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${
                  isCartActive ? "scale-105 stroke-[2.2]" : "stroke-[1.75]"
                }`}
              />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-secondary text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {cartItemsCount}
                </span>
              )}
            </div>
            <span className="text-[11px] sm:text-xs mt-1">السلة</span>
          </Link>

          {/* 5. المزيد */}
          <button
            type="button"
            onClick={() => setIsMoreOpen((prev) => !prev)}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 cursor-pointer ${
              isMoreOpen
                ? "text-primary font-bold"
                : "text-gray-400 hover:text-primary font-medium"
            }`}
          >
            <MoreHorizontal
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${
                isMoreOpen ? "scale-105 stroke-[2.5]" : "stroke-[2]"
              }`}
            />
            <span className="text-[11px] sm:text-xs mt-1">المزيد</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

