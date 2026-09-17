const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const { successResponse, errorResponse } = require("../utils/response");

// Place a new order
// Place Order
const AddOrder = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const { shippingAddress, paymentMethod } = req.body;

    if (!userId) {
      return errorResponse(res, "Unauthorized user", 401);
    }

    // Find User
    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Find User Cart
    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return errorResponse(res, "Cart is empty", 400);
    }

    // Validate Shipping Address
    if (
      !shippingAddress ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.pincode
    ) {
      return errorResponse(
        res,
        "Complete shipping address is required",
        400
      );
    }

    // Create Order
    const orderData = {
      user: user._id,
      username: user.userName,
      email: user.email,
      mobileno: user.mobileNo,

      // Copy Cart Data
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
      totalDiscount: cart.totalDiscount,
      finalPrice: cart.finalPrice,

      shippingAddress,
      paymentMethod,

      paymentStatus:
        paymentMethod === "CARD" || paymentMethod === "UPI"
          ? "Completed"
          : "Pending",
    };

    const newOrder = new Order(orderData);

    const savedOrder = await newOrder.save();

    // Clear Cart
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    cart.totalDiscount = 0;
    cart.finalPrice = 0;

    await cart.save();

    return successResponse(
      res,
      "Order placed successfully",
      savedOrder,
      201
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// Get all orders (Admin / General list)
const GetAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return successResponse(res, "No orders found", []);
    }
    return successResponse(res, "All orders fetched successfully", orders);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// Get orders by specific user
const GetOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.uid || req.user?.id || req.user?._id;
    if (!userId) {
      return errorResponse(res, "User ID is required", 400);
    }

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 });

    return successResponse(res, "Orders fetched successfully", orders);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// Update order status (Admin)
const UpdateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updateFields = {};

    if (status) updateFields.status = status;

    if (Object.keys(updateFields).length === 0) {
      return errorResponse(res, "No status or payment status provided to update", 400);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate("items.product");

    if (!updatedOrder) {
      return errorResponse(res, "Order not found", 404);
    }

    return successResponse(res, "Order updated successfully", updatedOrder);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// Delete Order
const DeleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    // Only cancelled orders can be deleted
    if (order.status !== "cancelled") {
      return errorResponse(
        res,
        "Only cancelled orders can be deleted",
        400
      );
    }

    await Order.findByIdAndDelete(req.params.id);

    return successResponse(res, "Order deleted successfully", order);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  AddOrder,
  GetAllOrders,
  GetOrdersByUserId,
  UpdateOrderStatus,
  DeleteOrder,
};
