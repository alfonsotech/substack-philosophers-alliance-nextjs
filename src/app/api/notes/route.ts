import { NextRequest, NextResponse } from 'next/server';

// Cache configuration for Next.js
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET(request: NextRequest) {
  try {
    // For now, return empty notes array
    // This can be implemented later with MongoDB when you have notes data
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');

    return NextResponse.json({
      notes: [],
      total: 0,
      page,
      limit,
      pages: 0,
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}
