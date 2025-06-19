const express = require("express");
const Review = require("../models/Review");
const router = express.Router();

// Add a review
router.post("/add", async (req, res) => {
  const { productId, name, rating, comment } = req.body;

  if (!productId || !name || !rating || !comment) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const review = new Review({ productId, name, rating, comment });
    await review.save();
    res.status(201).json({ message: "Review added successfully!", review });
  } catch (err) {
    res.status(500).json({ message: "Error adding review", error: err.message });
  }
});

// Get reviews for a product
router.get("/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ productId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reviews", error: err.message });
  }
});

module.exports = router;
