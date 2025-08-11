import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.detail || error.response.data?.message || 'Server error occurred';
      error.userMessage = message;
    } else if (error.request) {
      // Request was made but no response received
      error.userMessage = 'No response from server. Please check your connection.';
    } else {
      // Something else happened
      error.userMessage = 'An unexpected error occurred.';
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  getDashboardMetrics: async () => {
    try {
      const response = await apiClient.get('/dashboard/metrics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      throw error;
    }
  },

  getTransactions: async (page = 1, limit = 50, status = null) => {
    try {
      const params = { page, limit };
      if (status) params.status = status;
      const response = await apiClient.get('/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  },

  getAnomalies: async (page = 1, limit = 50, status = 'all') => {
    try {
      const response = await apiClient.get('/anomalies', {
        params: { page, limit, status }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
      throw error;
    }
  },

  getNetworkData: async (days = null) => {
    try {
      const params = {};
      if (days !== null) {
        params.days = days;
      }
      const response = await apiClient.get('/network/data', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch network data:', error);
      throw error;
    }
  },

  getAnalytics: async () => {
    try {
      const response = await apiClient.get('/analytics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  },

  getAnomalyTrends: async (days = 30) => {
    try {
      const response = await apiClient.get('/analytics/anomaly-trends', {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch anomaly trends:', error);
      throw error;
    }
  },

  getDetectionMethods: async () => {
    try {
      const response = await apiClient.get('/analytics/detection-methods');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch detection methods:', error);
      throw error;
    }
  },

  getRealTimeData: async () => {
    try {
      const response = await apiClient.get('/realtime/data');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
      throw error;
    }
  },

  updateAnomalyStatus: async (anomalyId, status) => {
    try {
      const response = await apiClient.put(`/anomalies/${anomalyId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Failed to update anomaly status:', error);
      throw error;
    }
  },

  runDetection: async () => {
    try {
      const response = await apiClient.post('/detect');
      return response.data;
    } catch (error) {
      console.error('Failed to run detection:', error);
      throw error;
    }
  }
};