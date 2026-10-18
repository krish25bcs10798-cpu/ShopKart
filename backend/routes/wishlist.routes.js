import express from "express";
import verifyAuthenticationSession from "../middlewares/authMiddleware.js";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} from "../controllers/wishlist.controller.js";

const wishlistRouter = express.Router();

// All wishlist operations require authenticated customer session
wishlistRouter.use(verifyAuthenticationSession);

wishlistRouter.post("/:productId", addToWishlist);
wishlistRouter.get("/", getWishlist);
wishlistRouter.delete("/:productId", removeFromWishlist);
wishlistRouter.patch("/:productId/toggle", toggleWishlist);

export default wishlistRouter;
