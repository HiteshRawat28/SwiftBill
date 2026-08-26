import apiClient from './apiClient';

export const getProducts = () => apiClient.get('/products').then(res => res.data);
export const createProduct = (data) => apiClient.post('/products', data).then(res => res.data);
export const updateProduct = (id, data) => apiClient.put(`/products/${id}`, data).then(res => res.data);
export const deleteProduct = (id) => apiClient.delete(`/products/${id}`).then(res => res.data);

export const getCategories = () => apiClient.get('/lookups/categories').then(res => res.data);
export const createCategory = (data) => apiClient.post('/lookups/categories', data).then(res => res.data);

export const getUnits = () => apiClient.get('/lookups/units').then(res => res.data);
export const createUnit = (data) => apiClient.post('/lookups/units', data).then(res => res.data);
