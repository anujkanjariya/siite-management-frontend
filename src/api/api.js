import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://site-management-zggf.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add a response interceptor to handle token expiration/errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const login = (number, password) => api.post('/auth/login', { number, password });
export const register = (userData) => api.post('/auth/register', userData);

export const getSites = () => api.get('/sites');
export const getSiteById = (id) => api.get(`/sites/${id}`);
export const createSite = (name) => api.post('/sites', { name });
export const updateSite = (id, data) => api.put(`/sites/${id}`, data);
export const deleteSite = (id) => api.delete(`/sites/${id}`);

// Billing Item endpoints
export const getBillingItems = (siteId) => api.get(`/sites/${siteId}/billing`);
export const addBillingItem = (siteId, itemData) => api.post(`/sites/${siteId}/billing`, itemData);
export const updateBillingItem = (siteId, itemId, itemData) => api.put(`/sites/${siteId}/billing/${itemId}`, itemData);
export const deleteBillingItem = (siteId, itemId) => api.delete(`/sites/${siteId}/billing/${itemId}`);

// Worker and Payment endpoints
export const getWorkers = (siteId) => api.get(`/sites/${siteId}/workers`);
export const addWorker = (siteId, workerData) => api.post(`/sites/${siteId}/workers`, workerData);
export const updateWorker = (siteId, workerId, workerData) => api.put(`/sites/${siteId}/workers/${workerId}`, workerData);
export const deleteWorker = (siteId, workerId) => api.delete(`/sites/${siteId}/workers/${workerId}`);
export const recordPayment = (siteId, workerId, paymentData) => api.post(`/sites/${siteId}/workers/${workerId}/payments`, paymentData);
export const updatePayment = (siteId, workerId, paymentId, paymentData) => api.put(`/sites/${siteId}/workers/${workerId}/payments/${paymentId}`, paymentData);
export const deletePayment = (siteId, workerId, paymentId) => api.delete(`/sites/${siteId}/workers/${workerId}/payments/${paymentId}`);

export default api;
