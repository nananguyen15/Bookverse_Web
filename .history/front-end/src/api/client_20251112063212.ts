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
  // Don't set default Content-Type here - let each request decide
});

// Public endpoints that don't require authentication (GET only)
const PUBLIC_ENDPOINTS = [
  "/books",
  "/authors",
  "/publishers",
  "/series",
  "/sup-categories",
  "/sub-categories",
];

// Request interceptor - Add auth token only for protected endpoints
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log("🔍 Request interceptor:", {
      url: config.url,
      method: config.method,
      dataType: config.data?.constructor?.name,
      isFormData: config.data instanceof FormData,
      contentType: config.headers?.["Content-Type"],
    });

    // Public endpoints only apply to GET requests
    const isPublicGetRequest =
      config.method?.toUpperCase() === "GET" &&
      PUBLIC_ENDPOINTS.some((endpoint) => config.url?.startsWith(endpoint));

    // Add token for all non-public requests (POST, PUT, DELETE or protected GET)
    if (!isPublicGetRequest) {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // IMPORTANT: Set Content-Type based on data type
    // - FormData: Set to false to prevent axios from setting it
    // - JSON: Explicitly set application/json
    if (
      config.data &&
      Object.prototype.toString.call(config.data) === "[object FormData]"
    ) {
      console.log("📦 Detected FormData - setting Content-Type to false");
      // Set Content-Type to false for FormData - tells axios not to set it
      // Browser will automatically set multipart/form-data with boundary
      if (config.headers) {
        config.headers.setContentType(false as any);
      }
    } else if (config.data && typeof config.data === 'object') {
      // For JSON data, explicitly set Content-Type
      console.log("📄 Detected JSON object - setting application/json");
      if (config.headers) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    console.log("📤 Final headers:", config.headers);
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

export default apiClient;
export { API_BASE_URL };
