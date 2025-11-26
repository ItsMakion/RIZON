import apiClient from './client';

const auditLogService = {
    /**
     * Get list of audit logs with optional filtering
     * @param {Object} filters - Filter parameters
     * @returns {Promise} List of audit logs
     */
    async getAuditLogs(filters = {}) {
        const params = new URLSearchParams();
        if (filters.entity_type) params.append('entity_type', filters.entity_type);
        if (filters.action) params.append('action', filters.action);
        if (filters.user_id) params.append('user_id', filters.user_id);
        if (filters.skip) params.append('skip', filters.skip);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await apiClient.get(`/api/v1/audit-logs?${params}`);
        return response.data;
    },

    /**
     * Get single audit log by ID
     * @param {number} id - Audit log ID
     * @returns {Promise} Audit log data
     */
    async getAuditLog(id) {
        const response = await apiClient.get(`/api/v1/audit-logs/${id}`);
        return response.data;
    },
};

export default auditLogService;
