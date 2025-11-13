# Philosophy and Humanities Alliance

A curated directory of philosophy and theory writers on Substack, featuring aggregated posts, philosopher profiles with bios and recent posts.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/philosophers-alliance
CRON_SECRET=your-random-secret-here
```

**Already configured?** The MongoDB URI is already in your `.env.local` file.

### 3. Populate the Database

**IMPORTANT:** Before the site will display any data, you need to populate MongoDB with philosopher profiles, photos, bios, and posts:

```bash
npm run seed
```

This script will:
- Connect to MongoDB
- Fetch profile photos from RSS feeds
- Extract bios from feed descriptions
- Download 3 recent posts per philosopher with cover images
- Store everything in MongoDB

Takes ~1-2 minutes to complete.

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Pages

- **Home** (`/`) - Landing page with overview
- **Discover** (`/discover`) - Browse all philosophers with photos, bios, and recent posts
- **Posts** (`/posts`) - Aggregated feed of all posts from all philosophers
- **Notes** (`/notes`) - Substack Notes (empty - needs implementation)
- **About** (`/about`) - About the project

## Data Management

### Initial Setup
After installing, run once:
```bash
npm run seed
```

### Updating Data
To refresh all philosopher data and posts:
```bash
# Visit this endpoint in your browser or via curl
http://localhost:3000/api/cron/refresh-philosophers
```

### Automatic Updates (Vercel)
The project is configured for automatic daily updates via Vercel Cron Jobs. See `vercel.json` for configuration.

## Adding New Philosophers

1. Edit `src/data/philosophers.ts`
2. Add a new entry:
```typescript
{
  id: 'unique-id',
  name: 'Author Name',
  publicationName: 'Publication Name',
  substackUrl: 'https://example.substack.com',
  rssUrl: 'https://example.substack.com/feed',
}
```
3. Run `npm run seed` to fetch their data

## Detailed Setup Guide

For comprehensive setup instructions including MongoDB configuration, troubleshooting, and production deployment, see [SETUP.md](./SETUP.md).

## Tech Stack

- **Next.js 15** - React framework
- **MongoDB + Mongoose** - Database and ODM
- **RSS Parser** - Feed parsing
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
