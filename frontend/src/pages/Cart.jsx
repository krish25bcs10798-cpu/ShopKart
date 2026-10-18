import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const {
    cartItems: activeBagEntries,
    cartLoading: isBagSyncInProgress,
    cartError: bagSyncErrorNotice,
    refreshCart: reloadShoppingBag,
    subtotal: computedBagSubtotal,
    totalUnits: aggregateBagUnits,
    totalItems: uniqueItemCount,
  } = useCart();

  const [promoVoucherCode, setPromoVoucherCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoFeedback, setPromoFeedback] = useState("");

  const formatPriceValue = (numericAmount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numericAmount || 0);
  };

  const freeShippingBenchmarkAmount = 999;
  const isEligibleForFreeDispatch = computedBagSubtotal >= freeShippingBenchmarkAmount || computedBagSubtotal === 0;
  const standardDispatchFee = isEligibleForFreeDispatch ? 0 : 99;
  const amountToUnlockFreeShipping = Math.max(0, freeShippingBenchmarkAmount - computedBagSubtotal);
  const shippingProgressPercentage = Math.min(100, Math.round((computedBagSubtotal / freeShippingBenchmarkAmount) * 100));

  // Promotional voucher calculation
  const voucherDiscountAmount = isPromoApplied ? Math.round(computedBagSubtotal * 0.1) : 0;
  const finalPayableTotal = Math.max(0, computedBagSubtotal - voucherDiscountAmount + standardDispatchFee);

  const handleApplyPromoVoucher = (e) => {
    e.preventDefault();
    if (promoVoucherCode.trim().toUpperCase() === "WELCOME10" || promoVoucherCode.trim().toUpperCase() === "ATELIER10") {
      setIsPromoApplied(true);
      setPromoFeedback("10% promotional privilege applied!");
    } else {
      setIsPromoApplied(false);
      setPromoFeedback("Invalid voucher code. Try 'WELCOME10'.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition">Home</Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">Shopping Bag</span>
        </nav>

        {/* Section Header */}
        <div className="mb-8">
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
            Order Review
          </span>
          <h1 className="mt-1 font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Shopping Bag
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Review your selected artifacts before proceed to verified checkout.
          </p>
        </div>

        {/* Loading Spinner State */}
        {isBagSyncInProgress && activeBagEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-4" />
            <p className="font-serif-editorial text-base font-semibold text-slate-800">
              Retrieving your active bag...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isBagSyncInProgress && bagSyncErrorNotice && (
          <div className="mx-auto max-w-md rounded-2xl lux-glass-panel p-8 text-center my-12 border border-rose-200">
            <h3 className="font-serif-editorial text-lg font-bold text-slate-900">
              Unable to retrieve shopping bag
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              {bagSyncErrorNotice}
            </p>
            <button
              type="button"
              onClick={reloadShoppingBag}
              className="mt-5 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
            >
              Retry Bag Loading
            </button>
          </div>
        )}

        {/* Empty Shopping Bag State */}
        {!isBagSyncInProgress && !bagSyncErrorNotice && activeBagEntries.length === 0 && (
          <div className="mx-auto max-w-md rounded-3xl lux-glass-panel p-10 text-center my-12 shadow-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.188-.578-1.118-1.243l1.262-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
            </div>
            <h2 className="font-serif-editorial text-2xl font-bold text-slate-900">
              Your bag is currently empty
            </h2>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Explore our catalogue of 50+ curated studio artifacts and add something you love.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-98"
            >
              Explore 50+ Products
            </Link>
          </div>
        )}

        {/* Populated Cart Workspace */}
        {activeBagEntries.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Items Column */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Dispatch Progress Bar Meter */}
              <div className="rounded-2xl lux-glass-panel p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-800">
                    {isEligibleForFreeDispatch
                      ? "✓ You have qualified for Complimentary Express Dispatch!"
                      : `Add ${formatPriceValue(amountToUnlockFreeShipping)} more to qualify for Free Shipping`}
                  </span>
                  <span className="font-bold text-indigo-600">{shippingProgressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${shippingProgressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Line Items List */}
              <div className="space-y-3">
                {activeBagEntries.map((lineItem) => (
                  <CartItem
                    key={lineItem.product?._id || lineItem._id}
                    item={lineItem}
                  />
                ))}
              </div>

              <div className="pt-3 flex justify-between items-center text-xs">
                <Link
                  to="/products"
                  className="font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  ← Continue Exploring Catalog
                </Link>
                <span className="text-slate-400">
                  {uniqueItemCount} distinct items • {aggregateBagUnits} total units
                </span>
              </div>
            </div>

            {/* Right Summary & Checkout Column */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-3xl lux-glass-panel p-6 shadow-md">
                <h3 className="font-serif-editorial text-xl font-bold text-slate-900 pb-4 border-b border-slate-100">
                  Order Summary
                </h3>

                <div className="py-4 space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Artifacts Subtotal</span>
                    <span className="font-semibold text-slate-900">{formatPriceValue(computedBagSubtotal)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Express Dispatch</span>
                    <span className="font-semibold text-slate-900">
                      {isEligibleForFreeDispatch ? (
                        <span className="text-emerald-600 font-bold">COMPLIMENTARY</span>
                      ) : (
                        formatPriceValue(standardDispatchFee)
                      )}
                    </span>
                  </div>

                  {isPromoApplied && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Privilege Discount (10%)</span>
                      <span>-{formatPriceValue(voucherDiscountAmount)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900">Estimated Total</span>
                    <div className="text-right">
                      <span className="font-serif-editorial text-2xl font-bold text-slate-900">
                        {formatPriceValue(finalPayableTotal)}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Includes GST & duties</p>
                    </div>
                  </div>
                </div>

                {/* Promotional Voucher Input */}
                <form onSubmit={handleApplyPromoVoucher} className="mt-2 pt-3 border-t border-slate-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoVoucherCode}
                      onChange={(e) => setPromoVoucherCode(e.target.value)}
                      placeholder="Promo voucher (WELCOME10)"
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs uppercase placeholder:normal-case outline-none focus:border-indigo-500 focus:bg-white"
                    />
                    <button
                      type="submit"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Apply
                    </button>
                  </div>
                  {promoFeedback && (
                    <p className={`mt-1.5 text-[11px] font-semibold ${isPromoApplied ? "text-emerald-600" : "text-rose-600"}`}>
                      {promoFeedback}
                    </p>
                  )}
                </form>

                {/* Checkout Trigger Action */}
                <div className="mt-6">
                  <Link
                    to="/checkout"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-700 active:scale-98"
                  >
                    Proceed to Checkout →
                  </Link>
                </div>
              </div>

              {/* Trust Badges Strip */}
              <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-4 text-xs text-slate-500 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">🛡️</span>
                  <span>Cryptographic Razorpay 256-bit payment verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>30-Day Effortless Returns guarantee on original pieces</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
