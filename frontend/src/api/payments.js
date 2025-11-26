import apiClient from './client';

const paymentService = {
    /**
     * Get list of payments with optional filtering
     * @param {Object} filters - Filter parameters
     * @returns {Promise} List of payments
     */
    async getPayments(filters = {}) {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.method) params.append('method', filters.method);
        if (filters.search) params.append('search', filters.search);
        if (filters.skip) params.append('skip', filters.skip);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await apiClient.get(`/api/v1/payments?${params}`);
        return response.data;
    },

    /**
     * Get payment statistics
     * @returns {Promise} Payment stats
     */
    async getPaymentStats() {
        const response = await apiClient.get('/api/v1/payments/stats');
        return response.data;
    },

    /**
     * Get single payment by ID
     * @param {number} id - Payment ID
     * @returns {Promise} Payment data
     */
    async getPayment(id) {
        const response = await apiClient.get(`/api/v1/payments/${id}`);
        return response.data;
    },

    /**
     * Create new payment
     * @param {Object} data - Payment data
     * @returns {Promise} Created payment
     */
    async createPayment(data) {
        const response = await apiClient.post('/api/v1/payments', data);
        return response.data;
    },

    /**
     * Process payment
     * @param {number} id - Payment ID
     * @returns {Promise} Processed payment
     */
    async processPayment(id) {
        const response = await apiClient.post(`/api/v1/payments/${id}/process`);
        return response.data;
    },
};

export default paymentService;
