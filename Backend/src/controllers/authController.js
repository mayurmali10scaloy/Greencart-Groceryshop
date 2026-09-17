const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Register = async (req, res) => {
  try {
    const { username, email, password, mobileno } = req.body;

    //Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    //Check user already exists
    const userExist = await User.findOne({
      $or: [
        { email },
        { userName: username }
      ]
    });

    if (userExist) {
      if (userExist.email === email) {
        return res.status(400).json({
          message: "Email already exists"
        });
      }
      if (userExist.userName === username || userExist.username === username) {
        return res.status(400).json({
          message: "Username already exists"
        });
      }
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Create user using schema fields (userName, mobileNo)
    const user = await User.create({
      userName: username,
      email,
      password: hashedPassword,
      mobileNo: mobileno
    });

    //Send data
    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const Login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate inputs
    if (!password) {
      return res.status(400).json({
        message: "Password is required"
      });
    }

    const query = [];
    if (username) {
      query.push({ userName: username });
      query.push({ username: username });
    }
    if (email) {
      query.push({ email });
    }

    if (query.length === 0) {
      return res.status(400).json({
        message: "Username or email is required"
      });
    }

    // username or email check
    const user = await User.findOne({
      $or: query
    }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // password check (bcrypt)
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    // token generate
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        username: user.userName || user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  Register,
  Login,
};
