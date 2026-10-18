import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
  const { product: targetProductPayload, quantity: itemQuantityUnits } = item;
  const { updateQuantity: alterItemUnits, removeFromCart: deleteItemFromBag, actionLoadingId: activePendingItemId } = useCart();

  if (!targetProductPayload) return null;

  const isModificationPending = activePendingItemId === targetProductPayload._id;
  const isAtMinimumAllowed = itemQuantityUnits <= 1;
  const isAtMaximumInventory = itemQuantityUnits >= targetProductPayload.stock;

  const handleDecrementUnits = async () => {
    if (isAtMinimumAllowed || isModificationPending) return;
    await alterItemUnits(targetProductPayload._id, itemQuantityUnits - 1);
  };

  const handleIncrementUnits = async () => {
    if (isAtMaximumInventory || isModificationPending) return;
    await alterItemUnits(targetProductPayload._id, itemQuantityUnits + 1);
  };

  const handleDeleteItem = async () => {
    if (isModificationPending) return;
    await deleteItemFromBag(targetProductPayload._id);
  };

  const computedLineItemTotal = Number(targetProductPayload.price || 0) * Number(itemQuantityUnits || 0);

  const formatPriceValue = (numericAmount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numericAmount || 0);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl lux-card transition-all">
      {/* Product Image Thumbnail & Identity */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Link
          to={`/products/${targetProductPayload._id}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200 group"
        >
          <img
            src={targetProductPayload.image}
            alt={targetProductPayload.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
            }}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
            {targetProductPayload.category}
          </span>
          <Link
            to={`/products/${targetProductPayload._id}`}
            className="block font-serif-editorial text-sm sm:text-base font-bold text-slate-900 truncate hover:text-indigo-600 transition-colors"
          >
            {targetProductPayload.name}
          </Link>
          <div className="mt-1 text-xs text-slate-500">
            {formatPriceValue(targetProductPayload.price)} per unit
          </div>
        </div>
      </div>

      {/* Steppers, Total & Remove Action */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Quantity Controls Stepper */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/80 p-1">
          <button
            type="button"
            onClick={handleDecrementUnits}
            disabled={isAtMinimumAllowed || isModificationPending}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-slate-700 transition hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-8 text-center text-xs font-bold text-slate-900">
            {isModificationPending ? "..." : itemQuantityUnits}
          </span>
          <button
            type="button"
            onClick={handleIncrementUnits}
            disabled={isAtMaximumInventory || isModificationPending}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-slate-700 transition hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Line Item Total */}
        <div className="text-right min-w-[90px]">
          <span className="font-serif-editorial text-sm sm:text-base font-bold text-slate-900">
            {formatPriceValue(computedLineItemTotal)}
          </span>
        </div>

        {/* Eject from Cart Action */}
        <button
          type="button"
          onClick={handleDeleteItem}
          disabled={isModificationPending}
          className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 shadow-2xs"
          title="Remove from shopping bag"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
