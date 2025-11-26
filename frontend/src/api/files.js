import apiClient from './client';

const filesService = {
    /**
     * Upload a file
     * @param {File} file - File to upload
     * @param {string} entityType - Entity type (e.g., 'procurement')
     * @param {number} entityId - Entity ID
     * @param {string} description - Optional description
     * @returns {Promise} Uploaded file data
     */
    async uploadFile(file, entityType, entityId, description = null) {
        const formData = new FormData();
        formData.append('file', file);

        const params = new URLSearchParams({
            entity_type: entityType,
            entity_id: entityId.toString(),
        });

        if (description) {
            params.append('description', description);
        }

        const response = await apiClient.post(`/api/v1/files/upload?${params}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    /**
     * List files for an entity
     * @param {string} entityType - Entity type
     * @param {number} entityId - Entity ID
     * @returns {Promise} List of files
     */
    async listFiles(entityType, entityId) {
        const params = new URLSearchParams({
            entity_type: entityType,
            entity_id: entityId.toString(),
        });

        const response = await apiClient.get(`/api/v1/files/?${params}`);
        return response.data;
    },

    /**
     * Download a file
     * @param {number} fileId - File ID
     * @returns {string} Download URL
     */
    getDownloadUrl(fileId) {
        return `${apiClient.defaults.baseURL}/api/v1/files/${fileId}/download`;
    },

    /**
     * Delete a file
     * @param {number} fileId - File ID
     * @returns {Promise}
     */
    async deleteFile(fileId) {
        const response = await apiClient.delete(`/api/v1/files/${fileId}`);
        return response.data;
    },
};

export default filesService;
