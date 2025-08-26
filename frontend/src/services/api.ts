import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Configure axios to include credentials
axios.defaults.withCredentials = true;

// Add CSRF token to requests
axios.interceptors.request.use(
  (config) => {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];

    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 403) {
      // CSRF or permission error - could redirect to login or show appropriate message
    }
    return Promise.reject(error);
  }
);

// Types
export interface Prompt {
  id: number;
  title: string;
  description: string;
  prompt_text: string;
  category_name: string;
  difficulty: string;
  difficulty_display: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  tags_detail: Tag[];
}

export interface PromptListItem {
  id: number;
  title: string;
  description: string;
  category_name: string;
  difficulty: string;
  difficulty_display: string;
  views_count: number;
  likes_count: number;
  tags_detail: Tag[];
}

export interface Category {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  icon_emoji: string;
  color: string;
  order: number;
  is_featured: boolean;
  prompts_count: number;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface StatsResponse {
  total_prompts: number;
  total_categories: number;
  total_views: number;
  total_likes: number;
  popular_prompts: PromptListItem[];
}

// Authentication interfaces
interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  bio?: string;
  is_verified: boolean;
  date_joined: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

interface LoginData {
  email: string;
  password: string;
}

// Authentication API methods
export const authAPI = {
  register: async (userData: RegisterData) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register/`, userData);
    return response.data;
  },

  login: async (loginData: LoginData) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login/`, loginData);
    return response.data;
  },

  logout: async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/logout/`);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/password-reset/`, { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string, confirmPassword: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/password-reset/confirm/`, {
      token,
      new_password: newPassword,
      new_password_confirm: confirmPassword,
    });
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/change-password/`, {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: confirmPassword,
    });
    return response.data;
  },

  ssoLogin: async (provider: string, accessToken: string, userInfo: any) => {
    const response = await axios.post(`${API_BASE_URL}/auth/sso/`, {
      provider,
      access_token: accessToken,
      user_info: userInfo,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await axios.get(`${API_BASE_URL}/auth/profile/`);
    return response.data;
  },

  updateProfile: async (userData: Partial<User>) => {
    const response = await axios.put(`${API_BASE_URL}/auth/profile/`, userData);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await axios.get(`${API_BASE_URL}/auth/verify-email/${token}/`);
    return response.data;
  },
};

// Utility functions
export const getDifficultyColor = (difficulty: string): string => {
  const colors = {
    'Dễ': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    'Trung bình': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    'Khó': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  };
  return colors[difficulty as keyof typeof colors] || colors['Trung bình'];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// API Service Class
class ApiService {
  private baseURL = API_BASE_URL;

  // Get CSRF token
  async getCSRFToken(): Promise<void> {
    try {
      await axios.get(`${this.baseURL}/auth/csrf/`, { withCredentials: true });
    } catch (error) {
      console.warn('Failed to get CSRF token:', error);
    }
  }

  // Authentication methods
  async register(userData: RegisterData) {
    return authAPI.register(userData);
  }

  async login(email: string, password: string) {
    return authAPI.login({ email, password });
  }

  async logout() {
    return authAPI.logout();
  }

  async forgotPassword(email: string) {
    return authAPI.forgotPassword(email);
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    return authAPI.resetPassword(token, newPassword, confirmPassword);
  }

  async changePassword(oldPassword: string, newPassword: string, confirmPassword: string) {
    return authAPI.changePassword(oldPassword, newPassword, confirmPassword);
  }

  async ssoLogin(provider: string, accessToken: string, userInfo: any) {
    return authAPI.ssoLogin(provider, accessToken, userInfo);
  }

  async getProfile() {
    return authAPI.getProfile();
  }

  async updateProfile(userData: Partial<User>) {
    return authAPI.updateProfile(userData);
  }

  async verifyEmail(token: string) {
    return authAPI.verifyEmail(token);
  }

  // Prompt methods
  async getPrompts(params: any = {}): Promise<PaginatedResponse<PromptListItem>> {
    const response = await axios.get(`${this.baseURL}/prompts/`, { params });
    return response.data;
  }

  async getPrompt(id: number): Promise<Prompt> {
    const response = await axios.get(`${this.baseURL}/prompts/${id}/`);
    return response.data;
  }

  async likePrompt(id: number): Promise<{ likes_count: number }> {
    const response = await axios.post(`${this.baseURL}/prompts/${id}/like/`);
    return response.data;
  }

  async getPromptStats(): Promise<StatsResponse> {
    const response = await axios.get(`${this.baseURL}/prompts/stats/`);
    return response.data;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    const response = await axios.get(`${this.baseURL}/categories/`);
    return response.data;
  }

  async getFeaturedCategories(): Promise<Category[]> {
    const response = await axios.get(`${this.baseURL}/categories/featured/`);
    return response.data;
  }

  async getCategory(id: number): Promise<Category> {
    const response = await axios.get(`${this.baseURL}/categories/${id}/`);
    return response.data;
  }

  // Tag methods
  async getTags(): Promise<Tag[]> {
    const response = await axios.get(`${this.baseURL}/tags/`);
    return response.data;
  }

  // AI Chat methods
  async chatWithAI(promptId: number, provider: string, message: string): Promise<any> {
    const response = await axios.post(`${this.baseURL}/prompts/${promptId}/chat/`, {
      provider,
      message
    });
    return response.data;
  }

  async getAIProviders(): Promise<any> {
    const response = await axios.get(`${this.baseURL}/ai/providers/`);
    return response.data;
  }

  // Contact methods
  async submitContactMessage(data: ContactMessageData): Promise<ContactMessageResponse> {
    const response = await axios.post(`${this.baseURL}/contact/`, data);
    return response.data;
  }
}

// Contact form interfaces
export interface ContactMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  message: string;
  id: number;
  created_at: string;
}

export const apiService = new ApiService();
