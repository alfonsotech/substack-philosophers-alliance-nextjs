import mongoose, { Schema, Model } from 'mongoose';

export interface IAggregatedPost {
  post_url: string;
  title: string;
  cover_image_url: string;
  date: Date;
  excerpt: string;
  author_name: string;
  author_url: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AggregatedPostSchema = new Schema<IAggregatedPost>(
  {
    post_url: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    cover_image_url: { type: String, required: true },
    date: { type: Date, required: true },
    excerpt: { type: String, default: '' },
    author_name: { type: String, required: true },
    author_url: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Create indexes for search and sorting
AggregatedPostSchema.index({ date: -1 });
AggregatedPostSchema.index({ title: 'text', excerpt: 'text', author_name: 'text' });

const AggregatedPost: Model<IAggregatedPost> =
  mongoose.models.AggregatedPost ||
  mongoose.model<IAggregatedPost>('AggregatedPost', AggregatedPostSchema);

export default AggregatedPost;
