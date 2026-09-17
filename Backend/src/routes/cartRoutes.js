const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { AddToCart, GetMyCart, DeleteCartItem, IncreaseQuantity, DecreaseQuantity, GetAllCart } = require("../controllers/cartController");

router.post("/add", authMiddleware, AddToCart);
router.get("/mycart", authMiddleware, GetMyCart);
router.delete("/remove/:productId",authMiddleware,DeleteCartItem);
router.put("/increase/:productId", authMiddleware, IncreaseQuantity);
router.put("/decrease/:productId", authMiddleware, DecreaseQuantity);
router.get("/getall", authMiddleware, GetAllCart);
module.exports = router;