import mongoose from "mongoose";
import ProductCatalogItem from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Register a new product entry in catalog
 * @route POST /products
 */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name: candidateTitle,
    description: candidateSummary,
    price: candidateAmount,
    category: candidateCategory,
    image: candidateMediaUrl,
    stock: candidateInventory,
  } = req.body;

  // Validate presence of mandatory fields
  const missingParameters = [];
  if (!candidateTitle || !String(candidateTitle).trim()) missingParameters.push("name");
  if (!candidateSummary || !String(candidateSummary).trim()) missingParameters.push("description");
  if (!candidateCategory || !String(candidateCategory).trim()) missingParameters.push("category");
  if (!candidateMediaUrl || !String(candidateMediaUrl).trim()) missingParameters.push("image");
  if (candidateAmount === undefined || candidateAmount === null || candidateAmount === "")
    missingParameters.push("price");
  if (candidateInventory === undefined || candidateInventory === null || candidateInventory === "")
    missingParameters.push("stock");

  if (missingParameters.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing mandatory catalog fields: ${missingParameters.join(", ")}`,
    });
  }

  const parsedPrice = Number(candidateAmount);
  const parsedInventoryStock = Number(candidateInventory);

  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid pricing: price must be a numeric value greater than zero",
    });
  }

  if (isNaN(parsedInventoryStock) || parsedInventoryStock < 0 || !Number.isInteger(parsedInventoryStock)) {
    return res.status(400).json({
      success: false,
      message: "Invalid inventory count: stock must be a non-negative integer",
    });
  }

  const freshlyCreatedProduct = await ProductCatalogItem.create({
    name: String(candidateTitle).trim(),
    description: String(candidateSummary).trim(),
    price: parsedPrice,
    category: String(candidateCategory).trim(),
    image: String(candidateMediaUrl).trim(),
    stock: parsedInventoryStock,
  });

  return res.status(201).json(freshlyCreatedProduct);
});

/**
 * Query products with keyword filtering, category classification, and price sorting
 * @route GET /products
 */
export const getProducts = asyncHandler(async (req, res) => {
  const { search: searchKeyword, category: filterCategory, sort: sortOrdering } = req.query;

  const catalogQueryFilter = {};

  // Case-insensitive regex title matching
  if (searchKeyword && String(searchKeyword).trim() !== "") {
    catalogQueryFilter.name = {
      $regex: String(searchKeyword).trim(),
      $options: "i",
    };
  }

  // Exact category match (excluding "All Categories" wildcard)
  if (
    filterCategory &&
    String(filterCategory).trim() !== "" &&
    filterCategory !== "All Categories" &&
    filterCategory !== "All"
  ) {
    catalogQueryFilter.category = {
      $regex: `^${String(filterCategory).trim()}$`,
      $options: "i",
    };
  }

  // Determine sorting order
  let activeSortStrategy = { createdAt: -1 };
  if (sortOrdering === "price_asc") {
    activeSortStrategy = { price: 1 };
  } else if (sortOrdering === "price_desc") {
    activeSortStrategy = { price: -1 };
  }

  const catalogResults = await ProductCatalogItem.find(catalogQueryFilter).sort(activeSortStrategy);

  return res.status(200).json({
    success: true,
    count: catalogResults.length,
    products: catalogResults,
  });
});

/**
 * Retrieve single product record by primary ObjectId
 * @route GET /products/:id
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { id: targetProductIdentifier } = req.params;

  if (!mongoose.Types.ObjectId.isValid(targetProductIdentifier)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product identifier format",
    });
  }

  const locatedProductDocument = await ProductCatalogItem.findById(targetProductIdentifier);

  if (!locatedProductDocument) {
    return res.status(404).json({
      success: false,
      message: "Product not found in current catalog",
    });
  }

  return res.status(200).json({
    success: true,
    product: locatedProductDocument,
  });
});

// Aliases for refactored naming
export const handleProductCreation = createProduct;
export const retrieveProductCatalog = getProducts;
export const retrieveSingleProductRecord = getProductById;
