import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function WishlistCard({ product, onRemove }) {
  const { _id: productIdentifier, name: productTitle, price: unitPrice, category: productCategory, image: coverImageUrl, stock: availableUnits } = product;
  const { addToCart: appendProductToBag } = useCart();
  const [isEjectionPending, setIsEjectionPending] = useState(false);
  const [isTransferringToBag, setIsTransferringToBag] = useState(false);
  const [transferOutcomeNotice, setTransferOutcomeNotice] = useState("");

  const handleEjectFromWishlist = async () => {
    if (isEjectionPending) return;
    setIsEjectionPending(true);
    try {
      await onRemove(productIdentifier);
    } finally {
      setIsEjectionPending(false);
    }
  };

  const handleTransferToShoppingBag = async () => {
    if (isTransferringToBag || availableUnits <= 0) return;
    setIsTransferringToBag(true);
    try {
      const operationOutcome = await appendProductToBag(productIdentifier);
      if (operationOutcome.success) {
        setTransferOutcomeNotice("Moved to Bag");
        setTimeout(() => setTransferOutcomeNotice(""), 2000);
      }
    } finally {
      setIsTransferringToBag(false);
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
    <div className="flex flex-col overflow-hidden rounded-2xl lux-card transition-all group">
      {/* Product Image Frame */}
      <Link
        to={`/products/${productIdentifier}`}
        className="relative block aspect-4/3 w-full overflow-hidden bg-slate-100"
      >
        <img
          src={coverImageUrl}
          alt={productTitle}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
          }}
        />
        <div className="absolute top-3 left-3">
          <span className="lux-badge rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-xs">
            {productCategory}
          </span>
        </div>
      </Link>

      {/* Details Section */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link to={`/products/${productIdentifier}`} className="group-hover:text-indigo-600 transition-colors">
          <h3 className="line-clamp-1 font-serif-editorial text-base font-bold text-slate-900">
            {productTitle}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="font-serif-editorial text-base font-bold text-slate-900">
            {formatPriceValue(unitPrice)}
          </span>

          <span className={`text-[11px] font-semibold ${availableUnits > 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {availableUnits > 0 ? `${availableUnits} in stock` : "Sold out"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleTransferToShoppingBag}
            disabled={isTransferringToBag || availableUnits <= 0}
            className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50 active:scale-98"
          >
            {isTransferringToBag
              ? "Moving..."
              : transferOutcomeNotice
              ? transferOutcomeNotice
              : "+ Move to Bag"}
          </button>

          <button
            type="button"
            onClick={handleEjectFromWishlist}
            disabled={isEjectionPending}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 shadow-2xs"
            title="Remove from saved pieces"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
