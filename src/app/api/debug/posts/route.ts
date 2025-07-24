import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/rssService';

export async function GET() {
  try {
    const { posts } = await getAllPosts(1, 100); // Get first 100 posts for debugging
    
    const imageInfo = posts.map((post) => ({
      title: post.title,
      hasImage: !!post.coverImage,
      imageUrl: post.coverImage || 'none',
      philosopherId: post.philosopherId,
      author: post.author,
    }));

    return NextResponse.json(imageInfo);
  } catch (error) {
    console.error('Error in debug posts endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to get debug information' },
      { status: 500 }
    );
  }
}
