const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function debugLogos() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });
  
  try {
    await client.connect();
    const db = client.db('philosophers-alliance');
    
    // Check philosophers collection
    console.log('\n=== PHILOSOPHERS COLLECTION ===');
    const philosophers = await db.collection('philosophers').find({}).toArray();
    console.log(`Found ${philosophers.length} philosophers in database`);
    
    philosophers.forEach(p => {
      console.log(`- ${p.name}: ${p.logoUrl ? '✅ Has logo' : '❌ No logo'}`);
      if (p.logoUrl) console.log(`  URL: ${p.logoUrl}`);
    });
    
    // Check a few RSS feeds manually for logos
    console.log('\n=== MANUAL RSS CHECK ===');
    const testPhilosophers = [
      { id: 'deterritorialization', name: 'Buen Ravov', rssUrl: 'https://deterritorialization.substack.com/feed' },
      { id: 'mattfujimoto', name: 'Matt Fujimoto', rssUrl: 'https://mattfujimoto.substack.com/feed' }
    ];
    
    const Parser = require('rss-parser');
    const parser = new Parser({
      customFields: {
        image: ['url', 'title', 'link'],
      },
    });
    
    for (const phil of testPhilosophers) {
      try {
        console.log(`\nChecking ${phil.name}...`);
        const feed = await parser.parseURL(phil.rssUrl);
        console.log(`- Feed title: ${feed.title}`);
        console.log(`- Feed image: ${feed.image?.url || 'None'}`);
        console.log(`- Feed description: ${feed.description?.substring(0, 100)}...`);
      } catch (error) {
        console.log(`- Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

debugLogos();
