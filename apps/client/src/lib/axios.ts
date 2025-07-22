import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create axios instance with base URL and credentials
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };

// Helper function to handle API errors
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return error.response?.data?.message || 'An error occurred';
  } else if (error instanceof Error) {
    // The request was made but no response was received
    return 'No response from server. Please check your connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || 'An unexpected error occurred';
  }
}
