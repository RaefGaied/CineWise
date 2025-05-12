import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Movie } from '../models/Movie';
import express from 'express';
import movieController from '../controllers/movie_controller';
import { beforeEach, describe, it } from 'node:test';

const app = express();
app.use(express.json());
app.use('/api/movies', movieController);

describe('Movie Service API Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Setup MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await Movie.deleteMany({});
  });

  describe('POST /api/movies', () => {
    it('should create a new movie', async () => {
      const movieData = {
        title: 'Test Movie',
        genre: 'Action',
        summary: 'A test movie summary',
        rating: 8.5,
        releaseYear: 2024,
        posterUrl: 'http://example.com/poster.jpg'
      };

      const response = await request(app)
        .post('/api/movies')
        .send(movieData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(movieData.title);
    });

    it('should return 400 for invalid movie data', async () => {
      const invalidMovie = {
        title: 'Test Movie'
        // Missing required fields
      };

      await request(app)
        .post('/api/movies')
        .send(invalidMovie)
        .expect(400);
    });
  });

  describe('GET /api/movies', () => {
    beforeEach(async () => {
      // Add some test movies
      await Movie.create([
        {
          title: 'Movie 1',
          genre: 'Action',
          summary: 'Summary 1',
          rating: 8.0,
          releaseYear: 2024
        },
        {
          title: 'Movie 2',
          genre: 'Drama',
          summary: 'Summary 2',
          rating: 7.5,
          releaseYear: 2023
        }
      ]);
    });

    it('should return all movies with pagination', async () => {
      const response = await request(app)
        .get('/api/movies')
        .expect(200);

      expect(response.body.movies).toHaveLength(2);
      expect(response.body.total).toBe(2);
    });

    it('should search movies', async () => {
      const response = await request(app)
        .get('/api/movies/search?q=Action')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].genre).toBe('Action');
    });
  });

  describe('GET /api/movies/:id', () => {
    let testMovie: any;

    beforeEach(async () => {
      testMovie = await Movie.create({
        title: 'Test Movie',
        genre: 'Action',
        summary: 'Test Summary',
        rating: 8.0,
        releaseYear: 2024
      });
    });

    it('should return a movie by id', async () => {
      const response = await request(app)
        .get(`/api/movies/${testMovie._id}`)
        .expect(200);

      expect(response.body.title).toBe(testMovie.title);
    });

    it('should return 404 for non-existent movie', async () => {
      await request(app)
        .get('/api/movies/654321654321654321654321')
        .expect(404);
    });
  });

  describe('PUT /api/movies/:id', () => {
    let testMovie: any;

    beforeEach(async () => {
      testMovie = await Movie.create({
        title: 'Test Movie',
        genre: 'Action',
        summary: 'Test Summary',
        rating: 8.0,
        releaseYear: 2024
      });
    });

    it('should update a movie', async () => {
      const updateData = {
        title: 'Updated Movie',
        rating: 9.0
      };

      const response = await request(app)
        .put(`/api/movies/${testMovie._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.rating).toBe(updateData.rating);
    });
  });

  describe('DELETE /api/movies/:id', () => {
    let testMovie: any;

    beforeEach(async () => {
      testMovie = await Movie.create({
        title: 'Test Movie',
        genre: 'Action',
        summary: 'Test Summary',
        rating: 8.0,
        releaseYear: 2024
      });
    });

    it('should delete a movie', async () => {
      await request(app)
        .delete(`/api/movies/${testMovie._id}`)
        .expect(204);

      const deletedMovie = await Movie.findById(testMovie._id);
      expect(deletedMovie).toBeNull();
    });
  });
});



