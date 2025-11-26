import apiClient from './client';

const rolesService = {
    /**
     * Get all roles
     * @returns {Promise} List of roles
     */
    async getRoles() {
        const response = await apiClient.get('/api/v1/roles/');
        return response.data;
    },

    /**
     * Get all permissions
     * @returns {Promise} List of permissions
     */
    async getPermissions() {
        const response = await apiClient.get('/api/v1/roles/permissions');
        return response.data;
    },

    /**
     * Create a new role
     * @param {Object} roleData - Role data { name, description, permissions: [id, id] }
     * @returns {Promise} Created role
     */
    async createRole(roleData) {
        const response = await apiClient.post('/api/v1/roles/', roleData);
        return response.data;
    },

    /**
     * Update a role
     * @param {number} id - Role ID
     * @param {Object} roleData - Role data to update
     * @returns {Promise} Updated role
     */
    async updateRole(id, roleData) {
        const response = await apiClient.put(`/api/v1/roles/${id}`, roleData);
        return response.data;
    },

    /**
     * Delete a role
     * @param {number} id - Role ID
     * @returns {Promise}
     */
    async deleteRole(id) {
        const response = await apiClient.delete(`/api/v1/roles/${id}`);
        return response.data;
    },
};

export default rolesService;
