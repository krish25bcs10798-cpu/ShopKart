import mongoose from "mongoose";
import CustomerAccount from "../models/customerModel.js";
import ProductCatalogItem from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const WISHLIST_POPULATE_FIELDS = "name price category image stock description";

/**
 * Append product to user's saved wishlist
 * @route POST /wishlist/:productId
 */
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId: targetItemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(targetItemId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product identifier provided",
    });
  }

  const catalogProduct = await ProductCatalogItem.findById(targetItemId);
  if (!catalogProduct) {
    return res.status(404).json({
      success: false,
      message: "Product not found in catalog",
    });
  }

  const authenticatedCustomer = await CustomerAccount.findById(req.user._id);
  if (!authenticatedCustomer) {
    return res.status(401).json({
      success: false,
      message: "Customer account not found",
    });
  }

  if (!Array.isArray(authenticatedCustomer.wishlist)) {
    authenticatedCustomer.wishlist = [];
  }

  const isAlreadySaved = authenticatedCustomer.wishlist.some(
    (existingId) => existingId.toString() === targetItemId
  );

  if (isAlreadySaved) {
    return res.status(409).json({
      success: false,
      message: "Product is already in your wishlist",
    });
  }

  authenticatedCustomer.wishlist.push(targetItemId);
  await authenticatedCustomer.save();

  return res.status(201).json({
    success: true,
    message: "Product added to wishlist",
  });
});

/**
 * Retrieve user's populated wishlist
 * @route GET /wishlist
 */
export const getWishlist = asyncHandler(async (req, res) => {
  const customerProfile = await CustomerAccount.findById(req.user._id).populate({
    path: "wishlist",
    select: WISHLIST_POPULATE_FIELDS,
  });

  if (!customerProfile) {
    return res.status(401).json({
      success: false,
      message: "Customer account not found",
    });
  }

  const verifiedWishlistItems = (customerProfile.wishlist || []).filter(
    (element) => element !== null && element !== undefined
  );

  return res.status(200).json({
    success: true,
    count: verifiedWishlistItems.length,
    wishlist: verifiedWishlistItems,
  });
});

/**
 * Remove product from user's wishlist
 * @route DELETE /wishlist/:productId
 */
export const removeFromWishlist = asyncHandler(async (req, res) => {
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
      message: "Customer account not found",
    });
  }

  if (!Array.isArray(targetCustomer.wishlist)) {
    targetCustomer.wishlist = [];
  }

  const entryIndex = targetCustomer.wishlist.findIndex(
    (savedId) => savedId.toString() === targetItemId
  );

  if (entryIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Product is not present in wishlist",
    });
  }

  targetCustomer.wishlist.splice(entryIndex, 1);
  await targetCustomer.save();

  return res.status(200).json({
    success: true,
    message: "Product removed from wishlist",
  });
});

/**
 * Toggle product saved state in wishlist
 * @route PATCH /wishlist/:productId/toggle
 */
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId: targetItemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(targetItemId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product identifier format",
    });
  }

  const catalogProduct = await ProductCatalogItem.findById(targetItemId);
  if (!catalogProduct) {
    return res.status(404).json({
      success: false,
      message: "Product not found in catalog",
    });
  }

  const activeCustomer = await CustomerAccount.findById(req.user._id);
  if (!activeCustomer) {
    return res.status(401).json({
      success: false,
      message: "Customer account not found",
    });
  }

  if (!Array.isArray(activeCustomer.wishlist)) {
    activeCustomer.wishlist = [];
  }

  const matchedIndex = activeCustomer.wishlist.findIndex(
    (savedId) => savedId.toString() === targetItemId
  );

  if (matchedIndex > -1) {
    // Currently present -> remove
    activeCustomer.wishlist.splice(matchedIndex, 1);
    await activeCustomer.save();
    return res.status(200).json({
      success: true,
      saved: false,
      message: "Product removed from wishlist",
    });
  } else {
    // Currently absent -> append
    activeCustomer.wishlist.push(targetItemId);
    await activeCustomer.save();
    return res.status(200).json({
      success: true,
      saved: true,
      message: "Product added to wishlist",
    });
  }
});

// Modern aliases
export const appendItemToSavedWishlist = addToWishlist;
export const retrieveSavedWishlist = getWishlist;
export const ejectItemFromWishlist = removeFromWishlist;
export const toggleProductWishlistStatus = toggleWishlist;
