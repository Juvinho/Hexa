import axios from 'axios';
import { toast } from 'sonner';

export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retryCount?: number;
}

const defaultConfig: ApiConfig = {
  baseUrl: 'http://localhost:3000/api',
  timeout: 10000,
  retryCount: 3,
};

// Create the axios instance
const api = axios.create({
  baseURL: defaultConfig.baseUrl,
  timeout: defaultConfig.timeout,
  withCredentials: true, // Important for Cookies
});

// Cache storage
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Memory Token
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// Configuration function
export const configureApi = (config: ApiConfig) => {
  api.defaults.baseURL = config.baseUrl;
  api.defaults.timeout = config.timeout || 10000;
  if (config.apiKey) {
    api.defaults.headers.common['x-api-key'] = config.apiKey;
  }
  (api as any).retryCount = config.retryCount || 3;
};

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

// Request Interceptor
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Add CSRF Token
  const csrfToken = getCookie('X-CSRF-Token');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  
  // Cache check for GET requests
  if (config.method === 'get' && config.headers?.['x-use-cache']) {
    const key = `${config.baseURL}${config.url}`;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      config.adapter = () => {
        return Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: {}
        });
      };
    }
  }

  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Cache response for GET requests
    if (response.config.method === 'get' && response.config.headers?.['x-use-cache']) {
      const key = `${response.config.baseURL}${response.config.url}`;
      cache.set(key, { data: response.data, timestamp: Date.now() });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 - Refresh Token
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/refresh-token')) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint (which uses the HttpOnly cookie)
        const response = await api.post('/auth/refresh-token');
        const { token } = response.data;
        
        setAccessToken(token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - Logout user
        setAccessToken(null);
        // Dispatch custom event or callback to redirect to login
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      }
    }
    
    // Retry logic (only if not 401 or if retry is allowed)
    if (!originalRequest || !originalRequest.retry) {
      originalRequest.retry = 0;
    }
    
    const maxRetries = (api as any).retryCount || 3;
    
    if (originalRequest.retry < maxRetries && error.response?.status !== 401 && error.response?.status !== 403) {
      originalRequest.retry += 1;
      const delay = 1000 * Math.pow(2, originalRequest.retry); // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
