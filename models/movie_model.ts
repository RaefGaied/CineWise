import mongoose, { Document, Schema } from 'mongoose';

export interface MovieDocument extends Document {
  id: string;
  title: string;
  description: string;
  director: string;
  genres: string[];
  release_year: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

const MovieSchema = new Schema<MovieDocument>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  director: { type: String, required: true },
  genres: { type: [String], default: [] },
  release_year: { type: Number },
  image_url: { type: String },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true }
});

export default mongoose.model<MovieDocument>('Movie', MovieSchema);
