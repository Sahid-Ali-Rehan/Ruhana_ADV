const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email address'],
  },
  phonenumber: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[+]?[0-9]{7,15}$/.test(v); // Valid international phone number
      },
      message: props => `${props.value} is not a valid phone number!`,
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function (v) {
        return /^[A-Za-z\d]{8,}$/.test(v); // At least 8 characters, only letters and numbers
      },
      message: 'Password must be at least 8 characters long and contain only letters and numbers.',
    },
  },

  isActive: {
    type: Boolean,
    default: true,
  },
  
  role: {
    type: String,
    default: 'customer',
    enum: ['customer', 'admin'],
  },
 
}, { timestamps: true });



// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
