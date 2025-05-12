import { UserPreference } from '../models/UserPreference';
import axios from 'axios';

interface MovieData {
    id: string;
    _id?: string;  
    title: string;
    genre: string[];  
    summary: string;
    rating: number;
    releaseYear: number;
    posterUrl?: string;
    createdAt: string;
    updatedAt: string;
    score?: number;  
}

interface MovieResponse {
    movies: MovieData[];
}

export class RecommendationService {
    private readonly MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || 'http://localhost:3001';

    async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<MovieData[]> {
        try {
            // Get user's preferences
            const userPreferences = await UserPreference.find({ userId });
            
            if (!userPreferences.length) {
                return this.getPopularMovies(limit);
            }
            const genrePreferences = this.calculateGenrePreferences(userPreferences);
            const allMovies = await this.fetchMoviesFromService();
            const scoredMovies = this.scoreMovies(allMovies, genrePreferences, userPreferences);
            
            return scoredMovies.slice(0, limit);
        } catch (error) {
            console.error('Error generating recommendations:', error);
            throw error;
        }
    }

    private calculateGenrePreferences(preferences: any[]): Map<string, number> {
        const genreScores = new Map<string, number>();
        
        preferences.forEach(pref => {
            pref.favoriteGenres.forEach((genre: string) => {
                const currentScore = genreScores.get(genre) || 0;
                genreScores.set(genre, currentScore + (pref.rating * pref.watchCount));
            });
        });
        
        return genreScores;
    }

    private async getPopularMovies(limit: number): Promise<MovieData[]> {
        try {
            const response = await axios.get<MovieResponse>(`${this.MOVIE_SERVICE_URL}/api/movies/popular?limit=${limit}`);
            return response.data.movies;
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            throw error;
        }
    }

    private async fetchMoviesFromService(): Promise<MovieData[]> {
        try {
            const response = await axios.get<MovieResponse>(`${this.MOVIE_SERVICE_URL}/api/movies`);
            return response.data.movies;
        } catch (error) {
            console.error('Error fetching movies:', error);
            throw error;
        }
    }

    private scoreMovies(
        movies: MovieData[],
        genrePreferences: Map<string, number>,
        userPreferences: any[]
    ): MovieData[] {
        const watchedMovies = new Set(userPreferences.map(pref => pref.movieId));
        
        return movies
            .filter(movie => !watchedMovies.has(movie._id))
            .map(movie => {
                let score = 0;
                
                // Genre-based scoring
                movie.genre.forEach(genre => {
                    score += genrePreferences.get(genre) || 0;
                });
                score += movie.rating * 10;
                
                return { ...movie, score };
            })
            .sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    async updateUserPreference(
        userId: string,
        movieId: string,
        rating?: number,
        genres?: string[]
    ): Promise<void> {
        try {
            const update: any = {
                $inc: { watchCount: 1 },
                lastWatched: new Date()
            };

            if (rating !== undefined) {
                update.rating = rating;
            }

            if (genres && genres.length > 0) {
                update.favoriteGenres = genres;
            }

            await UserPreference.findOneAndUpdate(
                { userId, movieId },
                update,
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error('Error updating user preference:', error);
            throw error;
        }
    }

    async getRecommendations(userId: string, limit: number = 10): Promise<MovieData[]> {
        try {
            const response = await axios.get<MovieResponse>(`${this.MOVIE_SERVICE_URL}/recommendations/${userId}`, {
                params: { limit }
            });
            return response.data.movies;
        } catch (error) {
            throw new Error(`Failed to get recommendations: ${error}`);
        }
    }

    async getSimilarMovies(movieId: string, limit: number = 10): Promise<MovieData[]> {
        try {
            const response = await axios.get<MovieResponse>(`${this.MOVIE_SERVICE_URL}/similar/${movieId}`, {
                params: { limit }
            });
            return response.data.movies;
        } catch (error) {
            throw new Error(`Failed to get similar movies: ${error}`);
        }
    }
}