const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  storeName: {
    type: String,
    required: true,
    trim: true,
  },
  storeUrlSlug: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Create a simple url slug from the store name before saving
userSchema.pre('save', function(next) {
  if (this.isModified('storeName') || this.isNew) {
    this.storeUrlSlug = this.storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
