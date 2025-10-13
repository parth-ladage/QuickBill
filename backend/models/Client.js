const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    // Link the client to a specific user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This creates a reference to the User model
    },
    name: {
      type: String,
      required: [true, 'Please add a client name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Client', clientSchema);
