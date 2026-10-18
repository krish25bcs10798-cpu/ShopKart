import httpClient from "../axiosCalls/axios";

/**
 * Query products catalog with optional search term, category filter, and sorting
 * @param {Object} queryOptions - { search, category, sort }
 */
export const getProducts = async ({ search = "", category = "", sort = "" } = {}) => {
  const queryParameters = {};
  if (search && String(search).trim() !== "") {
    queryParameters.search = String(search).trim();
  }
  if (
    category &&
    String(category).trim() !== "" &&
    category !== "All Categories" &&
    category !== "All"
  ) {
    queryParameters.category = String(category).trim();
  }
  if (sort && String(sort).trim() !== "") {
    queryParameters.sort = String(sort).trim();
  }

  const networkResponse = await httpClient.get("/products", { params: queryParameters });
  return networkResponse.data;
};

/**
 * Fetch a single product record by its ObjectId
 * @param {string} productIdentifier
 */
export const getProductById = async (productIdentifier) => {
  const networkResponse = await httpClient.get(`/products/${productIdentifier}`);
  return networkResponse.data;
};

/**
 * Create a new product listing in catalog
 * @param {Object} productPayload
 */
export const createProduct = async (productPayload) => {
  const networkResponse = await httpClient.post("/products", productPayload);
  return networkResponse.data;
};

/**
 * Fetch authenticated customer's populated saved wishlist
 */
export const getWishlist = async () => {
  const networkResponse = await httpClient.get("/wishlist");
  return networkResponse.data;
};

/**
 * Append item to authenticated customer's wishlist
 * @param {string} productIdentifier
 */
export const addToWishlist = async (productIdentifier) => {
  const networkResponse = await httpClient.post(`/wishlist/${productIdentifier}`);
  return networkResponse.data;
};

/**
 * Eject item from authenticated customer's wishlist
 * @param {string} productIdentifier
 */
export const removeFromWishlist = async (productIdentifier) => {
  const networkResponse = await httpClient.delete(`/wishlist/${productIdentifier}`);
  return networkResponse.data;
};

/**
 * Toggle saved status of a product in wishlist
 * @param {string} productIdentifier
 */
export const toggleWishlist = async (productIdentifier) => {
  const networkResponse = await httpClient.patch(`/wishlist/${productIdentifier}/toggle`);
  return networkResponse.data;
};

/**
 * Fetch current authenticated customer's shopping bag
 */
export const getCart = async () => {
  const networkResponse = await httpClient.get("/cart");
  return networkResponse.data;
};

/**
 * Append product or increment quantity in shopping bag
 * @param {string} productIdentifier
 */
export const addToCart = async (productIdentifier) => {
  const networkResponse = await httpClient.post(`/cart/${productIdentifier}`);
  return networkResponse.data;
};

/**
 * Modify unit quantity for an item in shopping bag
 * @param {string} productIdentifier
 * @param {number} updatedQuantity
 */
export const updateCartQuantity = async (productIdentifier, updatedQuantity) => {
  const networkResponse = await httpClient.patch(`/cart/${productIdentifier}`, {
    quantity: updatedQuantity,
  });
  return networkResponse.data;
};

/**
 * Remove an item from shopping bag
 * @param {string} productIdentifier
 */
export const removeFromCart = async (productIdentifier) => {
  const networkResponse = await httpClient.delete(`/cart/${productIdentifier}`);
  return networkResponse.data;
};

/**
 * Initialize checkout order and generate Razorpay payment order session
 * @param {Object} shippingAddressPayload
 */
export const createPaymentOrder = async (shippingAddressPayload) => {
  const networkResponse = await httpClient.post("/orders/create-payment-order", {
    shippingAddress: shippingAddressPayload,
  });
  return networkResponse.data;
};

/**
 * Authenticate Razorpay payment signature and seal order
 * @param {Object} paymentVerificationData
 */
export const verifyPayment = async (paymentVerificationData) => {
  const networkResponse = await httpClient.post("/orders/verify-payment", paymentVerificationData);
  return networkResponse.data;
};

/**
 * Retrieve authenticated customer's order history
 */
export const getMyOrders = async () => {
  const networkResponse = await httpClient.get("/orders");
  return networkResponse.data;
};

/**
 * Fetch detailed order record by its ID
 * @param {string} orderIdentifier
 */
export const getOrderById = async (orderIdentifier) => {
  const networkResponse = await httpClient.get(`/orders/${orderIdentifier}`);
  return networkResponse.data;
};

/**
 * Developer status progression simulator
 * @param {string} orderIdentifier
 * @param {string} nextStatus
 */
export const updateOrderStatus = async (orderIdentifier, nextStatus) => {
  const networkResponse = await httpClient.patch(`/orders/${orderIdentifier}/status`, {
    status: nextStatus,
  });
  return networkResponse.data;
};

// Modern function aliases
export const fetchCatalogProducts = getProducts;
export const fetchSingleProductDetails = getProductById;
export const fetchCustomerWishlist = getWishlist;
export const toggleSavedItem = toggleWishlist;
export const fetchCustomerShoppingBag = getCart;
export const appendProductToShoppingBag = addToCart;
export const modifyBagItemUnits = updateCartQuantity;
export const deleteBagItem = removeFromCart;
export const createCheckoutSession = createPaymentOrder;
export const verifyGatewaySignature = verifyPayment;
export const fetchCustomerOrders = getMyOrders;
