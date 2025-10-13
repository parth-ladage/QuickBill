const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, companyName, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    firstName,
    lastName,
    companyName,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      companyName: user.companyName,
      isGstEnabled: user.isGstEnabled,
      gstPercentage: user.gstPercentage,
      logoUrl: user.logoUrl, // Send logoUrl
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      companyName: user.companyName,
      isGstEnabled: user.isGstEnabled,
      gstPercentage: user.gstPercentage,
      logoUrl: user.logoUrl, // Send logoUrl
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      companyName: user.companyName,
      isGstEnabled: user.isGstEnabled,
      gstPercentage: user.gstPercentage,
      logoUrl: user.logoUrl, // Send logoUrl
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.companyName = req.body.companyName || user.companyName;
    user.email = req.body.email || user.email;
    
    user.isGstEnabled = req.body.isGstEnabled ?? user.isGstEnabled; 
    user.gstPercentage = req.body.gstPercentage ?? user.gstPercentage;
    
    // --- UPDATE LOGO URL ---
    // Use `??` to allow saving an empty string to clear the logo
    user.logoUrl = req.body.logoUrl ?? user.logoUrl;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      companyName: updatedUser.companyName,
      isGstEnabled: updatedUser.isGstEnabled,
      gstPercentage: updatedUser.gstPercentage,
      logoUrl: updatedUser.logoUrl, // Send updated logoUrl
      token: generateToken(updatedUser._id), // Re-issue token with new info
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changeUserPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!(await user.matchPassword(currentPassword))) {
        res.status(401);
        throw new Error('Invalid current password');
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
};