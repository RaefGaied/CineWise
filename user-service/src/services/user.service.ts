import { User, IUser } from '../models/User';
import { z } from 'zod';

const updateUserSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    profilePicture: z.string().optional(),
    preferences: z.object({
        favoriteGenres: z.array(z.string()).optional(),
        languagePreference: z.string().optional(),
        contentRating: z.array(z.string()).optional()
    }).optional()
});

export class UserService {
    async getUserById(userId: string) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async updateUser(userId: string, updateData: z.infer<typeof updateUserSchema>) {
        try {
            const validatedData = updateUserSchema.parse(updateData);
            
            const user = await User.findByIdAndUpdate(
                userId,
                { $set: validatedData },
                { new: true, runValidators: true }
            );

            if (!user) {
                throw new Error('User not found');
            }

            return user;
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error('Invalid input data: ' + error.errors.map(e => e.message).join(', '));
            }
            throw error;
        }
    }

    async addToWatchlist(userId: string, movieId: string) {
        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { watchlist: movieId } },
            { new: true }
        );

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async removeFromWatchlist(userId: string, movieId: string) {
        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { watchlist: movieId } },
            { new: true }
        );

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async addToFavorites(userId: string, movieId: string) {
        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { favorites: movieId } },
            { new: true }
        );

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async removeFromFavorites(userId: string, movieId: string) {
        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { favorites: movieId } },
            { new: true }
        );

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async updatePreferences(userId: string, preferences: IUser['preferences']) {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { preferences } },
            { new: true }
        );

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async deleteUser(userId: string) {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return { message: 'User deleted successfully' };
    }

    async searchUsers(query: string, page: number = 1, limit: number = 10) {
        const searchRegex = new RegExp(query, 'i');
        
        const users = await User.find({
            $or: [
                { username: searchRegex },
                { email: searchRegex },
                { firstName: searchRegex },
                { lastName: searchRegex }
            ]
        })
        .select('-password')
        .skip((page - 1) * limit)
        .limit(limit);

        const total = await User.countDocuments({
            $or: [
                { username: searchRegex },
                { email: searchRegex },
                { firstName: searchRegex },
                { lastName: searchRegex }
            ]
        });

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
} 