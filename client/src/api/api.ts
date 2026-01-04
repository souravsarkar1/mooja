import axios from 'axios';

const api = axios.create({
    baseURL: 'https://9b8679d4026c.ngrok-free.app/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
