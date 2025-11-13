import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Philosopher from '@/models/Philosopher';

// Cache configuration
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '1500');

    let query = {};

    // If search query provided, use text search
    if (search) {
      query = { $text: { $search: search } };
    }

    const philosophers = await Philosopher.find(query)
      .sort({ name: 1 })
      .limit(limit)
      .lean();

    const total = await Philosopher.countDocuments(query);

    return NextResponse.json({
      philosophers,
      total,
    });
  } catch (error) {
    console.error('Error fetching philosophers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch philosophers' },
      { status: 500 }
    );
  }
}
