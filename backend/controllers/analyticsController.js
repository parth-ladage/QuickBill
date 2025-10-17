const asyncHandler = require('express-async-handler');
const Invoice = require('../models/Invoice');
const mongoose = require('mongoose');

// @desc    Get analytics summary for the logged-in user
// @route   GET /api/analytics/summary
// @access  Private
const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  // 1. Calculate Total and Outstanding Revenue
  const revenueStats = await Invoice.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$status',
        total: { $sum: '$totalAmount' },
      },
    },
  ]);

  let totalRevenue = 0;
  let outstandingRevenue = 0;
  revenueStats.forEach(stat => {
    if (stat._id === 'paid') {
      totalRevenue = stat.total;
    } else if (['pending', 'overdue', 'draft'].includes(stat._id)) {
      outstandingRevenue += stat.total;
    }
  });

  // 2. Calculate Invoice Status Breakdown
  const statusBreakdown = await Invoice.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // 3. Calculate Monthly Revenue for the last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlyRevenue = await Invoice.aggregate([
    {
      $match: {
        user: userId,
        status: 'paid',
        createdAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        total: { $sum: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Format monthly data for the chart (e.g., "10/2025")
  const formattedMonthlyData = monthlyRevenue.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    revenue: item.total,
  }));

  // --- TOP CLIENTS BY REVENUE ---
  const topClients = await Invoice.aggregate([
    { $match: { user: userId, status: 'paid' } },
    {
      $group: {
        _id: '$client',
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'clients',
        localField: '_id',
        foreignField: '_id',
        as: 'clientDetails',
      },
    },
    {
      $unwind: '$clientDetails',
    },
    {
      $project: {
        _id: 0,
        clientName: '$clientDetails.name',
        totalRevenue: 1,
      },
    },
  ]);

  res.json({
    totalRevenue,
    outstandingRevenue,
    statusBreakdown,
    monthlyRevenue: formattedMonthlyData,
    topClients,
  });
});

module.exports = {
  getAnalyticsSummary,
};

