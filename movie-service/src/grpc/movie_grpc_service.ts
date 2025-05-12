import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { Movie } from '../models/Movie';
import mongoose from 'mongoose';

const PROTO_PATH = path.join(__dirname, '../../../proto/movie.proto');

// Load proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;
const movieService = proto.movie.MovieService;

// Type definitions
interface MovieRequest {
  id: string;
}

interface ListMoviesRequest {
  page?: number;
  limit?: number;
}

interface CreateMovieRequest {
  title: string;
  genre: string;
  summary: string;
  rating: number;
  releaseYear: number;
  posterUrl?: string;
}

interface UpdateMovieRequest extends Partial<CreateMovieRequest> {
  id: string;
}

// GRPC Response Interface
interface IMovie {
  _id: string;
  title: string;
  description: string;
  director: string;
  genres: string[];
  release_year: number;
  rating: number;
  poster_url: string;
  created_at: string;
  updated_at: string;
}

// MongoDB Document Interface
interface MongoMovie extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  genre: string;
  summary: string;
  rating: number;
  releaseYear: number;
  posterUrl?: string;
  director?: string;  // Add this line
  createdAt: Date;
  updatedAt: Date;
}

interface LeanMongoMovie {
  _id: mongoose.Types.ObjectId;
  title: string;
  genre: string;
  summary: string;
  rating: number;
  releaseYear: number;
  posterUrl?: string;
  director?: string;  // Add this line
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

// Helper function to convert MongoDB document to IMovie
const convertToIMovie = (movie: LeanMongoMovie): IMovie => {
  if (!movie) {
    throw new Error('Movie object is null or undefined');
  }
  
  return {
    _id: movie._id.toString(),
    title: movie.title,
    description: movie.summary,
    director: movie.director || "",
    genres: Array.isArray(movie.genre) ? movie.genre : [movie.genre],
    release_year: movie.releaseYear,
    rating: movie.rating,
    poster_url: movie.posterUrl || "",
    created_at: movie.createdAt ? movie.createdAt.toISOString() : new Date().toISOString(),
    updated_at: movie.updatedAt ? movie.updatedAt.toISOString() : new Date().toISOString()
  };
};

const movieGrpcHandlers = {
  GetMovie: async (
    call: grpc.ServerUnaryCall<MovieRequest, IMovie>,
    callback: grpc.sendUnaryData<IMovie>
  ) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(call.request.id)) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Invalid movie ID format'
        });
      }

      const movie = await Movie.findById(call.request.id).lean<LeanMongoMovie>();
      if (!movie) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: 'Movie not found'
        });
      }
      
      callback(null, convertToIMovie(movie));
    } catch (err) {
      console.error('GetMovie error:', err);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error'
      });
    }
  },

  ListMovies: async (
    call: grpc.ServerUnaryCall<ListMoviesRequest, { movies: IMovie[]; total: number }>,
    callback: grpc.sendUnaryData<{ movies: IMovie[]; total: number }>
  ) => {
    try {
      const page = call.request.page || 1;
      const limit = call.request.limit || 10;
      const skip = (page - 1) * limit;

      const [movies, total] = await Promise.all([
        Movie.find().skip(skip).limit(limit).lean<LeanMongoMovie[]>(),
        Movie.countDocuments()
      ]);

      callback(null, { 
        movies: movies.map(convertToIMovie),
        total 
      });
    } catch (err) {
      console.error('ListMovies error:', err);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error'
      });
    }
  },

  CreateMovie: async (
    call: grpc.ServerUnaryCall<CreateMovieRequest, IMovie>,
    callback: grpc.sendUnaryData<IMovie>
  ) => {
    try {
      const movie = await Movie.create(call.request);
      const leanMovie = movie.toObject() as unknown as LeanMongoMovie;
      callback(null, convertToIMovie(leanMovie));
    } catch (err) {
      console.error('CreateMovie error:', err);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to create movie'
      });
    }
  },

  UpdateMovie: async (
    call: grpc.ServerUnaryCall<UpdateMovieRequest, IMovie>,
    callback: grpc.sendUnaryData<IMovie>
  ) => {
    try {
      const { id, ...updates } = call.request;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Invalid movie ID format'
        });
      }

      const movie = await Movie.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      ).lean<LeanMongoMovie>();

      if (!movie) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: 'Movie not found'
        });
      }

      callback(null, convertToIMovie(movie));
    } catch (err) {
      console.error('UpdateMovie error:', err);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to update movie'
      });
    }
  },

  DeleteMovie: async (
    call: grpc.ServerUnaryCall<MovieRequest, { success: boolean }>,
    callback: grpc.sendUnaryData<{ success: boolean }>
  ) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(call.request.id)) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Invalid movie ID format'
        });
      }

      const movie = await Movie.findByIdAndDelete(call.request.id);
      callback(null, { success: !!movie });
    } catch (err) {
      console.error('DeleteMovie error:', err);
      callback({
        code: grpc.status.INTERNAL,
        message: 'Failed to delete movie'
      });
    }
  },

  ProcessMovieEvent: (
    call: grpc.ServerDuplexStream<
      { event_type: string; movie: IMovie; timestamp: string },
      { success: boolean; message_id: string }
    >
  ) => {
    call.on('data', async (event) => {
      console.log(`Received movie event: ${event.event_type}`, event.movie);
      
      try {
        if (!event || !event.movie) {
          throw new Error('Invalid event or movie data');
        }

        const movieData = {
          title: event.movie.title || '',
          genre: event.movie.genres?.[0] || 'Unknown',
          summary: event.movie.description || '',
          rating: event.movie.rating || 0,
          releaseYear: event.movie.release_year || new Date().getFullYear(),
          posterUrl: event.movie.poster_url || ''
        };

        // Validate required fields
        if (!movieData.title) {
          throw new Error('Movie title is required');
        }

        switch (event.event_type) {
          case 'CREATED':
            await Movie.create(movieData);
            break;
          case 'UPDATED':
            if (!event.movie._id || !mongoose.Types.ObjectId.isValid(event.movie._id)) {
              throw new Error('Invalid movie ID for update');
            }
            await Movie.findByIdAndUpdate(event.movie._id, movieData, { new: true });
            break;
          case 'DELETED':
            if (!event.movie._id || !mongoose.Types.ObjectId.isValid(event.movie._id)) {
              throw new Error('Invalid movie ID for deletion');
            }
            await Movie.findByIdAndDelete(event.movie._id);
            break;
          default:
            throw new Error(`Unknown event type: ${event.event_type}`);
        }

        call.write({
          success: true,
          message_id: `${event.event_type}-${Date.now()}`
        });
      } catch (error) {
        console.error('Error processing movie event:', error);
        call.write({
          success: false,
          message_id: `error-${Date.now()}`
        });
      }
    });

    call.on('end', () => {
      call.end();
    });

    call.on('error', (error) => {
      console.error('Stream error:', error);
      call.end();
    });
  }
};

export { movieService, movieGrpcHandlers };