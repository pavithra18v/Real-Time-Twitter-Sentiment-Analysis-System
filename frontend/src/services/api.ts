import axios from 'axios';
import type { TrainingRequest, LiveTwitterRequest } from '../types';

const API_URL = 'http://localhost:8000'; // Adjust if port is different

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const trainModel = async (path: string, data: TrainingRequest) => {
    const response = await api.post(path, data);
    return response.data;
};

export const analyzeTwitter = async (data: LiveTwitterRequest) => {
    const response = await api.post('/live/analyze', data);
    return response.data;
};

export const getMetrics = async () => {
    const response = await api.get('/metrics');
    return response.data;
};

export const resetSystem = async () => {
    const response = await api.post('/api/reset');
    return response.data;
};

export const getDashboardStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

export default api;
