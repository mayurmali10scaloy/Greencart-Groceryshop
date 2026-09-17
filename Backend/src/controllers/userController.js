const { deleteImage } = require("../middlewares/multer");
const User = require("../models/userModel");
const { errorResponse, successResponse } = require("../utils/response");
const bcrypt = require("bcryptjs");

const GetAllUser = async (req, res) => {
  try {
    const users = await User.find().sort({ updatedAt: -1 });

    if (users.length === 0) {
      return successResponse(res, "No users found", []);
    }
    return successResponse(res, "All Users", users);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// Get User By ID
const GetUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, "User found", user);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// Add User
const AddUser = async (req, res) => {
  try {
    const {
      userName,
      email,
      password,
      mobileNo,
      address,
      city,
      pincode,
      isActive,
      role,
    } = req.body;

    const profileImage = req.file ? req.file.filename : "";


    if (!userName || !email || !password || !mobileNo) {
      if (req.file) {
        deleteImage("users", req.file.filename);
      }
      return errorResponse(res, "userName, email, password, and mobileNo are required", 400);
    }

    const checkUser = await User.findOne({ email });

    if (checkUser) {
      if (req.file) {
        deleteImage("users", req.file.filename);
      }
      return errorResponse(res, "Email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      userName,
      email,
      password: hashedPassword,
      mobileNo,
      profileImage,
      address,
      city,
      pincode,
      isActive,
      role,
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return successResponse(res, "User added successfully", userResponse, 201);
  } catch (error) {
    if (req.file) {
      deleteImage("users", req.file.filename);
    }
    return errorResponse(res, error.message);
  }
};

// Update User
const UpdateUser = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.password) {
      if (updateData.password.length < 6) {
        return errorResponse(res, "Password must be at least 6 characters long", 400);
      }
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    if (req.file) {
      // Find the user first to get their old profile image
      const user = await User.findById(req.params.id);
      if (!user) {
        // Delete the uploaded file to avoid orphaned files
        deleteImage("users", req.file.filename);
        return errorResponse(res, "User not found", 404);
      }

      // Delete the old profile image if it exists
      if (user.profileImage) {
        deleteImage("users", user.profileImage);
      }

      // Add the new profile image filename to updateData
      updateData.profileImage = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, "User updated successfully", updatedUser);
  } catch (error) {
    if (req.file) {
      deleteImage("users", req.file.filename);
    }
    return errorResponse(res, error.message);
  }
};

// Delete User
const DeleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return errorResponse(res, "User not found", 404);
    }

    if (deletedUser.profileImage) {
      deleteImage("users", deletedUser.profileImage);
    }

    return successResponse(res, "User deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  GetAllUser,
  GetUserById,
  AddUser,
  UpdateUser,
  DeleteUser,
};

