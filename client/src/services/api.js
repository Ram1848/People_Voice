import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const clean = envUrl.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  // Robust production fallback: If running on Vercel or any remote domain without VITE_API_URL embedded, target Render backend
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://people-voice-backend-0jmm.onrender.com/api';
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor for runtime diagnostics
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

// Response interceptor for safe, informative debugging (never logs secrets)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Failure Details]', {
      fullUrl: `${error.config?.baseURL || ''}${error.config?.url || ''}`,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseBody: error.response?.data,
      errorMessage: error.message,
    });
    return Promise.reject(error);
  }
);

export const getDashboard = async () => {
  const res = await api.get('/dashboard');
  return res.data;
};

export const getInsights = async () => {
  const res = await api.get('/insights');
  return res.data;
};

export const getProducts = async (params = {}) => {
  const res = await api.get('/products', { params });
  return res.data;
};

export const getProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

export const createProduct = async (productData) => {
  const res = await api.post('/products', productData);
  return res.data;
};

export const updateProduct = async (id, productData) => {
  const res = await api.put(`/products/${id}`, productData);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

export const addStock = async (stockData) => {
  const res = await api.post('/inventory/add', stockData);
  return res.data;
};

export const removeStock = async (stockData) => {
  const res = await api.post('/inventory/remove', stockData);
  return res.data;
};

export const explainStock = async (idOrName) => {
  const res = await api.get(`/inventory/explain/${encodeURIComponent(idOrName)}`);
  return res.data;
};

export const getHistory = async (limit = 50) => {
  const res = await api.get('/inventory/history', { params: { limit } });
  return res.data;
};

export const getLowStock = async () => {
  const res = await api.get('/inventory/low-stock');
  return res.data;
};

export const getRecommendations = async (leadTime = 3) => {
  const res = await api.get('/inventory/recommendations', { params: { leadTime } });
  return res.data;
};

export const sendVoiceCommand = async (command, source = 'VOICE', confirmed = false) => {
  const res = await api.post('/voice/command', { command, source, confirmed });
  return res.data;
};

export const validateVoiceCommand = async (command, source = 'VOICE') => {
  const res = await api.post('/voice/validate', { command, source });
  return res.data;
};

export default api;
