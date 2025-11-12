import axios from "axios";
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

// API Base URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/bookverse/api";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/books',
  '/authors',
  '/publishers',
  '/series',
  '/sup-categories',
  '/sub-categories',
];

// Request interceptor - Add auth token only for protected endpoints
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
      config.url?.startsWith(endpoint)
    );
    
    // Only add token for non-public endpoints
    if (!isPublicEndpoint) {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "/auth/signin";
      }
      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error("Access forbidden");
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
