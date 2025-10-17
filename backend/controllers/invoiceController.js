const asyncHandler = require('express-async-handler');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const User = require('../models/User');

// @desc    Create a new invoice with server-generated number
// @route   POST /api/invoices
// @access  Private
const createInvoice = asyncHandler(async (req, res) => {
  const { client, items, status, dueDate } = req.body;

  if (!client) {
    res.status(400);
    throw new Error('Client is required.');
  }
  if (!dueDate) {
    res.status(400);
    throw new Error('Due date is required.');
  }
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('Invoice must have at least one item.');
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;
  const searchPrefix = `INV-${datePrefix}-`;

  const lastInvoice = await Invoice.findOne({
    user: req.user.id,
    invoiceNumber: { $regex: `^${searchPrefix}` },
  }).sort({ createdAt: -1 });

  let sequenceNumber = 1;
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    sequenceNumber = lastSequence + 1;
  }

  const newInvoiceNumber = `${searchPrefix}${String(sequenceNumber).padStart(3, '0')}`;

  const totalAmount = items.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.rate || 0),
    0
  );

  const invoice = new Invoice({
    user: req.user.id,
    client,
    invoiceNumber: newInvoiceNumber,
    items,
    totalAmount,
    status: status || 'draft',
    dueDate,
  });

  const createdInvoice = await invoice.save();
  res.status(201).json(createdInvoice);
});

// @desc    Get all invoices for a user, with optional search and client filter
// @route   GET /api/invoices
// @access  Private
const getInvoices = asyncHandler(async (req, res) => {
  const { search, client } = req.query;
  const query = { user: req.user.id };

  // If a specific client ID is provided, add it to the main query
  if (client) {
    query.client = client;
  }

  // If a search term is provided, apply the search logic
  if (search) {
    // If we are already filtering by a client, we only need to search by invoice number.
    if (client) {
      query.invoiceNumber = { $regex: search, $options: 'i' };
    } else {
      // Otherwise (on the main dashboard), search by invoice number OR client name.
      const matchingClients = await Client.find({
        user: req.user.id,
        name: { $regex: search, $options: 'i' },
      });
      const clientIds = matchingClients.map(c => c._id);
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { client: { $in: clientIds } },
      ];
    }
  }

  const invoices = await Invoice.find(query)
    .populate('client', 'name')
    .sort({ createdAt: -1 });

  const processedInvoices = invoices.map(invoice => {
    const invObject = invoice.toObject();
    const today = new Date();
    today.setHours(0,0,0,0);
    if (invObject.status !== 'paid' && new Date(invObject.dueDate) < today) {
      invObject.status = 'overdue';
    }
    return invObject;
  });

  res.json(processedInvoices);
});

// @desc    Get a single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate('client', 'name');

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  if (invoice.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const invObject = invoice.toObject();
  const today = new Date();
  today.setHours(0,0,0,0);
  if (invObject.status !== 'paid' && new Date(invObject.dueDate) < today) {
    invObject.status = 'overdue';
  }

  res.json(invObject);
});


// @desc    Generate HTML for an invoice PDF
// @route   GET /api/invoices/:id/html
// @access  Private
const getInvoiceAsHtml = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('client')
    .populate('user');

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  if (invoice.user._id.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const { client, user, items, totalAmount, invoiceNumber, dueDate, paymentMethod } = invoice;
  const issuedDate = new Date(invoice.createdAt).toLocaleDateString();
  const dueDateFormatted = new Date(dueDate).toLocaleDateString();
  
  const subtotal = totalAmount;
  const platformFee = subtotal * 0.005;
  let gstHtml = '';
  let grandTotal = subtotal + platformFee;

  if (user.isGstEnabled && user.gstPercentage > 0) {
    const gstAmount = subtotal * (user.gstPercentage / 100);
    grandTotal += gstAmount;
    gstHtml = `
      <tr class="total">
          <td colspan="2"></td>
          <td class="text-right">GST (${user.gstPercentage}%):</td>
          <td class="text-right">₹${gstAmount.toFixed(2)}</td>
      </tr>
    `;
  }
  
  let paymentMethodHtml = '';
  if (invoice.status === 'paid' && paymentMethod !== '-') {
    paymentMethodHtml = `
      <tr>
        <td colspan="4" style="padding-bottom: 20px;">
          <strong>Payment Method:</strong> ${paymentMethod}
        </td>
      </tr>
    `;
  }

  const itemsHtml = items.map(item => `
    <tr class="item">
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>₹${item.rate.toFixed(2)}</td>
      <td class="text-right">₹${(item.quantity * item.rate).toFixed(2)}</td>
    </tr>
  `).join('');

  const logoHtml = user.logoUrl 
    ? `<img src="${user.logoUrl}" style="width: 100%; max-width: 150px" />` 
    : `<h2 class="company-name">${user.companyName}</h2>`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <title>Invoice ${invoiceNumber}</title>
        <style>
            :root { --theme-color: #6200ee; }
            body { font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #555; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; line-height: 24px; }
            .invoice-box table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
            .invoice-box table td { padding: 8px; vertical-align: top; }
            .invoice-box table tr.top table td { padding-bottom: 20px; }
            .invoice-box table tr.top table td.title { font-size: 30px; line-height: 30px; color: #333; }
            .company-name { color: var(--theme-color); margin: 0; }
            .invoice-box table tr.information td { padding-bottom: 20px; }
            .invoice-box table tr.heading td { background: var(--theme-color); color: #fff; border: 1px solid var(--theme-color); font-weight: bold; }
            .invoice-box table tr.item td { border-bottom: 1px solid #eee; }
            .invoice-box table tr.total td { border-top: 1px solid #eee; }
            .grand-total td { border-top: 2px solid var(--theme-color); font-weight: bold; }
            .text-right { text-align: right; }
            .watermark { text-align: center; padding-top: 20px; padding-bottom: 20px; font-size: 12px; color: #ccc; }
        </style>
    </head>
    <body>
        <div class="invoice-box">
            <table cellpadding="0" cellspacing="0">
                <tr class="top">
                    <td colspan="4">
                        <table>
                            <tr>
                                <td class="title">${logoHtml}</td>
                                <td class="text-right">
                                    <strong>Invoice #:</strong> ${invoiceNumber}<br />
                                    <strong>Created:</strong> ${issuedDate}<br />
                                    <strong>Due:</strong> ${dueDateFormatted}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr class="information">
                    <td colspan="4">
                        <strong>Bill To:</strong><br />
                        ${client.name}<br />
                        ${client.email || ''}<br />
                        ${client.address || ''}
                    </td>
                </tr>
                ${paymentMethodHtml}
                <tr class="heading">
                    <td>Description</td>
                    <td>Quantity</td>
                    <td>Rate</td>
                    <td class="text-right">Amount</td>
                </tr>
                ${itemsHtml}
                <tr class="total">
                    <td colspan="2"></td>
                    <td class="text-right">Subtotal:</td>
                    <td class="text-right">₹${subtotal.toFixed(2)}</td>
                </tr>
                ${gstHtml}
                <tr class="total">
                    <td colspan="2"></td>
                    <td class="text-right">Platform Fee (0.5%):</td>
                    <td class="text-right">₹${platformFee.toFixed(2)}</td>
                </tr>
                <tr class="total grand-total">
                    <td colspan="2"></td>
                    <td class="text-right"><strong>Grand Total:</strong></td>
                    <td class="text-right"><strong>₹${grandTotal.toFixed(2)}</strong></td>
                </tr>
                <tr class="notes">
                    <td colspan="4" style="text-align: center; padding-top: 40px; font-style: italic;">
                        Thank you for your business!
                    </td>
                </tr>
            </table>
        </div>
        <div class="watermark">Generated by QuickBill</div>
    </body>
    </html>
  `;
  res.send({ html });
});


// @desc    Update an invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = asyncHandler(async (req, res) => {
  const { items, status, dueDate, paymentMethod } = req.body;
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  if (invoice.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  invoice.items = items || invoice.items;
  invoice.status = status || invoice.status;
  invoice.dueDate = dueDate || invoice.dueDate;
  
  if (status === 'paid') {
    invoice.paymentMethod = paymentMethod || invoice.paymentMethod;
  } else {
    invoice.paymentMethod = '-';
  }

  if (items) {
    invoice.totalAmount = items.reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.rate || 0),
      0
    );
  }

  const updatedInvoice = await invoice.save();
  res.json(updatedInvoice);
});

// @desc    Delete an invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }
  if (invoice.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }
  await invoice.deleteOne();
  res.json({ message: 'Invoice removed successfully' });
});


module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  getInvoiceAsHtml,
  updateInvoice,
  deleteInvoice,
};

