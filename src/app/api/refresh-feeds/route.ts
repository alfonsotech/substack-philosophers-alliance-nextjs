import { NextRequest, NextResponse } from 'next/server';
import { refreshAllFeeds } from '@/lib/rssService';
import { philosophers } from '@/data/philosophers';

export async function POST(request: NextRequest) {
  try {
    console.log('Manual feed refresh triggered');
    
    const result = await refreshAllFeeds(philosophers);
    
    return NextResponse.json({
      message: `Successfully refreshed ${result.updated} feeds`,
      updated: result.updated,
      newContentFound: result.newContentFound,
      newPostsCount: result.newPosts.length,
    });
  } catch (error) {
    console.error('Error refreshing feeds:', error);
    return NextResponse.json(
      { error: 'Failed to refresh feeds' },
      { status: 500 }
    );
  }
}

// Also allow GET for testing purposes
export async function GET() {
  try {
    console.log('Manual feed refresh triggered via GET');
    
    const result = await refreshAllFeeds(philosophers);
    
    return NextResponse.json({
      message: `Successfully refreshed ${result.updated} feeds`,
      updated: result.updated,
      newContentFound: result.newContentFound,
      newPostsCount: result.newPosts.length,
    });
  } catch (error) {
    console.error('Error refreshing feeds:', error);
    return NextResponse.json(
      { error: 'Failed to refresh feeds' },
      { status: 500 }
    );
  }
}
