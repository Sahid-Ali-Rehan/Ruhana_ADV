const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { fullname, email, phonenumber, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = new User({ fullname, email, phonenumber, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error); // Log the full error
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Login
// Login
// Login route in backend (adjusted)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ message: 'Login successful', token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});



// Logout (example placeholder)
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
