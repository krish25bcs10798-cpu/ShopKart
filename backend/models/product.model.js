import mongoose from "mongoose";

const productItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0.01, "Price must be strictly positive"],
      index: true,
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
      index: true,
    },
    image: {
      type: String,
      required: [true, "Product image URL is required"],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "Product stock count is required"],
      min: [0, "Inventory stock cannot be negative"],
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for enhanced keyword search across title and description
productItemSchema.index({ name: "text", description: "text" });

const Product = mongoose.models.Product || mongoose.model("Product", productItemSchema);

export default Product;
