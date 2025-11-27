import apiClient from './client';

const fraudService = {
    /**
     * Get fraud alerts
     * @param {boolean} resolved
     * @returns {Promise} List of alerts
     */
    async getAlerts(resolved = false) {
        const response = await apiClient.get(`/api/v1/fraud/?resolved=${resolved}`);
        return response.data;
    },

    /**
     * Resolve alert
     * @param {number} id
     * @returns {Promise}
     */
    async resolveAlert(id) {
        const response = await apiClient.put(`/api/v1/fraud/${id}/resolve`);
        return response.data;
    },
};

export default fraudService;
