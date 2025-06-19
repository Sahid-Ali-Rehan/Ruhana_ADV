const express = require('express');
const router = express.Router();
const Order = require('../models/orderModal');
const Product = require('../models/Product');
const User = require('../models/User');

// Route to get the dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Fetch real-time data
    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();
    const usersCount = await User.countDocuments();

    // Sales data for the line chart (Example for the last 6 months)
    // Sales data for the line chart dynamically from orders
const salesData = await Order.aggregate([
    {
      $group: {
        _id: { $month: '$orderDate' },  // Assuming 'orderDate' is a date field in your Order model
        totalSales: { $sum: '$amount' }, // Assuming 'amount' is the sales amount field
      },
    },
    { $sort: { _id: 1 } },  // Sort by month ascending
  ]);
  
  // Format the data to match the line chart structure
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const salesValues = salesData.map((data) => data.totalSales);
  const monthsArray = salesData.map((data) => months[data._id - 1]);
  
  res.json({
    orders: ordersCount,
    products: productsCount,
    users: usersCount,
    salesData: {
      months: monthsArray,
      values: salesValues,
    },
  });
  
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router;
