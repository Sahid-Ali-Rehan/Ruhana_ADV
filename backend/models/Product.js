const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Remove images validation
images: {
  type: [String],
},
    availableColors: {
      type: [String],
    },
    // availableSizes: {
    //   type: [String],
    // },
    availableSizes: {
      type: [
        {
          size: { type: String, required: true },
          sizePrice: { type: Number, required: true, min: 0 },
        },
      ],
    },
    
    sizeChart: {
      type: String, // Size chart image URL
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
    },
    productCode: {
      type: String,
      required: true,
      unique: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    videoUrl: {
      type: String,
    },    
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
