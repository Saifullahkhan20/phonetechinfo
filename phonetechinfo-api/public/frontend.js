// Global state management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

// Product management
async function fetchProducts() {
    try {
        // Fetch products from backend API
        const response = await window.api.getProducts();
        if (response.success) {
            products = response.data;
            displayProducts(products);
        } else {
            showError('Failed to load products. Please try again later.');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products. Please try again later.');
    }
}

function displayProducts(products) {
    // Use 'search-results' if it exists, otherwise fallback to 'products-container'
    const container = document.getElementById('search-results') || document.getElementById('products-container');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No products found</div>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card card shadow-sm">
            <img src="${product.mainImage || product.image}" alt="${product.name}" class="product-image card-img-top">
            <div class="product-info card-body d-flex flex-column">
                <h3 class="card-title">${product.name}</h3>
                <div class="d-flex align-items-center mb-2">
                    <span class="text-warning me-2">${'★'.repeat(Math.floor(product.rating || 0))}</span>
                    <span class="text-muted">(${product.rating || 0}/5)</span>
                </div>
                <p class="price text-primary">Rs ${product.price.toLocaleString()}</p>
                <p class="description">${product.description}</p>
                <div class="product-meta mb-2">
                    <span class="brand">${product.brand?.name || ''}</span>
                    <span class="category">${product.category?.name || ''}</span>
                </div>
                <div class="mt-auto d-flex gap-2">
                    <button onclick="addToCart('${product._id || product.id}', 1)" class="btn btn-success flex-fill">Add to Cart</button>
                    <a href="product.html?id=${product._id || product.id}" class="btn btn-outline-primary flex-fill">View Details</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Cart management
async function addToCart(productId, quantity = 1) {
    const token = localStorage.getItem('token');
    
    if (token) {
        // User is logged in, use API
        try {
            const response = await window.api.addToCart(productId, quantity);
            if (response.success) {
                showNotification('Product added to cart!');
                // Update cart count from response
                updateCartCount();
            } else {
                showError('Failed to add to cart: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showError('Failed to add to cart. Please try again.');
        }
    } else {
        // User is not logged in, use local storage
        const product = products.find(p => p._id === productId || p.id === productId);
        if (!product) {
            showError('Product not found');
            return;
        }

        const existingItem = cart.find(item => item.id === productId || item._id === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ 
                ...product, 
                id: product._id || product.id,
                quantity: quantity 
            });
        }

        saveCart();
        updateCartCount();
        showNotification('Product added to cart!');
        
        // Ask user to login to save their cart
        setTimeout(() => {
            if (!localStorage.getItem('cartLoginPromptShown')) {
                if (confirm('Sign in to save your cart and checkout. Would you like to sign in now?')) {
                    window.location.href = 'signinPage.html';
                }
                localStorage.setItem('cartLoginPromptShown', 'true');
            }
        }, 1000);
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    showNotification('Product removed from cart!');
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

async function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (!cartCount) return;

    const token = localStorage.getItem('token');
    
    if (token) {
        // User is logged in, fetch cart from API
        try {
            const response = await window.api.getCart();
            if (response.success) {
                const items = response.data;
                const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
                cartCount.textContent = totalItems;
            }
        } catch (error) {
            console.error('Error fetching cart count:', error);
            // Fall back to local storage if API fails
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    } else {
        // User is not logged in, use local storage
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// UI Helpers
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.textContent = message;
    document.body.insertBefore(errorDiv, document.body.firstChild);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Authentication state management
function checkAuth() {
    const token = localStorage.getItem('token');
    const profileLink = document.getElementById('profileLink');
    const signInLink = document.getElementById('signInLink');
    
    if (token) {
        if (profileLink) profileLink.style.display = 'block';
        if (signInLink) signInLink.style.display = 'none';
    } else {
        if (profileLink) profileLink.style.display = 'none';
        if (signInLink) signInLink.style.display = 'block';
    }
}

// Define updateResults globally so it can be overridden if needed
window.updateResults = async function() {
    const searchForm = document.getElementById('searchForm');
    const filterForm = document.getElementById('filterForm');
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('search-results');
    const resultCount = document.getElementById('resultCount');
    const searchQuerySpan = document.getElementById('searchQuery');

    const query = searchInput ? searchInput.value.trim() : '';
    const formData = filterForm ? new FormData(filterForm) : null;
    const categories = formData ? formData.getAll('category').map(c => c.toLowerCase()) : [];
    const brands = formData ? formData.getAll('brand').map(b => b.toLowerCase()) : [];
    const minPrice = formData ? formData.get('minPrice') : '';
    const maxPrice = formData ? formData.get('maxPrice') : '';

    // Build filters for API
    const filters = {};
    if (query) filters.search = query;
    if (categories.length > 0) filters.category = categories;
    if (brands.length > 0) filters.brand = brands;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;

    try {
        const response = await window.api.getProducts(filters);
        if (response.success) {
            if (resultsContainer) displayProducts(response.data);
            if (resultCount) resultCount.textContent = response.data.length;
            if (searchQuerySpan) searchQuerySpan.textContent = query;
        } else {
            if (resultsContainer) resultsContainer.innerHTML = '<div class="alert alert-info">No products found</div>';
            if (resultCount) resultCount.textContent = '0';
            if (searchQuerySpan) searchQuerySpan.textContent = query;
        }
    } catch (error) {
        if (resultsContainer) resultsContainer.innerHTML = '<div class="alert alert-danger">Failed to fetch products</div>';
        if (resultCount) resultCount.textContent = '0';
        if (searchQuerySpan) searchQuerySpan.textContent = query;
    }
};

// Update your search and filter event handlers:
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const filterForm = document.getElementById('filterForm');

    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            window.updateResults();
        });
    }

    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            window.updateResults();
        });
    }

    // Only run updateResults automatically on pages other than search-results.html
    if (!window.location.pathname.includes('search-results.html')) {
        // Initial display
        window.updateResults();
    }
});

// Fetch and populate brand filters dynamically
async function populateBrandFilters() {
    const brandContainer = document.getElementById('brandFilters');
    if (!brandContainer) return;
    try {
        const response = await window.api.getBrands();
        if (response.success) {
            const brands = response.data;
            brandContainer.innerHTML = brands.map(brand =>
                `<div class="form-check">
                    <input class="form-check-input" type="checkbox" name="brand" value="${brand._id}" id="brand-${brand._id}">
                    <label class="form-check-label" for="brand-${brand._id}">${brand.name}</label>
                </div>`
            ).join('');
        } else {
            brandContainer.innerHTML = '<div class="text-danger">Failed to load brands</div>';
        }
    } catch (error) {
        brandContainer.innerHTML = '<div class="text-danger">Failed to load brands</div>';
    }
}

// Fetch and populate category filters dynamically
async function populateCategoryFilters() {
    const categoryContainer = document.getElementById('categoryFilters');
    if (!categoryContainer) return;
    try {
        const response = await window.api.getCategories();
        if (response.success) {
            const categories = response.data;
            categoryContainer.innerHTML = categories.map(category =>
                `<div class="form-check">
                    <input class="form-check-input" type="checkbox" name="category" value="${category._id}" id="category-${category._id}">
                    <label class="form-check-label" for="category-${category._id}">${category.name}</label>
                </div>`
            ).join('');
        } else {
            categoryContainer.innerHTML = '<div class="text-danger">Failed to load categories</div>';
        }
    } catch (error) {
        categoryContainer.innerHTML = '<div class="text-danger">Failed to load categories</div>';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    await updateCartCount();
    
    // If we're on a page with products, fetch them
    if (document.getElementById('products-container')) {
        fetchProducts();
    }
}); 