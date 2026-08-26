import apiClient from './apiClient';

export const getParties = () => apiClient.get('/parties').then(res => res.data);
export const createParty = (data) => apiClient.post('/parties', data).then(res => res.data);
export const updateParty = (id, data) => apiClient.put(`/parties/${id}`, data).then(res => res.data);
export const deleteParty = (id) => apiClient.delete(`/parties/${id}`).then(res => res.data);
