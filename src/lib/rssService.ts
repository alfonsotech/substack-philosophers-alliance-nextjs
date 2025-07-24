import Parser from 'rss-parser';
import { connectToDatabase } from './mongodb';
import { Philosopher, Post } from '@/types';
import { 
  savePostsToFile, 
  getAllPostsFromFile, 
  getPostsByPhilosopherFromFile, 
  getPhilosopherLogoFromFile,
  savePhilosopherLogoToFile 
} from './fileStorage';

// Check if MongoDB is available
async function isMongoDBAvailable(): Promise<boolean> {
  try {
    const db = await connectToDatabase();
    await db.admin().ping();
    return true;
  } catch (error) {
    console.log('MongoDB not available, falling back to file storage');
    return false;
  }
}

// Configure the RSS parser to capture enclosure tags
const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'content'],
      ['description', 'description'],
      ['enclosure', 'enclosure'],
    ],
  },
});

// Extract subtitle from content or description
function extractSubtitle(content?: string, description?: string): string {
  // Try to extract from content first
  if (content) {
    // Look for the first paragraph after removing HTML tags
    const contentText = content.replace(/<[^>]+>/g, ' ').trim();
    const firstParagraph = contentText.split(/\n\s*\n/)[0];
    if (firstParagraph && firstParagraph.length > 0) {
      // Limit to a reasonable length for a subtitle
      return firstParagraph.length > 150
        ? firstParagraph.substring(0, 147) + '...'
        : firstParagraph;
    }
  }

  // Fall back to description
  if (description) {
    // Remove HTML tags and trim
    const descText = description.replace(/<[^>]+>/g, ' ').trim();
    // Limit to a reasonable length for a subtitle
    return descText.length > 150
      ? descText.substring(0, 147) + '...'
      : descText;
  }

  return ''; // Return empty string if no subtitle found
}

// Extract the first image from content, description, or enclosure
function extractImage(item: any): string | null {
  // 1. Check for enclosure tag first (this is where Substack puts the images)
  const enclosure = item.enclosure as { url?: string; type?: string } | undefined;
  if (
    enclosure &&
    enclosure.url &&
    enclosure.type &&
    enclosure.type.startsWith('image/')
  ) {
    return enclosure.url;
  }

  // 2. Try content:encoded field
  const content = item.content as string | undefined;
  if (content) {
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }

  // 3. Try description as fallback
  const description = item.description as string | undefined;
  if (description) {
    const descImgMatch = description.match(/<img[^>]+src="([^">]+)"/);
    if (descImgMatch && descImgMatch[1]) {
      return descImgMatch[1];
    }
  }

  return null;
}

// Fetch feed for a philosopher
export async function fetchFeed(philosopher: Philosopher): Promise<Post[]> {
  try {
    console.log(`Fetching feed for ${philosopher.name}...`);
    const feed = await parser.parseURL(philosopher.rssUrl);

    console.log(`Feed for ${philosopher.name} has ${feed.items?.length || 0} items`);

    // Extract publication logo from feed
    let logoUrl: string | null = null;
    if (feed.image?.url) {
      logoUrl = feed.image.url;
      console.log(`Found logo for ${philosopher.name}: ${logoUrl}`);

      // Store the logo URL in database or file storage
      const mongoAvailable = await isMongoDBAvailable();
      if (mongoAvailable) {
        try {
          const db = await connectToDatabase();
          await db.collection('philosophers').updateOne(
            { id: philosopher.id },
            { 
              $set: { 
                ...philosopher,
                logoUrl,
                lastUpdated: new Date()
              } 
            },
            { upsert: true }
          );
        } catch (error) {
          // Fallback to file storage
          await savePhilosopherLogoToFile(philosopher.id, logoUrl);
        }
      } else {
        // Use file storage
        await savePhilosopherLogoToFile(philosopher.id, logoUrl);
      }
    }

    // Map feed items to our simplified format
    const posts: Post[] = feed.items?.map((item: any) => {
      // Extract cover image from enclosure, content, or description
      const coverImage = extractImage(item);

      // Create unique ID combining philosopher ID and post identifier
      const postId = item.guid || item.link || `${philosopher.id}-${Date.now()}-${Math.random()}`;
      const uniqueId = `${philosopher.id}:${postId}`;

      return {
        id: uniqueId,
        title: (item.title as string) || '',
        subtitle: extractSubtitle(content, description),
        author: philosopher.name,
        publicationName: philosopher.publicationName || (feed.title as string) || '',
        publishDate: new Date(item.pubDate as string).toISOString(),
        link: (item.link as string) || '',
        philosopherId: philosopher.id,
        coverImage: coverImage || undefined,
        logoUrl: logoUrl || undefined,
      };
    }) || [];

    return posts;
  } catch (error) {
    console.error(`Error fetching feed for ${philosopher.name}:`, error);
    return [];
  }
}

// Save posts to MongoDB or file storage
export async function savePosts(philosopherId: string, posts: Post[]): Promise<void> {
  const mongoAvailable = await isMongoDBAvailable();
  
  if (mongoAvailable) {
    try {
      const db = await connectToDatabase();
      const postsCollection = db.collection('posts');

      // Remove existing posts from this philosopher
      await postsCollection.deleteMany({ philosopherId });

      // Insert new posts
      if (posts.length > 0) {
        const operations = posts.map((post) => ({
          updateOne: {
            filter: { id: post.id },
            update: {
              $set: {
                ...post,
                publishDate: new Date(post.publishDate),
                lastUpdated: new Date(),
              },
            },
            upsert: true,
          },
        }));

        await postsCollection.bulkWrite(operations);
        console.log(`Saved ${posts.length} posts for ${philosopherId} to MongoDB`);
      }
    } catch (error) {
      console.error(`Error saving posts to MongoDB for ${philosopherId}:`, error);
      // Fallback to file storage
      await savePostsToFile(philosopherId, posts);
    }
  } else {
    // Use file storage
    await savePostsToFile(philosopherId, posts);
  }
}

// Refresh all feeds
export async function refreshAllFeeds(philosophers: Philosopher[]): Promise<{
  updated: number;
  newContentFound: boolean;
  newPosts: Post[];
}> {
  console.log(`Starting feed refresh for ${philosophers.length} philosophers...`);

  let newContentFound = false;
  let updatedFeeds = 0;
  const newPosts: Post[] = [];

  for (const philosopher of philosophers) {
    try {
      if (!philosopher?.rssUrl) {
        console.error(`Missing RSS URL for philosopher:`, philosopher);
        continue;
      }

      console.log(`Fetching feed for ${philosopher.name}...`);
      const posts = await fetchFeed(philosopher);

      if (posts.length > 0) {
        // Save posts to MongoDB
        await savePosts(philosopher.id, posts);
        
        // For now, consider all fetched posts as "new" since we're rebuilding
        newContentFound = true;
        updatedFeeds++;
        newPosts.push(...posts);
      }
    } catch (error) {
      console.error(`Error refreshing feed for ${philosopher.name}:`, error);
    }
  }

  return {
    updated: updatedFeeds,
    newContentFound,
    newPosts,
  };
}

// Get all posts from MongoDB or file storage
export async function getAllPosts(page = 1, limit = 10, search = ''): Promise<{
  posts: Post[];
  total: number;
  hasMore: boolean;
}> {
  const mongoAvailable = await isMongoDBAvailable();
  
  if (mongoAvailable) {
    try {
      const db = await connectToDatabase();
      const postsCollection = db.collection('posts');

      // Build search query
      let query: Record<string, unknown> = {};
      if (search) {
        query = {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { subtitle: { $regex: search, $options: 'i' } },
            { author: { $regex: search, $options: 'i' } },
            { publicationName: { $regex: search, $options: 'i' } },
          ],
        };
      }

      const total = await postsCollection.countDocuments(query);
      const skip = (page - 1) * limit;

      const posts = await postsCollection
        .find(query)
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        posts: posts.map(post => ({
          ...post,
          publishDate: post.publishDate.toISOString(),
        })) as Post[],
        total,
        hasMore: skip + posts.length < total,
      };
    } catch (error) {
      console.error('Error getting posts from MongoDB:', error);
      // Fallback to file storage
    }
  }
  
  // Use file storage
  try {
    let allPosts = getAllPostsFromFile();
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      allPosts = allPosts.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.subtitle.toLowerCase().includes(searchLower) ||
        post.author.toLowerCase().includes(searchLower) ||
        post.publicationName.toLowerCase().includes(searchLower)
      );
    }
    
    const total = allPosts.length;
    const skip = (page - 1) * limit;
    const paginatedPosts = allPosts.slice(skip, skip + limit);
    
    return {
      posts: paginatedPosts,
      total,
      hasMore: skip + paginatedPosts.length < total,
    };
  } catch (error) {
    console.error('Error getting posts from file:', error);
    return { posts: [], total: 0, hasMore: false };
  }
}

// Get posts for a specific philosopher
export async function getPostsByPhilosopher(philosopherId: string): Promise<Post[]> {
  const mongoAvailable = await isMongoDBAvailable();
  
  if (mongoAvailable) {
    try {
      const db = await connectToDatabase();
      const postsCollection = db.collection('posts');

      const posts = await postsCollection
        .find({ philosopherId })
        .sort({ publishDate: -1 })
        .toArray();

      return posts.map(post => ({
        ...post,
        publishDate: post.publishDate.toISOString(),
      })) as Post[];
    } catch (error) {
      console.error(`Error reading posts for ${philosopherId} from MongoDB:`, error);
    }
  }
  
  // Use file storage
  return getPostsByPhilosopherFromFile(philosopherId);
}

// Get philosopher logo
export async function getPhilosopherLogo(philosopherId: string): Promise<string | null> {
  const mongoAvailable = await isMongoDBAvailable();
  
  if (mongoAvailable) {
    try {
      const db = await connectToDatabase();
      const philosopherDoc = await db.collection('philosophers').findOne({ id: philosopherId });
      
      return philosopherDoc?.logoUrl || null;
    } catch (error) {
      console.error(`Error reading logo for ${philosopherId} from MongoDB:`, error);
    }
  }
  
  // Use file storage
  return getPhilosopherLogoFromFile(philosopherId);
}
