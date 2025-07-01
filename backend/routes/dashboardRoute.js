const express = require('express');
const router = express.Router();
const Order = require('../models/orderModal');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');

// Route to get the dashboard stats
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

// Best Selling Products with REAL ratings
router.get('/best-sellers', async (req, res) => {
  try {
    const bestSellers = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      // Get real ratings from reviews
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "productId",
          as: "reviews"
        }
      },
      {
        $addFields: {
          avgRating: { $avg: "$reviews.rating" }
        }
      },
      {
        $project: {
          name: "$product.productName",
          sold: "$totalSold",
          revenue: "$totalRevenue",
          price: "$product.price",
          rating: { $ifNull: ["$avgRating", 0] } // Use real rating
        }
      }
    ]);

    res.json(bestSellers);
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    res.status(500).json({ message: 'Error fetching best sellers', error: error.message });
  }
});

// REAL Sales Performance Metrics
router.get('/sales-performance', async (req, res) => {
  try {
    // Calculate conversion rate (orders/visitors)
    const ordersCount = await Order.countDocuments();
    const visitorsCount = await User.countDocuments(); // Real visitor count
    const conversionRate = ordersCount > 0 ? Math.round((ordersCount / visitorsCount) * 100) : 0;
    
    // Calculate average order value
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const avgOrderValue = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0;
    
    // Calculate REAL customer retention
    const repeatCustomers = await Order.aggregate([
      { $group: { _id: "$userId", orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: "repeatCustomers" }
    ]);
    const retentionRate = ordersCount > 0 
      ? Math.round((repeatCustomers[0]?.repeatCustomers || 0) / ordersCount * 100) 
      : 0;

    // Calculate REAL cart abandonment
    const abandonedCarts = await User.countDocuments({ 
      $where: "this.cartItems && this.cartItems.length > 0" 
    });
    const cartAbandonmentRate = ordersCount > 0 
      ? Math.round(abandonedCarts / (abandonedCarts + ordersCount) * 100) 
      : 0;

    res.json({
      conversionRate,
      avgOrderValue,
      retentionRate,
      abandonmentRate: cartAbandonmentRate,
      conversionChange: 0, // Removed fake percentage changes
      avgOrderValueChange: 0,
      retentionChange: 0,
      abandonmentChange: 0
    });
  } catch (error) {
    console.error('Error fetching sales performance:', error);
    res.status(500).json({ message: 'Error fetching sales performance', error: error.message });
  }
});

// REAL Sales Distribution
router.get('/sales-distribution', async (req, res) => {
  try {
    const distribution = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format for chart
    const statusMap = {
      'Delivered': 'Completed',
      'Pending': 'Pending',
      'Cancelled': 'Cancelled',
      'CancellationRequested': 'Cancelled'
    };
    
    const formatted = distribution.reduce((acc, item) => {
      const status = statusMap[item._id] || 'Other';
      acc[status] = (acc[status] || 0) + item.count;
      return acc;
    }, {});
    
    const total = Object.values(formatted).reduce((sum, val) => sum + val, 0);
    
    res.json({
      data: [
        { status: 'Completed', count: formatted.Completed || 0, percent: total > 0 ? Math.round((formatted.Completed || 0) / total * 100) : 0 },
        { status: 'Pending', count: formatted.Pending || 0, percent: total > 0 ? Math.round((formatted.Pending || 0) / total * 100) : 0 },
        { status: 'Cancelled', count: formatted.Cancelled || 0, percent: total > 0 ? Math.round((formatted.Cancelled || 0) / total * 100) : 0 }
      ],
      total
    });
  } catch (error) {
    console.error('Error fetching sales distribution:', error);
    res.status(500).json({ message: 'Error fetching sales distribution', error: error.message });
  }
});

// REAL Sales by Category
router.get('/sales-by-category', async (req, res) => {
  try {
    const salesByCategory = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          totalSales: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 }
    ]);
    
    res.json(salesByCategory);
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    res.status(500).json({ message: 'Error fetching sales by category', error: error.message });
  }
});

module.exports = router;