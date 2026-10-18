import { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  getCart as fetchCartApi,
  addToCart as appendCartApi,
  updateCartQuantity as updateCartUnitsApi,
  removeFromCart as removeCartItemApi,
} from "../services/api";
import { useAuth } from "./AuthContext";

const ShoppingBagContext = createContext();

export const CartProvider = ({ children }) => {
  const { user: currentAccount } = useAuth();
  const [bagLineItems, setBagLineItems] = useState([]);
  const [isBagFetching, setIsBagFetching] = useState(false);
  const [bagFetchError, setBagFetchError] = useState(null);
  const [activeOperationId, setActiveOperationId] = useState(null);

  const [cacheBusterKey, setCacheBusterKey] = useState(0);

  useEffect(() => {
    let activeEffect = true;

    if (!currentAccount) {
      queueMicrotask(() => {
        if (activeEffect) setBagLineItems([]);
      });
      return;
    }

    const loadShoppingBag = async () => {
      try {
        const bagPayload = await fetchCartApi();
        if (activeEffect && bagPayload?.success && Array.isArray(bagPayload.cart)) {
          setBagLineItems(bagPayload.cart);
        }
      } catch (networkError) {
        if (activeEffect) {
          console.error("Failed to load shopping bag:", networkError);
          setBagFetchError("Unable to load your shopping bag.");
        }
      } finally {
        if (activeEffect) {
          setIsBagFetching(false);
        }
      }
    };

    loadShoppingBag();

    // Event listener for external cart synchronization
    const handleCartSyncEvent = () => {
      if (activeEffect) setCacheBusterKey((prev) => prev + 1);
    };
    window.addEventListener("cart-updated", handleCartSyncEvent);

    return () => {
      activeEffect = false;
      window.removeEventListener("cart-updated", handleCartSyncEvent);
    };
  }, [currentAccount, cacheBusterKey]);

  const reloadBag = () => {
    setIsBagFetching(true);
    setBagFetchError(null);
    setCacheBusterKey((prev) => prev + 1);
  };

  // Add item or increment its units
  const insertItemToBag = async (productIdentifier) => {
    setActiveOperationId(productIdentifier);
    try {
      const responseOutcome = await appendCartApi(productIdentifier);
      if (responseOutcome?.success && Array.isArray(responseOutcome.cart)) {
        setBagLineItems(responseOutcome.cart);
        return { success: true, message: responseOutcome.message || "Added to cart" };
      }
      return { success: false, message: "Could not update shopping bag" };
    } catch (operationError) {
      console.error("Cart insertion error:", operationError);
      const feedbackMessage =
        operationError.response?.data?.message || "Failed to add product to shopping bag.";
      return { success: false, message: feedbackMessage };
    } finally {
      setActiveOperationId(null);
    }
  };

  // Adjust item unit count
  const modifyItemUnits = async (productIdentifier, targetQuantity) => {
    setActiveOperationId(productIdentifier);
    try {
      const responseOutcome = await updateCartUnitsApi(productIdentifier, targetQuantity);
      if (responseOutcome?.success && Array.isArray(responseOutcome.cart)) {
        setBagLineItems(responseOutcome.cart);
        return { success: true };
      }
      return { success: false, message: "Failed to update item quantity" };
    } catch (operationError) {
      console.error("Quantity modification error:", operationError);
      const feedbackMessage =
        operationError.response?.data?.message || "Failed to update quantity.";
      return { success: false, message: feedbackMessage };
    } finally {
      setActiveOperationId(null);
    }
  };

  // Delete an item from the bag
  const ejectItemFromBag = async (productIdentifier) => {
    setActiveOperationId(productIdentifier);
    try {
      const responseOutcome = await removeCartItemApi(productIdentifier);
      if (responseOutcome?.success && Array.isArray(responseOutcome.cart)) {
        setBagLineItems(responseOutcome.cart);
        return { success: true };
      }
      return { success: false, message: "Failed to remove item" };
    } catch (operationError) {
      console.error("Removal error:", operationError);
      const feedbackMessage =
        operationError.response?.data?.message || "Failed to remove item from bag.";
      return { success: false, message: feedbackMessage };
    } finally {
      setActiveOperationId(null);
    }
  };

  // Instant local purge (triggered upon verified order placement)
  const emptyBag = () => {
    setBagLineItems([]);
  };

  // Derived financial computations
  const { computedCumulativeUnits, computedBagSubtotal } = useMemo(() => {
    return bagLineItems.reduce(
      (accumulator, lineItem) => {
        const itemQuantity = Number(lineItem.quantity) || 0;
        const unitPrice = Number(lineItem.product?.price) || 0;
        accumulator.computedCumulativeUnits += itemQuantity;
        accumulator.computedBagSubtotal += unitPrice * itemQuantity;
        return accumulator;
      },
      { computedCumulativeUnits: 0, computedBagSubtotal: 0 }
    );
  }, [bagLineItems]);

  const contextBundle = {
    // Standard names for compatibility with existing components
    cartItems: bagLineItems,
    cartLoading: isBagFetching,
    cartError: bagFetchError,
    actionLoadingId: activeOperationId,
    addToCart: insertItemToBag,
    updateQuantity: modifyItemUnits,
    removeFromCart: ejectItemFromBag,
    clearCart: emptyBag,
    refreshCart: reloadBag,
    totalUnits: computedCumulativeUnits,
    cartCount: computedCumulativeUnits,
    subtotal: computedBagSubtotal,
    totalItems: bagLineItems.length,

    // Modern descriptive aliases
    shoppingBag: bagLineItems,
    isBagBusy: isBagFetching,
    activeItemId: activeOperationId,
    addItem: insertItemToBag,
    setUnits: modifyItemUnits,
    removeItem: ejectItemFromBag,
    resetBag: emptyBag,
  };

  return (
    <ShoppingBagContext.Provider value={contextBundle}>
      {children}
    </ShoppingBagContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(ShoppingBagContext);
  if (!context) {
    throw new Error("useCart must be consumed within a CartProvider");
  }
  return context;
};

export default useCart;
