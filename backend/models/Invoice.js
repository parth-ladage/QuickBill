const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema(
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
    },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        rate: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'pending', 'paid', 'overdue'],
      default: 'draft',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    // --- NEW PAYMENT METHOD FIELD ---
    paymentMethod: {
      type: String,
      required: true,
      // Define the allowed values, with '-' as the default for "Not Paid"
      enum: ['-', 'Online', 'Cash', 'Bank Transfer', 'UPI'],
      default: '-',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// This index ensures that an invoice number is unique for each user.
invoiceSchema.index({ user: 1, invoiceNumber: 1 }, { unique: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;