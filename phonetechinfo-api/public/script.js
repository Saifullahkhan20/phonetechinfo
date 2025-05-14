// Main JavaScript file for PhoneInfotec website

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize all components
  await initComponents();
});

async function initComponents() {
  // Initialize quantity buttons
  initQuantityButtons();

  // Initialize color selection
  initColorSelection();

  // Initialize image gallery
  initImageGallery();

  // Initialize cart functionality
  await initCart();

  // Load product details if on product page
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  if (productId) {
    await loadProductDetails(productId);
  }
}

// Load product details
async function loadProductDetails(productId) {
  try {
    const response = await window.api.getProductById(productId);
    if (response.success) {
      const product = response.data;
      updateProductUI(product);
    }
  } catch (error) {
    console.error('Error loading product details:', error);
    showError('Failed to load product details');
  }
}

// Update product UI with details
function updateProductUI(product) {
  // Update product title
  const titleElement = document.querySelector('h1');
  if (titleElement) titleElement.textContent = product.name;

  // Update price
  const priceElement = document.querySelector('.text-primary');
  if (priceElement) priceElement.textContent = `Rs ${product.price.toLocaleString()}`;

  // Update main image
  const mainImage = document.querySelector('.img-fluid:not(.thumbnail-img)');
  if (mainImage) mainImage.src = product.mainImage;

  // Update thumbnails
  const thumbnailsContainer = document.querySelector('.thumbnails-container');
  if (thumbnailsContainer && product.images) {
    thumbnailsContainer.innerHTML = product.images.map(img => `
      <img src="${img}" class="thumbnail-img" onclick="changeMainImage('${img}')" alt="${product.name}">
    `).join('');
  }

  // Update specifications
  const specsContainer = document.querySelector('.specifications');
  if (specsContainer && product.specs) {
    specsContainer.innerHTML = Object.entries(product.specs)
      .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
      .join('');
  }
}

// Quantity Buttons
function initQuantityButtons() {
  const decrementBtn = document.getElementById("decrementBtn")
  const incrementBtn = document.getElementById("incrementBtn")
  const quantityInput = document.getElementById("quantityInput")

  if (decrementBtn && incrementBtn && quantityInput) {
    decrementBtn.addEventListener("click", () => {
      const currentValue = Number.parseInt(quantityInput.value)
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1
      }
    })

    incrementBtn.addEventListener("click", () => {
      const currentValue = Number.parseInt(quantityInput.value)
      quantityInput.value = currentValue + 1
    })
  }
}

// Updated Cart functionality
async function initCart() {
  const addToCartBtn = document.getElementById("addToCartBtn");
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (addToCartBtn && productId) {
    addToCartBtn.addEventListener("click", async () => {
      const quantity = document.getElementById("quantityInput").value;
      
      try {
        const response = await window.api.addToCart(productId, parseInt(quantity));
        if (response.success) {
          showSuccess(`${quantity} item(s) added to cart!`);
          updateCartUI();
        } else {
          showError(response.error || "Failed to add to cart");
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        if (error.message === 'Authentication required') {
          showError("Please login to add items to cart");
          // Optionally redirect to login page
          // window.location.href = '/signinPage.html';
        } else {
          showError("Failed to add to cart. Please try again.");
        }
      }
    });
  }

  // Update cart UI
  await updateCartUI();
}

async function updateCartUI() {
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
    console.error('Error updating cart UI:', error);
  }
}

// Utility functions for showing messages
function showSuccess(message) {
  // You can implement a proper toast/notification system here
  alert(message);
}

function showError(message) {
  // You can implement a proper toast/notification system here
  alert(message);
}

// Color Selection
function initColorSelection() {
  const colorOptions = document.querySelectorAll(".color-option")

  if (colorOptions.length > 0) {
    colorOptions.forEach((option) => {
      option.addEventListener("click", function () {
        // Remove active class from all options
        colorOptions.forEach((opt) => opt.classList.remove("active"))

        // Add active class to selected option
        this.classList.add("active")

        // Update selected color text
        const selectedColor = document.getElementById("selectedColor")
        if (selectedColor) {
          selectedColor.textContent = "Selected: " + this.getAttribute("data-color")
        }
      })
    })
  }
}

// Image Gallery
function initImageGallery() {
  const thumbnails = document.querySelectorAll(".thumbnail-img")

  if (thumbnails.length > 0) {
    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", function () {
        const mainImg = document.querySelector(".product-main-img")
        if (mainImg) {
          mainImg.src = this.src
        }
      })
    })
  }
}

function changeMainImage(src) {
  const mainImg = document.querySelector(".product-main-img")
  if (mainImg) {
    mainImg.src = src
  }
}
