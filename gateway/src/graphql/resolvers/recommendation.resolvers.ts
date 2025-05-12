import { RecommendationService } from '../../services/recommendation.service';

export const recommendationResolvers = {
  Query: {
    userRecommendations: async (_: any, { limit = 10 }: { limit: number }) => {
      // Temporarily using a fixed userId for testing
      const userId = "681fb8cbe88a07ac47ae8ddb";
      const recommendations = await RecommendationService.getUserRecommendations(userId, limit);
      return recommendations;
    },

    popularRecommendations: async (_: any, { limit = 10 }: { limit: number }) => {
      const recommendations = await RecommendationService.getPopularRecommendations(limit);
      return recommendations;
    },

    recommendationsByGenre: async (_: any, { genre, limit = 10 }: { genre: string; limit: number }) => {
      const recommendations = await RecommendationService.getRecommendationsByGenre(genre, limit);
      return recommendations;
    }
  },

  Mutation: {
    updatePreferences: async (_: any, { input }: { input: any }) => {
      // Temporarily using a fixed userId for testing
      const userId = "681fb8cbe88a07ac47ae8ddb";
      const updatedPreferences = await RecommendationService.updateUserPreferences(userId, input);
      return updatedPreferences;
    },

    markAsWatched: async (_: any, { movieId, watchDuration }: { movieId: string, watchDuration?: number }) => {
      // Temporarily using a fixed userId for testing
      const userId = "681fb8cbe88a07ac47ae8ddb";
      await RecommendationService.markMovieAsWatched(userId, movieId, watchDuration);
      return true;
    }
  }
};
