import { NextRequest, NextResponse } from 'next/server';
import { refreshAllFeeds } from '@/lib/rssService';
import { philosophers } from '@/data/philosophers';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (Vercel adds special headers)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Cron job triggered: refreshing RSS feeds');
    
    const result = await refreshAllFeeds(philosophers);
    
    console.log(`Cron job completed: updated ${result.updated} feeds, found ${result.newPosts.length} new posts`);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      updated: result.updated,
      newContentFound: result.newContentFound,
      newPostsCount: result.newPosts.length,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to refresh feeds',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
