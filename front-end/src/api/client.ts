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
  timeout: 60000, // Increase to 60 seconds for email operations
  headers: {
    "Content-Type": "application/json",
  },
});

// Public endpoints that don't require authentication
const PUBLIC_GET_ENDPOINTS = [
  "/books",
  "/authors",
  "/publishers",
  "/series",
  "/sup-categories",
  "/sub-categories",
];

// Auth endpoints that should never send token (to avoid expired token issues)
const PUBLIC_AUTH_ENDPOINTS = [
  "/auth/token",
  "/auth/refresh",
  "/users/signup",
  "/users/id-by-email",
  "/otp/send-by-email",
  "/otp/send-by-email-reset-password",
  "/otp/verify",
  "/otp/verify-reset-password",
];

// Request interceptor - Add auth token only for protected endpoints
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if this is a public auth endpoint (login, signup, OTP)
    const isPublicAuthEndpoint = PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
      config.url?.startsWith(endpoint)
    );

    // Check if this is a public GET request (books, authors, etc.)
    const isPublicGetRequest =
      config.method?.toUpperCase() === "GET" &&
      PUBLIC_GET_ENDPOINTS.some((endpoint) => config.url?.startsWith(endpoint));

    // Only add token if NOT a public endpoint
    if (!isPublicAuthEndpoint && !isPublicGetRequest) {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // CRITICAL: Remove Content-Type for FormData to let browser set boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
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
        console.error("🔒 401 Unauthorized - Token expired or invalid");
        console.error("Current URL:", window.location.pathname);
        console.error("Error:", error.response.data);
        
        // Clear both possible token keys
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");

        // Only redirect to signin if not on a public page
        const currentPath = window.location.pathname;
        const isPublicPage =
          currentPath === "/" ||
          currentPath.startsWith("/books") ||
          currentPath.startsWith("/book/") ||
          currentPath.startsWith("/category") ||
          currentPath.startsWith("/about") ||
          currentPath.startsWith("/qa") ||
          currentPath.startsWith("/faq") ||
          currentPath.startsWith("/search") ||
          currentPath.startsWith("/signin") ||
          currentPath.startsWith("/signup");

        if (!isPublicPage) {
          console.log("🔄 Redirecting to signin...");
          window.location.href = "/signin";
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

export default apiClient;
export { API_BASE_URL };
