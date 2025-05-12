import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const authService = new AuthService();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const result = await authService.login(req.body);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: (error as Error).message });
    }
});

// Get current user
router.get('/me', authenticate, async (req: Request, res: Response) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Verify token
router.post('/verify-token', async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const user = await authService.verifyToken(token);
        return res.json({ valid: true, user });
    } catch (error) {
        return res.status(401).json({ valid: false, error: (error as Error).message });
    }
});

export default router;