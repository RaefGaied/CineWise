import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPreference extends Document {
    userId: string;
    movieId: string;
    rating: number;
    watchCount: number;
    lastWatched: Date;
    favoriteGenres: string[];
    createdAt: Date;
    updatedAt: Date;
}

const UserPreferenceSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    movieId: {
        type: String,
        required: true,
        index: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    watchCount: {
        type: Number,
        default: 1
    },
    lastWatched: {
        type: Date,
        default: Date.now
    },
    favoriteGenres: [{
        type: String
    }],
}, {
    timestamps: true
});


UserPreferenceSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export const UserPreference = mongoose.model<IUserPreference>('UserPreference', UserPreferenceSchema); 