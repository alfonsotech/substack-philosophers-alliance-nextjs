import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/rssService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const { posts, total, hasMore } = await getAllPosts(page, limit, search);

    return NextResponse.json({
      total,
      page,
      limit,
      hasMore,
      posts,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
