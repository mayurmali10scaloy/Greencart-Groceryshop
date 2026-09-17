const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      trim: true,
      default: null,
    },
    quantity: {
      type: String,
      required: true,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    productImg: {
      type: String,
      default: null,
    },
    ratings: {
      type: Number,
      default: null,
      min: 0,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ SINGLE INSERT (save)
productSchema.pre("save", async function (next) {
  // discount calculate
  if (this.price && this.discountPercent) {
    this.discountPrice = Math.round((this.price * this.discountPercent) / 100);
    this.finalPrice = this.price - this.discountPrice;
  } else {
    this.finalPrice = this.price;
  }

  next();
});


module.exports = mongoose.model("Product", productSchema);