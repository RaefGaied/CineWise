import { Request, Response, Router } from 'express';
import { MovieService } from '../services/movie_service';


const router: Router = Router();
const movieService = new MovieService();

// Get all movies with pagination
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await movieService.listMovies(page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search movies
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string || '';
    const movies = await movieService.searchMovies(query);
    res.json(movies);
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get movie by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const movie = await movieService.getMovieById(req.params.id);
    if (!movie) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }
    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new movie - Admin only
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, genre, summary, rating, releaseYear, posterUrl } = req.body;

    // Validate required fields
    if (!title || !genre || !summary || rating === undefined || !releaseYear) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const movie = await movieService.createMovie({
      title,
      genre,
      summary,
      rating,
      releaseYear,
      posterUrl
    });

    res.status(201).json(movie);
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(400).json({ error: 'Invalid request data' });
  }
});

// Update movie - Admin only
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, genre, summary, rating, releaseYear, posterUrl } = req.body;
    const movieData = {
      ...(title && { title }),
      ...(genre && { genre }),
      ...(summary && { summary }),
      ...(rating !== undefined && { rating }),
      ...(releaseYear && { releaseYear }),
      ...(posterUrl && { posterUrl })
    };

    const updatedMovie = await movieService.updateMovie(req.params.id, movieData);
    if (!updatedMovie) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }
    res.json(updatedMovie);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(400).json({ error: 'Invalid request data' });
  }
});

// Delete movie - Admin only
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const success = await movieService.deleteMovie(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cleanup when the server shuts down
process.on('SIGTERM', async () => {
  await movieService.disconnect();
});

export default router;
