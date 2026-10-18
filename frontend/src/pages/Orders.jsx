import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMyOrders, updateOrderStatus } from "../services/api";

export default function Orders() {
  const [customerOrderHistory, setCustomerOrderHistory] = useState([]);
  const [isHistoryFetching, setIsHistoryFetching] = useState(true);
  const [orderRetrievalError, setOrderRetrievalError] = useState("");
  const [activeStatusProgressionOrderId, setActiveStatusProgressionOrderId] = useState(null);

  const fetchCustomerOrderHistory = async () => {
    try {
      setIsHistoryFetching(true);
      setOrderRetrievalError("");
      const orderHistoryOutcome = await getMyOrders();
      if (orderHistoryOutcome?.success && Array.isArray(orderHistoryOutcome.orders)) {
        setCustomerOrderHistory(orderHistoryOutcome.orders);
      } else {
        setCustomerOrderHistory([]);
      }
    } catch (fetchError) {
      console.error("Order history retrieval failure:", fetchError);
      setOrderRetrievalError("Unable to retrieve your order history. Please try again.");
    } finally {
      setIsHistoryFetching(false);
    }
  };

  useEffect(() => {
    fetchCustomerOrderHistory();
  }, []);

  const triggerOrderStatusAdvance = async (orderIdentifier, activeCurrentStatus) => {
    const progressionLifecycle = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
    const currentStepIndex = progressionLifecycle.indexOf(activeCurrentStatus);
    if (currentStepIndex === -1 || currentStepIndex === progressionLifecycle.length - 1) return;

    const nextMilestoneStatus = progressionLifecycle[currentStepIndex + 1];
    setActiveStatusProgressionOrderId(orderIdentifier);
    try {
      const updateOutcome = await updateOrderStatus(orderIdentifier, nextMilestoneStatus);
      if (updateOutcome?.success) {
        setCustomerOrderHistory((previousList) =>
          previousList.map((entry) =>
            entry._id === orderIdentifier ? { ...entry, status: nextMilestoneStatus } : entry
          )
        );
      }
    } catch (mutationError) {
      console.error("Status progression mutation error:", mutationError);
    } finally {
      setActiveStatusProgressionOrderId(null);
    }
  };

  const formatPriceValue = (numericAmount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numericAmount || 0);
  };

  const resolveStatusBadgeClasses = (statusString) => {
    switch (statusString) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CONFIRMED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "PLACED":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const statusMilestoneOrder = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition">Home</Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">Purchase History</span>
        </nav>

        {/* Page Section Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
              Customer Archival Ledger
            </span>
            <h1 className="mt-1 font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
              Order History
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Track active dispatches, view cryptographic receipts, and inspect historical artifact purchases.
            </p>
          </div>

          {!isHistoryFetching && (
            <div className="rounded-full lux-badge px-4 py-1.5 text-xs font-semibold text-slate-800 self-start sm:self-auto shadow-xs">
              <span>{customerOrderHistory.length} {customerOrderHistory.length === 1 ? "Recorded Order" : "Recorded Orders"}</span>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {isHistoryFetching && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-4" />
            <p className="font-serif-editorial text-base text-slate-800">
              Loading purchase history ledger...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isHistoryFetching && orderRetrievalError && (
          <div className="mx-auto max-w-md rounded-2xl lux-glass-panel p-8 text-center my-12 border border-rose-200">
            <h3 className="font-serif-editorial text-lg font-bold text-slate-900">
              Unable to load order ledger
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              {orderRetrievalError}
            </p>
            <button
              type="button"
              onClick={fetchCustomerOrderHistory}
              className="mt-5 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* Empty History State */}
        {!isHistoryFetching && !orderRetrievalError && customerOrderHistory.length === 0 && (
          <div className="mx-auto max-w-md rounded-3xl lux-glass-panel p-10 text-center my-12 shadow-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="font-serif-editorial text-2xl font-bold text-slate-900">
              No orders placed yet
            </h2>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              When you confirm an order with your shopping bag, receipt records and delivery tracking timelines will appear here.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
            >
              Explore 50+ Products
            </Link>
          </div>
        )}

        {/* Populated Order History Cards List */}
        {!isHistoryFetching && customerOrderHistory.length > 0 && (
          <div className="space-y-6">
            {customerOrderHistory.map((orderRecord) => {
              const currentStatusIndex = statusMilestoneOrder.indexOf(orderRecord.status);
              const isDelivered = orderRecord.status === "DELIVERED";

              return (
                <div
                  key={orderRecord._id}
                  className="rounded-3xl lux-glass-panel p-6 sm:p-8 shadow-md transition-all"
                >
                  {/* Top Bar: Reference, Date, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-serif-editorial text-lg font-bold text-slate-900">
                          Order #{orderRecord._id.slice(-8).toUpperCase()}
                        </h3>
                        <span
                          className={`rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${resolveStatusBadgeClasses(
                            orderRecord.status
                          )}`}
                        >
                          {orderRecord.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Placed on{" "}
                        {new Date(orderRecord.createdAt).toLocaleDateString("en-IN", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="flex items-baseline sm:flex-col sm:items-end justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Charged</span>
                      <span className="font-serif-editorial text-xl font-bold text-slate-900">
                        {formatPriceValue(orderRecord.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* 4-Stage Visual Delivery Timeline */}
                  <div className="py-6 border-b border-slate-100">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
                      Dispatch Pipeline Tracking
                    </span>

                    <div className="relative flex items-center justify-between">
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-500 z-0"
                        style={{
                          width: `${Math.max(0, (currentStatusIndex / (statusMilestoneOrder.length - 1)) * 100)}%`,
                        }}
                      />

                      {statusMilestoneOrder.map((milestoneName, stageIdx) => {
                        const isReached = currentStatusIndex >= stageIdx;
                        const isCurrentActive = currentStatusIndex === stageIdx;

                        return (
                          <div key={milestoneName} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                isReached
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : "border border-slate-300 bg-white text-slate-400"
                              } ${isCurrentActive ? "ring-4 ring-indigo-100" : ""}`}
                            >
                              {isReached ? "✓" : stageIdx + 1}
                            </div>
                            <span
                              className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${
                                isCurrentActive
                                  ? "text-indigo-600"
                                  : isReached
                                  ? "text-slate-800"
                                  : "text-slate-400"
                              }`}
                            >
                              {milestoneName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Purchased Items Miniature List */}
                  <div className="py-6 border-b border-slate-100">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Artifacts in Package ({orderRecord.items?.length || 0})
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {orderRecord.items?.map((purchasedItem, lineIdx) => (
                        <div
                          key={lineIdx}
                          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/70 p-3"
                        >
                          <img
                            src={purchasedItem.image}
                            alt={purchasedItem.name}
                            className="h-12 w-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0 text-xs">
                            <p className="font-bold text-slate-900 truncate">{purchasedItem.name}</p>
                            <p className="text-slate-500 mt-0.5">
                              {purchasedItem.quantity} unit{purchasedItem.quantity > 1 ? "s" : ""} ×{" "}
                              {formatPriceValue(purchasedItem.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Destination & Developer Simulator Advance Button */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="text-slate-500 text-[11px]">
                      <span className="font-bold text-slate-700">Delivery To:</span>{" "}
                      {orderRecord.shippingAddress?.fullName},{" "}
                      {orderRecord.shippingAddress?.city}, {orderRecord.shippingAddress?.pincode}
                      {orderRecord.razorpayPaymentId && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Razorpay Txn: {orderRecord.razorpayPaymentId}
                        </span>
                      )}
                    </div>

                    {!isDelivered && (
                      <button
                        type="button"
                        onClick={() => triggerOrderStatusAdvance(orderRecord._id, orderRecord.status)}
                        disabled={activeStatusProgressionOrderId === orderRecord._id}
                        className="self-start sm:self-auto rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition active:scale-98 disabled:opacity-50"
                        title="Simulate dispatch progression (Development Feature)"
                      >
                        {activeStatusProgressionOrderId === orderRecord._id
                          ? "Advancing..."
                          : `Simulate: Advance to ${statusMilestoneOrder[currentStatusIndex + 1]} →`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
