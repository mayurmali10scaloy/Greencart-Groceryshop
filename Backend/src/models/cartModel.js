const mongoose = require("mongoose");

// Cart Item Sub-Schema
const cartItemSchema = new mongoose.Schema({
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
    min: 1,
  },

  itemTotal: {
    type: Number,
    default: 0,
  },
  
},
  {
    _id: false 
  });

// Main Cart Schema
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
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
    
  },
  {
    timestamps: true,
  },
  
);

// ✅ Auto Calculate Totals
cartSchema.pre("save", function (next) {
  // Per item total
  this.items.forEach((item) => {
    item.itemTotal = item.finalPrice * item.quantity;
  });

  this.totalItems = this.items.reduce((acc, item) => acc + item.quantity, 0);
  this.totalPrice = this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  this.totalDiscount = this.items.reduce((acc, item) => acc + item.discountPrice * item.quantity, 0);
  this.finalPrice = this.totalPrice - this.totalDiscount;

  next();
});

module.exports = mongoose.model("Cart", cartSchema);