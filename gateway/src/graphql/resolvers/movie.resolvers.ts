
import { MovieService } from '../../services/movie.service';


// Define the expected result type for MovieService.find
// Define the types properly
interface Movie {
  id: string;
  title: string;
  genre: string;
  rating: number;
}

interface MovieConnection {
  edges: Movie[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
    totalPages: number;
  };
  totalCount: number;
}

interface MovieSearchResult {
  data: Movie[];
  total: number;
  totalPages: number;
}

interface MovieSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  exclude?: string;
}

export const movieResolvers = {
  Query: {
    movies: async (_: any, { page = 1, limit = 10 }: { page: number; limit: number }) => {
      try {
        const searchParams: MovieSearchParams = {
          page: Number(page),
          limit: Number(limit)
        };
        
        // Ensure page is always a number
        const pageNumber = searchParams.page || 1;
        const moviesResult = await MovieService.find(pageNumber) as unknown as MovieSearchResult;
        
        if (!moviesResult) {
          throw new Error('No results returned from MovieService');
        }

        const connection: MovieConnection = {
          edges: moviesResult.data || [],
          pageInfo: {
            hasNextPage: pageNumber < (moviesResult.totalPages || 1),
            hasPreviousPage: pageNumber > 1,
            currentPage: pageNumber,
            totalPages: moviesResult.totalPages || 1
          },
          totalCount: moviesResult.total || 0
        };

        return connection;
      } catch (error) {
        console.error('Error in movies resolver:', error);
        return {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            currentPage: page,
            totalPages: 1
          },
          totalCount: 0
        } as MovieConnection;
      }
    },

    movie: async (_: any, { id }: { id: string }) => {
      return await MovieService.findById(id);
    },

    searchMovies: async (_: any, { query: searchQuery }: { query: string }) => {
      const searchParams: MovieSearchParams = {
        page: 1,
        limit: 10,
        search: searchQuery
      };
      
      // Ensure page is always a number
      const pageNumber = searchParams.page || 1;
      const moviesResult = await MovieService.find(pageNumber) as unknown as MovieSearchResult;
      const filteredResults = moviesResult.data?.filter(movie => 
        movie.title.toLowerCase().includes(searchParams.search?.toLowerCase() || '')
      );
      return filteredResults || [];
    }
  },

 Mutation: {
  createMovie: async (_: any, { input }: { input: any }) => {
    try {
      return await MovieService.create(input);
    } catch (error) {
      console.error('Error creating movie:', error);
      throw new Error('Failed to create movie');
    }
  },

  updateMovie: async (_: any, { id, input }: { id: string; input: any }) => {
    try {
      return await MovieService.findByIdAndUpdate(id, input);
    } catch (error) {
      console.error('Error updating movie:', error);
      throw new Error('Failed to update movie');
    }
  },

  deleteMovie: async (_: any, { id }: { id: string }) => {
    try {
      const result = await MovieService.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting movie:', error);
      throw new Error('Failed to delete movie');
    }
  }
},


  Movie: {
    recommendations: async (movie: Movie) => {
      const searchParams: MovieSearchParams = {
        page: 1,
        limit: 10,
        genre: movie.genre,
        exclude: movie.id
      };
      
      // Ensure page is always a number
      const pageNumber = searchParams.page || 1;
      const moviesResult = await MovieService.find(pageNumber) as unknown as MovieSearchResult;
      const filteredResults = moviesResult.data?.filter(m => 
        m.genre === searchParams.genre && m.id !== searchParams.exclude
      );
      return filteredResults || [];
    }
  }
};