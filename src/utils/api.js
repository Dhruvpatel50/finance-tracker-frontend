import React from 'react'; // Import React
import axios from 'axios'; // Import axios

// Use environment variable for API URL, fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Add token to requests if available
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle token expiration
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userEmail');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

// Utility function to get URL parameters
const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        token: params.get('token'),
        email: params.get('email')
    };
};

// Function to fetch dashboard summary data
const getDashboardSummary = async () => {
    try {
        const response = await axios.get('/api/dashboard/summary');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        throw error;
    }
};

// Function to fetch time-based data
const getTimeData = async (period) => {
    try {
        const response = await axios.get(`/api/dashboard/time-data?period=${period}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching time-based data:', error);
        throw error;
    }
};

export { getUrlParams, getDashboardSummary, getTimeData };