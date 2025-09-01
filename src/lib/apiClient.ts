import { API_BASE_URL } from "./config";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }


  private async handleResponse(response: Response): Promise<Response> {
    if (response.status === 401) {
      // Token expired or invalid, clear it and redirect to login
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
      window.location.href = '/auth/Login';
      throw new Error('Unauthorized - redirecting to login');
    }
    
    return response;
  }


  private async fetchWithAuth(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    return this.handleResponse(response);
  }

  async get(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return this.fetchWithAuth(endpoint, {
      ...options,
      method: 'GET',
    });
  }


  async post(endpoint: string, data?: any, options: RequestInit = {}): Promise<Response> {
    const config: RequestInit = {
      ...options,
      method: 'POST',
    };

    // Handle different data types
    if (data instanceof FormData) {
      config.body = data;
      // Don't set Content-Type for FormData, let browser set it with boundary
    } else if (data) {
      config.body = JSON.stringify(data);
      config.headers = {
        'Content-Type': 'application/json',
        ...config.headers,
      };
    }

    return this.fetchWithAuth(endpoint, config);
  }

  async put(endpoint: string, data?: any, options: RequestInit = {}): Promise<Response> {
    const config: RequestInit = {
      ...options,
      method: 'PUT',
    };

    if (data instanceof FormData) {
      config.body = data;
    } else if (data) {
      config.body = JSON.stringify(data);
      config.headers = {
        'Content-Type': 'application/json',
        ...config.headers,
      };
    }

    return this.fetchWithAuth(endpoint, config);
  }


  async delete(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return this.fetchWithAuth(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }


  async patch(endpoint: string, data?: any, options: RequestInit = {}): Promise<Response> {
    const config: RequestInit = {
      ...options,
      method: 'PATCH',
    };

    if (data instanceof FormData) {
      config.body = data;
    } else if (data) {
      config.body = JSON.stringify(data);
      config.headers = {
        'Content-Type': 'application/json',
        ...config.headers,
      };
    }

    return this.fetchWithAuth(endpoint, config);
  }

  async uploadFile(
    endpoint: string, 
    file: File, 
    additionalData?: Record<string, string>,
    onProgress?: (progress: number) => void
  ): Promise<Response> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional form data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    // If progress tracking is needed, use XMLHttpRequest
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 401) {
            localStorage.removeItem('access_token');
            sessionStorage.removeItem('access_token');
            window.location.href = '/auth/Login';
            reject(new Error('Unauthorized - redirecting to login'));
            return;
          }
          
          const response = new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: new Headers(),
          });
          resolve(response);
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        xhr.open('POST', url);
        
        const authHeaders = this.getAuthHeaders();
        if ('Authorization' in authHeaders && authHeaders.Authorization) {
          xhr.setRequestHeader('Authorization', authHeaders.Authorization as string);
        }
        
        xhr.send(formData);
      });
    }

    return this.post(endpoint, formData);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export { ApiClient };

export const apiGet = (endpoint: string, options?: RequestInit) => 
  apiClient.get(endpoint, options);

export const apiPost = (endpoint: string, data?: any, options?: RequestInit) => 
  apiClient.post(endpoint, data, options);

export const apiPut = (endpoint: string, data?: any, options?: RequestInit) => 
  apiClient.put(endpoint, data, options);

export const apiDelete = (endpoint: string, options?: RequestInit) => 
  apiClient.delete(endpoint, options);

export const apiPatch = (endpoint: string, data?: any, options?: RequestInit) => 
  apiClient.patch(endpoint, data, options);
