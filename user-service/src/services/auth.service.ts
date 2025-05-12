import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { z } from 'zod';


const JWT_SECRET: string = process.env.JWT_SECRET || 'your-fallback-secret';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h';


// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    username: z.string().min(3),
    firstName: z.string().optional(),
    lastName: z.string().optional()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export class AuthService {
    async register(userData: z.infer<typeof registerSchema>) {
        try {
            // Validate input
            const validatedData = registerSchema.parse(userData);

            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [
                    { email: validatedData.email },
                    { username: validatedData.username }
                ]
            });

            if (existingUser) {
                throw new Error('User with this email or username already exists');
            }

            // Create new user
            const user = new User(validatedData);
            await user.save();

            // Generate token
            const token = this.generateToken(user);

            return {
                token,
                user: this.sanitizeUser(user)
            };
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error('Invalid input data: ' + error.errors.map(e => e.message).join(', '));
            }
            throw error;
        }
    }

    async login(credentials: z.infer<typeof loginSchema>) {
        try {
            // Validate input
            const validatedData = loginSchema.parse(credentials);

            // Find user
            const user = await User.findOne({ email: validatedData.email });
            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Check password
            const isValid = await user.comparePassword(validatedData.password);
            if (!isValid) {
                throw new Error('Invalid credentials');
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Generate token
            const token = this.generateToken(user);

            return {
                token,
                user: this.sanitizeUser(user)
            };
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error('Invalid input data: ' + error.errors.map(e => e.message).join(', '));
            }
            throw error;
        }
    }

    async verifyToken(token: string) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
            const user = await User.findById(decoded.userId).lean() as IUser;
            
            if (!user) {
                throw new Error('User not found');
            }

            return this.sanitizeUser(user);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
    private generateToken(user: IUser): string {
        const payload = { userId: (user as any)._id.toString() };
        const options = {
            expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
        };
        
        return jwt.sign(payload, JWT_SECRET, options);
    }


    private sanitizeUser(user: IUser) {
        const { password, ...sanitizedUser } = user.toObject();
        return sanitizedUser;
    }
}