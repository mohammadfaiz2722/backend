const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const fetchuser = require('../middleware/fetchuser');
const OTP_SECRET = "OTPSecret";
// const sendEmail = require('../emailService');
const sendEmail=require("../emailService")
const JWT_SECRET = "Harryisagood$oy";

// Route 1: Create a User using: POST "/api/auth/createuser" no login required
router.post('/createuser', async (req, res) => {
  try {
    // Check if a user with this email already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "Sorry, a user with this email already exists" });
    }

    // Hash the password before saving the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Creating a new user
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });

    // Generating JWT token
    const data = {
      user: {
        id: user.id
      }
    };
    const authToken = jwt.sign(data, JWT_SECRET);
    res.json({ authToken });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

// Route 2: Authenticate a user using: POST "/api/auth/login" no login required
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }

    // Generating JWT token
    const data = {
      user: {
        id: user.id
      }
    };
    const authToken = jwt.sign(data, JWT_SECRET);
    res.json({ authToken, message: "Login Successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

// Route 3: Get logged-in User Details using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});
router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;

  // console.log('Received email:', email);

  try {
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User with this email does not exist" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpToken = jwt.sign({ otp, email }, OTP_SECRET, { expiresIn: '10m' });

    // console.log('Sending email to:', email);

    sendEmail(email, 'Password Reset OTP', `Your OTP for password reset is ${otp}`);

    res.json({ message: "OTP sent to your email", otpToken });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send("Internal server error");
  }
});

// Step 3.2: Verify OTP and reset password
router.post('/verifyotp', async (req, res) => {
  const { otp, otpToken, email } = req.body;
  try {
    const decoded = jwt.verify(otpToken, OTP_SECRET);
    if (decoded.otp === otp && decoded.email === email) {
      res.json({ message: "OTP verified" });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

// Reset Password Route
router.post('/resetpassword', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the new password
    const saltRounds = 10; // Salt rounds for bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password with the hashed password
    user.password = hashedPassword;
    await user.save();

    // Respond with success message
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send("Internal server error");
  }
});
// module.exports = router;
module.exports = router;
