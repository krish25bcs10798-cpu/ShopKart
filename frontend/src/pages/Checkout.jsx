import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, verifyPayment } from "../services/api";

// Dynamically inject Razorpay standard checkout SDK script
const loadGatewaySdkScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const gatewayScriptElement = document.createElement("script");
    gatewayScriptElement.src = "https://checkout.razorpay.com/v1/checkout.js";
    gatewayScriptElement.onload = () => resolve(true);
    gatewayScriptElement.onerror = () => resolve(false);
    document.body.appendChild(gatewayScriptElement);
  });
};

export default function Checkout() {
  const { user: currentCustomer } = useAuth();
  const { cartItems: activeBagItems, totalUnits: aggregateUnits, subtotal: bagSubtotal, clearCart: emptyShoppingBag } = useCart();
  const routerNavigator = useNavigate();

  // Shipping destination form state
  const [shippingDestinationForm, setShippingDestinationForm] = useState({
    fullName: currentCustomer?.name || "",
    phone: currentCustomer?.phoneNo || "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [shippingFormErrors, setShippingFormErrors] = useState({});
  const [isOrderInFlight, setIsOrderInFlight] = useState(false);
  const [checkoutServerFaultMessage, setCheckoutServerFaultMessage] = useState("");

  // Sync user details if session initialized asynchronously
  useEffect(() => {
    if (currentCustomer) {
      setShippingDestinationForm((prev) => ({
        ...prev,
        fullName: prev.fullName || currentCustomer.name || "",
        phone: prev.phone || currentCustomer.phoneNo || "",
      }));
    }
  }, [currentCustomer]);

  // If shopping bag is empty, redirect user back to cart
  useEffect(() => {
    if (activeBagItems.length === 0 && !isOrderInFlight) {
      routerNavigator("/cart", { replace: true });
    }
  }, [activeBagItems, isOrderInFlight, routerNavigator]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDestinationForm((prev) => ({ ...prev, [name]: value }));
    if (shippingFormErrors[name]) {
      setShippingFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setCheckoutServerFaultMessage("");
  };

  const validateShippingForm = () => {
    const foundErrors = {};
    if (!shippingDestinationForm.fullName.trim()) foundErrors.fullName = "Full recipient name is required.";
    if (!shippingDestinationForm.phone.trim()) {
      foundErrors.phone = "Contact phone number is required.";
    } else if (!/^\d{10}$/.test(shippingDestinationForm.phone.replace(/[\s-+]/g, ""))) {
      foundErrors.phone = "Phone must be a valid 10-digit numeric mobile.";
    }
    if (!shippingDestinationForm.addressLine1.trim()) foundErrors.addressLine1 = "Street address is required.";
    if (!shippingDestinationForm.city.trim()) foundErrors.city = "City is required.";
    if (!shippingDestinationForm.state.trim()) foundErrors.state = "State is required.";
    if (!shippingDestinationForm.pincode.trim()) {
      foundErrors.pincode = "Delivery pincode is required.";
    } else if (!/^\d{6}$/.test(shippingDestinationForm.pincode.trim())) {
      foundErrors.pincode = "Pincode must contain exactly 6 digits.";
    }

    setShippingFormErrors(foundErrors);
    return Object.keys(foundErrors).length === 0;
  };

  const handleCommitCheckoutOrder = async (e) => {
    e.preventDefault();
    setCheckoutServerFaultMessage("");

    if (!validateShippingForm()) {
      return;
    }

    setIsOrderInFlight(true);

    try {
      // 1. Ensure Razorpay checkout script is loaded
      const isSdkReady = await loadGatewaySdkScript();
      if (!isSdkReady) {
        setCheckoutServerFaultMessage("Failed to load Razorpay payment SDK. Please verify internet connectivity.");
        setIsOrderInFlight(false);
        return;
      }

      // 2. Request backend order creation & price calculation
      const orderSessionOutcome = await createPaymentOrder(shippingDestinationForm);

      if (!orderSessionOutcome.success) {
        setCheckoutServerFaultMessage(orderSessionOutcome.message || "Failed to initialize order.");
        setIsOrderInFlight(false);
        return;
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = orderSessionOutcome;

      // 3. Configure Razorpay modal options
      const razorpayOptions = {
        key: key,
        amount: amount,
        currency: currency,
        name: "ShopKart Atelier",
        description: `Order #${shopKartOrderId.slice(-6).toUpperCase()}`,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=80",
        order_id: razorpayOrderId,
        handler: async function (gatewayResponse) {
          try {
            // 4. Send payment signatures to backend for cryptographic HMAC verification
            const verificationOutcome = await verifyPayment({
              shopKartOrderId: shopKartOrderId,
              razorpay_order_id: gatewayResponse.razorpay_order_id,
              razorpay_payment_id: gatewayResponse.razorpay_payment_id,
              razorpay_signature: gatewayResponse.razorpay_signature,
            });

            if (verificationOutcome.success) {
              // 5. Instantly clear frontend global bag state and navigate to Order Confirmation
              emptyShoppingBag();
              window.dispatchEvent(new Event("cart-updated"));
              routerNavigator(`/order-success/${shopKartOrderId}`, {
                replace: true,
                state: { order: verificationOutcome.order },
              });
            } else {
              setCheckoutServerFaultMessage(verificationOutcome.message || "Payment verification failed.");
              setIsOrderInFlight(false);
            }
          } catch (verificationException) {
            console.error("Payment verification failure:", verificationException);
            setCheckoutServerFaultMessage(
              verificationException.response?.data?.message ||
                "Payment validation failed. Please contact customer care."
            );
            setIsOrderInFlight(false);
          }
        },
        prefill: {
          name: shippingDestinationForm.fullName,
          contact: shippingDestinationForm.phone,
          email: currentCustomer?.email || "",
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: function () {
            setIsOrderInFlight(false);
            setCheckoutServerFaultMessage("Payment modal was closed. Your shopping bag remains saved.");
          },
        },
      };

      const razorpayModalInstance = new window.Razorpay(razorpayOptions);

      razorpayModalInstance.on("payment.failed", function (failureResponse) {
        console.error("Razorpay Payment Rejection:", failureResponse.error);
        setCheckoutServerFaultMessage(
          `Transaction declined: ${failureResponse.error?.description || "Payment failed."} Your bag is preserved.`
        );
        setIsOrderInFlight(false);
      });

      razorpayModalInstance.open();
    } catch (orderException) {
      console.error("Order submission failure:", orderException);
      setCheckoutServerFaultMessage(
        orderException.response?.data?.message ||
          "An error occurred while creating your order. Please try again."
      );
      setIsOrderInFlight(false);
    }
  };

  const formatPriceValue = (numericAmount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numericAmount || 0);
  };

  const isFreeShipping = bagSubtotal >= 999;
  const dispatchFee = isFreeShipping ? 0 : 99;
  const grandPayableTotal = bagSubtotal + dispatchFee;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition">Home</Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-slate-900 transition">Bag</Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">Secure Checkout</span>
        </nav>

        {/* Section Header */}
        <div className="mb-8">
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
            Encrypted Order Gateway
          </span>
          <h1 className="mt-1 font-serif-editorial text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Checkout & Shipping
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Provide delivery coordinates to complete your order.
          </p>
        </div>

        {checkoutServerFaultMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs text-rose-700 animate-slide-up">
            <svg className="h-5 w-5 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{checkoutServerFaultMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Shipping Address Form Column */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl lux-glass-panel p-6 sm:p-8 shadow-md">
              <h2 className="font-serif-editorial text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
                1. Delivery Destination Coordinates
              </h2>

              <form onSubmit={handleCommitCheckoutOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingDestinationForm.fullName}
                      onChange={handleInputChange}
                      placeholder="Eleanor Vance"
                      className={`w-full rounded-xl border bg-slate-50/70 px-3.5 py-2.5 text-xs sm:text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500/10 ${
                        shippingFormErrors.fullName ? "border-rose-400" : "border-slate-200 focus:border-indigo-500"
                      }`}
                    />
                    {shippingFormErrors.fullName && (
                      <p className="mt-1 text-[11px] text-rose-600">{shippingFormErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Contact Phone (10 digits) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingDestinationForm.phone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      className={`w-full rounded-xl border bg-slate-50/70 px-3.5 py-2.5 text-xs sm:text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500/10 ${
                        shippingFormErrors.phone ? "border-rose-400" : "border-slate-200 focus:border-indigo-500"
                      }`}
                    />
                    {shippingFormErrors.phone && (
                      <p className="mt-1 text-[11px] text-rose-600">{shippingFormErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Street Address & Suite / Apartment *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={shippingDestinationForm.addressLine1}
                    onChange={handleInputChange}
                    placeholder="Flat 402, Highline Residency, Bandra West"
                    className={`w-full rounded-xl border bg-slate-50/70 px-3.5 py-2.5 text-xs sm:text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500/10 ${
                      shippingFormErrors.addressLine1 ? "border-rose-400" : "border-slate-200 focus:border-indigo-500"
                    }`}
                  />
                  {shippingFormErrors.addressLine1 && (
                    <p className="mt-1 text-[11px] text-rose-600">{shippingFormErrors.addressLine1}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingDestinationForm.city}
                      onChange={handleInputChange}
                      placeholder="Mumbai"
                      className={`w-full rounded-xl border bg-slate-50/70 px-3.5 py-2.5 text-xs sm:text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500/10 ${
                        shippingFormErrors.city ? "border-rose-400" : "border-slate-200 focus:border-indigo-500"
                      }`}
                    />
                    {shippingFormErrors.city && (
                      <p className="mt-1 text-[11px] text-rose-600">{shippingFormErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      State / Province *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingDestinationForm.state}
                      onChange={handleInputChange}
                      placeholder="Maharashtra"
                      className={`w-full rounded-xl border bg-slate-50/70 px-3.5 py-2.5 text-xs sm:text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500/10 ${
                        shippingFormErrors.state ? "border-rose-400" : "border-slate-200 focus:border-indigo-500"
                      }`}
                    />
                    {shippingFormErrors.state && (
                      <p className="mt-1 text-[11px] text-rose-600">{shippingFormErrors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Pincode (6 digits) *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={shippingDestinationForm.pincode}
                      onChange={handleInputChange}
                      placeholder="400050"
                      className={`w-full rounded-xl border bg-slate-50/70 px-3.5 py-2.5 text-xs sm:text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500/10 ${
                        shippingFormErrors.pincode ? "border-rose-400" : "border-slate-200 focus:border-indigo-500"
                      }`}
                    />
                    {shippingFormErrors.pincode && (
                      <p className="mt-1 text-[11px] text-rose-600">{shippingFormErrors.pincode}</p>
                    )}
                  </div>
                </div>

                {/* Submit Payment Trigger Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isOrderInFlight}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 px-6 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-700 disabled:opacity-50 active:scale-98"
                  >
                    {isOrderInFlight ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Initializing Razorpay Gateway...
                      </span>
                    ) : (
                      `Pay & Confirm Order • ${formatPriceValue(grandPayableTotal)}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Order Breakdown Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl lux-glass-panel p-6 shadow-md">
              <h3 className="font-serif-editorial text-xl font-bold text-slate-900 pb-4 border-b border-slate-100 flex items-center justify-between">
                <span>Selected Artifacts</span>
                <span className="text-xs font-semibold text-slate-500">
                  {aggregateUnits} {aggregateUnits === 1 ? "unit" : "units"}
                </span>
              </h3>

              {/* Item Thumbnails Snapshot List */}
              <div className="py-4 space-y-3 max-h-80 overflow-y-auto pr-1">
                {activeBagItems.map((item) => (
                  <div
                    key={item.product?._id || item._id}
                    className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-b-0"
                  >
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="h-14 w-14 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.product?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Qty: {item.quantity} × {formatPriceValue(item.product?.price)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {formatPriceValue((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Artifacts Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatPriceValue(bagSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Express Dispatch</span>
                  <span className="font-semibold text-slate-900">
                    {isFreeShipping ? (
                      <span className="text-emerald-600 font-bold">COMPLIMENTARY</span>
                    ) : (
                      formatPriceValue(dispatchFee)
                    )}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Grand Total</span>
                  <span className="font-serif-editorial text-2xl font-bold text-slate-900">
                    {formatPriceValue(grandPayableTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Gateway Security Banner */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-indigo-900 space-y-1">
              <p className="font-bold">🔒 Razorpay PCI-DSS Level 1 Gateway</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Your payment is authenticated with end-to-end cryptographic HMAC SHA256 signatures. Credentials are never stored on client machines.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
