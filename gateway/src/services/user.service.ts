import axios from 'axios';
import { services } from '../config/services.config';

const userService = services.find(s => s.name === 'user-service');
const baseURL = userService?.url || 'http://localhost:3003';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  preferences: {
    favoriteGenres?: string[];
    languagePreference?: string;
    contentRating?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export class UserService {
  static async searchUsers(query: string, page: number = 1, limit: number = 10) {
    const response = await axios.get(`${baseURL}/api/users/search`, {
      params: { query, page, limit }
    });
    return response.data;
  }

  static async getUserById(id: string) {
    const response = await axios.get(`${baseURL}/api/users/${id}`);
    return response.data;
  }

  static async register(userData: Partial<User>) {
    const response = await axios.post(`${baseURL}/api/auth/register`, userData);
    return response.data;
  }

  static async updateUser(id: string, updateData: Partial<User>) {
    const response = await axios.put(`${baseURL}/api/users/${id}`, updateData);
    return response.data;
  }

  static async deleteUser(id: string) {
    const response = await axios.delete(`${baseURL}/api/users/${id}`);
    return response.data;
  }

  static async login(email: string, password: string) {
    const response = await axios.post(`${baseURL}/api/auth/login`, {
      email,
      password
    });
    return response.data;
  }

  static async updatePreferences(id: string, preferences: User['preferences']) {
    const response = await axios.put(`${baseURL}/api/users/${id}/preferences`, preferences);
    return response.data;
  }
}

export const User = UserService;