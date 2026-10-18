import mongoose from "mongoose";
import CustomerAccount from "../models/customerModel.js";
import ProductCatalogItem from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const PRODUCT_POPULATE_FIELDS = "name price image stock category description";

/**
 * Append product to cart or increment its units
 * @route POST /cart/:productId
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId: targetItemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(targetItemId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product identifier provided",
    });
  }

  const catalogProductRecord = await ProductCatalogItem.findById(targetItemId);
  if (!catalogProductRecord) {
    return res.status(404).json({
      success: false,
      message: "Product could not be located in catalog",
    });
  }

  if (catalogProductRecord.stock <= 0) {
    return res.status(400).json({
      success: false,
      message: "This product is currently out of stock",
    });
  }

  const activeCustomer = await CustomerAccount.findById(req.user._id);
  if (!activeCustomer) {
    return res.status(401).json({
      success: false,
      message: "Authenticated account record could not be found",
    });
  }

  if (!Array.isArray(activeCustomer.cart)) {
    activeCustomer.cart = [];
  }

  const existingLineItem = activeCustomer.cart.find(
    (entry) => entry.product.toString() === targetItemId
  );

  if (existingLineItem) {
    const projectedUnitCount = existingLineItem.quantity + 1;
    if (projectedUnitCount > catalogProductRecord.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available inventory stock",
      });
    }
    existingLineItem.quantity = projectedUnitCount;
  } else {
    activeCustomer.cart.push({ product: targetItemId, quantity: 1 });
  }

  await activeCustomer.save();

  await activeCustomer.populate({
    path: "cart.product",
    select: PRODUCT_POPULATE_FIELDS,
  });

  const sanitizedCartList = (activeCustomer.cart || []).filter(
    (line) => line.product !== null && line.product !== undefined
  );

  return res.status(200).json({
    success: true,
    message: "Shopping cart updated successfully",
    cart: sanitizedCartList,
  });
});

/**
 * Fetch current user's populated cart
 * @route GET /cart
 */
export const getCart = asyncHandler(async (req, res) => {
  const customerWithCart = await CustomerAccount.findById(req.user._id).populate({
    path: "cart.product",
    select: PRODUCT_POPULATE_FIELDS,
  });

  if (!customerWithCart) {
    return res.status(401).json({
      success: false,
      message: "User session account not found",
    });
  }

  const activeCartEntries = (customerWithCart.cart || []).filter(
    (line) => line.product !== null && line.product !== undefined
  );

  return res.status(200).json({
    success: true,
    cart: activeCartEntries,
  });
});

/**
 * Update units for a specific item in cart
 * @route PATCH /cart/:productId
 */
export const updateCartQuantity = asyncHandler(async (req, res) => {
  const { productId: targetItemId } = req.params;
  const { quantity: candidateUnits } = req.body;

  if (!mongoose.Types.ObjectId.isValid(targetItemId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product identifier provided",
    });
  }

  const parsedUnits = Number(candidateUnits);
  if (
    candidateUnits === undefined ||
    candidateUnits === null ||
    isNaN(parsedUnits) ||
    !Number.isInteger(parsedUnits) ||
    parsedUnits < 1
  ) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be an integer of at least 1 unit",
    });
  }

  const catalogProduct = await ProductCatalogItem.findById(targetItemId);
  if (!catalogProduct) {
    return res.status(404).json({
      success: false,
      message: "Product not found in catalog",
    });
  }

  if (parsedUnits > catalogProduct.stock) {
    return res.status(400).json({
      success: false,
      message: `Requested quantity exceeds available stock (${catalogProduct.stock})`,
    });
  }

  const targetCustomer = await CustomerAccount.findById(req.user._id);
  if (!targetCustomer) {
    return res.status(401).json({
      success: false,
      message: "User session account not found",
    });
  }

  if (!Array.isArray(targetCustomer.cart)) {
    targetCustomer.cart = [];
  }

  const targetLineItem = targetCustomer.cart.find(
    (entry) => entry.product.toString() === targetItemId
  );

  if (!targetLineItem) {
    return res.status(404).json({
      success: false,
      message: "Item not found in shopping cart",
    });
  }

  targetLineItem.quantity = parsedUnits;
  await targetCustomer.save();

  await targetCustomer.populate({
    path: "cart.product",
    select: PRODUCT_POPULATE_FIELDS,
  });

  const refreshedCartList = (targetCustomer.cart || []).filter(
    (line) => line.product !== null && line.product !== undefined
  );

  return res.status(200).json({
    success: true,
    message: "Cart item quantity updated",
    cart: refreshedCartList,
  });
});

/**
 * Remove an item from current user's cart
 * @route DELETE /cart/:productId
 */
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId: targetItemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(targetItemId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product identifier provided",
    });
  }

  const targetCustomer = await CustomerAccount.findById(req.user._id);
  if (!targetCustomer) {
    return res.status(401).json({
      success: false,
      message: "User session account not found",
    });
  }

  if (!Array.isArray(targetCustomer.cart)) {
    targetCustomer.cart = [];
  }

  const lineIndex = targetCustomer.cart.findIndex(
    (entry) => entry.product.toString() === targetItemId
  );

  if (lineIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Item not present in shopping cart",
    });
  }

  targetCustomer.cart.splice(lineIndex, 1);
  await targetCustomer.save();

  await targetCustomer.populate({
    path: "cart.product",
    select: PRODUCT_POPULATE_FIELDS,
  });

  const remainingCartEntries = (targetCustomer.cart || []).filter(
    (line) => line.product !== null && line.product !== undefined
  );

  return res.status(200).json({
    success: true,
    message: "Item removed from cart",
    cart: remainingCartEntries,
  });
});

// Modern naming aliases
export const appendItemToCartBag = addToCart;
export const retrieveUserCartBag = getCart;
export const modifyCartItemUnits = updateCartQuantity;
export const ejectItemFromCartBag = removeFromCart;
