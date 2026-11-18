import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  House,
  ClipboardCheck,
  ShoppingCart,
  Info,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  Loader2,
  FileText,
} from "lucide-react";

import {
  selectAuthToken,
  selectIsAuthenticated,
  logoutUser,
  forceLogout,
  selectLogoutLoading,
} from "../data/auth/authSlice";
import { TokenStorage } from "../data/auth/authModels";
import headerLogo from "../../assets/modryklogo.png";
import sidebarLogo from "../../assets/logolg.png";

const NAV_ITEMS = [
  { to: "/", i18nKey: "nav.home", label: "الرئيسية", icon: House, end: true },
  {
    to: "/orders",
    i18nKey: "nav.myOrders",
    label: "طلباتي",
    icon: ClipboardCheck,
    requiresAuth: true,
  },
  {
    to: "/confirm-order",
    i18nKey: "nav.cart",
    label: "السلة",
    icon: ShoppingCart,
    requiresAuth: true,
  },
  { to: "/about", i18nKey: "nav.about", label: "عن الشركة", icon: Info },
  {
    to: "/terms",
    i18nKey: "nav.terms",
    label: "الشروط والأحكام",
    icon: FileText,
  },
];

export default function Header() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authToken = useSelector(selectAuthToken);
  const isLoggingOut = useSelector(selectLogoutLoading);
  const [hasStoredToken, setHasStoredToken] = useState(() =>
    Boolean(TokenStorage.get()),
  );
  const [hasStoredUser, setHasStoredUser] = useState(() => {
    try {
      return Boolean(
        localStorage.getItem("token") || localStorage.getItem("user"),
      );
    } catch {
      return false;
    }
  });

  // Sync with storage changes and auth state
  useEffect(() => {
    const checkStorage = () => {
      setHasStoredToken(Boolean(TokenStorage.get()));
      try {
        setHasStoredUser(
          Boolean(
            localStorage.getItem("token") || localStorage.getItem("user"),
          ),
        );
      } catch {
        setHasStoredUser(false);
      }
    };

    const handleUnauthorized = () => {
      dispatch(forceLogout());
      checkStorage();
    };

    window.addEventListener("storage", checkStorage);
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("storage", checkStorage);
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [dispatch]);

  const hasToken = Boolean(hasStoredToken || authToken);
  const isUserLoggedIn = isAuthenticated || hasStoredUser;
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.requiresAuth || hasToken,
  );

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      // fallback
    }
    setHasStoredToken(false);
    setHasStoredUser(false);
    closeMenu();
    navigate("/");
  };

  // قفل السكرول + إغلاق القائمة بزرار Escape
  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header
        id="mainHeader"
        className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300"
      >
        <div className="bg-primary">
          <div className="app-container flex justify-between items-center gap-6">
            <Link to="/">
              <img
                src={headerLogo}
                alt="Logo"
                className="w-16 sm:w-16 h-16 sm:h-16 object-contain"
              />
            </Link>

            {/* Desktop nav */}
            <ul className="hidden lg:flex p-2 rounded-4xl gap-6 xl:gap-10 items-center flex-1 justify-center">
              {visibleNavItems.map(({ to, i18nKey, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `cursor-pointer flex items-center gap-2 text-white md:text-secondary px-2 py-2 nav-link text-sm xl:text-base whitespace-nowrap ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t(i18nKey, label)}</span>
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="flex gap-2 sm:gap-3 items-center">
              {isUserLoggedIn ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/my-profile"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all text-sm font-bold shadow-xs"
                    title="الملف الشخصي"
                  >
                    <User className="w-4 h-4 text-secondary-light" />
                    <span>الملف الشخصي</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/85 text-white transition-all text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    title="تسجيل الخروج"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex btn btn-secondary btn-sm items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="text">{t("nav.login", "تسجيل الدخول")}</span>
                </Link>
              )}

              <button
                id="mobileMenuBtn"
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden btn btn-secondary btn-sm flex items-center justify-center p-2 cursor-pointer"
                aria-label={t("nav.menu", "القائمة")}
                aria-expanded={isMenuOpen}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      <div
        id="mobileMenuBackdrop"
        onClick={closeMenu}
        className={`mobile-backdrop ${isMenuOpen ? "open" : ""}`}
      />

      {/* Mobile Sidebar */}
      <aside
        id="mobileSidebar"
        aria-hidden={!isMenuOpen}
        className={`mobile-sidebar p-6 flex flex-col bg-white ${
          isMenuOpen ? "open" : ""
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD0]">
          <img
            src={sidebarLogo}
            alt="Logo"
            className="w-24 h-12 object-contain"
          />
          <button
            id="closeMobileMenuBtn"
            type="button"
            onClick={closeMenu}
            className="btn btn-sm p-2 cursor-pointer"
            aria-label={t("actions.close", "إغلاق")}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <ul className="flex flex-col gap-2 py-6 overflow-y-auto flex-1">
          {visibleNavItems.map(({ to, i18nKey, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block cursor-pointer px-4 py-2.5 nav-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                {t(i18nKey, label)}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="pt-4 border-t border-[#E8DFD0] flex flex-col gap-2.5 mt-auto">
          {isUserLoggedIn ? (
            <>
              <Link
                to="/my-profile"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-light transition-all"
              >
                <User className="w-4 h-4" />
                <span>الملف الشخصي</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-white font-bold text-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>تسجيل الخروج</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
              className="btn btn-secondary btn-sm flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span className="text">{t("nav.login", "تسجيل الدخول")}</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
