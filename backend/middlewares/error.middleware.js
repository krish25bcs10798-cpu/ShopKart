/**
 * Centralized Application Error Handling Middleware
 * Intercepts uncaught exceptions and Mongoose schema errors, sending structured HTTP envelopes.
 */

export const globalErrorHandler = (err, req, res, next) => {
  let httpStatusCode = err.statusCode || 500;
  let clientMessage = err.message || "Internal server error occurred";

  // Mongoose Validation Error (missing fields, invalid formats)
  if (err.name === "ValidationError") {
    httpStatusCode = 400;
    const validationMessages = Object.values(err.errors).map((e) => e.message);
    clientMessage = validationMessages.join(", ") || "Validation check failed";
  }

  // Mongoose Bad ObjectId / Cast Error
  if (err.name === "CastError") {
    httpStatusCode = 400;
    clientMessage = `Resource not found with specified identifier: ${err.value}`;
  }

  // MongoDB Unique Constraint Collision
  if (err.code === 11000) {
    httpStatusCode = 409;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || "field";
    clientMessage = `A record with this ${duplicatedField} already exists in the system`;
  }

  // JWT Verification Failures
  if (err.name === "JsonWebTokenError") {
    httpStatusCode = 401;
    clientMessage = "Invalid authentication signature. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    httpStatusCode = 401;
    clientMessage = "Your authentication session has expired. Please log in again.";
  }

  console.error(`[Error Handler] ${req.method} ${req.url} -> Status ${httpStatusCode}: ${clientMessage}`);

  return res.status(httpStatusCode).json({
    success: false,
    message: clientMessage,
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
};

export default globalErrorHandler;
