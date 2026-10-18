/**
 * Standardized API Response Envelope Utility
 * Formats all Express JSON responses into a consistent, predictable structure.
 */

export const sendApiResponse = (
  res,
  statusCode = 200,
  success = true,
  message = "Operation executed successfully",
  payload = null,
  metaData = {}
) => {
  const responseObject = {
    success,
    message,
    ...(payload !== null && payload !== undefined ? { data: payload } : {}),
    ...metaData,
  };

  return res.status(statusCode).json(responseObject);
};

export const sendErrorResponse = (
  res,
  statusCode = 500,
  message = "An unexpected server error occurred",
  errorDetails = null
) => {
  const errorObject = {
    success: false,
    message,
    ...(errorDetails && process.env.NODE_ENV !== "production"
      ? { error: errorDetails }
      : {}),
  };

  return res.status(statusCode).json(errorObject);
};
