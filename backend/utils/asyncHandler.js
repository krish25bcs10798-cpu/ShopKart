/**
 * Asynchronous Controller Wrapper
 * Eliminates repetitive try/catch scaffolding across Express routes by forwarding errors to middleware.
 */

export const asyncHandler = (controllerFunction) => {
  return (req, res, next) => {
    Promise.resolve(controllerFunction(req, res, next)).catch(next);
  };
};

export default asyncHandler;
