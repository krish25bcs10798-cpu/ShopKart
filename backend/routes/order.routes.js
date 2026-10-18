import express from "express";
import verifyAuthenticationSession from "../middlewares/authMiddleware.js";
import {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

// All order lifecycle routes require customer authentication
orderRouter.use(verifyAuthenticationSession);

orderRouter.post("/create-payment-order", createPaymentOrder);
orderRouter.post("/verify-payment", verifyPayment);
orderRouter.get("/", getMyOrders);
orderRouter.get("/:id", getOrderById);
orderRouter.patch("/:id/status", updateOrderStatus);

export default orderRouter;
