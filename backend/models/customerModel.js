import mongoose from "mongoose";

const customerProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is mandatory"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Customer email is mandatory"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must contain at least 6 characters"],
    },

    phoneNo: {
      type: String,
      required: [true, "Phone number is mandatory"],
      trim: true,
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Method to sanitize sensitive attributes from customer representation
customerProfileSchema.methods.toSafeObject = function () {
  const accountDoc = this.toObject();
  delete accountDoc.password;
  return accountDoc;
};

// Use existing collection name "customer" for database consistency
const Customer = mongoose.models.customer || mongoose.model("customer", customerProfileSchema);

export { Customer as customerModel };
export default Customer;