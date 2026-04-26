import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.0.4:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    console.log('Attaching token to request:', token.substring(0, 10) + '...');
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No token found in localStorage');
  }
  return config;
});

export default api;
