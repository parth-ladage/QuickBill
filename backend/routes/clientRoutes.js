const express = require('express');
const router = express.Router();
const {
  getClients,
  createClient,
  getClientById,
  updateClient, // Import the new functions
  deleteClient,
} = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');

// This route handles GET (fetch all) and POST (create new)
router.route('/').get(protect, getClients).post(protect, createClient);

// This route handles PUT (update by ID) and DELETE (delete by ID)
router
  .route('/:id')
  .get(protect, getClientById)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

module.exports = router;