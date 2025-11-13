export interface Philosopher {
  _id?: string; // MongoDB ID when from database
  id: string;
  name: string;
  publicationName: string;
  substackUrl: string;
  rssUrl: string;
  bio?: string;
  profile_photo_url?: string;
  recent_posts?: Post[];
}

export interface Post {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  publicationName: string;
  publishDate: string;
  link: string;
  philosopherId: string;
  coverImage?: string;
  logoUrl?: string;
}

export interface PostsResponse {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  posts: Post[];
}
