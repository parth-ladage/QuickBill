const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes for registration and login
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/change-password').put(protect, changeUserPassword);

// Protected route for getting and updating the user profile
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;