// src/utils/auth.js
export const setAuthToken = (token) => {
  localStorage.setItem('adminToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

export const removeAuthToken = () => {
  localStorage.removeItem('adminToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};