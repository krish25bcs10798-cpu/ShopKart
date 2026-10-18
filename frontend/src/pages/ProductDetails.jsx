import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { getProductById, getProducts, toggleWishlist } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id: activeProductIdentifier } = useParams();
  const { user: activeCustomer, openAuthModal: displayAuthDialog } = useAuth();
  const { cartItems: currentBagItems, addToCart: appendItemToBag } = useCart();
  const routerNavigator = useNavigate();

  const [targetProductEntity, setTargetProductEntity] = useState(null);
  const [complementaryArtifacts, setComplementaryArtifacts] = useState([]);
  const [isDetailsFetching, setIsDetailsFetching] = useState(true);
  const [detailsRetrievalError, setDetailsRetrievalError] = useState(null);

  const [isProductSavedInWishlist, setIsProductSavedInWishlist] = useState(false);
  const [isWishlistSyncInProgress, setIsWishlistSyncInProgress] = useState(false);
  const [isCartOperationActive, setIsCartOperationActive] = useState(false);
  const [cartSuccessNotice, setCartSuccessNotice] = useState("");
  const [activeDisplayedMediaUrl, setActiveDisplayedMediaUrl] = useState("");
  const [selectedUnitCount, setSelectedUnitCount] = useState(1);
  const [activeTabSection, setActiveTabSection] = useState("specifications");

  // Fetch product and complementary recommendations
  useEffect(() => {
    let activeComponent = true;
    setIsDetailsFetching(true);
    setDetailsRetrievalError(null);

    const retrieveProductInformation = async () => {
      try {
        const productOutcome = await getProductById(activeProductIdentifier);
        if (activeComponent) {
          const productRecord = productOutcome?.product || productOutcome;
          if (productRecord?._id) {
            setTargetProductEntity(productRecord);
            setActiveDisplayedMediaUrl(productRecord.image);

            // Fetch related items from the same discipline
            if (productRecord.category) {
              const categoryResults = await getProducts({ category: productRecord.category });
              if (activeComponent && categoryResults?.success && Array.isArray(categoryResults.products)) {
                setComplementaryArtifacts(
                  categoryResults.products.filter((p) => p._id !== productRecord._id).slice(0, 4)
                );
              }
            }
          } else {
            setDetailsRetrievalError("Specified product artifact could not be found.");
          }
        }
      } catch (networkError) {
        if (activeComponent) {
          console.error("Failed to load product details:", networkError);
          setDetailsRetrievalError("We were unable to load the product specifications.");
        }
      } finally {
        if (activeComponent) setIsDetailsFetching(false);
      }
    };

    retrieveProductInformation();
    return () => {
      activeComponent = false;
    };
  }, [activeProductIdentifier]);

  // Wishlist toggle handler
  const handleToggleWishlistSaved = async () => {
    if (!activeCustomer) {
      displayAuthDialog("login");
      return;
    }
    if (isWishlistSyncInProgress || !targetProductEntity) return;

    setIsWishlistSyncInProgress(true);
    try {
      const toggleOutcome = await toggleWishlist(targetProductEntity._id);
      if (toggleOutcome?.success) {
        setIsProductSavedInWishlist(Boolean(toggleOutcome.saved));
        window.dispatchEvent(new Event("wishlist-updated"));
      }
    } catch (operationError) {
      console.error("Wishlist operation error:", operationError);
    } finally {
      setIsWishlistSyncInProgress(false);
    }
  };

  // Add to Bag action
  const handleAppendItemToBag = async () => {
    if (!activeCustomer) {
      displayAuthDialog("login");
      return;
    }
    if (isCartOperationActive || !targetProductEntity || targetProductEntity.stock <= 0) return;

    setIsCartOperationActive(true);
    try {
      const bagOutcome = await appendItemToBag(targetProductEntity._id);
      if (bagOutcome.success) {
        setCartSuccessNotice("Added to Shopping Bag");
        setTimeout(() => setCartSuccessNotice(""), 2500);
      } else {
        setCartSuccessNotice(bagOutcome.message || "Failed to add");
        setTimeout(() => setCartSuccessNotice(""), 2500);
      }
    } finally {
      setIsCartOperationActive(false);
    }
  };

  // Instant Checkout shortcut
  const handleInstantCheckout = async () => {
    if (!activeCustomer) {
      displayAuthDialog("login");
      return;
    }
    await handleAppendItemToBag();
    routerNavigator("/cart");
  };

  const formatPriceValue = (numericAmount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numericAmount || 0);
  };

  if (isDetailsFetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 text-center flex flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-4" />
          <p className="font-serif-editorial text-base text-slate-800">
            Unpacking artifact specifications...
          </p>
        </main>
      </div>
    );
  }

  if (detailsRetrievalError || !targetProductEntity) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 mx-auto max-w-md w-full px-4 py-20 text-center">
          <div className="rounded-3xl lux-glass-panel p-8">
            <h2 className="font-serif-editorial text-2xl font-bold text-slate-900">Artifact Not Found</h2>
            <p className="mt-2 text-xs text-slate-500">{detailsRetrievalError || "Could not retrieve piece."}</p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
            >
              Return to Catalog
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const existingInBag = currentBagItems.find(
    (item) => (item.product?._id || item.product) === targetProductEntity._id
  );
  const unitsAlreadyInBag = existingInBag ? existingInBag.quantity : 0;
  const isOutOfStock = targetProductEntity.stock <= 0;
  const isMaxUnitsInBag = unitsAlreadyInBag >= targetProductEntity.stock && targetProductEntity.stock > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-slate-900 transition">Catalog</Link>
          <span>/</span>
          <Link to={`/products?category=${encodeURIComponent(targetProductEntity.category)}`} className="hover:text-slate-900 transition">
            {targetProductEntity.category}
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900 truncate max-w-[200px]">{targetProductEntity.name}</span>
        </nav>

        {/* Product Details Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14">
          {/* Left Visual Gallery Canvas */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl lux-card bg-slate-100 shadow-md">
              <img
                src={activeDisplayedMediaUrl}
                alt={targetProductEntity.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
                }}
              />

              {/* Wishlist Floating Button */}
              <button
                type="button"
                onClick={handleToggleWishlistSaved}
                disabled={isWishlistSyncInProgress}
                aria-label="Toggle wishlist"
                className={`absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-md ${
                  isProductSavedInWishlist
                    ? "bg-rose-50 text-rose-600"
                    : "bg-white/85 text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
              >
                <svg
                  className={`h-5 w-5 ${isProductSavedInWishlist ? "fill-rose-600" : ""}`}
                  fill={isProductSavedInWishlist ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Product Overview & Purchase Deck */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="flex items-center gap-2 mb-3">
              <span className="lux-badge rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">
                {targetProductEntity.category}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                isOutOfStock ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
              }`}>
                {isOutOfStock ? "Sold Out" : `${targetProductEntity.stock} Units Available`}
              </span>
            </div>

            <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {targetProductEntity.name}
            </h1>

            {/* Price Indicator */}
            <div className="mt-4 flex items-baseline gap-3 pb-6 border-b border-slate-200">
              <span className="font-serif-editorial text-3xl sm:text-4xl font-bold text-slate-900">
                {formatPriceValue(targetProductEntity.price)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Inclusive of all applicable GST taxes
              </span>
            </div>

            <p className="mt-6 text-sm text-slate-600 leading-relaxed">
              {targetProductEntity.description}
            </p>

            {/* In-Cart Status Indicator if present */}
            {unitsAlreadyInBag > 0 && (
              <div className="mt-5 rounded-xl bg-indigo-50/80 border border-indigo-200/80 p-3 text-xs text-indigo-800 flex items-center justify-between">
                <span>Currently in your shopping bag:</span>
                <span className="font-bold">{unitsAlreadyInBag} {unitsAlreadyInBag === 1 ? "unit" : "units"}</span>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={handleAppendItemToBag}
                disabled={isCartOperationActive || isOutOfStock || isMaxUnitsInBag}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 ${
                  cartSuccessNotice
                    ? "bg-emerald-600 text-white"
                    : isOutOfStock || isMaxUnitsInBag
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
                }`}
              >
                {isCartOperationActive ? (
                  "Syncing Bag..."
                ) : cartSuccessNotice ? (
                  cartSuccessNotice
                ) : isOutOfStock ? (
                  "Sold Out"
                ) : isMaxUnitsInBag ? (
                  "Max Units in Bag"
                ) : (
                  "+ Add to Shopping Bag"
                )}
              </button>

              <button
                type="button"
                onClick={handleInstantCheckout}
                disabled={isOutOfStock}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs active:scale-98 disabled:opacity-50"
              >
                Instant Bag Checkout →
              </button>
            </div>

            {/* Specifications Tabs / Accordion */}
            <div className="mt-10 pt-6 border-t border-slate-200">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTabSection("specifications")}
                  className={`pb-3 text-xs font-bold tracking-wider uppercase border-b-2 mr-6 transition ${
                    activeTabSection === "specifications"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTabSection("shipping")}
                  className={`pb-3 text-xs font-bold tracking-wider uppercase border-b-2 mr-6 transition ${
                    activeTabSection === "shipping"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Shipping & Returns
                </button>
                <button
                  onClick={() => setActiveTabSection("security")}
                  className={`pb-3 text-xs font-bold tracking-wider uppercase border-b-2 transition ${
                    activeTabSection === "security"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Authenticity
                </button>
              </div>

              <div className="py-4 text-xs text-slate-600 leading-relaxed">
                {activeTabSection === "specifications" && (
                  <ul className="space-y-2">
                    <li>• <strong className="text-slate-800">Category Realm:</strong> {targetProductEntity.category}</li>
                    <li>• <strong className="text-slate-800">Warehouse Origin:</strong> Mumbai Atelier Distribution Hub</li>
                    <li>• <strong className="text-slate-800">Inventory Status:</strong> {targetProductEntity.stock} units recorded</li>
                    <li>• <strong className="text-slate-800">Material Standard:</strong> Certified studio grade materials</li>
                  </ul>
                )}
                {activeTabSection === "shipping" && (
                  <p>
                    Orders placed before 2:00 PM IST dispatch the same business day. Complimentary express delivery applies to all orders surpassing ₹999. Return requests are honored within 30 days of confirmed delivery in original packaging.
                  </p>
                )}
                {activeTabSection === "security" && (
                  <p>
                    Every transaction is protected by 256-bit SSL encryption and Razorpay cryptographic signature verification. Product snapshots are immutably archived on order placement.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Artifacts Carousel/Grid */}
        {complementaryArtifacts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-serif-editorial text-2xl font-bold text-slate-900">
                You May Also Admire
              </h3>
              <Link to={`/products?category=${encodeURIComponent(targetProductEntity.category)}`} className="text-xs font-bold text-indigo-600 hover:underline">
                View More in {targetProductEntity.category} →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {complementaryArtifacts.map((relatedEntity) => (
                <ProductCard key={relatedEntity._id} product={relatedEntity} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
