import apiClient from './client';

const procurementService = {
    /**
     * Get list of tenders with optional filtering
     * @param {Object} filters - Filter parameters
     * @returns {Promise} List of tenders
     */
    async getTenders(filters = {}) {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('search', filters.search);
        if (filters.skip) params.append('skip', filters.skip);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await apiClient.get(`/api/v1/procurement?${params}`);
        return response.data;
    },

    /**
     * Get single tender by ID
     * @param {number} id - Tender ID
     * @returns {Promise} Tender data
     */
    async getTender(id) {
        const response = await apiClient.get(`/api/v1/procurement/${id}`);
        return response.data;
    },

    /**
     * Create new tender
     * @param {Object} data - Tender data
     * @returns {Promise} Created tender
     */
    async createTender(data) {
        const response = await apiClient.post('/api/v1/procurement', data);
        return response.data;
    },

    /**
     * Update tender
     * @param {number} id - Tender ID
     * @param {Object} data - Updated tender data
     * @returns {Promise} Updated tender
     */
    async updateTender(id, data) {
        const response = await apiClient.put(`/api/v1/procurement/${id}`, data);
        return response.data;
    },

    /**
     * Delete tender
     * @param {number} id - Tender ID
     * @returns {Promise} Deletion confirmation
     */
    async deleteTender(id) {
        const response = await apiClient.delete(`/api/v1/procurement/${id}`);
        return response.data;
    },
};

export default procurementService;
