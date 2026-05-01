import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config || {};
        
        // Handle 401 Unauthorized (Token expired/invalid)
        if (error.response?.status === 401 && !config.__isRetryRequest) {
            config.__isRetryRequest = true;
            // Simple approach: clear tokens and force re-login if we get 401
            // In a more complex app, we would hit a /refresh endpoint here
            localStorage.removeItem('access_token');
            sessionStorage.removeItem('access_token');
            if (
                window.location.pathname !== '/login' && 
                window.location.pathname !== '/admin-login' && 
                window.location.pathname !== '/register'
            ) {
                 window.location.href = '/login';
            }
        }

        const shouldRetry = !config.__retry && (!error.response || error.response.status >= 500);
        if (shouldRetry) {
            config.__retry = true;
            return api(config);
        }

        const apiMessage =
            error.response?.data?.error ||
            error.response?.data?.detail ||
            error.response?.data?.non_field_errors?.[0] ||
            null;
        if (apiMessage) {
            error.userMessage = apiMessage;
        }
        return Promise.reject(error);
    }
);

export default api;
