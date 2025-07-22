import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = useAuthStore.getState().token;

    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      hasToken: !!token,
      endpoint
    });

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            url,
            error: errorData,
            headers: Object.fromEntries(response.headers.entries())
          });
        } catch (jsonError) {
          const text = await response.text();
          console.error('API Error (non-JSON response):', {
            status: response.status,
            statusText: response.statusText,
            url,
            responseText: text,
            headers: Object.fromEntries(response.headers.entries())
          });
        }
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
      }

      try {
        const data = await response.json();
        console.log('API Response:', {
          url,
          status: response.status,
          data: endpoint === '/auth/login' ? { ...data, token: '***' } : data
        });
        return data;
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', {
          error: jsonError,
          url,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('API request failed:', {
        error,
        url,
        method: config.method || 'GET',
        hasToken: !!token
      });
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = useAuthStore.getState().token;
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

