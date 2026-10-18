import express from "express";
import {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getMe,
} from "../controllers/customerController.js";
import verifyAuthenticationSession from "../middlewares/authMiddleware.js";

const customerRouter = express.Router();

// Public authentication routes
customerRouter.post("/register", registerCustomer);
customerRouter.post("/login", loginCustomer);
customerRouter.post("/logout", logoutCustomer);

// Protected session route
customerRouter.get("/me", verifyAuthenticationSession, getMe);

export default customerRouter;