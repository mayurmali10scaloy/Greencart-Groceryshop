const mongoose = require("mongoose");

const connectionDB = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");

    await mongoose.connect(
      "mongodb://localhost:27017/EComerce"
    );

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
  }
};

module.exports = connectionDB;
