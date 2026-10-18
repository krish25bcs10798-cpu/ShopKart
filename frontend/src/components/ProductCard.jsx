import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toggleWishlist } from "../services/api";

export default function ProductCard({ product, initialWishlisted = false }) {
  const { _id: productIdentifier, name: productTitle, price: unitPrice, category: productCategory, image: mediaCoverUrl, stock: availableInventory } = product;
  const { user: activeCustomer, openAuthModal: displayAuthDialog } = useAuth();
  const { cartItems: currentBagItems, addToCart: appendItemToBag } = useCart();

  const [activeWishlistedState, setActiveWishlistedState] = useState(initialWishlisted);
  const [isWishlistInFlight, setIsWishlistInFlight] = useState(false);
  const [isAddingProductToBag, setIsAddingProductToBag] = useState(false);
  const [bagInteractionFeedback, setBagInteractionFeedback] = useState("");
  const [isMediaAssetLoaded, setIsMediaAssetLoaded] = useState(false);

  // Cross-reference existing quantity in global bag state
  const matchingBagItem = currentBagItems.find(
    (item) => (item.product?._id || item.product) === productIdentifier
  );
  const existingQuantityInBag = matchingBagItem ? matchingBagItem.quantity : 0;
  const isInventoryDepleted = availableInventory <= 0;
  const isInventoryLimitReached = existingQuantityInBag >= availableInventory && availableInventory > 0;

  const handleWishlistToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!activeCustomer) {
      displayAuthDialog("login");
      return;
    }

    if (isWishlistInFlight) return;
    setIsWishlistInFlight(true);

    try {
      const toggleOutcome = await toggleWishlist(productIdentifier);
      if (toggleOutcome?.success) {
        setActiveWishlistedState(Boolean(toggleOutcome.saved));
        window.dispatchEvent(new Event("wishlist-updated"));
      }
    } catch (operationError) {
      console.error("Wishlist operation failed:", operationError);
    } finally {
      setIsWishlistInFlight(false);
    }
  };

  const handleAppendToBag = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!activeCustomer) {
      displayAuthDialog("login");
      return;
    }

    if (isAddingProductToBag || isInventoryDepleted || isInventoryLimitReached) return;

    setIsAddingProductToBag(true);
    setBagInteractionFeedback("");

    try {
      const operationResult = await appendItemToBag(productIdentifier);
      if (operationResult.success) {
        setBagInteractionFeedback("Added to Bag");
        setTimeout(() => setBagInteractionFeedback(""), 2000);
      } else {
        setBagInteractionFeedback(operationResult.message || "Failed");
        setTimeout(() => setBagInteractionFeedback(""), 2500);
      }
    } catch {
      setBagInteractionFeedback("Error");
      setTimeout(() => setBagInteractionFeedback(""), 2500);
    } finally {
      setIsAddingProductToBag(false);
    }
  };

  const formatPriceValue = (numericAmount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numericAmount || 0);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl lux-card transition-all duration-300">
      {/* Product Image Frame */}
      <Link
        to={`/products/${productIdentifier}`}
        className="relative block aspect-4/3 w-full overflow-hidden bg-slate-100"
      >
        {/* Placeholder skeleton loader */}
        {!isMediaAssetLoaded && (
          <div className="absolute inset-0 animate-pulse bg-slate-200" />
        )}

        <img
          src={mediaCoverUrl}
          alt={productTitle}
          onLoad={() => setIsMediaAssetLoaded(true)}
          className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            isMediaAssetLoaded ? "opacity-100" : "opacity-0"
          }`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
          }}
        />

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="lux-badge rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-xs">
            {productCategory}
          </span>
          {availableInventory > 0 && availableInventory <= 5 && (
            <span className="rounded-full bg-amber-500/90 backdrop-blur-xs px-2.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
              Only {availableInventory} Left
            </span>
          )}
          {isInventoryDepleted && (
            <span className="rounded-full bg-slate-900/90 backdrop-blur-xs px-2.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Quick Wishlist Action Toggle Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={isWishlistInFlight}
          aria-label={activeWishlistedState ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 ${
            activeWishlistedState
              ? "bg-rose-50 text-rose-600 shadow-sm"
              : "bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 shadow-xs"
          } ${isWishlistInFlight ? "opacity-60" : ""}`}
        >
          <svg
            className={`h-4.5 w-4.5 transition-transform duration-200 ${activeWishlistedState ? "scale-110 fill-rose-600" : ""}`}
            fill={activeWishlistedState ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>
      </Link>

      {/* Product Details Section */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link to={`/products/${productIdentifier}`} className="group-hover:text-indigo-600 transition-colors">
          <h3 className="line-clamp-1 font-serif-editorial text-base sm:text-lg font-bold text-slate-900">
            {productTitle}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Pricing & Units Status Row */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex flex-col">
            <span className="font-serif-editorial text-lg font-bold text-slate-900 tracking-tight">
              {formatPriceValue(unitPrice)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Incl. all taxes</span>
          </div>

          <span
            className={`text-[11px] font-semibold ${
              isInventoryDepleted
                ? "text-rose-600"
                : availableInventory <= 5
                ? "text-amber-600"
                : "text-emerald-600"
            }`}
          >
            {isInventoryDepleted ? "Out of stock" : `${availableInventory} in warehouse`}
          </span>
        </div>

        {/* Add to Bag Action Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleAppendToBag}
            disabled={isAddingProductToBag || isInventoryDepleted || isInventoryLimitReached}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold tracking-wide transition-all shadow-xs active:scale-98 ${
              bagInteractionFeedback
                ? "bg-emerald-600 text-white"
                : isInventoryDepleted
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : isInventoryLimitReached
                ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
            }`}
          >
            {isAddingProductToBag ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating Bag...
              </span>
            ) : bagInteractionFeedback ? (
              <span className="inline-flex items-center gap-1.5 font-bold">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {bagInteractionFeedback}
              </span>
            ) : isInventoryDepleted ? (
              "Sold Out"
            ) : isInventoryLimitReached ? (
              "Max in Bag"
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add to Bag
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
