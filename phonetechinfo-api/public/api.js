// API service for PhoneInfotec website
const API_BASE_URL = 'http://localhost:5000/api';

// Authentication functions
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function register(name, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

async function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Product functions
async function getProducts(filters = {}) {
  try {
    // Convert filters object to URL parameters
    const params = new URLSearchParams();
    
    // Handle category filter (can be array)
    if (filters.category) {
      if (Array.isArray(filters.category)) {
        filters.category.forEach(cat => params.append('category', cat));
      } else {
        params.append('category', filters.category);
      }
    }
    
    // Handle brand filter (can be array)
    if (filters.brand) {
      if (Array.isArray(filters.brand)) {
        filters.brand.forEach(brand => params.append('brand', brand));
      } else {
        params.append('brand', filters.brand);
      }
    }
    
    // Handle price range
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    
    // Handle search query
    if (filters.search) params.append('search', filters.search);
    
    // Handle sorting
    if (filters.sort) params.append('sort', filters.sort);
    
    // Handle pagination
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

async function getProductById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

// Cart functions
async function getCart() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { success: true, data: [] };

    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
}

async function addToCart(productId, quantity) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity })
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

async function updateCartItem(productId, quantity) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
}

async function removeFromCart(productId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

// Search functions
async function searchProducts(query) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
    return await response.json();
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

// Category and Brand functions
async function getCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

async function getBrands() {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
}

// Export functions to window object
window.api = {
  login,
  register,
  logout,
  getProducts,
  getProductById,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  searchProducts,
  getCategories,
  getBrands
}; 