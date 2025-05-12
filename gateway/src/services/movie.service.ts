import axios from 'axios';
import { services } from '../config/services.config';

const movieServiceConfig = services.find(s => s.name === 'movie-service');
const baseURL = movieServiceConfig?.url || 'http://localhost:3001';

export interface Movie {
  id: string;
  title: string;
  genres: string[];
  summary: string;
  director: string;
  rating: number;
  releaseYear: number;
  posterUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MovieConnection {
  edges: Movie[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
    totalPages: number;
  };
  totalCount: number;
}

/**
 * Transforme la forme brute du microservice en type Movie
 */
function transformMovie(raw: any): Movie {
  return {
    id: raw._id || raw.id,
    title: raw.title,
    genres: raw.genres || [],
    summary: raw.description,
    director: raw.director,
    rating: raw.rating ?? 0,
    releaseYear: raw.release_year,
    posterUrl: raw.image_url,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at
  };
}

export class MovieService {
  /**
   * Récupère les films paginés et construit un MovieConnection
   */
  static async find(
    page: number = 1,
    limit: number = 10
  ): Promise<MovieConnection> {
    // On suppose que le microservice renvoie { movies: any[], total: number }
    const response = await axios.get<{ movies: any[]; total: number }>(
      `${baseURL}/api/movies`,
      { params: { page, limit } }
    );
    const { movies: rawMovies, total } = response.data;
    const totalPages = Math.ceil(total / limit);

    const edges = rawMovies.map(transformMovie);
    return {
      edges,
      pageInfo: {
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      totalCount: total
    };
  }

  static async findById(id: string): Promise<Movie> {
    const response = await axios.get<any>(`${baseURL}/api/movies/${id}`);
    return transformMovie(response.data);
  }

  static async create(input: Partial<Movie>): Promise<Movie> {
    const response = await axios.post<any>(`${baseURL}/api/movies`, input);
    return transformMovie(response.data);
  }

  static async findByIdAndUpdate(
    id: string,
    update: Partial<Movie>
  ): Promise<Movie> {
    const response = await axios.put<any>(
      `${baseURL}/api/movies/${id}`,
      update
    );
    return transformMovie(response.data);
  }

  static async findByIdAndDelete(id: string): Promise<Movie> {
    const response = await axios.delete<any>(`${baseURL}/api/movies/${id}`);
    return transformMovie(response.data);
  }
}
