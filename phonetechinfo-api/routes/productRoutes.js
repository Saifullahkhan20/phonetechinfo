const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByBrand,
  getFeaturedProducts,
  uploadProductImage,
  searchProducts
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.route('/search').get(searchProducts);
router.route('/featured').get(getFeaturedProducts);
router.route('/category/:categoryId').get(getProductsByCategory);
router.route('/brand/:brandId').get(getProductsByBrand);
router.route('/').get(getProducts);

// Protected routes
router.route('/upload').post(protect, authorize('admin'), upload.single('image'), uploadProductImage);
router.route('/').post(protect, authorize('admin'), createProduct);
router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;