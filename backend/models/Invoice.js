const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
});

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Client',
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true, // Ensures every invoice number is unique
    },
    items: [itemSchema], // An array of items using the schema defined above
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'sent', 'paid', 'overdue'], // Predefined possible values
      default: 'draft',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
