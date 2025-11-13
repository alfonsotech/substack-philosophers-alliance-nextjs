import mongoose, { Schema, Model } from 'mongoose';

export interface IPost {
  title: string;
  cover_image_url: string;
  url: string;
  date: Date;
  excerpt?: string;
}

export interface IPhilosopher {
  id: string;
  name: string;
  publicationName: string;
  substackUrl: string;
  rssUrl: string;
  profile_photo_url: string;
  bio: string;
  recent_posts: IPost[];
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema = new Schema<IPost>({
  title: { type: String, required: true },
  cover_image_url: { type: String, required: true },
  url: { type: String, required: true },
  date: { type: Date, required: true },
  excerpt: { type: String },
});

const PhilosopherSchema = new Schema<IPhilosopher>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    publicationName: { type: String, required: true },
    substackUrl: { type: String, required: true, unique: true },
    rssUrl: { type: String, required: true },
    profile_photo_url: { type: String, required: true },
    bio: { type: String, required: true },
    recent_posts: [PostSchema],
  },
  {
    timestamps: true,
  }
);

// Create indexes for search
PhilosopherSchema.index({ name: 'text', bio: 'text', publicationName: 'text' });

const Philosopher: Model<IPhilosopher> =
  mongoose.models.Philosopher || mongoose.model<IPhilosopher>('Philosopher', PhilosopherSchema);

export default Philosopher;
