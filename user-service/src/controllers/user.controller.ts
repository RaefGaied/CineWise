import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const userService = new UserService();

// Get user profile
router.get('/profile', authenticate, async (req: Request, res: Response) => {
    try {
        const user = await userService.getUserById(req.userId!);
        res.json(user);
    } catch (error) {
        res.status(404).json({ error: (error as Error).message });
    }
});

// Update user profile
router.put('/profile', authenticate, async (req: Request, res: Response) => {
    try {
        const user = await userService.updateUser(req.userId!, req.body);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

// Watchlist management
router.post('/watchlist/:movieId', authenticate, async (req: Request, res: Response) => {
    try {
        const user = await userService.addToWatchlist(req.userId!, req.params.movieId);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

router.delete('/watchlist/:movieId', authenticate, async (req: Request, res: Response) => {
    try {
        const user = await userService.removeFromWatchlist(req.userId!, req.params.movieId);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

// Favorites management
router.post('/favorites/:movieId', authenticate, async (req: Request, res: Response) => {
    try {
        const user = await userService.addToFavorites(req.userId!, req.params.movieId);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

router.delete('/favorites/:movieId', authenticate, async (req: Request, res: Response) => {
    try {
        const user = await userService.removeFromFavorites(req.userId!, req.params.movieId);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

// Update preferences
router.put('/preferences', authenticate, async (req: Request, res: Response) => {
    try {
        const user = await userService.updatePreferences(req.userId!, req.body);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

// Admin routes
router.get('/search', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { q, page, limit } = req.query;
        const result = await userService.searchUsers(
            q as string,
            page ? parseInt(page as string) : undefined,
            limit ? parseInt(limit as string) : undefined
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

router.delete('/:userId', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const result = await userService.deleteUser(req.params.userId);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: (error as Error).message });
    }
});

export default router; 