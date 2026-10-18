import express from "express";
import verifyAuthenticationSession from "../middlewares/authMiddleware.js";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "../controllers/cart.controller.js";

const cartRouter = express.Router();

// All shopping cart operations mandate active authentication
cartRouter.use(verifyAuthenticationSession);

cartRouter.post("/:productId", addToCart);
cartRouter.get("/", getCart);
cartRouter.patch("/:productId", updateCartQuantity);
cartRouter.delete("/:productId", removeFromCart);

export default cartRouter;
