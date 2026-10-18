import jwt from "jsonwebtoken";
import CustomerAccount from "../models/customerModel.js";

/**
 * Authentication Middleware: Verifies session via HTTP-only Cookie or Authorization Header
 */
export const verifyAuthenticationSession = async (req, res, next) => {
  try {
    let bearerToken = req.cookies?.token;

    if (!bearerToken && req.headers?.authorization && req.headers.authorization.startsWith("Bearer ")) {
      bearerToken = req.headers.authorization.split(" ")[1];
    }

    if (!bearerToken) {
      return res.status(401).json({
        success: false,
        message: "Login required. No authorization token present.",
      });
    }

    const signingKey = process.env.JWT_SECRET || "shopkart_super_secret_jwt_key_fallback";
    const tokenClaims = jwt.verify(bearerToken, signingKey);

    const activeCustomerRecord = await CustomerAccount.findById(tokenClaims.userId).select("-password");

    if (!activeCustomerRecord) {
      return res.status(401).json({
        success: false,
        message: "Account associated with token could not be found.",
      });
    }

    // Attach user record for route handlers
    req.user = activeCustomerRecord;
    req.authenticatedCustomer = activeCustomerRecord;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authorization token.",
      error: error.message,
    });
  }
};

// Aliases for backwards compatibility with any existing imports
export const isAuthenticated = verifyAuthenticationSession;
export default verifyAuthenticationSession;
