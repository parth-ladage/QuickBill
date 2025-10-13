const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  getInvoiceAsHtml,
  updateInvoice,
  deleteInvoice,
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

// This route handles GET (fetch all) and POST (create new)
router.route('/').get(protect, getInvoices).post(protect, createInvoice);

router.route('/:id/html').get(protect, getInvoiceAsHtml);

// This route handles PUT (update by ID) and DELETE (delete by ID)
router
  .route('/:id')
  .get(protect, getInvoiceById)
  .put(protect, updateInvoice)
  .delete(protect, deleteInvoice);

module.exports = router;