const Product = require("../models/productModel");
const { errorResponse, successResponse } = require("../utils/response");
const { deleteImage } = require("../middlewares/multer");

// Get all products
const GetAllProducts = async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};

    if (search) {
      filter = {
        $or: [
          { productName: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      };
    }

    const products = await Product.find(filter).sort({ updatedAt: -1 });

    if (products.length === 0) {
      return successResponse(res, "No products found", []);
    }

    return successResponse(res, "All Products", products);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// Get product by ID
const GetProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }
    return successResponse(res, "Product found", product);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// Add product
const AddProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      category,
      brand,
      quantity,
      price,
      discountPercent,
      stock,
      isActive,
      ratings,
    } = req.body;

    const productImg = req.file ? req.file.filename : "";

    if (!productName || !category || !price) {
      return errorResponse(
        res,
        "productName, category, and price are required",
        400,
      );
    }

    const productData = {
      productName,
      description,
      category,
      brand,
      quantity,
      price,
      discountPercent,
      stock,
      productImg,
      isActive,
    };

    // ratings is optional
    if (
      ratings !== undefined &&
      ratings !== null &&
      ratings !== "" &&
      !isNaN(ratings)
    ) {
      productData.ratings = Number(ratings);
    } else {
      productData.ratings = null;
    }

    const newProduct = await Product.create(productData);
    return successResponse(res, "Product added successfully", newProduct, 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// Update product
const UpdateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    const product = await Product.findById(req.params.id);
    if (!product) {
      if (req.file) {
        deleteImage("products", req.file.filename);
      }
      return errorResponse(res, "Product not found", 404);
    }

    // Handle image update
    if (req.file) {
      if (product.productImg) {
        deleteImage("products", product.productImg);
      }
      updateData.productImg = req.file.filename;
    }

    // Recalculate discount price and final price if price or discountPercent changes
    const price =
      updateData.price !== undefined ? Number(updateData.price) : product.price;
    const discountPercent =
      updateData.discountPercent !== undefined
        ? Number(updateData.discountPercent)
        : product.discountPercent;

    if (price && discountPercent) {
      updateData.discountPrice = Math.round((price * discountPercent) / 100);
      updateData.finalPrice = price - updateData.discountPrice;
    } else {
      updateData.discountPrice = 0;
      updateData.finalPrice = price;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return errorResponse(res, "Product not found", 404);
    }

    return successResponse(res, "Product updated successfully", updatedProduct);
  } catch (error) {
    if (req.file) {
      deleteImage("products", req.file.filename);
    }
    return errorResponse(res, error.message);
  }
};

// Delete product
const DeleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return errorResponse(res, "Product not found", 404);
    }
    if (deletedProduct.productImg) {
      deleteImage("products", deletedProduct.productImg);
    }
    return successResponse(res, "Product deleted successfully", deletedProduct);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  GetAllProducts,
  GetProductById,
  AddProduct,
  UpdateProduct,
  DeleteProduct,
};
