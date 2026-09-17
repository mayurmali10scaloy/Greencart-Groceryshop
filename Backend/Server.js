const express = require('express');
const connectionDB = require('./src/config/connection/Connection');
const dotenv = require("dotenv");
const User = require('./src/models/userModel');
const Product = require('./src/models/productModel');
const Order = require('./src/models/orderModel');
const cors = require("cors");

const app = express();

app.use(cors());
dotenv.config();

app.use(express.json());
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));

const userRoutes = require("./src/routes/userRoutes")
const productRoutes = require("./src/routes/productRoutes")
const authRoutes = require("./src/routes/authRoutes")
const cartRoute = require("./src/routes/cartRoutes")
const orderRoute = require("./src/routes/orderRoutes")

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoute)
app.use("/api/order", orderRoute)


connectionDB();

app.listen(process.env.PORT, () => {
  console.log(`Server started at server ${process.env.PORT}`);
});