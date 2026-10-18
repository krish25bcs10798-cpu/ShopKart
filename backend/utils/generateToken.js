import jwt from "jsonwebtoken";

/**
 * Signs and generates an authenticated JWT session token
 * @param {string} subjectId - User identifier (MongoDB ObjectId)
 * @param {string} tokenLifespan - Token duration (defaults to 7 days)
 * @returns {string} Signed JWT token string
 */
export const issueJsonWebToken = (subjectId, tokenLifespan = "7d") => {
  const tokenSecretKey = process.env.JWT_SECRET || "shopkart_super_secret_jwt_key_fallback";
  const sessionClaims = { userId: subjectId };

  return jwt.sign(sessionClaims, tokenSecretKey, {
    expiresIn: tokenLifespan,
  });
};

// Backwards-compatible default alias
export default issueJsonWebToken;
