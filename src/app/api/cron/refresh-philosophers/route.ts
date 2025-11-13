import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Philosopher from '@/models/Philosopher';
import AggregatedPost from '@/models/AggregatedPost';
import { fetchSubstackFeed, getProfileDetails } from '@/lib/rss-scraper';
import { philosophers } from '@/data/philosophers';

export const maxDuration = 300; // 5 minutes for Vercel

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting philosopher data refresh...');
    const startTime = Date.now();

    await connectToDatabase();

    let inserted = 0;
    let updated = 0;
    const allPosts: any[] = [];

    for (const person of philosophers) {
      try {
        console.log(`Processing: ${person.name}`);

        // Fetch profile details and recent posts
        const { profilePhoto, bio } = await getProfileDetails(person.rssUrl, person.substackUrl);
        const recentPosts = await fetchSubstackFeed(person.substackUrl);

        // Upsert philosopher
        const result = await Philosopher.findOneAndUpdate(
          { id: person.id },
          {
            id: person.id,
            name: person.name,
            publicationName: person.publicationName,
            substackUrl: person.substackUrl,
            rssUrl: person.rssUrl,
            profile_photo_url: profilePhoto,
            bio: bio,
            recent_posts: recentPosts,
          },
          { upsert: true, new: true }
        );

        if (result.createdAt?.getTime() === result.updatedAt?.getTime()) {
          inserted++;
        } else {
          updated++;
        }

        // Collect posts for aggregation
        recentPosts.forEach((post: any) => {
          allPosts.push({
            post_url: post.url,
            title: post.title,
            cover_image_url: post.cover_image_url,
            date: new Date(post.date),
            excerpt: post.excerpt || '',
            author_name: person.name,
            author_url: person.substackUrl,
          });
        });

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing ${person.name}:`, error);
      }
    }

    // Upsert aggregated posts
    console.log(`\n💾 Upserting ${allPosts.length} posts...`);
    let postsInserted = 0;
    let postsUpdated = 0;

    for (const post of allPosts) {
      try {
        const result = await AggregatedPost.findOneAndUpdate(
          { post_url: post.post_url },
          post,
          { upsert: true, new: true }
        );

        if (result.createdAt?.getTime() === result.updatedAt?.getTime()) {
          postsInserted++;
        } else {
          postsUpdated++;
        }
      } catch (error) {
        console.error(`Error upserting post ${post.post_url}:`, error);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Refresh complete in ${duration}s`);
    console.log(`   Philosophers - Inserted: ${inserted}, Updated: ${updated}`);
    console.log(`   Posts - Inserted: ${postsInserted}, Updated: ${postsUpdated}`);

    return NextResponse.json({
      success: true,
      duration: `${duration}s`,
      philosophers: {
        total: philosophers.length,
        inserted,
        updated,
      },
      posts: {
        total: allPosts.length,
        inserted: postsInserted,
        updated: postsUpdated,
      },
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
    return NextResponse.json(
      { error: 'Failed to refresh data' },
      { status: 500 }
    );
  }
}
