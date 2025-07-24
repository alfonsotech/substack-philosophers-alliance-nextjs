import { NextRequest, NextResponse } from 'next/server';
import { getPhilosopherLogo } from '@/lib/rssService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logoUrl = await getPhilosopherLogo(id);
    
    if (logoUrl) {
      // Redirect to the actual logo URL
      return NextResponse.redirect(logoUrl);
    } else {
      // Return 404 if logo not found
      return NextResponse.json(
        { error: 'Logo not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error(`Error fetching logo for philosopher:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch philosopher logo' },
      { status: 500 }
    );
  }
}
