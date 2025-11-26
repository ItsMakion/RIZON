import axios from 'axios';

// API base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            if (status === 401) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }

            // Return formatted error
            return Promise.reject({
                status,
                message: data.detail || data.message || 'An error occurred',
                data,
            });
        } else if (error.request) {
            // Request made but no response
            return Promise.reject({
                status: 0,
                message: 'Network error. Please check your connection.',
            });
        } else {
            // Something else happened
            return Promise.reject({
                status: 0,
                message: error.message || 'An unexpected error occurred',
            });
        }
    }
);

export default apiClient;
