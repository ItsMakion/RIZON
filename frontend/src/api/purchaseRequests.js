import apiClient from './client';

const purchaseRequestService = {
    /**
     * Get list of purchase requests with optional filtering
     * @param {Object} filters - Filter parameters
     * @returns {Promise} List of purchase requests
     */
    async getRequests(filters = {}) {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.department) params.append('department', filters.department);
        if (filters.search) params.append('search', filters.search);
        if (filters.skip) params.append('skip', filters.skip);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await apiClient.get(`/api/v1/purchase-requests?${params}`);
        return response.data;
    },

    /**
     * Get single purchase request by ID
     * @param {number} id - Request ID
     * @returns {Promise} Request data
     */
    async getRequest(id) {
        const response = await apiClient.get(`/api/v1/purchase-requests/${id}`);
        return response.data;
    },

    /**
     * Create new purchase request
     * @param {Object} data - Request data
     * @returns {Promise} Created request
     */
    async createRequest(data) {
        const response = await apiClient.post('/api/v1/purchase-requests', data);
        return response.data;
    },

    /**
     * Update purchase request
     * @param {number} id - Request ID
     * @param {Object} data - Updated request data
     * @returns {Promise} Updated request
     */
    async updateRequest(id, data) {
        const response = await apiClient.put(`/api/v1/purchase-requests/${id}`, data);
        return response.data;
    },

    /**
     * Approve purchase request
     * @param {number} id - Request ID
     * @returns {Promise} Approved request
     */
    async approveRequest(id) {
        const response = await apiClient.post(`/api/v1/purchase-requests/${id}/approve`);
        return response.data;
    },

    /**
     * Reject purchase request
     * @param {number} id - Request ID
     * @returns {Promise} Rejected request
     */
    async rejectRequest(id) {
        const response = await apiClient.post(`/api/v1/purchase-requests/${id}/reject`);
        return response.data;
    },
};

export default purchaseRequestService;
