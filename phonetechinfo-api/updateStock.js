const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function updateStock() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const productId = '682310f5030d30905d8ef06a'; // iPhone 15 Pro

    const result = await Product.findByIdAndUpdate(
      productId,
      { $set: { countInStock: 10 } },
      { new: true }
    );

    if (result) {
      console.log('Stock updated:', result);
    } else {
      console.log('Product not found.');
    }
    process.exit();
  } catch (err) {
    console.error('Error updating stock:', err);
    process.exit(1);
  }
}

updateStock(); 