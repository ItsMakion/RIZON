import apiClient from './client';

const analyticsService = {
    /**
     * Get dashboard statistics
     * @returns {Promise} Dashboard stats
     */
    async getDashboardStats() {
        const response = await apiClient.get('/api/v1/analytics/dashboard');
        return response.data;
    },

    /**
     * Get procurement trends
     * @returns {Promise} Procurement trends data
     */
    async getProcurementTrends() {
        const response = await apiClient.get('/api/v1/analytics/procurement-trends');
        return response.data;
    },

    /**
     * Get payment summary
     * @returns {Promise} Payment summary data
     */
    async getPaymentSummary() {
        const response = await apiClient.get('/api/v1/analytics/payment-summary');
        return response.data;
    },
};

export default analyticsService;
