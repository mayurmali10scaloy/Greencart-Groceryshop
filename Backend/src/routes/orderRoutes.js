const express = require("express");
const {
  AddOrder,
  GetAllOrders,
  GetOrdersByUserId,
  UpdateOrderStatus,
  DeleteOrder,
} = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

// Define order routes
router.post("/add", authMiddleware, AddOrder);
router.get("/", authMiddleware, GetAllOrders);
router.get("/:uid", authMiddleware, GetOrdersByUserId);
router.put("/update/:id", authMiddleware, UpdateOrderStatus);
router.delete("/delete/:id", authMiddleware,adminMiddleware, DeleteOrder);

module.exports = router;
