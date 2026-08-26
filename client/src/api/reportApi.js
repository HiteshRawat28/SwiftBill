import apiClient from './apiClient';

export const getDashboardStats = async () => {
  const response = await apiClient.get('/reports/dashboard-stats');
  return response.data;
};

export const getSalesSummary = async () => {
  const response = await apiClient.get('/reports/sales-summary');
  return response.data;
};

export const getGstLiability = async () => {
  const response = await apiClient.get('/reports/gst-liability');
  return response.data;
};

export const getStockValuation = async () => {
  const response = await apiClient.get('/reports/stock-valuation');
  return response.data;
};
