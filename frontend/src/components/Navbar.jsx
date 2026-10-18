import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getWishlist } from "../services/api";

export default function Navbar({ onOpenSearch }) {
  const { user: activeCustomer, logout: terminateCustomerSession, openAuthModal: displayAuthDialog } = useAuth();
  const { cartCount: totalBagUnits } = useCart();
  const routerNavigator = useNavigate();
  const currentBrowserLocation = useLocation();

  const [savedWishlistTally, setSavedWishlistTally] = useState(0);
  const [isNavElevated, setIsNavElevated] = useState(false);
  const [mobileNavExpanded, setMobileNavExpanded] = useState(false);
  const [accountDropdownActive, setAccountDropdownActive] = useState(false);

  // Monitor scroll offset to adjust navbar glassmorphism
  useEffect(() => {
    const handleViewportScroll = () => {
      setIsNavElevated(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleViewportScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleViewportScroll);
  }, []);

  // Fetch and synchronize wishlist item count
  useEffect(() => {
    let activeComponent = true;
    if (!activeCustomer) {
      setSavedWishlistTally(0);
      return;
    }

    const synchronizeWishlistTally = async () => {
      try {
        const wishlistData = await getWishlist();
        if (activeComponent && wishlistData?.success) {
          setSavedWishlistTally(typeof wishlistData.count === "number" ? wishlistData.count : 0);
        }
      } catch {
        // Silently catch error
      }
    };

    synchronizeWishlistTally();

    const handleWishlistUpdateEvent = () => synchronizeWishlistTally();
    window.addEventListener("wishlist-updated", handleWishlistUpdateEvent);
    return () => {
      activeComponent = false;
      window.removeEventListener("wishlist-updated", handleWishlistUpdateEvent);
    };
  }, [activeCustomer]);

  // Close menus when route changes
  useEffect(() => {
    setMobileNavExpanded(false);
    setAccountDropdownActive(false);
  }, [currentBrowserLocation.pathname]);

  const handleCustomerSignOut = async () => {
    await terminateCustomerSession();
    routerNavigator("/", { replace: true });
  };

  const isCurrentRouteActive = (routeUrl) => currentBrowserLocation.pathname === routeUrl;

  return (
    <>
      {/* Top Notification Announcement Bar */}
      <div className="bg-[#0F172A] px-4 py-2 text-center text-[11px] font-medium tracking-widest text-slate-300 uppercase transition-colors">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Curated Architectural Essentials • Complimentary Express Shipping On Orders Above ₹999
        </span>
      </div>

      {/* Main Elevated Glass Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isNavElevated
            ? "lux-glass-nav py-3.5 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.06)]"
            : "bg-slate-50/90 backdrop-blur-md py-4 border-b border-slate-200"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Editorial Identifier */}
          <div className="flex items-center gap-8">
            <Link to="/" className="group flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-serif-editorial text-xl font-bold text-white shadow-md shadow-indigo-600/20 transition-transform duration-300 group-hover:scale-105">
                S
              </span>
              <div className="flex flex-col">
                <span className="font-serif-editorial text-2xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  ShopKart
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500 -mt-1">
                  Atelier
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/products"
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isCurrentRouteActive("/products")
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                Catalog
              </Link>
              <Link
                to="/products?category=Electronics"
                className="px-4 py-2 rounded-xl text-xs font-semibold tracking-wide text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all"
              >
                Studio Gear
              </Link>
              <Link
                to="/products?category=Fashion"
                className="px-4 py-2 rounded-xl text-xs font-semibold tracking-wide text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all"
              >
                Apparel
              </Link>
              <Link
                to="/products?category=Home%20%26%20Living"
                className="px-4 py-2 rounded-xl text-xs font-semibold tracking-wide text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all"
              >
                Living
              </Link>
            </nav>
          </div>

          {/* Quick Actions & Account Panel */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Launcher */}
            <Link
              to="/products"
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white/80 text-xs font-medium text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-white transition-all shadow-xs"
              title="Search store catalog"
            >
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span className="hidden sm:inline">Search artifacts...</span>
              <kbd className="hidden lg:inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">⌘K</kbd>
            </Link>

            {/* Saved Wishlist Icon Button */}
            <Link
              to="/wishlist"
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                isCurrentRouteActive("/wishlist")
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                  : "border-slate-200 bg-white/80 text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
              title="Saved Wishlist"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {savedWishlistTally > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-fade-in">
                  {savedWishlistTally}
                </span>
              )}
            </Link>

            {/* Active Shopping Bag Icon Button */}
            <Link
              to="/cart"
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                isCurrentRouteActive("/cart")
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                  : "border-slate-200 bg-white/80 text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
              title="Shopping Bag"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.188-.578-1.118-1.243l1.262-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
              {totalBagUnits > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-xs animate-fade-in">
                  {totalBagUnits}
                </span>
              )}
            </Link>

            {/* Account Controls / Dropdown */}
            {activeCustomer ? (
              <div className="relative">
                <button
                  onClick={() => setAccountDropdownActive(!accountDropdownActive)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 p-1.5 sm:px-3 sm:py-1.5 hover:bg-white transition-all shadow-xs"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 font-serif-editorial text-xs font-bold text-indigo-700">
                    {activeCustomer.name ? activeCustomer.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {activeCustomer.name?.split(" ")[0]}
                  </span>
                  <svg className="hidden sm:inline h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Account Popup Menu */}
                {accountDropdownActive && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl lux-glass-modal p-2 shadow-xl border border-slate-200/80 animate-slide-up z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{activeCustomer.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{activeCustomer.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                    >
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Account Overview
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                    >
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Order History
                    </Link>

                    <Link
                      to="/wishlist"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                    >
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                      Saved Pieces ({savedWishlistTally})
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleCustomerSignOut}
                        className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => displayAuthDialog("login")}
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => displayAuthDialog("signup")}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 active:scale-98 transition"
                >
                  Join
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileNavExpanded(!mobileNavExpanded)}
              className="flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-700 hover:bg-white transition"
              aria-label="Toggle navigation drawer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileNavExpanded ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavExpanded && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 mt-3 space-y-3 animate-slide-up">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
              <Link
                to="/products"
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-800"
              >
                <span>📦</span> All Catalog
              </Link>
              <Link
                to="/products?category=Electronics"
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-800"
              >
                <span>⚡</span> Studio Gear
              </Link>
              <Link
                to="/products?category=Fashion"
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-800"
              >
                <span>🧥</span> Apparel
              </Link>
              <Link
                to="/products?category=Home%20%26%20Living"
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-800"
              >
                <span>🏺</span> Living
              </Link>
            </div>

            <div className="space-y-1">
              <Link
                to="/cart"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <span>Shopping Bag</span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] text-indigo-700 font-bold">
                  {totalBagUnits} units
                </span>
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <span>Saved Wishlist</span>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] text-rose-700 font-bold">
                  {savedWishlistTally} pieces
                </span>
              </Link>
              {activeCustomer && (
                <Link
                  to="/orders"
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <span>My Orders</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
