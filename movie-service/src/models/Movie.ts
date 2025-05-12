import mongoose, { Schema, Document } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  description: string;
  director: string;
  genres: string[];
  release_year: number;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

const MovieSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  director: { type: String, required: true },
  genres: [{ type: String, required: true }],
  release_year: { type: Number, required: true },
  image_url: { type: String }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Movie = mongoose.model<IMovie>('Movie', MovieSchema);
