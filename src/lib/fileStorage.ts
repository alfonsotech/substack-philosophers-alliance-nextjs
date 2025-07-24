import fs from 'fs-extra';
import path from 'path';
import { Post, Philosopher } from '@/types';

const CACHE_DIR = path.join(process.cwd(), 'data', 'cache');
const POSTS_FILE = path.join(CACHE_DIR, 'all-posts.json');

// Ensure cache directory exists
fs.ensureDirSync(CACHE_DIR);

// File-based storage functions
export async function savePostsToFile(philosopherId: string, posts: Post[]): Promise<void> {
  try {
    // Save individual philosopher posts
    const cacheFile = path.join(CACHE_DIR, `${philosopherId}.json`);
    fs.writeJsonSync(cacheFile, posts);

    // Update all-posts file
    const allPosts = getAllPostsFromFile();
    const filteredPosts = allPosts.filter(post => post.philosopherId !== philosopherId);
    const updatedPosts = [...filteredPosts, ...posts];
    
    // Sort by publish date (newest first)
    updatedPosts.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    
    fs.writeJsonSync(POSTS_FILE, updatedPosts);
    console.log(`Saved ${posts.length} posts for ${philosopherId} to file`);
  } catch (error) {
    console.error(`Error saving posts for ${philosopherId}:`, error);
  }
}

export function getAllPostsFromFile(): Post[] {
  try {
    if (fs.existsSync(POSTS_FILE)) {
      return fs.readJsonSync(POSTS_FILE);
    }
    return [];
  } catch (error) {
    console.error('Error reading posts file:', error);
    return [];
  }
}

export function getPostsByPhilosopherFromFile(philosopherId: string): Post[] {
  try {
    const cacheFile = path.join(CACHE_DIR, `${philosopherId}.json`);
    if (fs.existsSync(cacheFile)) {
      return fs.readJsonSync(cacheFile);
    }
    return [];
  } catch (error) {
    console.error(`Error reading posts for ${philosopherId}:`, error);
    return [];
  }
}

export async function getPhilosopherLogoFromFile(philosopherId: string): Promise<string | null> {
  try {
    const logoFile = path.join(process.cwd(), 'data', 'logos', `${philosopherId}.json`);
    if (fs.existsSync(logoFile)) {
      const data = fs.readJsonSync(logoFile);
      return data.logoUrl;
    }
    return null;
  } catch (error) {
    console.error(`Error reading logo for ${philosopherId}:`, error);
    return null;
  }
}

export async function savePhilosopherLogoToFile(philosopherId: string, logoUrl: string): Promise<void> {
  try {
    const logosDir = path.join(process.cwd(), 'data', 'logos');
    fs.ensureDirSync(logosDir);
    fs.writeJsonSync(path.join(logosDir, `${philosopherId}.json`), { logoUrl });
  } catch (error) {
    console.error(`Error saving logo for ${philosopherId}:`, error);
  }
}
