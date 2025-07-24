import { NextRequest, NextResponse } from 'next/server';
import { getPostsByPhilosopher } from '@/lib/rssService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const posts = await getPostsByPhilosopher(id);
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error(`Error fetching posts for philosopher:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch philosopher posts' },
      { status: 500 }
    );
  }
}
