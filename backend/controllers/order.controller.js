import crypto from "crypto";
import mongoose from "mongoose";
import CustomerOrderRecord from "../models/order.model.js";
import CustomerAccount from "../models/customerModel.js";
import ProductCatalogItem from "../models/product.model.js";
import razorpayGatewayClient from "../config/razorpay.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Validate active cart, compute trusted pricing snapshot, create ShopKart order & initialize Razorpay session
 * @route POST /orders/create-payment-order
 */
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { shippingAddress: rawShippingInput } = req.body;

  // 1. Verify required shipping address fields
  if (
    !rawShippingInput ||
    !rawShippingInput.fullName ||
    !rawShippingInput.phone ||
    !rawShippingInput.addressLine1 ||
    !rawShippingInput.city ||
    !rawShippingInput.state ||
    !rawShippingInput.pincode
  ) {
    return res.status(400).json({
      success: false,
      message: "All shipping destination fields are mandatory.",
    });
  }

  const sanitizedDestination = {
    fullName: String(rawShippingInput.fullName).trim(),
    phone: String(rawShippingInput.phone).trim(),
    addressLine1: String(rawShippingInput.addressLine1).trim(),
    city: String(rawShippingInput.city).trim(),
    state: String(rawShippingInput.state).trim(),
    pincode: String(rawShippingInput.pincode).trim(),
  };

  // Indian Pincode format check (6 digits)
  if (!/^\d{6}$/.test(sanitizedDestination.pincode)) {
    return res.status(400).json({
      success: false,
      message: "Delivery pincode must contain exactly 6 numeric digits.",
    });
  }

  // Phone number validation (at least 10 digits)
  const numericPhoneOnly = sanitizedDestination.phone.replace(/[\s-+()]/g, "");
  if (numericPhoneOnly.length < 10 || numericPhoneOnly.length > 13) {
    return res.status(400).json({
      success: false,
      message: "Please specify a valid 10-digit phone number.",
    });
  }

  // 2. Fetch authenticated customer document
  const authenticatedAccount = await CustomerAccount.findById(req.user._id);
  if (!authenticatedAccount) {
    return res.status(401).json({
      success: false,
      message: "Active customer session could not be verified.",
    });
  }

  if (!authenticatedAccount.cart || authenticatedAccount.cart.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Your shopping bag is empty. Please add items before checking out.",
    });
  }

  // 3. Verify stock availability and compute authoritative server total
  let authoritativeGrandTotal = 0;
  const historicalItemSnapshots = [];

  for (const cartEntry of authenticatedAccount.cart) {
    const liveProductDoc = await ProductCatalogItem.findById(cartEntry.product);

    if (!liveProductDoc) {
      return res.status(400).json({
        success: false,
        message: "One or more products in your cart are no longer available in store.",
      });
    }

    if (liveProductDoc.stock < cartEntry.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory for "${liveProductDoc.name}". In stock: ${liveProductDoc.stock}, requested: ${cartEntry.quantity}.`,
      });
    }

    const lineTotalAmount = Number(liveProductDoc.price) * Number(cartEntry.quantity);
    authoritativeGrandTotal += lineTotalAmount;

    historicalItemSnapshots.push({
      product: liveProductDoc._id,
      name: liveProductDoc.name,
      price: liveProductDoc.price,
      quantity: cartEntry.quantity,
      image: liveProductDoc.image,
    });
  }

  if (authoritativeGrandTotal <= 0) {
    return res.status(400).json({
      success: false,
      message: "Calculated order amount must be greater than zero.",
    });
  }

  // 4. Record pending ShopKart order in MongoDB
  const newlyCreatedOrder = await CustomerOrderRecord.create({
    user: authenticatedAccount._id,
    items: historicalItemSnapshots,
    shippingAddress: sanitizedDestination,
    totalAmount: authoritativeGrandTotal,
    paymentStatus: "PENDING",
    status: "PENDING_PAYMENT",
  });

  // 5. Create Razorpay gateway session order (paise = INR * 100)
  const payableAmountInPaise = Math.round(authoritativeGrandTotal * 100);
  let gatewayOrderId = null;
  const merchantPublicIdentifier = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";

  try {
    const gatewaySessionResponse = await razorpayGatewayClient.orders.create({
      amount: payableAmountInPaise,
      currency: "INR",
      receipt: newlyCreatedOrder._id.toString(),
    });

    gatewayOrderId = gatewaySessionResponse.id;
    newlyCreatedOrder.razorpayOrderId = gatewayOrderId;
    await newlyCreatedOrder.save();
  } catch (gatewayError) {
    console.error("Razorpay order initialization failure:", gatewayError);
    return res.status(500).json({
      success: false,
      message: "Payment gateway initialization encountered an unexpected issue.",
      error: gatewayError.message,
    });
  }

  return res.status(200).json({
    success: true,
    shopKartOrderId: newlyCreatedOrder._id,
    razorpayOrderId: gatewayOrderId,
    amount: payableAmountInPaise,
    currency: "INR",
    key: merchantPublicIdentifier,
  });
});

/**
 * Verify cryptographic HMAC SHA256 payment signature, record payment, deduct stock, and empty bag
 * @route POST /orders/verify-payment
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    shopKartOrderId: targetOrderId,
    razorpay_order_id: incomingGatewayOrderId,
    razorpay_payment_id: gatewayTransactionId,
    razorpay_signature: cryptographicDigest,
  } = req.body;

  if (
    !targetOrderId ||
    !incomingGatewayOrderId ||
    !gatewayTransactionId ||
    !cryptographicDigest
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing mandatory cryptographic payment verification parameters.",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(targetOrderId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ShopKart order identifier format.",
    });
  }

  const existingOrderDocument = await CustomerOrderRecord.findById(targetOrderId);
  if (!existingOrderDocument) {
    return res.status(404).json({
      success: false,
      message: "Order record not found.",
    });
  }

  // Confirm ownership of order by authenticated customer
  if (existingOrderDocument.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: you do not hold ownership of this order record.",
    });
  }

  // Security verification: compare with server-stored Razorpay Order ID
  const recordedGatewayId = existingOrderDocument.razorpayOrderId;
  if (!recordedGatewayId || recordedGatewayId !== incomingGatewayOrderId) {
    return res.status(400).json({
      success: false,
      message: "Gateway order identifier mismatch with recorded database entity.",
    });
  }

  // HMAC SHA256 signature verification
  const merchantSecret = process.env.RAZORPAY_KEY_SECRET;
  if (!merchantSecret) {
    return res.status(500).json({
      success: false,
      message: "Server Razorpay secret key is not configured.",
    });
  }

  const verificationString = `${recordedGatewayId}|${gatewayTransactionId}`;
  const computedHmacSignature = crypto
    .createHmac("sha256", merchantSecret)
    .update(verificationString)
    .digest("hex");

  if (computedHmacSignature !== cryptographicDigest) {
    existingOrderDocument.paymentStatus = "FAILED";
    await existingOrderDocument.save();
    return res.status(400).json({
      success: false,
      message: "Cryptographic signature validation failed. Transaction could not be confirmed.",
    });
  }

  // Signature is authenticated: commit PAID and PLACED
  existingOrderDocument.paymentStatus = "PAID";
  existingOrderDocument.status = "PLACED";
  existingOrderDocument.razorpayPaymentId = gatewayTransactionId;
  await existingOrderDocument.save();

  // Atomically decrease product inventory stock
  for (const orderedLineItem of existingOrderDocument.items) {
    await ProductCatalogItem.findByIdAndUpdate(orderedLineItem.product, {
      $inc: { stock: -orderedLineItem.quantity },
    });
  }

  // Clear customer's persistent shopping bag in database
  await CustomerAccount.findByIdAndUpdate(req.user._id, {
    $set: { cart: [] },
  });

  return res.status(200).json({
    success: true,
    message: "Payment successfully validated. Order confirmed.",
    order: existingOrderDocument,
  });
});

/**
 * Retrieve authenticated customer's order history
 * @route GET /orders
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const customerPastOrders = await CustomerOrderRecord.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  return res.status(200).json({
    success: true,
    count: customerPastOrders.length,
    orders: customerPastOrders,
  });
});

/**
 * Retrieve single order by ID with authorization verification
 * @route GET /orders/:id
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { id: targetOrderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(targetOrderId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order identifier format.",
    });
  }

  const locatedOrder = await CustomerOrderRecord.findById(targetOrderId);
  if (!locatedOrder) {
    return res.status(404).json({
      success: false,
      message: "Order record not found.",
    });
  }

  if (locatedOrder.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: you do not have permission to view this order.",
    });
  }

  return res.status(200).json({
    success: true,
    order: locatedOrder,
  });
});

/**
 * Development & Simulator helper: Transition order status
 * @route PATCH /orders/:id/status
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id: targetOrderId } = req.params;
  const { status: targetStatus } = req.body;

  const validProgressions = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
  if (!validProgressions.includes(targetStatus)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status specified. Permitted states: ${validProgressions.join(", ")}`,
    });
  }

  const orderToUpdate = await CustomerOrderRecord.findById(targetOrderId);
  if (!orderToUpdate) {
    return res.status(404).json({
      success: false,
      message: "Order record not found.",
    });
  }

  orderToUpdate.status = targetStatus;
  await orderToUpdate.save();

  return res.status(200).json({
    success: true,
    message: `Order delivery status updated to ${targetStatus}`,
    order: orderToUpdate,
  });
});

// Modern aliases
export const initializeCheckoutOrder = createPaymentOrder;
export const authenticatePaymentTransaction = verifyPayment;
export const retrieveCustomerOrderHistory = getMyOrders;
export const retrieveOrderDetailsById = getOrderById;
export const transitionOrderStatus = updateOrderStatus;
