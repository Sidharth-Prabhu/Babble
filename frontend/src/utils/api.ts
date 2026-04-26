import axios from 'axios';

export const BASE_URL = 'http://192.168.0.4:8080';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
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

export const getUserProfile = (username: string) => api.get(`/users/profile/${username}`);
export const getCurrentUser = () => api.get('/users/me');
export const updateProfile = (data: { displayName: string, bio: string }) => api.put('/users/profile', data);
export const uploadProfileImage = (file: File) => {
  const data = new FormData();
  data.append('file', file);
  return api.post('/users/profile/image', data);
};
export const uploadBannerImage = (file: File) => {
  const data = new FormData();
  data.append('file', file);
  return api.post('/users/profile/banner', data);
};
export const getAllPosts = () => api.get('/posts');

export const getStories = () => api.get('/stories');
export const uploadStory = (file: File) => {
  const data = new FormData();
  data.append('file', file);
  return api.post('/stories/upload', data);
};

export const toggleLike = (postId: number) => api.post(`/likes/${postId}`);
export const getComments = (postId: number) => api.get(`/comments/${postId}`);
export const addComment = (postId: number, content: string) => api.post(`/comments/${postId}`, { content });
export const deleteComment = (commentId: number) => api.delete(`/comments/${commentId}`);
export const updateComment = (commentId: number, content: string) => api.put(`/comments/${commentId}`, { content });

// Follows
export const toggleFollow = (username: string) => api.post(`/follows/${username}`);
export const getFollowStatus = (username: string) => api.get(`/follows/status/${username}`);
export const getFollowingPosts = () => api.get('/posts/following');
export const searchUsers = (query: string) => api.get('/users/search', { params: { query } });

export default api;
