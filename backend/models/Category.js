const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  subcategories: [{
    name: String,
    link: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);