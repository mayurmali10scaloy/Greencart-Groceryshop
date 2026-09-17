const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      default: null,
    },
    productImg: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity cannot be less than 1"],
    },
    itemTotal: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobileno: {
      type: String,
      required: true,
    },

    items: {
      type: [orderItemSchema],
      default: [],
    },

    totalItems: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      default: 0,
    },

    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Card", "UPI"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.pre("save", function (next) {
  this.items.forEach((item) => {
    item.itemTotal = item.finalPrice * item.quantity;
  });

  this.totalItems = this.items.reduce((acc, item) => acc + item.quantity, 0);

  this.totalPrice = this.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  this.totalDiscount = this.items.reduce(
    (acc, item) => acc + item.discountPrice * item.quantity,
    0,
  );

  this.finalPrice = this.totalPrice - this.totalDiscount;

  next();
});

module.exports = mongoose.model("Order", orderSchema);
