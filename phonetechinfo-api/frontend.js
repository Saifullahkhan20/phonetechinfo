// Frontend JavaScript for PhoneInfotec website

// Fetch and display products for homepage
async function fetchProducts() {
  try {
    // Get category filter from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    // Build filters object
    const filters = {};
    if (category) {
      filters.category = category;
    }
    
    const response = await window.api.getProducts(filters);
    if (response.success) {
      displayProducts(response.data);
    } else {
      console.error('Error fetching products:', response.error);
      showError('Failed to load products');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    showError('Failed to load products');
  }
}

// Display products on the homepage
function displayProducts(products) {
  const productsContainer = document.getElementById('products-container');
  if (!productsContainer) return;

  // Group products by category
  const phones = products.filter(product => product.category.name.toLowerCase() === 'phone');
  const laptops = products.filter(product => product.category.name.toLowerCase() === 'laptop');

  // Clear container
  productsContainer.innerHTML = '';

  // Display phones section if there are phones
  if (phones.length > 0) {
    const phonesSection = document.createElement('div');
    phonesSection.innerHTML = `
      <h2 class="category-title" id="phones">Phones</h2>
      <div class="row g-4" id="phones-container"></div>
    `;
    productsContainer.appendChild(phonesSection);
    displayProductCards(phones, 'phones-container');
  }

  // Display laptops section if there are laptops
  if (laptops.length > 0) {
    const laptopsSection = document.createElement('div');
    laptopsSection.innerHTML = `
      <h2 class="category-title" id="laptops">Laptops</h2>
      <div class="row g-4" id="laptops-container"></div>
    `;
    productsContainer.appendChild(laptopsSection);
    displayProductCards(laptops, 'laptops-container');
  }
}

// Display product cards in a container
function displayProductCards(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'col-md-4 mb-4';
    
    // Get relevant specs based on category
    const specs = product.specs || {};
    const displaySpecs = Object.entries(specs)
      .filter(([key]) => {
        // Show different specs for phones vs laptops
        if (product.category.name.toLowerCase() === 'phone') {
          return ['display', 'processor', 'camera', 'battery', 'storage'].includes(key);
        } else {
          return ['display', 'processor', 'ram', 'storage', 'graphics'].includes(key);
        }
      })
      .slice(0, 5)
      .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
      .join('');

    productCard.innerHTML = `
      <div class="card product-card h-100">
        <img src="${product.mainImage}" class="card-img-top" alt="${product.name}" 
             style="height: 200px; object-fit: cover;">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="text-primary h4">Rs ${product.price.toLocaleString()}</p>
          <div class="specs-preview">
            <ul class="list-unstyled">
              ${displaySpecs}
            </ul>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <a href="product.html?id=${product._id}" class="btn btn-primary">View Details</a>
            <button onclick="addToCart('${product._id}', 1)" class="btn btn-outline-primary">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(productCard);
  });
}

// Search functionality
async function searchProducts(query) {
  try {
    const response = await window.api.searchProducts(query);
    if (response.success) {
      displaySearchResults(response.data);
    } else {
      showError('No products found');
    }
  } catch (error) {
    console.error('Error searching products:', error);
    showError('Search failed');
  }
}

// Display search results
function displaySearchResults(products) {
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;

  if (products.length === 0) {
    resultsContainer.innerHTML = '<div class="alert alert-info">No products found</div>';
    return;
  }

  // Group products by category
  const phones = products.filter(product => product.category.name.toLowerCase() === 'phone');
  const laptops = products.filter(product => product.category.name.toLowerCase() === 'laptop');

  let html = '';

  // Display phones section if there are phones
  if (phones.length > 0) {
    html += `
      <h3 class="mt-4">Phones</h3>
      <div class="row g-4">
        ${phones.map(product => createProductCard(product)).join('')}
      </div>
    `;
  }

  // Display laptops section if there are laptops
  if (laptops.length > 0) {
    html += `
      <h3 class="mt-4">Laptops</h3>
      <div class="row g-4">
        ${laptops.map(product => createProductCard(product)).join('')}
      </div>
    `;
  }

  resultsContainer.innerHTML = html;
}

// Create a product card HTML
function createProductCard(product) {
  const specs = product.specs || {};
  const displaySpecs = Object.entries(specs)
    .filter(([key]) => {
      if (product.category.name.toLowerCase() === 'phone') {
        return ['display', 'processor', 'camera', 'battery', 'storage'].includes(key);
      } else {
        return ['display', 'processor', 'ram', 'storage', 'graphics'].includes(key);
      }
    })
    .slice(0, 3)
    .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
    .join('');

  return `
    <div class="col-md-4 mb-4">
      <div class="card product-card h-100">
        <img src="${product.mainImage}" class="card-img-top" alt="${product.name}"
             style="height: 200px; object-fit: cover;">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="text-primary h4">Rs ${product.price.toLocaleString()}</p>
          <div class="specs-preview">
            <ul class="list-unstyled">
              ${displaySpecs}
            </ul>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <a href="product.html?id=${product._id}" class="btn btn-primary">View Details</a>
            <button onclick="addToCart('${product._id}', 1)" class="btn btn-outline-primary">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Initialize search form
function initSearch() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const filterForm = document.getElementById('filterForm');

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        searchProducts(query);
      }
    });
  }

  // Initialize filters if they exist
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(filterForm);
      const filters = {};
      
      // Get category filters
      const categories = formData.getAll('category');
      if (categories.length > 0) {
        filters.category = categories;
      }
      
      // Get price range
      const minPrice = formData.get('minPrice');
      const maxPrice = formData.get('maxPrice');
      if (minPrice) filters.minPrice = minPrice;
      if (maxPrice) filters.maxPrice = maxPrice;
      
      // Get brand filters
      const brands = formData.getAll('brand');
      if (brands.length > 0) {
        filters.brand = brands;
      }
      
      // Apply filters
      applyFilters(filters);
    });
  }
}

// Apply filters to products
async function applyFilters(filters) {
  try {
    const response = await window.api.getProducts(filters);
    if (response.success) {
      displaySearchResults(response.data);
    } else {
      showError('No products found');
    }
  } catch (error) {
    console.error('Error applying filters:', error);
    showError('Failed to apply filters');
  }
}

// Utility functions
function showError(message) {
  // You can implement a proper toast/notification system here
  alert(message);
}

function showSuccess(message) {
  // You can implement a proper toast/notification system here
  alert(message);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
  // Load products on homepage
  if (document.getElementById('products-container')) {
    await fetchProducts();
  }

  // Initialize search if on search page
  if (document.getElementById('searchForm')) {
    initSearch();
  }

  // Update cart count
  await updateCartCount();
});

// Update cart count in header
async function updateCartCount() {
  try {
    const response = await window.api.getCart();
    if (response.success) {
      const cartCount = document.getElementById('cartCount');
      if (cartCount) {
        const totalItems = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
      }
    }
  } catch (error) {
    console.error('Error updating cart count:', error);
  }
}