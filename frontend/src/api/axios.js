import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
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
