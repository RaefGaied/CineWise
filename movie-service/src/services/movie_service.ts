import { Movie, IMovie } from '../models/Movie';
import { Kafka, Producer } from 'kafkajs';

export class MovieService {
  private producer: Producer | null = null;

  constructor() {
    try {
      const kafka = new Kafka({
        clientId: 'movie-service',
        brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
      });
      this.producer = kafka.producer();
      this.producer.connect().catch((err: Error) => {
        console.warn('Failed to connect to Kafka:', err.message);
        this.producer = null;
      });
    } catch (err: unknown) {
      console.warn('Failed to initialize Kafka:', err instanceof Error ? err.message : 'Unknown error');
      this.producer = null;
  }
  }

  private async publishEvent(topic: string, message: any): Promise<void> {
    if (!this.producer) {
      console.warn('Kafka producer not available, skipping event publication');
      return;
    }
    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }]
      });
    } catch (err: unknown) {
      console.warn(`Failed to publish event to ${topic}:`, err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async getMovieById(id: string): Promise<IMovie | null> {
    return await Movie.findById(id);
  }

  async listMovies(page: number = 1, limit: number = 10): Promise<{ movies: IMovie[]; total: number }> {
    const skip = (page - 1) * limit;
    const [movies, total] = await Promise.all([
      Movie.find().skip(skip).limit(limit),
      Movie.countDocuments()
    ]);
    return { movies, total };
  }

  async searchMovies(query: string): Promise<IMovie[]> {
    const searchRegex = new RegExp(query, 'i');
    return await Movie.find({
      $or: [
        { title: searchRegex },
        { summary: searchRegex },
        { genre: searchRegex }
      ]
    });
  }

  async createMovie(movieData: {
    title: string;
    genre: string;
    summary: string;
    rating: number;
    releaseYear: number;
    posterUrl?: string;
  }): Promise<IMovie> {
    const movie = new Movie(movieData);
    await movie.save();
    await this.publishEvent('movie-created', movie);
    return movie;
  }

  async updateMovie(id: string, movieData: Partial<{
    title: string;
    genre: string;
    summary: string;
    rating: number;
    releaseYear: number;
    posterUrl: string;
  }>): Promise<IMovie | null> {
    const movie = await Movie.findByIdAndUpdate(
      id,
      movieData,
      { new: true, runValidators: true }
    );

    if (movie) {
      await this.publishEvent('movie-updated', movie);
    }

    return movie;
  }

  async deleteMovie(id: string): Promise<boolean> {
    const movie = await Movie.findByIdAndDelete(id);
    
    if (movie) {
      await this.publishEvent('movie-deleted', { id });
      return true;
    }
    
    return false;
  }

  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }
}