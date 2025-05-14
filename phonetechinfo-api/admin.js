// Admin: Login
async function adminLogin(email, password) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    if (result.success) {
      localStorage.setItem('token', result.token);
      window.location.href = 'admin-dashboard.html';
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error('Error logging in:', error);
    alert('An error occurred while logging in');
  }
}

// Admin: Create Product
async function createProduct(productData) {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      window.location.href = 'admin-login.html';
      return;
    }
    
    const response = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Product created successfully!');
      document.getElementById('productForm').reset();
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('Error creating product:', error);
    alert('An error occurred while creating the product');
  }
}

// Admin: Upload Product Image
async function uploadProductImage(file) {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      window.location.href = 'admin-login.html';
      return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('http://localhost:5000/api/products/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      alert(`Error: ${result.message}`);
      return null;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('An error occurred while uploading the image');
    return null;
  }
}

// Admin: Get All Products
async function getAdminProducts() {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      window.location.href = 'admin-login.html';
      return;
    }
    
    const response = await fetch('http://localhost:5000/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      displayAdminProducts(result.data);
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    alert('An error occurred while fetching products');
  }
}

// Admin: Display Products in Admin Panel
function displayAdminProducts(products) {
  const productsTable = document.getElementById('productsTable');
  const tbody = productsTable.querySelector('tbody');
  tbody.innerHTML = '';
  
  products.forEach(product => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product._id}</td>
      <td>${product.name}</td>
      <td>Rs ${product.price.toLocaleString()}</td>
      <td>${product.category.name}</td>
      <td>${product.brand.name}</td>
      <td>${product.countInStock}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-btn" data-id="${product._id}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-id="${product._id}">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  // Add event listeners to edit and delete buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.getAttribute('data-id');
      window.location.href = `edit-product.html?id=${productId}`;
    });
  });
  
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this product?')) {
        await deleteProduct(productId);
        getAdminProducts(); // Refresh the list
      }
    });
  });
}

// Admin: Delete Product
async function deleteProduct(productId) {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      window.location.href = 'admin-login.html';
      return;
    }
    
    const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Product deleted successfully!');
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('An error occurred while deleting the product');
  }
}

// Initialize Admin Dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (!token && window.location.pathname !== '/admin-login.html') {
    window.location.href = 'admin-login.html';
    return;
  }
  
  // If on products page, load products
  if (document.getElementById('productsTable')) {
    getAdminProducts();
  }
  
  // Handle login form submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      adminLogin(email, password);
    });
  }
  
  // Handle product form submission
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById('name').value;
      const description = document.getElementById('description').value;
      const price = parseFloat(document.getElementById('price').value);
      const category = document.getElementById('category').value;
      const brand = document.getElementById('brand').value;
      const countInStock = parseInt(document.getElementById('countInStock').value);
      const featured = document.getElementById('featured').checked;
      
      // Get specs
      const display = document.getElementById('display').value;
      const processor = document.getElementById('processor').value;
      const camera = document.getElementById('camera').value;
      const battery = document.getElementById('battery').value;
      const storage = document.getElementById('storage').value;
      const os = document.getElementById('os').value;
      
      // Handle image upload
      const imageFile = document.getElementById('mainImage').files[0];
      let mainImage = '';
      
      if (imageFile) {
        mainImage = await uploadProductImage(imageFile);
        if (!mainImage) return;
      }
      
      // Create product object
      const productData = {
        name,
        description,
        price,
        category,
        brand,
        countInStock,
        featured,
        specs: {
          display,
          processor,
          camera,
          battery,
          storage,
          os
        },
        mainImage: mainImage || 'https://via.placeholder.com/300',
        images: []
      };
      
      await createProduct(productData);
    });
  }
});