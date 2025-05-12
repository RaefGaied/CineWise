import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    watchlist: string[]; // Array of movie IDs
    favorites: string[]; // Array of movie IDs
    preferences: {
        favoriteGenres: string[];
        languagePreference: string;
        contentRating: string[];
    };
    role: 'user' | 'admin';
    isVerified: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    profilePicture: {
        type: String
    },
    watchlist: [{
        type: String, // Movie IDs
        ref: 'Movie'
    }],
    favorites: [{
        type: String, // Movie IDs
        ref: 'Movie'
    }],
    preferences: {
        favoriteGenres: [{
            type: String
        }],
        languagePreference: {
            type: String,
            default: 'en'
        },
        contentRating: [{
            type: String
        }]
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
UserSchema.index({ email: 1, username: 1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

export const User = mongoose.model<IUser>('User', UserSchema); 