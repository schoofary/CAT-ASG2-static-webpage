// Main Application Logic
// Handles DOM manipulation, event handling, and form logic

// DOM Elements
const productList = document.getElementById('productList');
const productForm = document.getElementById('productForm');
const submitBtn = document.getElementById('submitBtn');
const alertContainer = document.getElementById('alertContainer');

// Form Input Elements
const productIdInput = document.getElementById('productId');
const productNameInput = document.getElementById('productName');
const productCategoryInput = document.getElementById('productCategory');
const productPriceInput = document.getElementById('productPrice');
const productStockInput = document.getElementById('productStock');

/**
 * Display an alert message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of alert ('error' or 'success')
 */
function showAlert(message, type = 'error') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    const icon = document.createElement('svg');
    icon.className = 'alert-icon';
    icon.setAttribute('width', '20');
    icon.setAttribute('height', '20');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '2');
    
    if (type === 'error') {
        icon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>';
    } else {
        icon.innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>';
    }
    
    const messageText = document.createElement('p');
    messageText.textContent = message;
    
    alert.appendChild(icon);
    alert.appendChild(messageText);
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    // Auto-remove success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
}

/**
 * Clear all alert messages
 */
function clearAlerts() {
    alertContainer.innerHTML = '';
}

/**
 * Render products to the DOM
 * @param {Array} products - Array of product objects
 */
function renderProducts(products) {
    if (!products || products.length === 0) {
        productList.innerHTML = '<div class="empty">No products found</div>';
        return;
    }

    productList.innerHTML = products.map(product => `
        <div class="product-item">
            <div class="product-header">
                <h3 class="product-name">${product.Name || 'Unnamed Product'}</h3>
                <span class="product-id">ID: ${product.ID}</span>
            </div>
            <div class="product-details">
                <div class="product-field">
                    <span class="field-label">Category:</span>
                    <span class="field-value">${product.Category || 'N/A'}</span>
                </div>
                <div class="product-field">
                    <span class="field-label">Price:</span>
                    <span class="field-value">${product.Price ? '$' + product.Price : 'N/A'}</span>
                </div>
                <div class="product-field">
                    <span class="field-label">Stock:</span>
                    <span class="field-value">${product.Stock || 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Fetch and display all products
 */
async function loadProducts() {
    try {
        productList.innerHTML = '<div class="loading">Loading products...</div>';
        const products = await API.getProducts();
        renderProducts(products);
    } catch (error) {
        productList.innerHTML = '<div class="empty">Failed to load products</div>';
        showAlert('Failed to fetch products. Please check your API configuration.', 'error');
        console.error('Load products error:', error);
    }
}

/**
 * Get form data as an object
 * @returns {Object} Form data
 */
function getFormData() {
    return {
    ID: Number(productIdInput.value.trim()),
    Name: productNameInput.value.trim(),
    Category: productCategoryInput.value.trim(),
    Price: parseFloat(productPriceInput.value.trim()) || 0, // Convert to number
    Stock: parseInt(productStockInput.value.trim(), 10) || 0 // Convert to number
};
}

/**
 * Clear the form inputs
 */
function clearForm() {
    productIdInput.value = '';
    productNameInput.value = '';
    productCategoryInput.value = '';
    productPriceInput.value = '';
    productStockInput.value = '';
}

/**
 * Validate form data
 * @param {Object} data - Form data to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateForm(data) {
    if (isNaN(data.ID) || data.ID === 0) {
        showAlert('Product ID must be a valid number', 'error');
        return false; 
    }
    return true;
}

/**
 * Handle form submission
 */
async function handleSubmit() {
    clearAlerts();
    
    const formData = getFormData();
    
    if (!validateForm(formData)) {
        return;
    }
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
        
        await API.addProduct(formData);
        
        showAlert('Product added successfully!', 'success');
        clearForm();
        
        // Reload products to show the new one
        await loadProducts();
    } catch (error) {
        showAlert('Failed to add product. Please try again.', 'error');
        console.error('Add product error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Product';
    }
}

// Event Listeners
submitBtn.addEventListener('click', handleSubmit);

// Allow Enter key to submit in any input field
const inputs = [productIdInput, productNameInput, productCategoryInput, productPriceInput, productStockInput];
inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    });
});

// Initialize: Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});