import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../services/api";

export default function OrderSuccess() {
  const { id: activeConfirmedOrderId } = useParams();
  const routerLocation = useLocation();
  const [confirmedOrderEntity, setConfirmedOrderEntity] = useState(routerLocation.state?.order || null);
  const [isOrderRecordFetching, setIsOrderRecordFetching] = useState(!confirmedOrderEntity);
  const [retrievalFaultMessage, setRetrievalFaultMessage] = useState("");

  useEffect(() => {
    if (confirmedOrderEntity) return;

    let activeComponent = true;
    const fetchOrderConfirmationRecord = async () => {
      try {
        const orderResponse = await getOrderById(activeConfirmedOrderId);
        if (activeComponent && orderResponse?.success) {
          setConfirmedOrderEntity(orderResponse.order);
        }
      } catch (retrievalError) {
        if (activeComponent) {
          console.error("Failed to load order confirmation record:", retrievalError);
          setRetrievalFaultMessage("Unable to retrieve order confirmation details.");
        }
      } finally {
        if (activeComponent) setIsOrderRecordFetching(false);
      }
    };

    fetchOrderConfirmationRecord();
    return () => {
      activeComponent = false;
    };
  }, [activeConfirmedOrderId, confirmedOrderEntity]);

  const formatPriceValue = (numericAmount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numericAmount || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        {isOrderRecordFetching ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-4" />
            <p className="font-serif-editorial text-base text-slate-800">
              Validating order receipt...
            </p>
          </div>
        ) : retrievalFaultMessage || !confirmedOrderEntity ? (
          <div className="rounded-3xl lux-glass-panel p-10 text-center border border-rose-200">
            <h2 className="font-serif-editorial text-2xl font-bold text-slate-900">Order Not Found</h2>
            <p className="mt-2 text-xs text-slate-500">
              {retrievalFaultMessage || "Could not retrieve specified order record."}
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl lux-glass-panel p-6 sm:p-10 shadow-xl animate-slide-up">
            {/* Top Success Seal */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm mb-6">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="text-center">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                Payment Authenticated & Confirmed
              </span>
              <h1 className="mt-1 font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                Thank you for your order.
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Your payment was cryptographically validated via Razorpay. We have registered your order and begun dispatch preparation at our Mumbai hub.
              </p>
            </div>

            {/* Quick Metadata Strip */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Order Reference</span>
                <span className="font-bold text-slate-900 mt-0.5 block truncate" title={confirmedOrderEntity._id}>
                  #{confirmedOrderEntity._id.slice(-8).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Date</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {new Date(confirmedOrderEntity.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Status</span>
                <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 mt-0.5">
                  {confirmedOrderEntity.status}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Grand Total</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {formatPriceValue(confirmedOrderEntity.totalAmount)}
                </span>
              </div>
            </div>

            {/* Purchased Items Snapshot List */}
            <div className="mt-8">
              <h3 className="font-serif-editorial text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Purchased Artifacts Snapshot
              </h3>
              <div className="space-y-3">
                {confirmedOrderEntity.items?.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white/70 p-3">
                    <img
                      src={line.image}
                      alt={line.name}
                      className="h-14 w-14 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold text-slate-900 truncate">{line.name}</p>
                      <p className="text-slate-500 mt-0.5">
                        Qty: {line.quantity} × {formatPriceValue(line.price)}
                      </p>
                    </div>
                    <span className="font-serif-editorial text-sm font-bold text-slate-900">
                      {formatPriceValue((line.price || 0) * (line.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Destination Summary */}
            {confirmedOrderEntity.shippingAddress && (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-2">
                  Delivery Destination
                </span>
                <p className="font-bold text-slate-900">{confirmedOrderEntity.shippingAddress.fullName}</p>
                <p className="text-slate-600 mt-0.5">{confirmedOrderEntity.shippingAddress.addressLine1}</p>
                <p className="text-slate-600">
                  {confirmedOrderEntity.shippingAddress.city}, {confirmedOrderEntity.shippingAddress.state} - {confirmedOrderEntity.shippingAddress.pincode}
                </p>
                <p className="text-slate-500 mt-1">Phone: {confirmedOrderEntity.shippingAddress.phone}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <Link
                to="/orders"
                className="flex-1 rounded-xl bg-indigo-600 py-3 text-center text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
              >
                Track in My Orders →
              </Link>
              <Link
                to="/products"
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-50 transition"
              >
                Explore More Artifacts
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
