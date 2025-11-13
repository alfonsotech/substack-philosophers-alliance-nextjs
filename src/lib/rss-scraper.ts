import RssParser from 'rss-parser';

interface RssFeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  'content:encoded'?: string;
  content?: string;
  description?: string;
  enclosure?: {
    url: string;
    type: string;
  };
}

export interface ParsedPost {
  title: string;
  cover_image_url: string;
  url: string;
  date: Date;
  excerpt: string;
}

const parser = new RssParser({
  customFields: {
    item: [
      ['content:encoded', 'content'],
      ['description', 'description'],
      ['enclosure', 'enclosure']
    ]
  }
});

/**
 * Extract the first image URL from HTML content
 */
function extractImageFromContent(html: string): string | null {
  // Try to find video poster/thumbnail
  const videoPosterMatch = html.match(/<video[^>]+poster="([^">]+)"/i);
  if (videoPosterMatch) return videoPosterMatch[1];

  // Check for data-attrs that might contain thumbnails
  const thumbnailMatch = html.match(/data-thumbnail="([^">]+)"/i);
  if (thumbnailMatch) return thumbnailMatch[1];

  // Look for Substack video thumbnail patterns
  const substackVideoThumb = html.match(/https:\/\/[^"'\s]+\.substack\.com\/[^"'\s]*video[^"'\s]*\.(?:jpg|jpeg|png|webp)/i);
  if (substackVideoThumb) return substackVideoThumb[0];

  // Look for video-related S3 URLs
  const s3VideoThumb = html.match(/https:\/\/substack[^"'\s]*\.s3\.amazonaws\.com\/[^"'\s]*\.(?:jpg|jpeg|png|webp)/i);
  if (s3VideoThumb) return s3VideoThumb[0];

  // Look for any Substack CDN images
  const substackCDN = html.match(/https:\/\/substackcdn\.com\/image\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/i);
  if (substackCDN) return substackCDN[0];

  // Look for img tags
  const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) {
    const src = imgMatch[1];
    // Skip tracking pixels and tiny images
    if (!src.includes('track') && !src.includes('pixel') && !src.includes('1x1')) {
      return src;
    }
  }

  return null;
}

/**
 * Extract plain text excerpt from HTML content
 */
function extractExcerpt(html: string, maxLength: number = 150): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

/**
 * Get cover image from RSS item
 */
function getCoverImage(item: RssFeedItem): string {
  if (item.enclosure?.url && item.enclosure.type.startsWith('image/')) {
    return item.enclosure.url;
  }

  if (item.enclosure?.url && item.enclosure.type.startsWith('video/')) {
    if (item.content) {
      const img = extractImageFromContent(item.content);
      if (img) return img;
    }
    if (item.description) {
      const img = extractImageFromContent(item.description);
      if (img) return img;
    }
  }

  if (item.content) {
    const img = extractImageFromContent(item.content);
    if (img) return img;
  }

  if (item.description) {
    const img = extractImageFromContent(item.description);
    if (img) return img;
  }

  return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop';
}

/**
 * Get excerpt from RSS item
 */
function getExcerpt(item: RssFeedItem): string {
  const content = item.content || item.description || '';
  return extractExcerpt(content);
}

/**
 * Fetch and parse RSS feed from a Substack URL
 */
export async function fetchSubstackFeed(substackUrl: string): Promise<ParsedPost[]> {
  try {
    const feedUrl = substackUrl.endsWith('/')
      ? `${substackUrl}feed`
      : `${substackUrl}/feed`;

    console.log(`Fetching feed: ${feedUrl}`);

    const feed = await parser.parseURL(feedUrl);

    if (!feed.items || feed.items.length === 0) {
      console.warn(`No items found in feed: ${feedUrl}`);
      return [];
    }

    const posts: ParsedPost[] = feed.items
      .slice(0, 3)
      .map((item: any) => ({
        title: item.title || 'Untitled',
        cover_image_url: getCoverImage(item),
        url: item.link || substackUrl,
        date: item.pubDate ? new Date(item.pubDate) : new Date(),
        excerpt: getExcerpt(item)
      }));

    return posts;
  } catch (error) {
    console.error(`Error fetching RSS feed from ${substackUrl}:`, error);
    return [];
  }
}

/**
 * Extract profile photo and bio from RSS feed
 */
export async function getProfileDetails(rssUrl: string, substackUrl: string) {
  try {
    const feed = await parser.parseURL(rssUrl);

    const profilePhoto =
      feed.image?.url ||
      (feed as any).itunes?.image ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';

    const bio = feed.description || `Writer and thinker exploring ideas at ${substackUrl}`;

    return {
      profilePhoto,
      bio: bio.substring(0, 200),
    };
  } catch (error) {
    console.error(`Error fetching profile details from ${rssUrl}:`, error);
    return {
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      bio: 'Writer and thinker exploring philosophy and ideas.',
    };
  }
}
