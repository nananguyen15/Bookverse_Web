import axios, { AxiosInstance, AxiosError } from 'axios';

// Base URL cho API backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/bookverse/api';

// Tạo axios instance với config mặc định
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor để thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage nếu có
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý response và error
apiClient.interceptors.response.use(
  (response) => {
    // Trả về data từ response.data.result (theo format APIResponse của backend)
    return response.data;
  },
  (error: AxiosError) => {
    // Xử lý lỗi
    if (error.response) {
      // Server trả về response với status code khác 2xx
      const { status } = error.response;
      
      if (status === 401) {
        // Unauthorized - xóa token và redirect đến login
        localStorage.removeItem('authToken');
        if (window.location.pathname !== '/signin') {
          window.location.href = '/signin';
        }
      } else if (status === 403) {
        console.error('Forbidden: You do not have permission');
      } else if (status === 404) {
        console.error('Not Found');
      }
      
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('No response from server');
      return Promise.reject({ message: 'Network error - No response from server' });
    } else {
      // Lỗi khi setup request
      console.error('Error:', error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

export { apiClient, API_BASE_URL };
export default apiClient;
