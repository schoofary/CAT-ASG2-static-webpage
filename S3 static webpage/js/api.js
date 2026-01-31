// API Service Layer
// Handles all HTTP requests to API Gateway

const API = {
    /**
     * Fetch all product records from DynamoDB via API Gateway
     * @returns {Promise<Array>} Array of product objects
     */
    async getProducts() {
        try {
            const response = await fetch(API_ENDPOINTS.records, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    /**
     * Add a new product record to DynamoDB via API Gateway
     * @param {Object} productData - The product data to add
     * @returns {Promise<Object>} The created product object
     */
    async addProduct(productData) {
        try {
            const response = await fetch(API_ENDPOINTS.uploads, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }
};