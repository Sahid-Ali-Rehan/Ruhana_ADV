const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories in frontend format
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    
    // Format for frontend
    const response = {
      categories: {},
      labels: {}
    };
    
    categories.forEach(category => {
      response.categories[category.key] = category.subcategories;
      response.labels[category.key] = category.name;
    });
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new category
router.post('/add', async (req, res) => {
  try {
    const { key, name } = req.body;
    
    const newCategory = new Category({
      key,
      name,
      subcategories: []
    });
    
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category
router.delete('/:key', async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ key: req.params.key });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add subcategory to category
router.post('/:key/subcategories', async (req, res) => {
  try {
    const { name, link } = req.body;
    const category = await Category.findOne({ key: req.params.key });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check for duplicate
    if (category.subcategories.some(sc => sc.name === name)) {
      return res.status(400).json({ message: 'Subcategory already exists' });
    }
    
    category.subcategories.push({ name, link });
    await category.save();
    
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete subcategory from category
router.delete('/:key/subcategories/:index', async (req, res) => {
  try {
    const category = await Category.findOne({ key: req.params.key });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const index = parseInt(req.params.index);
    if (isNaN(index) || index < 0 || index >= category.subcategories.length) {
      return res.status(400).json({ message: 'Invalid subcategory index' });
    }
    
    category.subcategories.splice(index, 1);
    await category.save();
    
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;