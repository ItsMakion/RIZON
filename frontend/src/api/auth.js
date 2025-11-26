import apiClient from './client';

const authService = {
    /**
     * Login user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} Token and user data
     */
    async login(email, password) {
        const formData = new FormData();
        formData.append('username', email); // OAuth2 uses 'username' field
        formData.append('password', password);

        const response = await apiClient.post('/api/v1/auth/login', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const { access_token, token_type } = response.data;

        // Store token
        localStorage.setItem('token', access_token);

        // Get user info
        const user = await this.getCurrentUser();
        localStorage.setItem('user', JSON.stringify(user));

        return { token: access_token, user };
    },

    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise} Created user data
     */
    async register(userData) {
        const response = await apiClient.post('/api/v1/auth/register', userData);
        return response.data;
    },

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    /**
     * Get current user info from token
     * @returns {Promise} User data
     */
    async getCurrentUser() {
        try {
            const response = await apiClient.get('/api/v1/auth/me');
            return response.data;
        } catch (error) {
            // Fallback to stored user if API call fails
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                return JSON.parse(storedUser);
            }
            return null;
        }
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },
};

export default authService;
