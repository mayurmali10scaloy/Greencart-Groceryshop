const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const { successResponse, errorResponse } = require("../utils/response");

const AddToCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { productId, quantity = 1 } = req.body;

    // Check Product
    const product = await Product.findById(productId);

    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    if (!product.isActive) {
      return errorResponse(res, "Product is unavailable", 400);
    }

    if (product.stock < quantity) {
      return errorResponse(res, "Insufficient stock", 400);
    }

    // Find User Cart
    let cart = await Cart.findOne({ user: userId });

    // Create Cart if not exists
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    // Check Product Already Exists
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({
        product: product._id,
        productName: product.productName,
        brand: product.brand,
        productImg: product.productImg,
        price: product.price,
        discountPrice: product.discountPrice,
        finalPrice: product.finalPrice,
        quantity: Number(quantity),
      });
    }

    await cart.save();

    return successResponse(res, "Product added to cart successfully", cart);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const GetMyCart = async (req, res) => {
  try {
    // User ID from JWT Token
    const userId = req.user.id || req.user._id;
   const cart = await Cart.findOne({ user: userId })
  .populate("user", "userName")
  
        if (!cart) {
      return successResponse(res, "Your cart is empty", []);
    }

    if (cart.items.length === 0) {
      return successResponse(res, "Your cart is empty", cart);
    }

    return successResponse(res, "Cart fetched successfully", cart);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const DeleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { productId } = req.params;

    // Find User Cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return errorResponse(res, "Cart not found", 404);
    }

    // Check Product Exists in Cart
    const itemExists = cart.items.some(
      (item) => item.product.toString() === productId
    );

    if (!itemExists) {
      return errorResponse(res, "Product not found in cart", 404);
    }

    // Remove Product
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    return successResponse(
      res,
      "Product removed from cart successfully",
      cart
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const IncreaseQuantity = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return errorResponse(res, "Cart not found", 404);
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return errorResponse(res, "Product not found in cart", 404);
    }

    const product = await Product.findById(productId);

    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    if (item.quantity >= product.stock) {
      return errorResponse(res, "Stock limit reached", 400);
    }

    item.quantity += 1;

    await cart.save();

    return successResponse(
      res,
      "Product quantity increased successfully",
      cart
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const DecreaseQuantity = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return errorResponse(res, "Cart not found", 404);
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return errorResponse(res, "Product not found in cart", 404);
    }

    if (item.quantity === 1) {
      return errorResponse(
        res,
        "Minimum quantity is 1. Use delete API to remove product.",
        400
      );
    }

    item.quantity -= 1;

    await cart.save();

    return successResponse(
      res,
      "Product quantity decreased successfully",
      cart
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

const GetAllCart = async (req, res) => {
  try {
    const carts = await Cart.find()
    .populate("user", "userName")
      .sort({ updatedAt: -1 });

    if (carts.length === 0) {
      return successResponse(res, "No carts found", []);
    }

    return successResponse(res, "All carts fetched successfully", carts);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  AddToCart,
  GetMyCart,
  DeleteCartItem,
  IncreaseQuantity,
  DecreaseQuantity,
  GetAllCart
};