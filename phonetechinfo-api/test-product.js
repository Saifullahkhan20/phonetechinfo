require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function testProductLookup() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGO_URI ? 'URI is set' : 'URI is not set');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // List some products
    console.log('\nListing all products:');
    const allProducts = await Product.find().limit(10);
    console.log(`Found ${allProducts.length} products:`);
    allProducts.forEach(product => {
      console.log(`- ID: ${product._id}, Name: ${product.name}`);
    });
    
    // Try to find the specific product
    const productId = '682310f5030d30905d8ef06d';
    console.log(`\nLooking for product with ID: ${productId}`);
    
    const product = await Product.findById(productId);
    if (product) {
      console.log('Product found:');
      console.log({
        id: product._id,
        name: product.name,
        price: product.price,
        brand: product.brand,
        category: product.category
      });
    } else {
      console.log('Product not found with that ID');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testProductLookup(); 