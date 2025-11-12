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
  "/books",
  "/authors",
  "/publishers",
  "/series",
  "/sup-categories",
  "/sub-categories",
  "/categories",
];

// Request interceptor - Add auth token only for protected endpoints
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Extract the path from the URL (remove base URL if present)
    const url = config.url || "";
    const path = url.startsWith("http") ? new URL(url).pathname : url;

    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
      path.startsWith(endpoint)
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
      // Handle 401 Unauthorized - Clear expired token
      if (error.response.status === 401) {
        // Clear both possible token keys
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");

        // Only redirect to signin if not on a public page
        const currentPath = window.location.pathname;
        const isPublicPage =
          currentPath === "/" ||
          currentPath.startsWith("/books") ||
          currentPath.startsWith("/series") ||
          currentPath.startsWith("/category") ||
          currentPath.startsWith("/about") ||
          currentPath.startsWith("/search");

        if (!isPublicPage && !currentPath.startsWith("/auth")) {
          window.location.href = "/auth/signin";
        }
      }
      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error("Access forbidden");
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient, API_BASE_URL };
export default apiClient;
