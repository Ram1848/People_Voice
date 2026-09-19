import api from './api.js';

/**
 * Dedicated Voice Service for Frontend
 * Interacts with /api/voice/* endpoints
 */

export const sendVoiceCommand = async (command, source = 'VOICE', confirmed = false) => {
  const res = await api.post('/voice/command', { command, source, confirmed });
  return res.data;
};

export const confirmVoiceCommand = async (commandId, confirmedQuantity = null) => {
  const res = await api.post('/voice/confirm', { 
    commandId: parseInt(commandId, 10), 
    confirmedQuantity 
  });
  return res.data;
};

export const cancelVoiceCommand = async (commandId) => {
  const res = await api.post('/voice/cancel', { 
    commandId: parseInt(commandId, 10) 
  });
  return res.data;
};

export const getVoiceHistory = async (limit = 30) => {
  const res = await api.get('/voice/history', { params: { limit } });
  return res.data;
};

export const getPendingVoiceCommand = async () => {
  const res = await api.get('/voice/pending');
  return res.data;
};

export const getVoiceBusinessSummary = async () => {
  const res = await api.get('/voice/business-summary');
  return res.data;
};

export const getVoiceStockExplanation = async (productId) => {
  const res = await api.get(`/voice/stock-explanation/${encodeURIComponent(productId)}`);
  return res.data;
};

export const getVoiceReorderSuggestions = async () => {
  const res = await api.get('/voice/reorder-suggestions');
  return res.data;
};

export default {
  sendVoiceCommand,
  confirmVoiceCommand,
  cancelVoiceCommand,
  getVoiceHistory,
  getPendingVoiceCommand,
  getVoiceBusinessSummary,
  getVoiceStockExplanation,
  getVoiceReorderSuggestions,
};
