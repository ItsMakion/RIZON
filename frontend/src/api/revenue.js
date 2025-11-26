import apiClient from './client';

const revenueService = {
    /**
     * Get list of revenue records with optional filtering
     * @param {Object} filters - Filter parameters
     * @returns {Promise} List of revenue records
     */
    async getRevenues(filters = {}) {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('search', filters.search);
        if (filters.skip) params.append('skip', filters.skip);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await apiClient.get(`/api/v1/revenue?${params}`);
        return response.data;
    },

    /**
     * Get single revenue record by ID
     * @param {number} id - Revenue ID
     * @returns {Promise} Revenue data
     */
    async getRevenue(id) {
        const response = await apiClient.get(`/api/v1/revenue/${id}`);
        return response.data;
    },

    /**
     * Create new revenue record
     * @param {Object} data - Revenue data
     * @returns {Promise} Created revenue
     */
    async createRevenue(data) {
        const response = await apiClient.post('/api/v1/revenue', data);
        return response.data;
    },

    /**
     * Update revenue record
     * @param {number} id - Revenue ID
     * @param {Object} data - Updated revenue data
     * @returns {Promise} Updated revenue
     */
    async updateRevenue(id, data) {
        const response = await apiClient.put(`/api/v1/revenue/${id}`, data);
        return response.data;
    },
};

export default revenueService;
