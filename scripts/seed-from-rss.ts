/**
 * Seed database from philosophers list by fetching RSS feeds
 * This will populate profile photos, bios, and recent posts
 * Run with: npx tsx scripts/seed-from-rss.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import mongoose from 'mongoose';
import Philosopher from '../src/models/Philosopher';
import { fetchSubstackFeed, getProfileDetails } from '../src/lib/rss-scraper';
import { philosophers } from '../src/data/philosophers';

async function seedFromRSS() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/philosophers-alliance';

    console.log('🔌 Connecting to MongoDB...');
    console.log('URI:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Collection:', mongoose.connection.db.collection('philosophers').collectionName);
    console.log('');

    // Clear existing philosophers
    console.log('🗑️  Clearing existing philosophers...');
    await Philosopher.deleteMany({});
    console.log('✓ Cleared existing philosophers\n');

    console.log(`📝 Processing ${philosophers.length} philosophers...\n`);

    const philosophersData = [];
    let successCount = 0;
    let failCount = 0;

    for (const person of philosophers) {
      try {
        console.log(`Processing: ${person.name}`);

        // Fetch profile details from RSS
        const { profilePhoto, bio } = await getProfileDetails(
          person.rssUrl,
          person.substackUrl
        );

        // Fetch recent posts
        const recentPosts = await fetchSubstackFeed(person.substackUrl);

        const philosopher = {
          id: person.id,
          name: person.name,
          publicationName: person.publicationName,
          substackUrl: person.substackUrl,
          rssUrl: person.rssUrl,
          profile_photo_url: profilePhoto,
          bio: bio,
          recent_posts: recentPosts,
        };

        philosophersData.push(philosopher);
        successCount++;
        console.log(`  ✓ ${person.name} - ${recentPosts.length} posts found\n`);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        failCount++;
        console.error(`  ✗ Error processing ${person.name}:`, error);
      }
    }

    // Insert all philosophers
    if (philosophersData.length > 0) {
      console.log(`\n💾 Inserting ${philosophersData.length} philosophers into database...`);
      const result = await Philosopher.insertMany(philosophersData);
      console.log('✓ Philosophers inserted successfully');
      console.log(`   Inserted ${result.length} documents\n`);

      // Verify insertion
      const count = await Philosopher.countDocuments();
      console.log(`   Verification: ${count} documents in collection`);
    }

    console.log(`\n🎉 Seed complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log(`   Total: ${philosophers.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedFromRSS();
