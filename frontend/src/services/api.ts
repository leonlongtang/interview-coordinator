import axios from "axios";

/**
 * Axios instance configured for our Django backend API.
 * Centralizes API configuration so all requests use the same base URL and headers.
 */
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    // Successful response - just return it
    return response;
  },
  (error) => {
    // Log errors for debugging during development
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

