import axios from 'axios';
import { services } from '../config/services.config';

const recommendationService = services.find(s => s.name === 'recommendation-service');
const baseURL = recommendationService?.url || 'http://localhost:3002';

export interface MovieRecommendation {
  movieId: string;
  title: string;
  score: number;
  reason: string;
  genre: string[];
  posterUrl?: string;
}

export interface UserPreferences {
  favoriteGenres: string[];
  watchHistory: string[];
  ratings: { movieId: string; rating: number }[];
}

export interface WatchedMovieResponse {
  success: boolean;
  movie: {
    id: string;
    title: string;
  };
  watchDuration: number | null;
  watchedAt: string;
}

export class RecommendationService {
  static async getUserRecommendations(userId: string, limit: number = 10) {
    const response = await axios.get(`${baseURL}/api/recommendations/user/${userId}`, {
      params: { limit }
    });
    return response.data;
  }

  static async getPopularRecommendations(limit: number = 10) {
    const response = await axios.get(`${baseURL}/api/recommendations/popular`, {
      params: { limit }
    });
    return response.data;
  }

  static async getRecommendationsByGenre(genre: string, limit: number = 10) {
    const response = await axios.get(`${baseURL}/api/recommendations/genre/${genre}`, {
      params: { limit }
    });
    return response.data;
  }

  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
    const response = await axios.put(
      `${baseURL}/api/recommendations/preferences/${userId}`,
      preferences
    );
    return response.data;
  }

  static async markMovieAsWatched(userId: string, movieId: string, watchDuration?: number): Promise<WatchedMovieResponse> {
    const response = await axios.post(`${baseURL}/api/recommendations/watched`, {
      userId,
      movieId,
      watchDuration: watchDuration || null
    });
    return response.data as WatchedMovieResponse;
  
  }
}

export const Recommendation = RecommendationService;