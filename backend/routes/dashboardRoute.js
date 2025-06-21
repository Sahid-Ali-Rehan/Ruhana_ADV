const express = require('express');
const router = express.Router();
const Order = require('../models/orderModal');
const Product = require('../models/Product');
const User = require('../models/User');

// Route to get the dashboard stats
// Updated dashboard stats route
router.get('/stats', async (req, res) => {
  try {
    // Fetch real-time data
    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();
    const usersCount = await User.countDocuments();
    
    // Calculate total revenue from all orders
    const totalRevenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);
    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

    // Sales data for the line chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const salesData = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$orderDate" },
            year: { $year: "$orderDate" }
          },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    
    // Format the data for chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesValues = [];
    const monthsArray = [];
    
    // Fill in data for last 6 months
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const monthName = months[date.getMonth()];
      
      // Find matching data
      const monthData = salesData.find(d => 
        d._id.month === month && d._id.year === year
      );
      
      monthsArray.push(`${monthName} ${year}`);
      salesValues.push(monthData ? monthData.totalSales : 0);
    }
    
    // Calculate revenue change
    let revenueChange = 0;
    if (salesValues.length >= 2) {
      const current = salesValues[salesValues.length - 1];
      const previous = salesValues[salesValues.length - 2];
      
      if (previous > 0) {
        revenueChange = Math.round(((current - previous) / previous) * 100);
      } else if (current > 0) {
        revenueChange = 100;
      }
    }
    
    res.json({
      orders: ordersCount,
      products: productsCount,
      users: usersCount,
      totalRevenue,
      revenueChange,
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
