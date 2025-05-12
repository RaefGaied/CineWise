import { Router, Request, Response } from 'express';
import { RecommendationService } from '../services/recommendation.service';

const router = Router();
const recommendationService = new RecommendationService();


router.get('/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit as string) || 10;
        
        const recommendations = await recommendationService.getPersonalizedRecommendations(userId, limit);
        res.json(recommendations);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});


router.post('/:userId/preferences', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { movieId, rating, genres } = req.body;

        if (!movieId) {
            return res.status(400).json({ error: 'movieId is required' });
        }

        await recommendationService.updateUserPreference(userId, movieId, rating, genres);
        res.status(200).json({ message: 'Preference updated successfully' });
    } catch (error) {
        console.error('Error updating preference:', error);
        res.status(500).json({ error: 'Failed to update preference' });
    }
});

export default router; 