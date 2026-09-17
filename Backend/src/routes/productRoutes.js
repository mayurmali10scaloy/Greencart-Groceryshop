const express = require("express");
const {
  GetAllProducts,
  GetProductById,
  AddProduct,
  UpdateProduct,
  DeleteProduct,
} = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const { productUpload } = require("../middlewares/multer");

const router = express.Router();

router.get("/", authMiddleware, GetAllProducts);
router.get("/:id", authMiddleware, GetProductById);
router.post("/add", authMiddleware, productUpload.single("productImg"), AddProduct);
router.put("/update/:id", authMiddleware, productUpload.single("productImg"), UpdateProduct);
router.delete("/delete/:id", authMiddleware, DeleteProduct);

module.exports = router;
