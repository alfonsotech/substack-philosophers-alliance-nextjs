# Philosophy and Humanities Alliance - Setup Guide

This guide explains how to set up the RSS feed scraping and MongoDB database to populate philosopher profiles with photos, bios, and recent posts.

## Prerequisites

1. **MongoDB** - You need a MongoDB database (local or cloud like MongoDB Atlas)
2. **Node.js** - Version 18 or higher
3. **Environment Variables** - Create a `.env.local` file

## Step 1: Set Up MongoDB

### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" and get your connection string
4. It will look like: `mongodb+srv://username:password@cluster.mongodb.net/philosophers-alliance`

### Option B: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB: `mongod`
3. Connection string: `mongodb://localhost:27017/philosophers-alliance`

## Step 2: Configure Environment Variables

Create or update `.env.local` in the project root:

```env
# MongoDB connection string
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/philosophers-alliance

# Optional: Cron secret for protecting the refresh endpoint in production
CRON_SECRET=your-random-secret-here
```

## Step 3: Install Dependencies

```bash
npm install
```

This will install:
- `mongoose` - MongoDB ODM
- `rss-parser` - RSS feed parsing
- `tsx` - TypeScript execution for scripts

## Step 4: Seed the Database

Run the seed script to fetch data from RSS feeds and populate MongoDB:

```bash
npm run seed
```

This script will:
1. Connect to MongoDB
2. Clear existing philosopher data
3. For each philosopher in `src/data/philosophers.ts`:
   - Fetch their profile photo from RSS feed
   - Fetch their bio/description
   - Fetch their 3 most recent posts with cover images
4. Save all data to MongoDB

**Note:** This process takes 1-2 minutes as it fetches data for all philosophers with a 1-second delay between each to avoid rate limiting.

## Step 5: Start the Development Server

```bash
npm run dev
```

Visit:
- **Home**: http://localhost:3000
- **Discover**: http://localhost:3000/discover (now shows photos and bios!)
- **Posts**: http://localhost:3000/posts (aggregated posts from all philosophers)
- **Notes**: http://localhost:3000/notes (empty for now)

## Step 6: Set Up Automatic Updates (Optional)

### Vercel Cron Jobs

If deploying to Vercel, you can set up automatic daily updates:

1. Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-philosophers",
      "schedule": "0 2 * * *"
    }
  ]
}
```

2. Add `CRON_SECRET` to your Vercel environment variables

3. The endpoint `/api/cron/refresh-philosophers` will run daily at 2 AM UTC

### Manual Refresh

You can manually trigger a refresh by visiting:
```
http://localhost:3000/api/cron/refresh-philosophers
```

Or in production (with auth):
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-site.vercel.app/api/cron/refresh-philosophers
```

## How It Works

### Data Flow

1. **Static Data** (`src/data/philosophers.ts`):
   - Basic info: name, publication, Substack URL, RSS URL

2. **RSS Scraping** (`src/lib/rss-scraper.ts`):
   - Fetches profile photos from feed metadata
   - Extracts bios from feed descriptions
   - Parses posts with cover images, excerpts, dates

3. **MongoDB Storage** (`src/models/Philosopher.ts`):
   - Stores enriched philosopher data
   - Stores aggregated posts in separate collection
   - Indexes for fast search

4. **API Routes**:
   - `/api/philosophers` - Returns philosophers with photos/bios
   - `/api/posts` - Returns all posts sorted by date
   - `/api/cron/refresh-philosophers` - Updates all data

### File Structure

```
src/
├── models/
│   ├── Philosopher.ts          # Mongoose model for philosophers
│   └── AggregatedPost.ts       # Mongoose model for posts
├── lib/
│   ├── rss-scraper.ts          # RSS feed parsing logic
│   └── mongodb.ts              # MongoDB connection
├── app/api/
│   ├── philosophers/route.ts   # Fetch philosophers from MongoDB
│   ├── posts/route.ts          # Fetch posts from MongoDB
│   └── cron/
│       └── refresh-philosophers/route.ts  # Update data
└── data/
    └── philosophers.ts         # Static list of philosophers

scripts/
└── seed-from-rss.ts            # Initial database seeding
```

## Troubleshooting

### "Cannot connect to MongoDB"
- Check your `MONGODB_URI` in `.env.local`
- Make sure MongoDB is running (if local)
- Check firewall/network settings

### "No data showing on /discover page"
- Run `npm run seed` to populate the database
- Check browser console for API errors
- Verify MongoDB connection

### "Rate limiting errors during seed"
- The script includes 1-second delays to avoid rate limits
- If you still get errors, increase the delay in `scripts/seed-from-rss.ts`

### "Missing profile photos or posts"
- Some RSS feeds may not include all metadata
- The scraper has fallbacks for missing data
- Check console logs during seed for any fetch errors

## Adding New Philosophers

1. Add to `src/data/philosophers.ts`:
```typescript
{
  id: 'unique-id',
  name: 'Author Name',
  publicationName: 'Publication Name',
  substackUrl: 'https://example.substack.com',
  rssUrl: 'https://example.substack.com/feed',
}
```

2. Run `npm run seed` or trigger the cron endpoint to fetch their data

## Next Steps

- Set up MongoDB Atlas for production
- Configure Vercel cron jobs for automatic updates
- Add more philosophers to the directory
- Customize the design and styling

## Reference

This implementation is based on the strategy used in the [midlife-womens-directory](https://github.com/yourusername/midlife-womens-directory) project.
