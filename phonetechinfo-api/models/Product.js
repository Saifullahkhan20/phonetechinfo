const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be positive']
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true
  },
  brand: {
    type: mongoose.Schema.ObjectId,
    ref: 'Brand',
    required: true
  },
  specs: {
    display: String,
    processor: String,
    camera: String,
    battery: String,
    storage: String,
    os: String,
    waterResistance: String,
    ram: String,
    graphics: String
  },
  images: [String],
  mainImage: {
    type: String,
    required: [true, 'Please add a main image']
  },
  colors: [String],
  countInStock: {
    type: Number,
    required: [true, 'Please add count in stock'],
    min: [0, 'Count in stock must be positive'],
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictPopulate: false
});

// Create product slug from the name
ProductSchema.pre('save', function(next) {
  this.slug = this.name.toLowerCase().split(' ').join('-');
  next();
});

module.exports = mongoose.model('Product', ProductSchema);