import apiClient from './client';

const notificationsService = {
    /**
     * Get user notifications
     * @param {number} skip
     * @param {number} limit
     * @returns {Promise} List of notifications
     */
    async getNotifications(skip = 0, limit = 50) {
        const response = await apiClient.get(`/api/v1/notifications/?skip=${skip}&limit=${limit}`);
        return response.data;
    },

    /**
     * Mark notification as read
     * @param {number} id
     * @returns {Promise} Updated notification
     */
    async markRead(id) {
        const response = await apiClient.put(`/api/v1/notifications/${id}/read`);
        return response.data;
    },

    /**
     * Mark all notifications as read
     * @returns {Promise}
     */
    async markAllRead() {
        const response = await apiClient.put('/api/v1/notifications/read-all');
        return response.data;
    },

    /**
     * Delete notification
     * @param {number} id
     * @returns {Promise}
     */
    async deleteNotification(id) {
        const response = await apiClient.delete(`/api/v1/notifications/${id}`);
        return response.data;
    },
};

export default notificationsService;
