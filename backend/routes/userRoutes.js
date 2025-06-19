const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Fetch all users
router.get('/fetch-users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    const userData = users.map(user => ({
      username: user.fullname, // Assuming fullname is used as username
      email: user.email,
      uid: user._id,
      role: user.role
    }));
    res.status(200).json(userData); // Return user data
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Change user role (admin/customer)
router.put('/role/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle the role
    user.role = user.role === 'customer' ? 'admin' : 'customer';

    // Skip password validation
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: 'User role updated', user });
  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete a user
// Delete a user
// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract user ID from the URL params
    const user = await User.findById(id); // Find the user by ID

    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // If user not found, return error
    }

    // Use findByIdAndDelete for deletion
    await User.findByIdAndDelete(id); // Delete the user by ID
    res.status(200).json({ message: 'User deleted successfully' }); // Return success message
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error }); // Handle any errors that may occur
  }
});

// Fetch Single User Data by ID
// router.get('/:id', authMiddleware, async (req, res) => {
//   try {
//     console.log("Received request to fetch user with ID:", req.params.id); // Log user ID from request

//     const { id } = req.params; // Fetch the ID from the URL parameter
//     const user = await User.findById(id); // Find the user by ID in the database

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' }); // If user is not found, return a 404
//     }

//     res.status(200).json({ message: 'User fetched successfully', user }); // Send user data
//   } catch (error) {
//     console.error("Error fetching user:", error); // Log the error for debugging
//     res.status(500).json({ message: 'Server error', error }); // Send server error
//   }
// });

// Fetch a Single User Data by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    console.log("Received request to fetch user with ID:", req.params.id); // Log user ID from request

    const { id } = req.params; // Fetch the ID from the URL parameter
    const user = await User.findById(id); // Find the user by ID in the database

    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // If user is not found, return a 404
    }

    res.status(200).json({ message: 'User fetched successfully', user }); // Send user data
  } catch (error) {
    console.error("Error fetching user:", error); // Log the error for debugging
    res.status(500).json({ message: 'Server error', error }); // Send server error
  }
});




// Fetch orders for the logged-in user

// Fetch all orders for a user
router.get("/user-orders", async (req, res) => {
  try {
    const userId = req.user._id; // Extract user ID from authenticated request
    const orders = await Order.find({ userId }).populate("items.productId"); // Populate product details
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


// Update order status
router.put("/update-status/:id",  async (req, res) => {
  try {
    const { id } = req.params; // Extract order ID from URL params
    const { status } = req.body; // Get new status from the request body

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status; // Update order status
    await order.save();

    res.status(200).json({ message: "Order status updated successfully", status: order.status });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error", error });
  }
});



// Add to wishlist
router.post('/wishlist/:productId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const productId = req.params.productId;
    const index = user.wishlist.indexOf(productId);

    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get wishlist
router.get('/wishlist', authMiddleware, async (req, res) => {
  try {
    
const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});



module.exports = router;
