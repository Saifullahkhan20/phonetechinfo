const Product = require('../models/Product');
const ApiFeatures = require('../utils/apiFeatures');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    // Build query
    let query = Product.find().populate('category brand');
    
    // Handle category filter
    if (req.query.category) {
      const categories = Array.isArray(req.query.category) 
        ? req.query.category 
        : [req.query.category];
      query = query.where('category').in(categories);
    }
    
    // Handle brand filter
    if (req.query.brand) {
      const brands = Array.isArray(req.query.brand) 
        ? req.query.brand 
        : [req.query.brand];
      query = query.where('brand').in(brands);
    }
    
    // Handle price range
    if (req.query.minPrice || req.query.maxPrice) {
      const priceFilter = {};
      if (req.query.minPrice) priceFilter.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) priceFilter.$lte = Number(req.query.maxPrice);
      query = query.where('price', priceFilter);
    }
    
    // Handle search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.or([
        { name: searchRegex },
        { description: searchRegex },
        { 'specs.display': searchRegex },
        { 'specs.processor': searchRegex }
      ]);
    }
    
    // Apply sorting
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      const sortOrder = {};
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortOrder[field.substring(1)] = -1;
        } else {
          sortOrder[field] = 1;
        }
      });
      query = query.sort(sortOrder);
    } else {
      // Default sort by createdAt
      query = query.sort('-createdAt');
    }
    
    // Apply pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const products = await query;
    
    // Get total count for pagination
    const total = await Product.countDocuments(query._conditions);
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    console.log('Getting product with ID:', req.params.id);
    
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid MongoDB ObjectID format');
      return res.status(404).json({
        success: false,
        message: `Invalid product ID format: ${req.params.id}`
      });
    }
    
    const product = await Product.findById(req.params.id)
      .populate('category brand');
    
    console.log('Product found:', product ? 'Yes' : 'No');
    
    if (!product) {
      console.log('Product not found with id:', req.params.id);
      return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
      });
    }
    
    console.log('Returning product data');
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error in getProduct:', error.message, error.stack);
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
      });
    }
    
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('category brand');
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id of ${req.params.id}`
      });
    }
    
    await product.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const products = await Product.find({ category: req.params.categoryId })
      .populate('category brand');
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by brand
// @route   GET /api/products/brand/:brandId
// @access  Public
exports.getProductsByBrand = async (req, res, next) => {
  try {
    const products = await Product.find({ brand: req.params.brandId })
      .populate('category brand');
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ featured: true })
      .populate('category brand')
      .limit(6);
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res, next) => {
  try {
    const searchQuery = req.query.q;
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    console.log('Search query:', searchQuery);
    
    // First, check if this is a brand search - common brands like Samsung, Apple, etc.
    // This handles cases where the user explicitly searches for a brand name
    const commonBrands = ['samsung', 'apple', 'google', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'huawei', 'xiaomi'];
    let brandSearch = false;
    
    // Check if the search query exactly matches a common brand
    if (commonBrands.includes(searchQuery.toLowerCase())) {
      brandSearch = true;
      console.log('Brand search detected for:', searchQuery);
      
      // Find the brand first
      const Brand = require('../models/Brand');
      const brand = await Brand.findOne({ 
        name: new RegExp(`^${searchQuery}$`, 'i') 
      });
      
      if (brand) {
        console.log('Found brand:', brand.name, 'with ID:', brand._id);
        // Get only products with this exact brand
        const products = await Product.find({ brand: brand._id })
          .populate('category brand');
          
        console.log(`Found ${products.length} products with brand "${searchQuery}"`);
        
        return res.status(200).json({
          success: true,
          count: products.length,
          data: products
        });
      }
    }
    
    // If not a direct brand search or brand not found, continue with regular search
    
    // Create both exact and fuzzy search patterns
    const exactMatch = new RegExp(`\\b${searchQuery}\\b`, 'i');  // Word boundary for exact matches
    const fuzzyMatch = new RegExp(searchQuery, 'i');
    
    // First, try to find products with exact matches in important fields
    let products = await Product.find({
      $or: [
        { name: exactMatch },
        { 'specs.model': exactMatch },
        { 'specs.processor': exactMatch }
      ]
    }).populate('category brand');
    
    // If no exact matches found, or if the query is very short (like 1-2 characters),
    // fall back to fuzzy search on more fields
    if (products.length === 0 || searchQuery.length < 3) {
      console.log('No exact matches found, trying fuzzy search');
      products = await Product.find({
        $or: [
          { name: fuzzyMatch },
          { description: fuzzyMatch },
          { 'specs.display': fuzzyMatch },
          { 'specs.processor': fuzzyMatch },
          { 'specs.storage': fuzzyMatch },
          { 'specs.ram': fuzzyMatch }
        ]
      }).populate('category brand');
    }
    
    console.log(`Found ${products.length} products matching "${searchQuery}"`);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Search error:', error);
    next(error);
  }
};

// @desc    Upload product image
// @route   POST /api/products/upload
// @access  Private/Admin
exports.uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    res.status(200).json({
      success: true,
      data: req.file.path
    });
  } catch (error) {
    next(error);
  }
};