import axios from "axios";

const resolveApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Default to backend port 8001 (matching backend server default)
  return "http://localhost:8001";
};

/**
 * Global HTTP Axios Client Instance
 * Configured with cookie credentials and standard payload interceptors.
 */
export const httpClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for structured error unwrapping
httpClient.interceptors.response.use(
  (successfulResponse) => successfulResponse,
  (networkOrHttpError) => {
    // Dispatch session event if 401 unauthorized occurs
    if (networkOrHttpError.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("shopkart:unauthorized-session"));
    }
    return Promise.reject(networkOrHttpError);
  }
);

export default httpClient;
