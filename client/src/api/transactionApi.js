import apiClient from './apiClient';

export const getTransactions = () => apiClient.get('/transactions').then(res => res.data);
export const createTransaction = (data) => apiClient.post('/transactions', data).then(res => res.data);
