const asyncHandler = require('express-async-handler');
const Client = require('../models/Client');

// @desc    Get all clients for a user, with optional search
// @route   GET /api/clients
// @access  Private
const getClients = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const query = { user: req.user.id };

  // --- NEW SEARCH LOGIC ---
  if (search) {
    // Add a case-insensitive regex search on the 'name' field
    query.name = { $regex: search, $options: 'i' };
  }
  // --- END OF SEARCH LOGIC ---

  const clients = await Client.find(query).sort({ name: 1 }); // Sort alphabetically
  res.json(clients);
});

// @desc    Create a new client
// @route   POST /api/clients
// @access  Private
const createClient = asyncHandler(async (req, res) => {
  const { name, email, phone, address } = req.body;

  if (!name || !email) {
    res.status(400);
    throw new Error('Please provide name and email');
  }

  const client = new Client({
    user: req.user.id,
    name,
    email,
    phone,
    address,
  });

  const createdClient = await client.save();
  res.status(201).json(createdClient);
});

// @desc    Get a single client by ID
// @route   GET /api/clients/:id
// @access  Private
const getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }
  // Ensure the user owns this client
  if (client.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }
  res.json(client);
});

// @desc    Update a client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = asyncHandler(async (req, res) => {
  const { name, email, phone, address } = req.body;

  const client = await Client.findById(req.params.id);

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  // Make sure the logged-in user owns this client
  if (client.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  client.name = name || client.name;
  client.email = email || client.email;
  client.phone = phone || client.phone;
  client.address = address || client.address;

  const updatedClient = await client.save();
  res.json(updatedClient);
});

// @desc    Delete a client
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  // Make sure the logged-in user owns this client
  if (client.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await client.deleteOne();
  res.json({ message: 'Client removed successfully' });
});


module.exports = {
  getClients,
  createClient,
  getClientById,
  updateClient,
  deleteClient,
};