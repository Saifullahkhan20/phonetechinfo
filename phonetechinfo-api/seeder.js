const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const db = require('./config/db');

dotenv.config();

db();

async function seed() {
  try {
    // Clear existing data
    await Product.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();

    // Create categories
    const phoneCategory = await Category.create({ name: 'Phone' });
    const laptopCategory = await Category.create({ name: 'Laptop' });

    // Create brands
    const apple = await Brand.create({ name: 'Apple' });
    const samsung = await Brand.create({ name: 'Samsung' });
    const google = await Brand.create({ name: 'Google' });
    const dell = await Brand.create({ name: 'Dell' });

    // Sample products
    const products = [
      {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        price: 250000,
        category: phoneCategory._id,
        brand: apple._id,
        mainImage: 'https://th.bing.com/th/id/OIP.pwx5UJMVOenBvTR440Iw0AHaHa?w=158&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
        specs: {
          display: '6.1" Super Retina XDR',
          processor: 'A17 Bionic Chip',
          camera: '48MP Main + 12MP Ultra Wide',
          battery: '3200mAh',
          storage: '128GB/256GB/512GB'
        },
        description: 'The latest iPhone with advanced features.'
      },
      {
        name: 'Samsung Galaxy S23 Ultra',
        slug: 'samsung-galaxy-s23-ultra',
        price: 110099,
        category: phoneCategory._id,
        brand: samsung._id,
        mainImage: 'https://th.bing.com/th/id/OIP.d_37IJDKLPKPUiaivYkUiQHaHk?w=174&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
        specs: {
          display: '6.8" Dynamic AMOLED',
          processor: 'Snapdragon 8 Gen 2',
          camera: '200MP Main + 12MP Ultra Wide',
          battery: '5000mAh',
          storage: '256GB/512GB/1TB'
        },
        description: 'Flagship Samsung phone with powerful camera.'
      },
      {
        name: 'Google Pixel 8 Pro',
        slug: 'google-pixel-8-pro',
        price: 599999,
        category: phoneCategory._id,
        brand: google._id,
        mainImage: 'https://th.bing.com/th/id/OIP.eWpYeRpy7iqft3IYVxlhgAHaHa?w=173&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
        specs: {
          display: '6.7" OLED',
          processor: 'Tensor G3',
          camera: '50MP Main + 12MP Ultra Wide',
          battery: '4500mAh',
          storage: '128GB/256GB'
        },
        description: "Google's latest flagship with AI features."
      },
      {
        name: 'MacBook Pro 16"',
        slug: 'macbook-pro-16',
        price: 350000,
        category: laptopCategory._id,
        brand: apple._id,
        mainImage: 'https://th.bing.com/th/id/OIP.DSzKHWsLWAbL1X5IsOnEvgHaEK?w=283&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
        specs: {
          display: '16" Retina Display',
          processor: 'M2 Pro Chip',
          ram: '16GB',
          storage: '512GB SSD',
          graphics: 'Apple GPU'
        },
        description: 'High-performance laptop for professionals.'
      },
      {
        name: 'Dell XPS 15',
        slug: 'dell-xps-15',
        price: 280000,
        category: laptopCategory._id,
        brand: dell._id,
        mainImage: 'https://th.bing.com/th/id/OIP.ohmnPhkbtA_4dkwgbyhTUQHaEK?w=283&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
        specs: {
          display: '15.6" 4K Display',
          processor: 'Intel i7 12th Gen',
          ram: '16GB',
          storage: '1TB SSD',
          graphics: 'NVIDIA GTX 1650'
        },
        description: 'Premium Windows laptop with stunning display.'
      }
    ];

    await Product.insertMany(products);
    console.log('Database seeded!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed(); 