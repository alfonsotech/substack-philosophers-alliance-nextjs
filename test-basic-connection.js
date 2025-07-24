const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function quickTest() {
  const uri = process.env.MONGODB_URI;
  console.log('Testing with shorter timeout...');
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000, // 5 second timeout
    connectTimeoutMS: 5000,
  });
  
  try {
    await client.connect();
    console.log('✅ Connected successfully!');
    await client.close();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    // Check if it's a DNS issue  
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 This looks like a DNS resolution issue');
    }
    
    // Check if it's a timeout
    if (error.message.includes('timeout')) {
      console.log('💡 This looks like a network/firewall issue');
    }
  }
}

quickTest();
